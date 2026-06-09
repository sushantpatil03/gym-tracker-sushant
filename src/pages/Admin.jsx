import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Settings } from 'lucide-react';
import { login, verifyToken } from '../lib/api';
import ExerciseManager from '../components/admin/ExerciseManager';
import VideoManager from '../components/admin/VideoManager';

const TABS = [
  { id: 'exercises', label: 'Exercises' },
  { id: 'videos', label: 'Videos' },
];

function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await login(password);
    setLoading(false);
    if (res.token) {
      localStorage.setItem('admin_token', res.token);
      onLogin(res.token);
    } else {
      setError(res.error || 'Invalid password');
    }
  };

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Settings size={30} color="var(--accent)" />
          </div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, fontFamily: 'DM Sans, sans-serif', color: 'var(--text-primary)' }}>Admin Panel</h1>
          <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: 14 }}>GymTracker — manage exercises & videos</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ position: 'relative' }}>
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              className="input"
              style={{ paddingRight: 48 }}
              autoFocus
            />
            <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {error && <p style={{ color: '#FCA5A5', fontSize: 13, margin: 0 }}>{error}</p>}
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            <Lock size={16} />
            {loading ? 'Logging in...' : 'Enter Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem('admin_token'));
  const [activeTab, setActiveTab] = useState('exercises');
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!token) { setChecking(false); return; }
    verifyToken(token).then(({ valid }) => {
      if (!valid) { localStorage.removeItem('admin_token'); setToken(null); }
      else setVerified(true);
      setChecking(false);
    });
  }, [token]);

  if (checking) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Checking auth...</div>;
  }

  if (!token || !verified) {
    return <LoginScreen onLogin={(t) => { setToken(t); setVerified(true); }} />;
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setVerified(false);
  };

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
      {/* Admin header */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Settings size={20} color="var(--accent)" />
          <span style={{ fontWeight: 800, fontSize: 16, fontFamily: 'DM Sans, sans-serif', color: 'var(--text-primary)' }}>Admin Panel</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a href="/" style={{ color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>← App</a>
          <button onClick={handleLogout} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 10px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>Logout</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        {TABS.map(({ id, label }) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{ flex: 1, padding: '12px 0', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: activeTab === id ? 700 : 500, fontSize: 14, color: activeTab === id ? 'var(--accent)' : 'var(--text-secondary)', borderBottom: activeTab === id ? '2px solid var(--accent)' : '2px solid transparent', transition: 'all 0.15s' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding: '20px', maxWidth: 900, margin: '0 auto' }}>
        {activeTab === 'exercises' && <ExerciseManager token={token} />}
        {activeTab === 'videos' && <VideoManager token={token} />}
      </div>
    </div>
  );
}
