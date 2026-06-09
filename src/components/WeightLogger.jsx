import { useState, useEffect } from 'react';
import { Save, ChevronDown, Clock } from 'lucide-react';
import { useLogStore } from '../store/logStore';
import { useWorkoutStore } from '../store/workoutStore';

function SetRow({ setNum, lastSet, onSave }) {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!weight && !reps) return;
    await onSave({ set_number: setNum, weight_kg: parseFloat(weight) || 0, reps_done: parseInt(reps) || 0, notes: note });
    setSaved(true);
  };

  return (
    <div
      style={{
        padding: '12px 14px',
        background: saved ? 'rgba(34,197,94,0.06)' : 'var(--surface-2)',
        border: `1px solid ${saved ? 'rgba(34,197,94,0.2)' : 'var(--border)'}`,
        borderRadius: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        transition: 'all 0.25s',
      }}
    >
      {/* Set header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: saved ? '#4ADE80' : 'var(--text-secondary)' }}>
          Set {setNum}
          {saved && ' ✓'}
        </span>
        {lastSet && (
          <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={10} />
            Last: <span className="font-mono" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
              {lastSet.weight_kg || '—'}kg × {lastSet.reps_done || '—'}
            </span>
          </span>
        )}
      </div>

      {/* Inputs row */}
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
            Weight (kg)
          </label>
          <input
            type="number"
            inputMode="decimal"
            value={weight}
            onChange={(e) => { setWeight(e.target.value); setSaved(false); }}
            placeholder={lastSet?.weight_kg || '0'}
            className="input"
            style={{ textAlign: 'center' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
            Reps
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={reps}
            onChange={(e) => { setReps(e.target.value); setSaved(false); }}
            placeholder={lastSet?.reps_done || '0'}
            className="input"
            style={{ textAlign: 'center' }}
          />
        </div>
      </div>

      {/* Note field */}
      <input
        type="text"
        value={note}
        onChange={(e) => { setNote(e.target.value); setSaved(false); }}
        placeholder="Note (optional)"
        className="input"
        style={{ fontSize: 13 }}
      />

      {/* Save button */}
      <button
        className="btn btn-primary"
        onClick={handleSave}
        style={{
          background: saved ? 'rgba(34,197,94,0.2)' : 'var(--accent)',
          color: saved ? '#4ADE80' : '#fff',
          border: saved ? '1px solid rgba(34,197,94,0.3)' : 'none',
          width: '100%',
          fontSize: 13,
          padding: '10px',
          borderRadius: 8,
        }}
      >
        <Save size={14} />
        {saved ? 'Saved!' : 'Log Set'}
      </button>
    </div>
  );
}

export default function WeightLogger({ exercise }) {
  const { saveLog, getLastSession } = useLogStore();
  const { activeUser } = useWorkoutStore();
  const [lastSession, setLastSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLastSession(exercise.id, activeUser).then((data) => {
      setLastSession(data);
      setLoading(false);
    });
  }, [exercise.id, activeUser]);

  const handleSave = async (setData) => {
    await saveLog({
      user_name: activeUser,
      exercise_id: exercise.id,
      log_date: new Date().toISOString().split('T')[0],
      ...setData,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Prescription */}
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Prescription</span>
        <span className="font-mono" style={{ fontWeight: 700, fontSize: 18, color: 'var(--accent)' }}>
          {exercise.default_sets} × {exercise.default_reps}
        </span>
      </div>

      {/* Last session info */}
      {!loading && lastSession && (
        <div
          style={{
            background: 'rgba(249,115,22,0.06)',
            border: '1px solid rgba(249,115,22,0.15)',
            borderRadius: 10,
            padding: '10px 14px',
          }}
        >
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
            Last session — {lastSession.date}
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {lastSession.sets.map((s) => (
              <span key={s.id} className="font-mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                S{s.set_number}: {s.weight_kg}kg×{s.reps_done}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Set rows */}
      {Array.from({ length: exercise.default_sets }, (_, i) => (
        <SetRow
          key={i}
          setNum={i + 1}
          lastSet={lastSession?.sets?.find((s) => s.set_number === i + 1)}
          onSave={handleSave}
        />
      ))}

      {/* Skip info */}
      <p style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', margin: '4px 0' }}>
        Logging is optional — skip freely 👍
      </p>
    </div>
  );
}
