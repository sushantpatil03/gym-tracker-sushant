import { useState, useEffect } from 'react';
import { fetchExercises, updateExercise, deleteExercise, clearCache } from '../../lib/api';
import { ChevronUp, ChevronDown, Trash2, Save, Plus, X } from 'lucide-react';

const DAY_OPTIONS = [
  { value: 'push', label: 'Push' },
  { value: 'pull', label: 'Pull' },
  { value: 'legs', label: 'Legs' },
  { value: 'all', label: 'All (Warmup/Cooldown)' },
];

function TipEditor({ tips, onChange }) {
  const [newTip, setNewTip] = useState('');
  const addTip = () => {
    if (!newTip.trim()) return;
    onChange([...tips, newTip.trim()]);
    setNewTip('');
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {tips.map((tip, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            value={tip}
            onChange={(e) => { const t = [...tips]; t[i] = e.target.value; onChange(t); }}
            className="input" style={{ flex: 1, fontSize: 12, padding: '6px 10px' }}
          />
          <button onClick={() => onChange(tips.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0 }}>
            <X size={14} />
          </button>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={newTip} onChange={(e) => setNewTip(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTip()} placeholder="Add tip (prefix with ✅ 🚫 ⚠️)" className="input" style={{ flex: 1, fontSize: 12, padding: '6px 10px' }} />
        <button onClick={addTip} className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: 12, flexShrink: 0 }}>
          <Plus size={14} /> Add
        </button>
      </div>
    </div>
  );
}

function ExerciseRow({ exercise, token, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...exercise });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await updateExercise(exercise.id, form, token);
    clearCache();
    setSaving(false);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const set = (field, value) => { setForm(f => ({ ...f, [field]: value })); setSaved(false); };

  return (
    <div style={{ background: 'var(--surface)', border: `1px solid ${editing ? 'rgba(249,115,22,0.3)' : 'var(--border)'}`, borderRadius: 10, overflow: 'hidden', transition: 'border-color 0.2s' }}>
      {/* Row header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', cursor: 'pointer' }} onClick={() => setEditing(!editing)}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{exercise.name}</p>
          <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, color: 'var(--accent)', background: 'rgba(249,115,22,0.1)', borderRadius: 4, padding: '1px 6px' }}>{exercise.muscle_group}</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', background: 'var(--surface-2)', borderRadius: 4, padding: '1px 6px' }}>{exercise.day_type}{exercise.push_day ? ` ${exercise.push_day}` : ''}</span>
            {exercise.is_warmup && <span style={{ fontSize: 10, color: '#FDE047', background: 'rgba(234,179,8,0.1)', borderRadius: 4, padding: '1px 6px' }}>warmup</span>}
            {exercise.is_cooldown && <span style={{ fontSize: 10, color: '#86EFAC', background: 'rgba(34,197,94,0.1)', borderRadius: 4, padding: '1px 6px' }}>cooldown</span>}
            {saved && <span style={{ fontSize: 10, color: '#4ADE80' }}>✓ Saved</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          {editing ? <ChevronUp size={16} color="var(--accent)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '14px', display: 'flex', flexDirection: 'column', gap: 14, background: 'rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Name</label>
              <input value={form.name} onChange={(e) => set('name', e.target.value)} className="input" style={{ fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Muscle Group</label>
              <input value={form.muscle_group} onChange={(e) => set('muscle_group', e.target.value)} className="input" style={{ fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Sets</label>
              <input type="number" value={form.default_sets} onChange={(e) => set('default_sets', Number(e.target.value))} className="input font-mono" style={{ fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Reps</label>
              <input value={form.default_reps} onChange={(e) => set('default_reps', e.target.value)} className="input font-mono" style={{ fontSize: 13 }} placeholder="e.g. 8-12" />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Day Type</label>
              <select value={form.day_type} onChange={(e) => set('day_type', e.target.value)} className="input" style={{ fontSize: 13 }}>
                {DAY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Push Day (1 or 2)</label>
              <input type="number" value={form.push_day || ''} onChange={(e) => set('push_day', e.target.value ? Number(e.target.value) : null)} className="input font-mono" style={{ fontSize: 13 }} placeholder="1 or 2" />
            </div>
          </div>

          {/* Form tips */}
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Form Tips</label>
            <TipEditor tips={form.form_tips || []} onChange={(tips) => set('form_tips', tips)} />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ flex: 1 }}>
              <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button onClick={() => { if (confirm(`Delete "${exercise.name}"?`)) onDelete(exercise.id); }} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', cursor: 'pointer', color: '#FCA5A5' }}>
              <Trash2 size={14} />
            </button>
            <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExerciseManager({ token }) {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('push');
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    const data = await fetchExercises();
    setExercises(data.exercises || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    await deleteExercise(id, token);
    clearCache();
    setExercises(prev => prev.filter(e => e.id !== id));
  };

  const filterOptions = [
    { value: 'push', label: 'Push' },
    { value: 'pull', label: 'Pull' },
    { value: 'legs', label: 'Legs' },
    { value: 'all', label: 'Warmup/Cooldown' },
  ];

  const filtered = exercises.filter(e => {
    const matchesType = filter === 'all' ? (e.is_warmup || e.is_cooldown) : e.day_type === filter && !e.is_warmup && !e.is_cooldown;
    const matchesSearch = !search || e.name.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {filterOptions.map(o => (
          <button key={o.value} onClick={() => setFilter(o.value)} className="btn" style={{ padding: '8px 16px', fontSize: 13, background: filter === o.value ? 'rgba(249,115,22,0.15)' : 'var(--surface)', border: filter === o.value ? '1px solid rgba(249,115,22,0.3)' : '1px solid var(--border)', color: filter === o.value ? 'var(--accent)' : 'var(--text-secondary)' }}>
            {o.label} {filter === o.value && `(${filtered.length})`}
          </button>
        ))}
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search exercises..." className="input" style={{ flex: 1, minWidth: 150, fontSize: 13, padding: '8px 12px' }} />
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1,2,3].map(i => <div key={i} className="shimmer" style={{ height: 60, borderRadius: 10 }} />)}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 32 }}>No exercises found</p>
          ) : (
            filtered.map(ex => <ExerciseRow key={ex.id} exercise={ex} token={token} onDelete={handleDelete} />)
          )}
        </div>
      )}
    </div>
  );
}
