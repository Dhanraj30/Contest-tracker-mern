const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const contestRoutes = require('./routes/contestRoutes');
const { syncSolutionLinks } = require('./controllers/contestController');

require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api', contestRoutes);

// Run syncSolutionLinks on startup
syncSolutionLinks();

// Schedule syncSolutionLinks to run every hour
cron.schedule('0 * * * *', () => {
  console.log('Running scheduled sync of solution links...');
  syncSolutionLinks();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});