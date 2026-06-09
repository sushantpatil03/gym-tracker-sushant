require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ready } = require('./db/init');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: true, // Allow all origins — lock down with FRONTEND_URL env var in production if needed
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Wait for DB before mounting routes
ready.then(() => {
  app.use('/api/exercises', require('./routes/exercises'));
  app.use('/api/videos', require('./routes/videos'));
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/logs', require('./routes/logs'));

  app.use((req, res) => res.status(404).json({ error: 'Not found' }));
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  });

  app.listen(PORT, () => console.log(`GymTracker API running on port ${PORT}`));
});
