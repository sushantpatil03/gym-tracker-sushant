import { useRef } from 'react';
import { CheckCircle2, Lock } from 'lucide-react';
import { useWorkoutStore, DAY_KEYS } from '../store/workoutStore';

const DAY_LABELS = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
};

const COLOR_MAP = {
  orange: { ring: '#F97316', bg: 'rgba(249,115,22,0.12)', text: '#F97316' },
  purple: { ring: '#7C3AED', bg: 'rgba(124,58,237,0.12)', text: '#A78BFA' },
  green: { ring: '#22C55E', bg: 'rgba(34,197,94,0.12)', text: '#4ADE80' },
  gray: { ring: '#4B5563', bg: 'rgba(75,85,99,0.10)', text: '#9CA3AF' },
};

export default function WeekTimeline({ onDayPress }) {
  const scrollRef = useRef(null);
  const { weekPlan, completedDays, getTodayKey } = useWorkoutStore();
  const todayKey = getTodayKey();
  const todayIdx = DAY_KEYS.indexOf(todayKey);

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto no-select"
      style={{ paddingBottom: 4, scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {DAY_KEYS.map((key, idx) => {
        const plan = weekPlan[key];
        const isToday = key === todayKey;
        const isDone = completedDays.includes(key);
        const isPast = idx < todayIdx && !isToday;
        const isFuture = idx > todayIdx;
        const colors = COLOR_MAP[plan?.color] || COLOR_MAP.gray;

        return (
          <button
            key={key}
            onClick={() => onDayPress?.(key, plan)}
            className="flex-shrink-0 flex flex-col items-center gap-1 no-select"
            style={{
              width: 60,
              padding: '10px 6px',
              borderRadius: 12,
              border: isToday
                ? `2px solid var(--accent)`
                : `1px solid ${isDone ? colors.ring + '60' : 'var(--border)'}`,
              background: isToday
                ? 'rgba(249,115,22,0.08)'
                : isDone
                ? colors.bg
                : isFuture
                ? 'rgba(255,255,255,0.02)'
                : 'var(--surface)',
              cursor: 'pointer',
              transition: 'all 0.15s',
              position: 'relative',
              opacity: isFuture && !isToday ? 0.65 : 1,
            }}
          >
            {/* Day label */}
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: isToday ? 'var(--accent)' : 'var(--text-secondary)',
              }}
            >
              {DAY_LABELS[key]}
            </span>

            {/* Icon or checkmark */}
            {isDone ? (
              <CheckCircle2 size={20} color="var(--success)" strokeWidth={2} />
            ) : (
              <span style={{ fontSize: 20, lineHeight: 1 }}>{plan?.icon || '😴'}</span>
            )}

            {/* Workout label */}
            <span
              style={{
                fontSize: 9,
                fontWeight: 600,
                color: isToday ? 'var(--accent)' : colors.text,
                textAlign: 'center',
                letterSpacing: '0.02em',
                lineHeight: 1.2,
              }}
            >
              {plan?.label || 'Rest'}
            </span>

            {/* Today indicator dot */}
            {isToday && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 4,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: 'var(--accent)',
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
