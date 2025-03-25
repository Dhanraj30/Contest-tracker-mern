const axios = require('axios');
const Contest = require('../models/Contest');
const SolutionLink = require('../models/SolutionLink');
require('dotenv').config();

const fetchYouTubeVideos = async (playlistId) => {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      throw new Error('YouTube API key not found in environment variables');
    }

    const url = `https://www.googleapis.com/youtube/v3/playlistItems`;
    const response = await axios.get(url, {
      params: {
        part: 'snippet',
        playlistId: playlistId,
        maxResults: 50,
        key: apiKey,
      },
    });

    if (!response.data.items) {
      console.warn(`No videos found in playlist ${playlistId}`);
      return [];
    }

    return response.data.items.map(item => ({
      title: item.snippet.title,
      videoId: item.snippet.resourceId.videoId,
      publishedAt: item.snippet.publishedAt,
      videoUrl: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
    }));
  } catch (error) {
    console.error('Error fetching YouTube videos:', error.message);
    return [];
  }
};

const syncSolutionLinks = async () => {
  try {
    console.log('Syncing solution links from YouTube playlists...');

    const playlists = {
      leetcode: 'PLcXpkI9A-RZI6FhydNz3JBt_-p_i25Cbr',
      codeforces: 'PLcXpkI9A-RZLUfBSNp-YQBCOezZKbDSgB',
      codechef: 'placeholder_codechef_playlist_id',
    };

    const contests = await Contest.find();
    const existingSolutionLinks = await SolutionLink.find();

    for (const platform in playlists) {
      const playlistId = playlists[platform];
      if (!playlistId || playlistId === 'placeholder_codechef_playlist_id') {
        console.log(`Skipping ${platform} due to missing or placeholder playlist ID`);
        continue;
      }

      console.log(`Fetching videos for ${platform} from playlist ${playlistId}...`);
      const videos = await fetchYouTubeVideos(playlistId);

      for (const video of videos) {
        const contest = contests.find(c => {
          if (c.platform === 'leetcode') {
            const match = video.title.match(/Weekly Contest (\d+)/i);
            return match && c.name.toLowerCase().includes(`weekly contest ${match[1]}`);
          } else if (c.platform === 'codeforces') {
            const match = video.title.match(/Round #?(\d+)/i);
            return match && c.name.toLowerCase().includes(`round ${match[1]}`);
          }
          return video.title.toLowerCase().includes(c.name.toLowerCase());
        });

        if (contest) {
          const existingLink = existingSolutionLinks.find(link =>
            link.contestId === contest._id.toString() &&
            link.youtubeLink === video.videoUrl
          );

          if (!existingLink) {
            const solutionLink = new SolutionLink({
              contestId: contest._id,
              platform: contest.platform,
              youtubeLink: video.videoUrl,
            });
            await solutionLink.save();
            console.log(`Added solution link for ${contest.name}: ${video.videoUrl}`);
          }
        } else {
          console.log(`No matching contest found for video: ${video.title}`);
        }
      }
    }

    console.log('Solution links synced successfully');
  } catch (error) {
    console.error('Error syncing solution links:', error.message);
  }
};

const getContests = async (req, res) => {
  try {
    console.log('Fetching contests from CLIST API...');
    const now = new Date();
    const pastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const futureMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const resourceIds = [1, 2, 102];
    let allContests = [];

    for (const resourceId of resourceIds) {
      console.log(`Fetching contests for resource_id: ${resourceId}...`);
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          const response = await axios.get('https://clist.by/api/v4/contest/', {
            params: {
              username: process.env.USERNAME,
              api_key: process.env.API_KEY,
              start__gte: pastMonth.toISOString(),
              start__lte: futureMonth.toISOString(),
              resource_id: Number(resourceId),
              format: 'json',
            },
            headers: {
              'User-Agent': 'ContestTracker/1.0 (Node.js)',
            },
          });

          console.log(`CLIST API Raw Response for resource_id ${resourceId}:`, response.data);

          if (response.data && response.data.objects) {
            allContests = allContests.concat(response.data.objects);
            break;
          } else {
            console.warn(`No contests found for resource_id ${resourceId}`);
            break;
          }
        } catch (error) {
          retryCount++;
          console.error(`Error fetching resource_id ${resourceId} (Attempt ${retryCount}/${maxRetries}):`, error.message);
          if (error.response) {
            console.error('CLIST API Error Response:', error.response.data);
          }
          if (retryCount === maxRetries) {
            console.error(`Max retries reached for resource_id ${resourceId}. Skipping...`);
            break;
          }
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
    }

    if (allContests.length === 0) {
      throw new Error('No contest data received from CLIST API for any resource');
    }

    const contestData = allContests.map(contest => {
      const resourceName = typeof contest.resource === 'string'
        ? contest.resource
        : contest.resource?.name || 'unknown';

      return {
        name: contest.event || 'Unnamed Contest',
        platform: resourceName.split('.')[0].toLowerCase(),
        startTime: new Date(contest.start),
        endTime: new Date(contest.end),
        url: contest.href || '',
        bookmarked: false,
        clistId: contest.id, 
      };
    });

    console.log('Processed contest data:', contestData);
    console.log('Saving contests to MongoDB...');

    // Update contests instead of deleting all
    for (const contest of contestData) {
      await Contest.findOneAndUpdate(
        { clistId: contest.clistId }, // Match by CLIST ID
        { $set: contest }, // Update fields
        { upsert: true, new: true } // Insert if not found
      );
    }

    // Remove contests not in the latest fetch
    const clistIds = contestData.map(c => c.clistId);
    await Contest.deleteMany({ clistId: { $nin: clistIds } });

    await syncSolutionLinks();

    const savedContests = await Contest.find();//.sort({ startTime: -1 }).limit(15); // Limit to latest 15 contests
    const solutionLinks = await SolutionLink.find();
    console.log('Fetched contests from DB:', savedContests);
    console.log('Fetched solution links:', solutionLinks);

    res.json({ contests: savedContests, solutionLinks });
  } catch (error) {
    console.error('Error in getContests:', error.message, error.stack);
    if (error.response) {
      console.error('CLIST API Error Response:', error.response.data);
    }
    res.status(200).json({ contests: [], solutionLinks: [] });
  }
};

const bookmarkContest = async (req, res) => {
  const { id } = req.params;
  try {
    const contest = await Contest.findById(id);
    if (!contest) throw new Error('Contest not found');
    contest.bookmarked = !contest.bookmarked;
    await contest.save();
    res.json({ _id: contest._id, bookmarked: contest.bookmarked });
  } catch (error) {
    console.error('Error in bookmarkContest:', error.message);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

const addSolutionLink = async (req, res) => {
  const { contestId, platform, youtubeLink } = req.body;
  try {
    const link = new SolutionLink({ contestId, platform, youtubeLink });
    await link.save();
    res.json(link);
  } catch (error) {
    console.error('Error in addSolutionLink:', error.message);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

const searchContests = async (req, res) => {
  const { title } = req.query;
  try {
    const contests = await Contest.find({ name: new RegExp(title, 'i') });
    res.json(contests);
  } catch (error) {
    console.error('Error in searchContests:', error.message);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

module.exports = {
  getContests,
  bookmarkContest,
  addSolutionLink,
  syncSolutionLinks,
  searchContests,
};