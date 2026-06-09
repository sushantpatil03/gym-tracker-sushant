import Dexie from 'dexie';

export const db = new Dexie('GymTrackerDB');

db.version(1).stores({
  workout_logs: '++id, user_name, exercise_id, log_date, set_number',
  day_assignments: '++id, week_start, day_of_week',
});

export default db;
