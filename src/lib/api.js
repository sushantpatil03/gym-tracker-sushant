const API_BASE = import.meta.env.VITE_API_URL || '';

// Session cache so we don't re-fetch on every navigation
const cache = new Map();

async function fetchWithFallback(url, fallbackFn) {
  if (cache.has(url)) return cache.get(url);

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    const data = await res.json();
    cache.set(url, data);
    return data;
  } catch (err) {
    console.warn(`[api] falling back to local data for ${url}:`, err.message);
    if (fallbackFn) return fallbackFn();
    throw err;
  }
}

// Import local JSON as offline fallback
async function localExercises() {
  const { exercises } = await import('../data/exercises.json');
  return { exercises };
}

async function localExercise(id) {
  const { exercises } = await import('../data/exercises.json');
  const ex = exercises.find((e) => e.id === id);
  return ex ? { ...ex, videos: ex.youtube_video_id ? [{ youtube_video_id: ex.youtube_video_id, is_primary: 1 }] : [] } : null;
}

// Exercises
export const fetchExercises = (params = {}) => {
  if (!API_BASE) return localExercises();
  const qs = new URLSearchParams(params).toString();
  const url = `${API_BASE}/api/exercises${qs ? '?' + qs : ''}`;
  return fetchWithFallback(url, localExercises);
};

export const fetchExercise = (id) => {
  if (!API_BASE) return localExercise(id);
  return fetchWithFallback(`${API_BASE}/api/exercises/${id}`, () => localExercise(id));
};

export const updateExercise = (id, data, token) =>
  fetch(`${API_BASE}/api/exercises/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  }).then((r) => r.json());

export const createExercise = (data, token) =>
  fetch(`${API_BASE}/api/exercises`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  }).then((r) => r.json());

export const deleteExercise = (id, token) =>
  fetch(`${API_BASE}/api/exercises/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  }).then((r) => r.json());

export const reorderExercises = (items, token) =>
  fetch(`${API_BASE}/api/exercises/reorder`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ items }),
  }).then((r) => r.json());

// Videos
export const fetchVideos = (exerciseId) =>
  fetch(`${API_BASE}/api/videos/${exerciseId}`).then((r) => r.json());

export const addVideo = (data, token) =>
  fetch(`${API_BASE}/api/videos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  }).then((r) => r.json());

export const deleteVideo = (id, token) =>
  fetch(`${API_BASE}/api/videos/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  }).then((r) => r.json());

export const setPrimaryVideo = (id, token) =>
  fetch(`${API_BASE}/api/videos/${id}/primary`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  }).then((r) => r.json());

// Auth
export const login = (password) =>
  fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  }).then((r) => r.json());

export const verifyToken = (token) =>
  fetch(`${API_BASE}/api/auth/verify`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  }).then((r) => r.json());

// Logs sync
export const syncLogs = (user_name, logs) => {
  if (!API_BASE) return Promise.resolve({ success: false, reason: 'no_api' });
  return fetch(`${API_BASE}/api/logs/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_name, logs }),
  }).then((r) => r.json()).catch(() => ({ success: false }));
};

// Clear session cache (call after admin edits)
export const clearCache = () => cache.clear();
