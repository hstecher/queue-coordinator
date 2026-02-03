const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

// High scores file path
const HIGH_SCORES_FILE = path.join(__dirname, 'highscores.json');

// Initialize high scores file if it doesn't exist
function initHighScores() {
  if (!fs.existsSync(HIGH_SCORES_FILE)) {
    fs.writeFileSync(HIGH_SCORES_FILE, JSON.stringify([], null, 2));
  }
}

// Load high scores from file
function loadHighScores() {
  try {
    const data = fs.readFileSync(HIGH_SCORES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Save high scores to file
function saveHighScores(scores) {
  fs.writeFileSync(HIGH_SCORES_FILE, JSON.stringify(scores, null, 2));
}

// Initialize on startup
initHighScores();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Main route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint for Cloud Run
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Get high scores (top 20)
app.get('/api/scores', (req, res) => {
  const scores = loadHighScores();
  // Sort by score descending and return top 20
  const topScores = scores
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
  res.json(topScores);
});

// Submit a new high score
app.post('/api/scores', (req, res) => {
  const { name, score, observations, efficiency } = req.body;

  if (!name || typeof score !== 'number') {
    return res.status(400).json({ error: 'Name and score are required' });
  }

  const scores = loadHighScores();

  const newScore = {
    id: Date.now(),
    name: name.substring(0, 20), // Limit name length
    score,
    observations: observations || 0,
    efficiency: efficiency || 0,
    date: new Date().toISOString()
  };

  scores.push(newScore);

  // Keep only top 100 scores to prevent file from growing too large
  const trimmedScores = scores
    .sort((a, b) => b.score - a.score)
    .slice(0, 100);

  saveHighScores(trimmedScores);

  // Determine rank
  const rank = trimmedScores.findIndex(s => s.id === newScore.id) + 1;

  res.json({ success: true, rank, score: newScore });
});

app.listen(PORT, () => {
  console.log(`Telescope Simulator server is running on port ${PORT}`);
});
