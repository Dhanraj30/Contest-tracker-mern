import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ModeToggle } from "../components/ModeToggle";
import { RefreshCw, ExternalLink, Bookmark, Clock, X } from "lucide-react";

function Home() {
  const [contests, setContests] = useState([]);
  const [solutionLinks, setSolutionLinks] = useState([]);
  const [youtubeLink, setYoutubeLink] = useState("");
  const [platformFilter, setPlatformFilter] = useState({
    codeforces: true,
    codechef: true,
    leetcode: true,
  });
  const [loading, setLoading] = useState(true);
  const [selectedSolution, setSelectedSolution] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchQuery, setSearchQuery] = useState(""); // Add search query state

  const fetchContests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("http://localhost:5000/api/contests");
      const { contests: fetchedContests, solutionLinks: fetchedSolutionLinks } = response.data;
      setContests(fetchedContests || []);
      setSolutionLinks(fetchedSolutionLinks || []);
    } catch (error) {
      console.error("Error fetching contests:", error.message);
      setError("Failed to fetch contests. Check server status or refresh.");
      setContests([]);
      setSolutionLinks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContests();
  }, []);

  const handleBookmark = async (id) => {
    try {
      const response = await axios.post(`http://localhost:5000/api/contests/bookmark/${id}`);
      if (response.status === 200 && response.data) {
        setContests(
          contests.map((contest) =>
            contest._id === id ? { ...contest, bookmarked: response.data.bookmarked } : contest,
          ),
        );
      }
    } catch (error) {
      console.error("Error bookmarking contest:", error.message);
      setContests(
        contests.map((contest) => (contest._id === id ? { ...contest, bookmarked: !contest.bookmarked } : contest)),
      );
    }
  };

  const handleAddSolutionLink = async (contestId, platform) => {
    try {
      if (!youtubeLink) {
        alert("Please enter a YouTube link.");
        return;
      }
      const response = await axios.post("http://localhost:5000/api/contests/solution-link", {
        contestId,
        platform,
        youtubeLink,
      });
      setSolutionLinks([...solutionLinks, response.data]);
      setYoutubeLink("");
      fetchContests();
    } catch (error) {
      console.error("Error adding solution link:", error.message);
      const newSolution = {
        _id: Date.now().toString(),
        contestId,
        platform,
        youtubeLink,
      };
      setSolutionLinks([...solutionLinks, newSolution]);
      setYoutubeLink("");
    }
  };

  const handlePlatformFilter = (platform) => {
    setPlatformFilter((prev) => ({
      ...prev,
      [platform]: !prev[platform],
    }));
  };

  const getTimeRemaining = (startTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const diff = start - now;
    if (diff <= 0) return "Ended";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}:${minutes.toString().padStart(2, "0")} hours`;
  };

  const openSolutionPopup = (solution) => {
    setSelectedSolution(solution);
  };

  const closeSolutionPopup = () => {
    setSelectedSolution(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Loading...</p>
      </div>
    );
  }

  const filteredContests = contests
    .filter((contest) => platformFilter[contest.platform])
    .filter((contest) => contest.name.toLowerCase().includes(searchQuery.toLowerCase())); // Filter by search query

  const upcomingContests = filteredContests.filter((c) => new Date(c.startTime) > new Date());
  const pastContests = filteredContests.filter((c) => new Date(c.startTime) <= new Date());

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <code className="text-primary">&lt;/&gt;</code>
            <span>Contest Tracker</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/admin" className="text-sm font-medium text-foreground hover:underline">
              Admin
            </Link>
            <button
              onClick={fetchContests}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-border rounded-md hover:bg-secondary transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* Search Field */}
      <div className="container mt-4">
        <input
          type="text"
          placeholder="Search contests by title"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-border rounded-md bg-background/60 backdrop-blur focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
      </div>

      {/* Main Content */}
      <main className="container py-6">
        <div className="flex flex-col gap-8">
          {/* Error Message */}
          {error && (
            <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md">{error}</div>
          )}

          {/* Filters */}
          <div className="flex flex-col gap-4">
            <h2 className="text-3xl font-bold tracking-tight">Contests</h2>
            <div className="flex flex-wrap gap-4">
              {["codeforces", "codechef", "leetcode"].map((platform) => (
                <div key={platform} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={platform}
                    checked={platformFilter[platform]}
                    onChange={() => handlePlatformFilter(platform)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <label
                    htmlFor={platform}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="w-full">
            <div className="grid w-full max-w-md grid-cols-2 border-b border-border">
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === "upcoming"
                    ? "border-b-2 border-primary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Upcoming Contests
              </button>
              <button
                onClick={() => setActiveTab("past")}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === "past"
                    ? "border-b-2 border-primary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Past Contests
              </button>
            </div>

            {/* Upcoming Contests */}
            {activeTab === "upcoming" && (
              <div className="mt-6">
                {upcomingContests.length === 0 ? (
                  <p className="text-muted-foreground">No upcoming contests match your filters.</p>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {upcomingContests.map((contest) => (
                      <ContestCard
                        key={contest._id}
                        contest={contest}
                        timeRemaining={getTimeRemaining(contest.startTime)}
                        onBookmark={handleBookmark}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Past Contests */}
            {activeTab === "past" && (
              <div className="mt-6">
                {pastContests.length === 0 ? (
                  <p className="text-muted-foreground">No past contests match your filters.</p>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {pastContests.map((contest) => {
                      const contestSolutionLinks = solutionLinks.filter(
                        (link) => link.contestId === contest._id.toString(),
                      );
                      return (
                        <PastContestCard
                          key={contest._id}
                          contest={contest}
                          solutionLinks={contestSolutionLinks}
                          youtubeLink={youtubeLink}
                          setYoutubeLink={setYoutubeLink}
                          onAddSolution={handleAddSolutionLink}
                          onViewSolution={openSolutionPopup}
                          onBookmark={handleBookmark}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Solution Popup */}
      {selectedSolution && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg w-11/12 max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Solution Video</h3>
              <button
                onClick={closeSolutionPopup}
                className="p-1 hover:bg-secondary rounded-full transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <iframe
              src={`https://www.youtube.com/embed/${
                selectedSolution.youtubeLink.split("v=")[1] || selectedSolution.youtubeLink.split("/").pop()
              }`}
              title="YouTube Solution"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full aspect-video mb-4"
            ></iframe>
            <div className="text-sm text-muted-foreground mb-4">
              <p>Platform: <span className="capitalize">{selectedSolution.platform}</span></p>
              <p>
                Contest:{" "}
                {contests.find((c) => c._id === selectedSolution.contestId)?.name || selectedSolution.contestId}
              </p>
            </div>
            <button
              onClick={closeSolutionPopup}
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ContestCard({ contest, timeRemaining, onBookmark }) {
  return (
    <div className="bg-card rounded-lg shadow overflow-hidden">
      <div className="p-4">
        <h3 className="text-lg font-bold line-clamp-2">{contest.name}</h3>
      </div>
      <div className="p-4 pt-0">
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Platform:</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border border-border capitalize">
              {contest.platform}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Starts:</span>
            <span>{new Date(contest.startTime).toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Time Remaining:</span>
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{timeRemaining}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-2 p-4 pt-3 border-t border-border">
        <a
          href={contest.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex-1 text-center"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Contest Link
        </a>
        <button
          onClick={() => onBookmark(contest._id)}
          className={`inline-flex items-center justify-center px-3 py-1.5 rounded-md transition-colors ${
            contest.bookmarked
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "border border-border hover:bg-secondary"
          }`}
        >
          <Bookmark className="h-3.5 w-3.5" />
          <span className="sr-only">Bookmark</span>
        </button>
      </div>
    </div>
  );
}

function PastContestCard({
  contest,
  solutionLinks,
  youtubeLink,
  setYoutubeLink,
  onAddSolution,
  onViewSolution,
  onBookmark,
}) {
  return (
    <div className="bg-card rounded-lg shadow overflow-hidden">
      <div className="p-4">
        <h3 className="text-lg font-bold line-clamp-2">{contest.name}</h3>
      </div>
      <div className="p-4 pt-0">
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Platform:</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border border-border capitalize">
              {contest.platform}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Ended:</span>
            <span>{new Date(contest.endTime || contest.startTime).toLocaleString()}</span>
          </div>
          {solutionLinks.length > 0 && (
            <div className="pt-1">
              <span className="text-muted-foreground">Solutions:</span>
              {solutionLinks.map((link) => (
                <button
                  key={link._id}
                  onClick={() => onViewSolution(link)}
                  className="block text-primary hover:underline text-sm pl-2"
                >
                  View Solution
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2 p-4 pt-3 border-t border-border">
        <div className="flex gap-2">
          <a
            href={contest.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex-1 text-center"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Contest Link
          </a>
          <button
            onClick={() => onBookmark(contest._id)}
            className={`inline-flex items-center justify-center px-3 py-1.5 rounded-md transition-colors ${
              contest.bookmarked
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "border border-border hover:bg-secondary"
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" />
            <span className="sr-only">Bookmark</span>
          </button>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add YouTube solution link"
            value={youtubeLink}
            onChange={(e) => setYoutubeLink(e.target.value)}
            className="flex-1 px-3 py-1.5 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
          <button
            onClick={() => onAddSolution(contest._id, contest.platform)}
            className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;