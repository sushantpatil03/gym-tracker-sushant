const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Password required' });

  const adminPassword = process.env.ADMIN_PASSWORD || 'gymtracker2024';

  // Support both plain text (dev) and bcrypt hash (prod) comparison
  let valid = false;
  if (adminPassword.startsWith('$2b$') || adminPassword.startsWith('$2a$')) {
    valid = await bcrypt.compare(password, adminPassword);
  } else {
    valid = password === adminPassword;
  }

  if (!valid) return res.status(401).json({ error: 'Invalid password' });

  const token = jwt.sign(
    { role: 'admin' },
    process.env.JWT_SECRET || 'dev_secret',
    { expiresIn: '7d' }
  );

  res.json({ token, expiresIn: '7d' });
});

// POST /api/auth/verify — check if token is still valid
router.post('/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ valid: false });

  try {
    jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    res.json({ valid: true });
  } catch {
    res.status(401).json({ valid: false });
  }
});

module.exports = router;
