import { X } from 'lucide-react';
import { useWorkoutStore } from '../store/workoutStore';

const WORKOUT_OPTIONS = [
  { type: 'push1', label: 'Push 1', sub: 'Chest · Triceps · Front Delts', icon: '💪', color: '#F97316' },
  { type: 'push2', label: 'Push 2', sub: 'Shoulders · Triceps · Incline', icon: '💪', color: '#F97316' },
  { type: 'pull1', label: 'Pull 1', sub: 'Back · Biceps · Rear Delts', icon: '🔄', color: '#A78BFA' },
  { type: 'pull2', label: 'Pull 2', sub: 'Back · Biceps · Deadlifts', icon: '🔄', color: '#A78BFA' },
  { type: 'legs', label: 'Legs', sub: 'Quads · Hamstrings · Calves', icon: '🦵', color: '#4ADE80' },
  { type: 'rest', label: 'Rest Day', sub: 'Recovery and mobility', icon: '😴', color: '#9CA3AF' },
  { type: 'skip', label: 'Skip', sub: 'Mark as skipped', icon: '⏭️', color: '#6B7280' },
];

export default function SwitchDaySheet({ dayKey, currentType, onClose }) {
  const { switchDay } = useWorkoutStore();

  const handleSelect = (type) => {
    switchDay(dayKey, type);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 100,
          animation: 'fadeIn 0.15s ease',
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 101,
          background: '#1A1A1A',
          borderRadius: '20px 20px 0 0',
          border: '1px solid var(--border)',
          borderBottom: 'none',
          padding: '0 0 env(safe-area-inset-bottom)',
          animation: 'slideUp 0.25s ease',
        }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, background: 'var(--border)' }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 12px' }}>
          <div>
            <p style={{ margin: 0, fontWeight: 800, fontSize: 18, color: 'var(--text-primary)', fontFamily: 'DM Sans, Inter, sans-serif' }}>
              Switch Workout
            </p>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
              {dayKey ? dayKey.charAt(0).toUpperCase() + dayKey.slice(1) : 'Today'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={16} color="var(--text-secondary)" />
          </button>
        </div>

        {/* Options */}
        <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {WORKOUT_OPTIONS.map((opt) => (
            <button
              key={opt.type}
              onClick={() => handleSelect(opt.type)}
              className="no-select"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 16px',
                background: currentType === opt.type ? 'rgba(249,115,22,0.1)' : 'var(--surface)',
                border: `1px solid ${currentType === opt.type ? 'rgba(249,115,22,0.3)' : 'var(--border)'}`,
                borderRadius: 12,
                cursor: 'pointer',
                transition: 'all 0.15s',
                width: '100%',
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 24 }}>{opt.icon}</span>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: currentType === opt.type ? 'var(--accent)' : 'var(--text-primary)' }}>
                  {opt.label}
                </p>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>
                  {opt.sub}
                </p>
              </div>
              {currentType === opt.type && (
                <div style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
              )}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}
