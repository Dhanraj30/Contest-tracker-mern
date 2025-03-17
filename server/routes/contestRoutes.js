const express = require('express');
const router = express.Router();
const { getContests, bookmarkContest, addSolutionLink } = require('../controllers/contestController');

router.get('/contests', getContests);              // Fetch all contests
router.post('/contests/bookmark/:id', bookmarkContest);     // Bookmark a contest
router.post('/contests/solution-link', addSolutionLink);         // Add YouTube link (admin)
// New endpoints for updating and deleting solution links
router.put('/contests/solution-link/:id', async (req, res) => {
    try {
      const { youtubeLink } = req.body;
      const solutionLink = await SolutionLink.findByIdAndUpdate(
        req.params.id,
        { youtubeLink },
        { new: true },
      );
      if (!solutionLink) {
        return res.status(404).json({ error: 'Solution link not found' });
      }
      res.status(200).json(solutionLink);
    } catch (error) {
      console.error('Error updating solution link:', error.message);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  });
  
router.delete('/contests/solution-link/:id', async (req, res) => {
    try {
      const solutionLink = await SolutionLink.findByIdAndDelete(req.params.id);
      if (!solutionLink) {
        return res.status(404).json({ error: 'Solution link not found' });
      }
      res.status(200).json({ message: 'Solution link deleted successfully' });
    } catch (error) {
      console.error('Error deleting solution link:', error.message);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

module.exports = router;