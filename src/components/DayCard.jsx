import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useWorkoutStore } from '../store/workoutStore';

const DAY_CONFIG = {
  push1: {
    label: 'Push Day 1',
    subtitle: 'Chest · Triceps · Front Delts',
    gradient: 'linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(249,115,22,0.03) 100%)',
    border: 'rgba(249,115,22,0.3)',
    accent: '#F97316',
    route: '/workout/push1',
    bg: 'rgba(249,115,22,0.08)',
  },
  push2: {
    label: 'Push Day 2',
    subtitle: 'Shoulders · Triceps · Incline',
    gradient: 'linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(249,115,22,0.03) 100%)',
    border: 'rgba(249,115,22,0.3)',
    accent: '#F97316',
    route: '/workout/push2',
    bg: 'rgba(249,115,22,0.08)',
  },
  pull1: {
    label: 'Pull Day 1',
    subtitle: 'Back · Biceps · Rear Delts',
    gradient: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(124,58,237,0.03) 100%)',
    border: 'rgba(124,58,237,0.3)',
    accent: '#A78BFA',
    route: '/workout/pull1',
    bg: 'rgba(124,58,237,0.08)',
  },
  pull2: {
    label: 'Pull Day 2',
    subtitle: 'Back · Biceps · Deadlifts',
    gradient: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(124,58,237,0.03) 100%)',
    border: 'rgba(124,58,237,0.3)',
    accent: '#A78BFA',
    route: '/workout/pull2',
    bg: 'rgba(124,58,237,0.08)',
  },
  legs: {
    label: 'Legs Day',
    subtitle: 'Quads · Hamstrings · Calves',
    gradient: 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.03) 100%)',
    border: 'rgba(34,197,94,0.3)',
    accent: '#4ADE80',
    route: '/workout/legs',
    bg: 'rgba(34,197,94,0.08)',
  },
  rest: {
    label: 'Rest Day',
    subtitle: 'Recovery · Mobility · Sleep',
    gradient: 'linear-gradient(135deg, rgba(107,114,128,0.1) 0%, rgba(0,0,0,0) 100%)',
    border: 'rgba(107,114,128,0.2)',
    accent: '#9CA3AF',
    route: null,
    bg: 'rgba(107,114,128,0.05)',
  },
  skip: {
    label: 'Skipped',
    subtitle: 'Take care of yourself',
    gradient: 'linear-gradient(135deg, rgba(107,114,128,0.1) 0%, rgba(0,0,0,0) 100%)',
    border: 'rgba(107,114,128,0.2)',
    accent: '#9CA3AF',
    route: null,
    bg: 'rgba(107,114,128,0.05)',
  },
};

export default function DayCard({ dayType, isCompleted, onSwitchPress }) {
  const navigate = useNavigate();
  const config = DAY_CONFIG[dayType] || DAY_CONFIG.rest;

  return (
    <div
      style={{
        background: 'var(--surface)',
        borderRadius: 16,
        border: `1px solid ${config.border}`,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: config.gradient,
          pointerEvents: 'none',
        }}
      />

      {/* Completed banner */}
      {isCompleted && (
        <div
          style={{
            background: 'rgba(34,197,94,0.15)',
            borderBottom: '1px solid rgba(34,197,94,0.2)',
            padding: '6px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <CheckCircle2 size={14} color="#4ADE80" />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#4ADE80' }}>
            Workout Complete — Great session!
          </span>
        </div>
      )}

      <div style={{ padding: '20px 20px 20px', position: 'relative' }}>
        {/* Day type label */}
        <div style={{ marginBottom: 6 }}>
          <span
            className="tag"
            style={{
              background: config.bg,
              color: config.accent,
              border: `1px solid ${config.border}`,
            }}
          >
            {config.label}
          </span>
        </div>

        {/* Muscles */}
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '4px 0 16px' }}>
          {config.subtitle}
        </p>

        {/* CTA */}
        <div className="flex gap-3 flex-wrap">
          {config.route && !isCompleted && (
            <button
              className="btn btn-primary btn-lg"
              onClick={() => navigate(config.route)}
              style={{ flex: 1, minWidth: 140 }}
            >
              Start Workout
              <ArrowRight size={18} />
            </button>
          )}

          {config.route && isCompleted && (
            <button
              className="btn btn-secondary"
              onClick={() => navigate(config.route)}
              style={{ flex: 1 }}
            >
              View Exercises
            </button>
          )}

          {dayType === 'rest' && (
            <p style={{ color: 'var(--text-muted)', fontSize: 13, alignSelf: 'center' }}>
              Rest well — recovery is part of the program 💤
            </p>
          )}

          <button
            className="btn btn-ghost"
            onClick={onSwitchPress}
            style={{ flexShrink: 0 }}
          >
            Switch
          </button>
        </div>
      </div>
    </div>
  );
}
