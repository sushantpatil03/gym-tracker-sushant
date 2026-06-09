import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import WorkoutDay from './pages/WorkoutDay';
import ExerciseDetail from './pages/ExerciseDetail';
import History from './pages/History';
import { useWorkoutStore } from './store/workoutStore';

function WorkoutRedirect() {
  const { getTodayWorkout } = useWorkoutStore();
  const todayWorkout = getTodayWorkout();
  const type = todayWorkout?.type || 'push1';
  return <Navigate to={`/workout/${type}`} replace />;
}

export default function App() {
  const { resetWeek } = useWorkoutStore();

  useEffect(() => {
    resetWeek();
  }, []);

  return (
    <BrowserRouter>
      <div style={{ maxWidth: 480, margin: '0 auto', position: 'relative', minHeight: '100dvh' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/workout" element={<WorkoutRedirect />} />
          <Route path="/workout/:dayType" element={<WorkoutDay />} />
          <Route path="/exercise/:id" element={<ExerciseDetail />} />
          <Route path="/history" element={<History />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}
