import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import exercisesData from '../data/exercises.json';
import ExerciseCard from '../components/ExerciseCard';
import WarmupBlock from '../components/WarmupBlock';
import { useWorkoutStore } from '../store/workoutStore';

const DAY_CONFIG = {
  push1: {
    title: 'Push Day 1',
    subtitle: 'Chest · Triceps · Front Delts',
    accent: '#F97316',
    bg: 'rgba(249,115,22,0.06)',
    filter: (e) => e.day_type === 'push' && e.push_day === 1 && !e.is_warmup && !e.is_cooldown,
    warmupFilter: (e) => (e.day_type === 'all' || e.day_type === 'push') && e.is_warmup,
    dayKey: 'mon',
  },
  push2: {
    title: 'Push Day 2',
    subtitle: 'Shoulders · Triceps · Incline',
    accent: '#F97316',
    bg: 'rgba(249,115,22,0.06)',
    filter: (e) => e.day_type === 'push' && e.push_day === 2 && !e.is_warmup && !e.is_cooldown,
    warmupFilter: (e) => (e.day_type === 'all' || e.day_type === 'push') && e.is_warmup,
    dayKey: 'thu',
  },
  pull1: {
    title: 'Pull Day 1',
    subtitle: 'Back · Biceps · Rear Delts',
    accent: '#A78BFA',
    bg: 'rgba(124,58,237,0.06)',
    filter: (e) => e.day_type === 'pull' && e.push_day === 1 && !e.is_warmup && !e.is_cooldown,
    warmupFilter: (e) => (e.day_type === 'all' || e.day_type === 'pull') && e.is_warmup,
    dayKey: 'tue',
  },
  pull2: {
    title: 'Pull Day 2',
    subtitle: 'Back · Biceps · Deadlifts',
    accent: '#A78BFA',
    bg: 'rgba(124,58,237,0.06)',
    filter: (e) => e.day_type === 'pull' && e.push_day === 2 && !e.is_warmup && !e.is_cooldown,
    warmupFilter: (e) => (e.day_type === 'all' || e.day_type === 'pull') && e.is_warmup,
    dayKey: 'fri',
  },
  legs: {
    title: 'Legs Day',
    subtitle: 'Quads · Hamstrings · Calves',
    accent: '#4ADE80',
    bg: 'rgba(34,197,94,0.06)',
    filter: (e) => e.day_type === 'legs' && !e.is_warmup && !e.is_cooldown,
    warmupFilter: (e) => (e.day_type === 'all' || e.day_type === 'legs') && e.is_warmup,
    dayKey: 'wed',
  },
};

export default function WorkoutDay() {
  const { dayType } = useParams();
  const navigate = useNavigate();
  const { markComplete, completedDays, getTodayKey } = useWorkoutStore();

  const config = DAY_CONFIG[dayType];
  if (!config) {
    navigate('/');
    return null;
  }

  const { exercises } = exercisesData;
  const mainExercises = exercises.filter(config.filter).sort((a, b) => a.order - b.order);
  const warmupExercises = exercises.filter(config.warmupFilter).sort((a, b) => a.order - b.order);
  const cooldownExercises = exercises.filter((e) => e.is_cooldown).sort((a, b) => a.order - b.order);

  // Determine which day key this corresponds to
  const todayKey = getTodayKey();
  const isToday = config.dayKey === todayKey;
  const isDone = isToday && completedDays.includes(todayKey);

  const handleFinish = () => {
    if (isToday) markComplete(todayKey);
    navigate('/');
  };

  return (
    <div className="page-enter" style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: 'rgba(15,15,15,0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          padding: '12px 20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <ArrowLeft size={18} color="var(--text-primary)" />
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, fontFamily: 'DM Sans, sans-serif', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              {config.title}
            </h1>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>
              {config.subtitle}
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Warmup block */}
        <WarmupBlock exercises={warmupExercises} title="Pre-workout Warmup" defaultOpen={true} />

        {/* Main exercises */}
        <div>
          <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Main Workout — {mainExercises.length} exercises
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {mainExercises.map((ex, idx) => (
              <ExerciseCard key={ex.id} exercise={ex} index={idx + 1} />
            ))}
          </div>
        </div>

        {/* Cooldown block */}
        <WarmupBlock exercises={cooldownExercises} title="Post-workout Cooldown" defaultOpen={false} />

        {/* Finish Workout button */}
        <div style={{ marginTop: 8 }}>
          <button
            className="btn btn-primary btn-full btn-lg"
            onClick={handleFinish}
            style={{
              background: isDone
                ? 'rgba(34,197,94,0.15)'
                : 'linear-gradient(135deg, var(--accent) 0%, #EA6C0A 100%)',
              color: isDone ? '#4ADE80' : '#fff',
              border: isDone ? '1px solid rgba(34,197,94,0.3)' : 'none',
              boxShadow: isDone ? 'none' : '0 4px 20px rgba(249,115,22,0.3)',
              fontSize: 16,
              padding: '16px',
              borderRadius: 14,
            }}
          >
            {isDone ? (
              <>
                <CheckCircle2 size={20} />
                Workout Complete!
              </>
            ) : (
              <>
                <CheckCircle2 size={20} />
                Finish Workout
              </>
            )}
          </button>
          {!isToday && (
            <p style={{ textAlign: 'center', margin: '8px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
              Viewing {config.title} — tap Finish to complete today's workout
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
