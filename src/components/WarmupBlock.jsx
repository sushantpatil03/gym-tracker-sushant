import { useState } from 'react';
import { ChevronDown, ChevronUp, CheckSquare, Square, Clock } from 'lucide-react';

export default function WarmupBlock({ exercises, title = 'Pre-workout Warmup', defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  const [checked, setChecked] = useState({});

  if (!exercises || exercises.length === 0) return null;

  const toggleCheck = (id) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const doneCount = Object.values(checked).filter(Boolean).length;

  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full no-select"
        style={{
          padding: '14px 16px',
          background: 'var(--surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          border: 'none',
          width: '100%',
          textAlign: 'left',
          transition: 'background 0.15s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>{title.includes('Cooldown') ? '🧘' : '🔥'}</span>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
              {title}
            </p>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>
              {doneCount}/{exercises.length} done
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
            ~{title.includes('Cooldown') ? '5' : '6'} min
          </span>
          {open ? (
            <ChevronUp size={18} color="var(--text-muted)" />
          ) : (
            <ChevronDown size={18} color="var(--text-muted)" />
          )}
        </div>
      </button>

      {/* Content */}
      <div className={`collapsible-content ${open ? 'open' : 'closed'}`}>
        <div style={{ background: 'rgba(0,0,0,0.2)', borderTop: '1px solid var(--border)' }}>
          {exercises.map((ex, idx) => (
            <button
              key={ex.id}
              onClick={() => toggleCheck(ex.id)}
              className="w-full no-select"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '12px 16px',
                background: 'transparent',
                border: 'none',
                borderBottom: idx < exercises.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
                transition: 'background 0.15s',
              }}
            >
              {/* Checkbox */}
              <div style={{ paddingTop: 1 }}>
                {checked[ex.id] ? (
                  <CheckSquare size={18} color="var(--success)" strokeWidth={2} />
                ) : (
                  <Square size={18} color="var(--text-muted)" strokeWidth={1.5} />
                )}
              </div>

              {/* Exercise info */}
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    margin: 0,
                    fontWeight: 600,
                    fontSize: 14,
                    color: checked[ex.id] ? 'var(--text-muted)' : 'var(--text-primary)',
                    textDecoration: checked[ex.id] ? 'line-through' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  {ex.name}
                </p>
                <div style={{ display: 'flex', gap: 8, marginTop: 3, alignItems: 'center' }}>
                  <span
                    className="font-mono"
                    style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}
                  >
                    {ex.default_reps}
                  </span>
                  {ex.muscle_group && ex.muscle_group !== 'Cardio' && ex.muscle_group !== 'Spine' && ex.muscle_group !== 'Neck' && (
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      · {ex.muscle_group}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
