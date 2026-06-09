import { useState, useEffect } from 'react';
import { fetchExercises, fetchVideos, addVideo, deleteVideo, setPrimaryVideo, clearCache } from '../../lib/api';
import { Trash2, Star, Plus, ExternalLink } from 'lucide-react';

export default function VideoManager({ token }) {
  const [exercises, setExercises] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [videos, setVideos] = useState([]);
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [loadingVideos, setLoadingVideos] = useState(false);

  useEffect(() => {
    fetchExercises().then(data => {
      const mainExercises = (data.exercises || []).filter(e => !e.is_warmup && !e.is_cooldown);
      setExercises(mainExercises);
    });
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoadingVideos(true);
    fetchVideos(selectedId).then(data => {
      setVideos(data.videos || []);
      setLoadingVideos(false);
    });
  }, [selectedId]);

  const handleAdd = async () => {
    if (!newUrl.trim()) return;
    setAdding(true);
    setError('');
    const res = await addVideo({ exercise_id: selectedId, youtube_video_id: newUrl, title: newTitle || undefined }, token);
    setAdding(false);
    if (res.success) {
      clearCache();
      setNewUrl('');
      setNewTitle('');
      // Reload videos
      const data = await fetchVideos(selectedId);
      setVideos(data.videos || []);
    } else {
      setError(res.error || 'Failed to add video');
    }
  };

  const handleDelete = async (id) => {
    await deleteVideo(id, token);
    clearCache();
    setVideos(prev => prev.filter(v => Number(v.id) !== id));
  };

  const handleSetPrimary = async (id) => {
    await setPrimaryVideo(id, token);
    clearCache();
    setVideos(prev => prev.map(v => ({ ...v, is_primary: Number(v.id) === id ? 1 : 0 })));
  };

  // Extract video ID for thumbnail
  const getThumb = (videoId) => `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

  const selectedExercise = exercises.find(e => e.id === selectedId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Exercise selector */}
      <div>
        <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Select Exercise</label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="input"
          style={{ fontSize: 14 }}
        >
          <option value="">— choose an exercise —</option>
          {exercises.map(e => (
            <option key={e.id} value={e.id}>{e.name} ({e.day_type}{e.push_day ? ` ${e.push_day}` : ''})</option>
          ))}
        </select>
      </div>

      {selectedId && (
        <>
          {/* Current videos */}
          <div>
            <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Assigned Videos for {selectedExercise?.name}
            </p>
            {loadingVideos ? (
              <div className="shimmer" style={{ height: 100, borderRadius: 10 }} />
            ) : videos.length === 0 ? (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '20px', textAlign: 'center' }}>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 13 }}>No videos assigned yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {videos.map(v => (
                  <div key={v.id} style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'var(--surface)', border: `1px solid ${Number(v.is_primary) ? 'rgba(249,115,22,0.3)' : 'var(--border)'}`, borderRadius: 10, padding: '10px 14px' }}>
                    {/* Thumbnail */}
                    <img src={getThumb(v.youtube_video_id)} alt="" style={{ width: 80, height: 45, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} onError={(e) => { e.target.style.display = 'none'; }} />
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        {Number(v.is_primary) ? <span style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 700 }}>PRIMARY</span> : null}
                        <span className="font-mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{v.youtube_video_id}</span>
                      </div>
                      {v.title && <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>{v.title}</p>}
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <a href={`https://youtube.com/watch?v=${v.youtube_video_id}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                        <ExternalLink size={14} />
                      </a>
                      {!Number(v.is_primary) && (
                        <button onClick={() => handleSetPrimary(Number(v.id))} title="Set as primary" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--warning)', display: 'flex', alignItems: 'center' }}>
                          <Star size={14} />
                        </button>
                      )}
                      <button onClick={() => handleDelete(Number(v.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FCA5A5', display: 'flex', alignItems: 'center' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add new video */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px' }}>
            <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Add YouTube Video</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                value={newUrl}
                onChange={(e) => { setNewUrl(e.target.value); setError(''); }}
                placeholder="YouTube URL or video ID (e.g. dQw4w9WgXcQ)"
                className="input font-mono"
                style={{ fontSize: 13 }}
              />
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Optional label (e.g. 'Jeff Nippard — Bench Press')"
                className="input"
                style={{ fontSize: 13 }}
              />
              {error && <p style={{ margin: 0, fontSize: 12, color: '#FCA5A5' }}>{error}</p>}
              <button className="btn btn-primary" onClick={handleAdd} disabled={adding || !newUrl.trim()}>
                <Plus size={14} /> {adding ? 'Adding...' : 'Add Video'}
              </button>
            </div>
          </div>
        </>
      )}

      {!selectedId && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: 14 }}>
          ← Select an exercise above to manage its videos
        </div>
      )}
    </div>
  );
}
