import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Clock, Save } from 'lucide-react';
import VideoEmbed from '../components/VideoEmbed';
import { fetchExercise } from '../lib/api';
import { useLogStore } from '../store/logStore';
import { useWorkoutStore } from '../store/workoutStore';
import exercisesData from '../data/exercises.json';

const TIP_STYLES = {
  '🚫': { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', color: '#FCA5A5' },
  '✅': { bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)', color: '#86EFAC' },
  '⚠️': { bg: 'rgba(234,179,8,0.08)', border: 'rgba(234,179,8,0.2)', color: '#FDE047' },
};

function FormTip({ tip }) {
  const icon = tip.startsWith('🚫') ? '🚫' : tip.startsWith('✅') ? '✅' : tip.startsWith('⚠️') ? '⚠️' : null;
  const style = TIP_STYLES[icon] || { bg: 'rgba(156,163,175,0.08)', border: 'rgba(156,163,175,0.2)', color: '#D1D5DB' };
  const text = icon ? tip.slice(icon === '⚠️' ? 3 : 2).trim() : tip;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', background: style.bg, border: `1px solid ${style.border}`, borderRadius: 10 }}>
      {icon && <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{icon}</span>}
      <span style={{ fontSize: 13, color: style.color, lineHeight: 1.5 }}>{text}</span>
    </div>
  );
}

// Inline log section — appears at bottom of page
function LogSection({ exercise, lastSession }) {
  const [open, setOpen] = useState(false);
  const [sets, setSets] = useState(() =>
    Array.from({ length: exercise.default_sets }, (_, i) => ({ set: i + 1, weight: '', reps: '' }))
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { saveLog } = useLogStore();
  const { activeUser } = useWorkoutStore();

  const handleChange = (idx, field, value) => {
    setSets((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
    setSaved(false);
  };

  const handleSaveAll = async () => {
    const filled = sets.filter((s) => s.weight || s.reps);
    if (!filled.length) return;
    setSaving(true);
    const today = new Date().toISOString().split('T')[0];
    for (const s of filled) {
      await saveLog({
        user_name: activeUser,
        exercise_id: exercise.id,
        log_date: today,
        set_number: s.set,
        weight_kg: parseFloat(s.weight) || 0,
        reps_done: parseInt(s.reps) || 0,
      });
    }
    setSaving(false);
    setSaved(true);
  };

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
      {/* Toggle header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full no-select"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px', background: open ? 'rgba(249,115,22,0.06)' : 'var(--surface)',
          border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
          borderBottom: open ? '1px solid var(--border)' : 'none', transition: 'background 0.2s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 16 }}>📝</span>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: open ? 'var(--accent)' : 'var(--text-primary)' }}>
              Log Today's Session
            </p>
            <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>
              Optional — fill in what you lifted after your workout
            </p>
          </div>
        </div>
        {open ? <ChevronUp size={18} color="var(--accent)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
      </button>

      {open && (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 10, background: 'rgba(0,0,0,0.15)' }}>
          {/* Prescription + last session */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span className="font-mono" style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)' }}>
              {exercise.default_sets} × {exercise.default_reps}
            </span>
            {lastSession && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={11} /> Last: {lastSession.date}
              </span>
            )}
          </div>

          {/* Last session summary */}
          {lastSession?.sets?.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingBottom: 4 }}>
              {lastSession.sets.map((s) => (
                <span key={s.id} style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '2px 8px' }} className="font-mono">
                  S{s.set_number}: {s.weight_kg || '—'}kg × {s.reps_done || '—'}
                </span>
              ))}
            </div>
          )}

          {/* Set rows — compact */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sets.map((s, idx) => {
              const last = lastSession?.sets?.find((ls) => ls.set_number === s.set);
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="font-mono" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', width: 32, flexShrink: 0 }}>
                    S{s.set}
                  </span>
                  <input
                    type="number" inputMode="decimal" value={s.weight}
                    onChange={(e) => handleChange(idx, 'weight', e.target.value)}
                    placeholder={last?.weight_kg || 'kg'}
                    className="input font-mono" style={{ flex: 1, textAlign: 'center', padding: '10px 8px', fontSize: 14 }}
                  />
                  <span style={{ color: 'var(--text-muted)', fontSize: 13, flexShrink: 0 }}>×</span>
                  <input
                    type="number" inputMode="numeric" value={s.reps}
                    onChange={(e) => handleChange(idx, 'reps', e.target.value)}
                    placeholder={last?.reps_done || 'reps'}
                    className="input font-mono" style={{ flex: 1, textAlign: 'center', padding: '10px 8px', fontSize: 14 }}
                  />
                </div>
              );
            })}
          </div>

          {/* Save All */}
          <button
            className="btn btn-primary btn-full"
            onClick={handleSaveAll}
            disabled={saving}
            style={{
              marginTop: 4,
              background: saved ? 'rgba(34,197,94,0.15)' : saving ? 'rgba(249,115,22,0.5)' : 'var(--accent)',
              color: saved ? '#4ADE80' : '#fff',
              border: saved ? '1px solid rgba(34,197,94,0.3)' : 'none',
              borderRadius: 10, padding: '12px', fontSize: 14,
            }}
          >
            <Save size={15} />
            {saved ? 'Saved! ✓' : saving ? 'Saving...' : 'Save All Sets'}
          </button>
          <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
            Tip: Leave blank any sets you want to skip
          </p>
        </div>
      )}
    </div>
  );
}

export default function ExerciseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastSession, setLastSession] = useState(null);
  const { getLastSession } = useLogStore();
  const { activeUser } = useWorkoutStore();

  useEffect(() => {
    // Try API first, fallback to local JSON
    fetchExercise(id)
      .then((data) => setExercise(data))
      .catch(() => {
        const local = exercisesData.exercises.find((e) => e.id === id);
        setExercise(local || null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (exercise) {
      getLastSession(exercise.id, activeUser).then(setLastSession);
    }
  }, [exercise, activeUser]);

  if (loading) {
    return (
      <div style={{ padding: '40px 20px' }}>
        <div className="shimmer" style={{ height: 200, borderRadius: 12, marginBottom: 16 }} />
        <div className="shimmer" style={{ height: 60, borderRadius: 10, marginBottom: 12 }} />
        <div className="shimmer" style={{ height: 120, borderRadius: 10 }} />
      </div>
    );
  }

  if (!exercise) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Exercise not found</p>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="page-enter" style={{ paddingBottom: 80 }}>
      {/* Sticky header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(15,15,15,0.95)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.04)', padding: '12px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginTop: 2 }}>
            <ArrowLeft size={18} color="var(--text-primary)" />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ margin: 0, fontSize: 19, fontWeight: 800, fontFamily: 'DM Sans, sans-serif', color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {exercise.name}
            </h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 5 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 5, padding: '2px 7px' }}>
                {exercise.muscle_group}
              </span>
              {exercise.secondary_muscles?.map((m) => (
                <span key={m} style={{ fontSize: 10, color: 'var(--text-muted)', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 5, padding: '2px 7px' }}>{m}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Single scroll content */}
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Videos */}
        {exercise.videos && exercise.videos.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {exercise.videos.map((v, i) => (
              <VideoEmbed key={v.id || i} videoId={v.youtube_video_id} title={v.title || `${exercise.name} — demonstration`} />
            ))}
          </div>
        ) : exercise.youtube_video_id ? (
          <VideoEmbed videoId={exercise.youtube_video_id} title={`${exercise.name} — demonstration`} />
        ) : null}

        {/* Prescription */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Prescription</span>
          <span className="font-mono" style={{ fontWeight: 700, fontSize: 22, color: 'var(--accent)' }}>
            {exercise.default_sets} × {exercise.default_reps}
          </span>
        </div>

        {/* Step-by-step */}
        {exercise.instructions?.length > 0 && (
          <div>
            <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Step-by-step
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {exercise.instructions.map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    <span className="font-mono" style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>{i + 1}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6 }}>{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form tips */}
        {exercise.form_tips?.length > 0 && (
          <div>
            <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Form Tips
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {exercise.form_tips.map((tip, i) => <FormTip key={i} tip={tip} />)}
            </div>
          </div>
        )}

        {/* Log section — collapsible, at bottom */}
        <LogSection exercise={exercise} lastSession={lastSession} />

      </div>
    </div>
  );
}
