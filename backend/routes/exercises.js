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

function parseExercise(row) {
  if (!row) return null;
  return {
    ...row,
    secondary_muscles: JSON.parse(row.secondary_muscles || '[]'),
    form_tips: JSON.parse(row.form_tips || '[]'),
    instructions: JSON.parse(row.instructions || '[]'),
    is_warmup: Boolean(Number(row.is_warmup)),
    is_cooldown: Boolean(Number(row.is_cooldown)),
    push_day: row.push_day != null ? Number(row.push_day) : null,
    default_sets: Number(row.default_sets),
  };
}

// GET /api/exercises
router.get('/', async (req, res) => {
  try {
    const { day_type, is_warmup, is_cooldown, push_day } = req.query;
    let sql = `
      SELECT e.*,
        (SELECT youtube_video_id FROM exercise_videos WHERE exercise_id = e.id AND is_primary = 1 LIMIT 1) as youtube_video_id,
        (SELECT title FROM exercise_videos WHERE exercise_id = e.id AND is_primary = 1 LIMIT 1) as video_title
      FROM exercises e WHERE 1=1
    `;
    const args = [];

    if (day_type !== undefined) { sql += ' AND e.day_type = ?'; args.push(day_type); }
    if (is_warmup !== undefined) { sql += ' AND e.is_warmup = ?'; args.push(is_warmup === 'true' ? 1 : 0); }
    if (is_cooldown !== undefined) { sql += ' AND e.is_cooldown = ?'; args.push(is_cooldown === 'true' ? 1 : 0); }
    if (push_day !== undefined) { sql += ' AND e.push_day = ?'; args.push(Number(push_day)); }
    sql += ' ORDER BY e.sort_order ASC, e.created_at ASC';

    const result = await client.execute({ sql, args });
    res.json({ exercises: result.rows.map(parseExercise) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/exercises/:id
router.get('/:id', async (req, res) => {
  try {
    const exResult = await client.execute({ sql: 'SELECT * FROM exercises WHERE id = ?', args: [req.params.id] });
    if (!exResult.rows.length) return res.status(404).json({ error: 'Exercise not found' });

    const exercise = parseExercise(exResult.rows[0]);
    const vResult = await client.execute({
      sql: 'SELECT * FROM exercise_videos WHERE exercise_id = ? ORDER BY is_primary DESC, created_at ASC',
      args: [req.params.id],
    });
    const videos = vResult.rows;
    const primaryVideo = videos.find(v => Number(v.is_primary)) || videos[0];

    res.json({ ...exercise, videos, youtube_video_id: primaryVideo?.youtube_video_id || null });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/exercises
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { id, name, muscle_group, secondary_muscles = [], day_type, push_day,
      is_warmup = false, is_cooldown = false, default_sets = 3, default_reps = '8-12',
      form_tips = [], instructions = [], sort_order = 0 } = req.body;

    if (!id || !name || !muscle_group || !day_type)
      return res.status(400).json({ error: 'id, name, muscle_group, day_type required' });

    await client.execute({
      sql: `INSERT INTO exercises (id, name, muscle_group, secondary_muscles, day_type, push_day,
              is_warmup, is_cooldown, default_sets, default_reps, form_tips, instructions, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, name, muscle_group, JSON.stringify(secondary_muscles), day_type, push_day ?? null,
        is_warmup ? 1 : 0, is_cooldown ? 1 : 0, default_sets, default_reps,
        JSON.stringify(form_tips), JSON.stringify(instructions), sort_order],
    });
    res.status(201).json({ success: true, id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/exercises/:id
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const exResult = await client.execute({ sql: 'SELECT * FROM exercises WHERE id = ?', args: [req.params.id] });
    if (!exResult.rows.length) return res.status(404).json({ error: 'Exercise not found' });
    const existing = exResult.rows[0];

    const { name, muscle_group, secondary_muscles, day_type, push_day,
      is_warmup, is_cooldown, default_sets, default_reps,
      form_tips, instructions, sort_order } = req.body;

    await client.execute({
      sql: `UPDATE exercises SET name=?, muscle_group=?, secondary_muscles=?, day_type=?, push_day=?,
              is_warmup=?, is_cooldown=?, default_sets=?, default_reps=?, form_tips=?, instructions=?, sort_order=?
            WHERE id=?`,
      args: [
        name ?? existing.name,
        muscle_group ?? existing.muscle_group,
        secondary_muscles !== undefined ? JSON.stringify(secondary_muscles) : existing.secondary_muscles,
        day_type ?? existing.day_type,
        push_day !== undefined ? push_day : existing.push_day,
        is_warmup !== undefined ? (is_warmup ? 1 : 0) : existing.is_warmup,
        is_cooldown !== undefined ? (is_cooldown ? 1 : 0) : existing.is_cooldown,
        default_sets ?? existing.default_sets,
        default_reps ?? existing.default_reps,
        form_tips !== undefined ? JSON.stringify(form_tips) : existing.form_tips,
        instructions !== undefined ? JSON.stringify(instructions) : existing.instructions,
        sort_order ?? existing.sort_order,
        req.params.id,
      ],
    });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/exercises/:id
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const result = await client.execute({ sql: 'DELETE FROM exercises WHERE id = ?', args: [req.params.id] });
    if (result.rowsAffected === 0) return res.status(404).json({ error: 'Exercise not found' });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/exercises/reorder
router.patch('/reorder', requireAdmin, async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ error: 'items array required' });
    for (const item of items) {
      await client.execute({ sql: 'UPDATE exercises SET sort_order = ? WHERE id = ?', args: [item.sort_order, item.id] });
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
