import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Dumbbell, ChevronRight, Filter } from 'lucide-react';
import { fetchExercises } from '../lib/api';

const MUSCLE_GROUPS = [
  'All',
  'Chest',
  'Back',
  'Shoulders',
  'Legs',
  'Arms',
  'Core',
  'Warmup/Cooldown',
];

export default function Library() {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    // This uses the cached fetchExercises in api.js, so it's instantly fast after the first load
    fetchExercises().then((data) => {
      setExercises(data.exercises || []);
      setLoading(false);
    });
  }, []);

  const filteredExercises = useMemo(() => {
    let result = exercises;

    // Filter by Muscle Group
    if (activeFilter !== 'All') {
      if (activeFilter === 'Warmup/Cooldown') {
        result = result.filter((e) => e.is_warmup || e.is_cooldown);
      } else {
        result = result.filter(
          (e) =>
            !e.is_warmup &&
            !e.is_cooldown &&
            (e.muscle_group.toLowerCase().includes(activeFilter.toLowerCase()) ||
              e.secondary_muscles?.some((m) => m.toLowerCase().includes(activeFilter.toLowerCase())))
        );
      }
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.muscle_group.toLowerCase().includes(q) ||
          e.day_type.toLowerCase().includes(q)
      );
    }

    return result;
  }, [exercises, activeFilter, searchQuery]);

  return (
    <div className="page-enter" style={{ paddingBottom: 80, minHeight: '100dvh', background: 'var(--bg)' }}>
      {/* Sticky Header with Search */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: 'rgba(15,15,15,0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          padding: '16px 20px 12px',
        }}
      >
        <h1 style={{ margin: '0 0 16px', fontSize: 24, fontWeight: 800, fontFamily: 'DM Sans, sans-serif', color: 'var(--text-primary)' }}>
          Exercise Library
        </h1>

        <div style={{ position: 'relative' }}>
          <Search
            size={18}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Search exercises (e.g. Bench)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input"
            style={{ paddingLeft: 42, height: 44, borderRadius: 12, fontSize: 15 }}
          />
        </div>
      </div>

      {/* Horizontally Scrollable Filter Chips */}
      <div style={{ padding: '12px 0 4px' }}>
        <div
          className="hide-scrollbar"
          style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            padding: '0 20px',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {MUSCLE_GROUPS.map((group) => {
            const isActive = activeFilter === group;
            return (
              <button
                key={group}
                onClick={() => setActiveFilter(group)}
                className="no-select"
                style={{
                  background: isActive ? 'var(--accent)' : 'var(--surface)',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 20,
                  padding: '6px 14px',
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                }}
              >
                {group}
              </button>
            );
          })}
        </div>
      </div>

      {/* Exercise List */}
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading ? (
          // Shimmers
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="shimmer" style={{ height: 72, borderRadius: 12 }} />
          ))
        ) : filteredExercises.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: 'var(--surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Filter size={24} color="var(--text-muted)" />
            </div>
            <p style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 600, fontSize: 16 }}>No exercises found</p>
            <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: 14 }}>Try adjusting your search or filters.</p>
          </div>
        ) : (
          filteredExercises.map((exercise) => (
            <button
              key={exercise.id}
              onClick={() => navigate(`/exercise/${exercise.id}`)}
              className="no-select w-full text-left"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: '12px 14px',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onActive={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: 'rgba(249,115,22,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Dumbbell size={20} color="var(--accent)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 15,
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {exercise.name}
                </p>
                <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'nowrap', overflow: 'hidden' }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: 'var(--accent)',
                      background: 'rgba(249,115,22,0.1)',
                      borderRadius: 4,
                      padding: '2px 6px',
                      flexShrink: 0,
                    }}
                  >
                    {exercise.muscle_group}
                  </span>
                  {!exercise.is_warmup && !exercise.is_cooldown && (
                    <span
                      style={{
                        fontSize: 10,
                        color: 'var(--text-secondary)',
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        borderRadius: 4,
                        padding: '1px 6px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {exercise.day_type.charAt(0).toUpperCase() + exercise.day_type.slice(1)} Day
                    </span>
                  )}
                  {exercise.is_warmup && (
                    <span style={{ fontSize: 10, color: '#FDE047', background: 'rgba(234,179,8,0.1)', borderRadius: 4, padding: '2px 6px' }}>
                      Warmup
                    </span>
                  )}
                  {exercise.is_cooldown && (
                    <span style={{ fontSize: 10, color: '#86EFAC', background: 'rgba(34,197,94,0.1)', borderRadius: 4, padding: '2px 6px' }}>
                      Cooldown
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
            </button>
          ))
        )}
      </div>
    </div>
  );
}
