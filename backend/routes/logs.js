const express = require('express');
const router = express.Router();
const { client } = require('../db/init');

router.post('/sync', async (req, res) => {
  try {
    const { user_name, logs } = req.body;
    if (!user_name || !Array.isArray(logs))
      return res.status(400).json({ error: 'user_name and logs array required' });

    let count = 0;
    for (const log of logs) {
      await client.execute({
        sql: `INSERT INTO workout_logs (user_name, exercise_id, log_date, set_number, weight_kg, reps_done, notes, synced)
              VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
        args: [log.user_name || user_name, log.exercise_id, log.log_date, log.set_number,
               log.weight_kg, log.reps_done, log.notes || null],
      });
      count++;
    }
    res.json({ success: true, synced: count });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:user', async (req, res) => {
  try {
    const result = await client.execute({
      sql: 'SELECT * FROM workout_logs WHERE user_name = ? ORDER BY log_date DESC, created_at DESC',
      args: [req.params.user],
    });
    res.json({ logs: result.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:user/:exerciseId', async (req, res) => {
  try {
    const result = await client.execute({
      sql: 'SELECT * FROM workout_logs WHERE user_name = ? AND exercise_id = ? ORDER BY log_date DESC, set_number ASC',
      args: [req.params.user, req.params.exerciseId],
    });
    res.json({ logs: result.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
