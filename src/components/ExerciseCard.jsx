import { useNavigate } from 'react-router-dom';
import { Play, ChevronRight } from 'lucide-react';

const MUSCLE_COLORS = {
  'Chest': '#F97316',
  'Upper Chest': '#F97316',
  'Triceps': '#FB923C',
  'Triceps (Long Head)': '#FB923C',
  'Shoulders': '#FBBF24',
  'Side Delts': '#FBBF24',
  'Front Delts': '#FCD34D',
  'Lats': '#A78BFA',
  'Lats / Mid Back': '#A78BFA',
  'Mid Back': '#A78BFA',
  'Biceps': '#818CF8',
  'Biceps (Brachialis)': '#818CF8',
  'Biceps (Peak)': '#818CF8',
  'Rear Delts / Rotator Cuff': '#C4B5FD',
  'Rear Delts': '#C4B5FD',
  'Full Posterior Chain': '#6D28D9',
  'Quads': '#4ADE80',
  'Quadriceps': '#4ADE80',
  'Hamstrings': '#34D399',
  'Calves': '#6EE7B7',
  'Glutes': '#10B981',
};

export default function ExerciseCard({ exercise, index }) {
  const navigate = useNavigate();
  const muscleColor = MUSCLE_COLORS[exercise.muscle_group] || '#9CA3AF';

  return (
    <button
      className="card card-hover w-full text-left"
      onClick={() => navigate(`/exercise/${exercise.id}`)}
      style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}
    >
      {/* Index number */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <span
          className="font-mono"
          style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}
        >
          {index}
        </span>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
            {exercise.name}
          </span>
          {exercise.youtube_video_id && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 4,
                padding: '1px 6px',
              }}
            >
              <Play size={9} fill="#EF4444" color="#EF4444" />
              <span style={{ fontSize: 9, fontWeight: 700, color: '#EF4444', letterSpacing: '0.03em' }}>
                VIDEO
              </span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Muscle group tag */}
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: muscleColor,
              background: muscleColor + '18',
              border: `1px solid ${muscleColor}30`,
              borderRadius: 4,
              padding: '1px 6px',
            }}
          >
            {exercise.muscle_group}
          </span>

          {/* Sets x Reps */}
          <span
            className="font-mono"
            style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}
          >
            {exercise.default_sets}×{exercise.default_reps}
          </span>
        </div>
      </div>

      {/* Arrow */}
      <ChevronRight size={18} color="var(--text-muted)" strokeWidth={1.5} />
    </button>
  );
}
