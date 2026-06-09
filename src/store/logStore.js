import { create } from 'zustand';
import db from '../lib/db';

export const useLogStore = create((set, get) => ({
  // In-memory cache for current session
  cache: {},

  saveLog: async (entry) => {
    // entry: { user_name, exercise_id, log_date, set_number, weight_kg, reps_done, notes }
    const id = await db.workout_logs.add({
      ...entry,
      created_at: new Date().toISOString(),
    });

    // Invalidate cache for this exercise
    const cacheKey = `${entry.user_name}-${entry.exercise_id}`;
    set((state) => {
      const newCache = { ...state.cache };
      delete newCache[cacheKey];
      return { cache: newCache };
    });

    return id;
  },

  getLogs: async (exerciseId, userName) => {
    return db.workout_logs
      .where('exercise_id')
      .equals(exerciseId)
      .and((log) => log.user_name === userName)
      .sortBy('log_date');
  },

  getLastSession: async (exerciseId, userName) => {
    const cacheKey = `${userName}-${exerciseId}`;
    const { cache } = get();

    if (cache[cacheKey]) return cache[cacheKey];

    // Get last date this exercise was logged
    const all = await db.workout_logs
      .where('exercise_id')
      .equals(exerciseId)
      .and((log) => log.user_name === userName)
      .toArray();

    if (!all.length) return null;

    // Find most recent date
    const sortedDates = [...new Set(all.map((l) => l.log_date))].sort().reverse();
    const lastDate = sortedDates[0];

    const lastSets = all.filter((l) => l.log_date === lastDate).sort((a, b) => a.set_number - b.set_number);

    // Cache and return
    set((state) => ({
      cache: { ...state.cache, [cacheKey]: { date: lastDate, sets: lastSets } },
    }));

    return { date: lastDate, sets: lastSets };
  },

  deleteLog: async (id) => {
    await db.workout_logs.delete(id);
  },

  getAllLogs: async (userName) => {
    return db.workout_logs.where('user_name').equals(userName).sortBy('log_date');
  },
}));
