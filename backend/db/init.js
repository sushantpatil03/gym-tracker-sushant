require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@libsql/client');
const path = require('path');
const fs = require('fs');

const DB_DIR = process.env.DB_DIR || path.join(__dirname, '../data');
fs.mkdirSync(DB_DIR, { recursive: true });

const DB_URL = process.env.DATABASE_URL || `file:${path.join(DB_DIR, 'gymtracker.db')}`;

const client = createClient({ url: DB_URL });

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS exercises (
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    muscle_group  TEXT NOT NULL,
    secondary_muscles TEXT DEFAULT '[]',
    day_type      TEXT NOT NULL,
    push_day      INTEGER,
    is_warmup     INTEGER DEFAULT 0,
    is_cooldown   INTEGER DEFAULT 0,
    default_sets  INTEGER DEFAULT 3,
    default_reps  TEXT DEFAULT '8-12',
    form_tips     TEXT DEFAULT '[]',
    instructions  TEXT DEFAULT '[]',
    sort_order    INTEGER DEFAULT 0,
    created_at    TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS exercise_videos (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    exercise_id     TEXT REFERENCES exercises(id) ON DELETE CASCADE,
    youtube_video_id TEXT NOT NULL,
    title           TEXT,
    is_primary      INTEGER DEFAULT 0,
    added_by        TEXT DEFAULT 'admin',
    created_at      TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS workout_logs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name   TEXT NOT NULL,
    exercise_id TEXT,
    log_date    TEXT NOT NULL,
    set_number  INTEGER,
    weight_kg   REAL,
    reps_done   INTEGER,
    notes       TEXT,
    synced      INTEGER DEFAULT 0,
    created_at  TEXT DEFAULT (datetime('now'))
  );
`;

async function initDB() {
  // Run schema
  for (const stmt of SCHEMA.split(';').map(s => s.trim()).filter(Boolean)) {
    await client.execute(stmt);
  }

  // Seed if empty
  const result = await client.execute('SELECT COUNT(*) as c FROM exercises');
  const count = Number(result.rows[0].c);

  if (count === 0) {
    console.log('Seeding database from exercises.json...');
    const exercisesPath = path.join(__dirname, '../../src/data/exercises.json');

    if (fs.existsSync(exercisesPath)) {
      const { exercises } = JSON.parse(fs.readFileSync(exercisesPath, 'utf-8'));

      for (const ex of exercises) {
        await client.execute({
          sql: `INSERT INTO exercises (id, name, muscle_group, secondary_muscles, day_type, push_day,
                  is_warmup, is_cooldown, default_sets, default_reps, form_tips, instructions, sort_order)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            ex.id, ex.name, ex.muscle_group,
            JSON.stringify(ex.secondary_muscles || []),
            ex.day_type, ex.push_day ?? null,
            ex.is_warmup ? 1 : 0, ex.is_cooldown ? 1 : 0,
            ex.default_sets, ex.default_reps,
            JSON.stringify(ex.form_tips || []),
            JSON.stringify(ex.instructions || []),
            ex.order || 0,
          ],
        });

        if (ex.youtube_video_id) {
          await client.execute({
            sql: `INSERT INTO exercise_videos (exercise_id, youtube_video_id, title, is_primary)
                  VALUES (?, ?, ?, 1)`,
            args: [ex.id, ex.youtube_video_id, ex.name + ' — demonstration'],
          });
        }
      }
      console.log(`Seeded ${exercises.length} exercises.`);
    }
  }

  return client;
}

// Export a promise that resolves to the ready client
const ready = initDB().catch(err => {
  console.error('DB init failed:', err);
  process.exit(1);
});

module.exports = { client, ready };
