import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { startOfWeek, addDays, format } from '../lib/dateUtils';

const DEFAULT_WEEKLY_PLAN = {
  mon: { type: 'push1', label: 'Push 1', icon: '💪', color: 'orange' },
  tue: { type: 'pull1', label: 'Pull 1', icon: '🔄', color: 'purple' },
  wed: { type: 'legs', label: 'Legs', icon: '🦵', color: 'green' },
  thu: { type: 'push2', label: 'Push 2', icon: '💪', color: 'orange' },
  fri: { type: 'pull2', label: 'Pull 2', icon: '🔄', color: 'purple' },
  sat: { type: 'rest', label: 'Optional', icon: '❓', color: 'gray' },
  sun: { type: 'rest', label: 'Rest', icon: '😴', color: 'gray' },
};

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

function getCurrentWeekStart() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon...
  const diff = day === 0 ? -6 : 1 - day; // get to Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split('T')[0];
}

function getTodayKey() {
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return days[new Date().getDay()];
}

export const useWorkoutStore = create(
  persist(
    (set, get) => ({
      activeUser: 'sush',
      weekStart: getCurrentWeekStart(),
      weekPlan: { ...DEFAULT_WEEKLY_PLAN },
      completedDays: [], // array of day keys completed this week
      streak: 0,

      setActiveUser: (user) => set({ activeUser: user }),

      getTodayKey,

      getTodayWorkout: () => {
        const { weekPlan } = get();
        const todayKey = getTodayKey();
        return weekPlan[todayKey] || weekPlan['sun'];
      },

      switchDay: (dayKey, workoutType) => {
        const WORKOUT_TYPES = {
          push1: { type: 'push1', label: 'Push 1', icon: '💪', color: 'orange' },
          push2: { type: 'push2', label: 'Push 2', icon: '💪', color: 'orange' },
          pull1: { type: 'pull1', label: 'Pull 1', icon: '🔄', color: 'purple' },
          pull2: { type: 'pull2', label: 'Pull 2', icon: '🔄', color: 'purple' },
          legs: { type: 'legs', label: 'Legs', icon: '🦵', color: 'green' },
          rest: { type: 'rest', label: 'Rest', icon: '😴', color: 'gray' },
          skip: { type: 'skip', label: 'Skip', icon: '⏭️', color: 'gray' },
        };
        set((state) => ({
          weekPlan: {
            ...state.weekPlan,
            [dayKey]: WORKOUT_TYPES[workoutType] || state.weekPlan[dayKey],
          },
        }));
      },

      markComplete: (dayKey) => {
        set((state) => {
          const newCompleted = state.completedDays.includes(dayKey)
            ? state.completedDays
            : [...state.completedDays, dayKey];

          // Calculate streak based on consecutive completed days ending today
          const todayKey = getTodayKey();
          const todayIdx = DAY_KEYS.indexOf(todayKey);
          let streak = 0;
          for (let i = todayIdx; i >= 0; i--) {
            if (
              newCompleted.includes(DAY_KEYS[i]) &&
              state.weekPlan[DAY_KEYS[i]]?.type !== 'rest'
            ) {
              streak++;
            } else if (state.weekPlan[DAY_KEYS[i]]?.type === 'rest') {
              // rest days don't break streak
            } else {
              break;
            }
          }

          return { completedDays: newCompleted, streak };
        });
      },

      resetWeek: () => {
        const currentWeekStart = getCurrentWeekStart();
        set((state) => {
          // Only reset if it's a new week
          if (state.weekStart !== currentWeekStart) {
            return {
              weekStart: currentWeekStart,
              weekPlan: { ...DEFAULT_WEEKLY_PLAN },
              completedDays: [],
            };
          }
          return {};
        });
      },

      // Force reset (for dev)
      forceReset: () => {
        set({
          weekStart: getCurrentWeekStart(),
          weekPlan: { ...DEFAULT_WEEKLY_PLAN },
          completedDays: [],
          streak: 0,
        });
      },
    }),
    {
      name: 'gymtracker-workout-store',
      version: 1,
    }
  )
);

export { DAY_KEYS, DEFAULT_WEEKLY_PLAN };
