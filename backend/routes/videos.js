const express = require('express');
const router = express.Router();
const { client } = require('../db/init');
const jwt = require('jsonwebtoken');

function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

router.get('/:exerciseId', async (req, res) => {
  try {
    const result = await client.execute({
      sql: 'SELECT * FROM exercise_videos WHERE exercise_id = ? ORDER BY is_primary DESC, created_at ASC',
      args: [req.params.exerciseId],
    });
    res.json({ videos: result.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    let { exercise_id, youtube_video_id, title } = req.body;
    if (!exercise_id || !youtube_video_id)
      return res.status(400).json({ error: 'exercise_id and youtube_video_id required' });

    // Extract ID from URL if needed
    const urlMatch = youtube_video_id.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([a-zA-Z0-9_-]{11})/);
    if (urlMatch) youtube_video_id = urlMatch[1];
    if (!/^[a-zA-Z0-9_-]{11}$/.test(youtube_video_id))
      return res.status(400).json({ error: 'Invalid YouTube video ID or URL' });

    const exResult = await client.execute({ sql: 'SELECT id FROM exercises WHERE id = ?', args: [exercise_id] });
    if (!exResult.rows.length) return res.status(404).json({ error: 'Exercise not found' });

    const countResult = await client.execute({
      sql: 'SELECT COUNT(*) as c FROM exercise_videos WHERE exercise_id = ?', args: [exercise_id],
    });
    const isPrimary = Number(countResult.rows[0].c) === 0 ? 1 : 0;

    const result = await client.execute({
      sql: 'INSERT INTO exercise_videos (exercise_id, youtube_video_id, title, is_primary) VALUES (?, ?, ?, ?)',
      args: [exercise_id, youtube_video_id, title || null, isPrimary],
    });
    res.status(201).json({ success: true, id: Number(result.lastInsertRowid), youtube_video_id, is_primary: isPrimary });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const vResult = await client.execute({ sql: 'SELECT * FROM exercise_videos WHERE id = ?', args: [Number(req.params.id)] });
    if (!vResult.rows.length) return res.status(404).json({ error: 'Video not found' });
    const video = vResult.rows[0];

    await client.execute({ sql: 'DELETE FROM exercise_videos WHERE id = ?', args: [Number(req.params.id)] });

    if (Number(video.is_primary)) {
      const next = await client.execute({
        sql: 'SELECT id FROM exercise_videos WHERE exercise_id = ? ORDER BY created_at ASC LIMIT 1',
        args: [video.exercise_id],
      });
      if (next.rows.length) {
        await client.execute({ sql: 'UPDATE exercise_videos SET is_primary = 1 WHERE id = ?', args: [next.rows[0].id] });
      }
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/:id/primary', requireAdmin, async (req, res) => {
  try {
    const vResult = await client.execute({ sql: 'SELECT * FROM exercise_videos WHERE id = ?', args: [Number(req.params.id)] });
    if (!vResult.rows.length) return res.status(404).json({ error: 'Video not found' });
    const video = vResult.rows[0];

    await client.execute({ sql: 'UPDATE exercise_videos SET is_primary = 0 WHERE exercise_id = ?', args: [video.exercise_id] });
    await client.execute({ sql: 'UPDATE exercise_videos SET is_primary = 1 WHERE id = ?', args: [Number(req.params.id)] });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
