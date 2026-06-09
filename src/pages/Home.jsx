import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, User, ChevronDown } from 'lucide-react';
import WeekTimeline from '../components/WeekTimeline';
import DayCard from '../components/DayCard';
import SwitchDaySheet from '../components/SwitchDaySheet';
import InstallPrompt from '../components/InstallPrompt';
import { useWorkoutStore } from '../store/workoutStore';
import { getTodayFormatted } from '../lib/dateUtils';

export default function Home() {
  const navigate = useNavigate();
  const { getTodayKey, getTodayWorkout, weekPlan, completedDays, streak, activeUser, setActiveUser } = useWorkoutStore();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const todayKey = getTodayKey();
  const todayWorkout = getTodayWorkout();
  const isCompleted = completedDays.includes(todayKey);

  const handleDayPress = (dayKey, plan) => {
    setSelectedDay(dayKey);
    setSheetOpen(true);
  };

  return (
    <div className="page-enter" style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div
        style={{
          padding: '16px 20px 12px',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: 'rgba(15,15,15,0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* App branding */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 22, fontWeight: 900, fontFamily: 'DM Sans, sans-serif', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                GymTracker
              </span>
              <span style={{ fontSize: 20 }}>🏋️</span>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', marginTop: 1 }}>
              {getTodayFormatted()}
            </p>
          </div>

          {/* User selector */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 20,
                padding: '6px 12px 6px 8px',
                cursor: 'pointer',
              }}
            >
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={13} color="#fff" />
              </div>
              <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                {activeUser}
              </span>
              <ChevronDown size={13} color="var(--text-muted)" />
            </button>

            {userMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 42,
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  overflow: 'hidden',
                  minWidth: 140,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                  zIndex: 50,
                }}
              >
                {['sush', 'vishwajeet'].map((user) => (
                  <button
                    key={user}
                    onClick={() => { setActiveUser(user); setUserMenuOpen(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '12px 16px',
                      background: activeUser === user ? 'rgba(249,115,22,0.1)' : 'transparent',
                      border: 'none',
                      width: '100%',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: activeUser === user ? 'var(--accent)' : 'var(--border)' }} />
                    <span style={{ fontWeight: 600, fontSize: 14, color: activeUser === user ? 'var(--accent)' : 'var(--text-primary)', textTransform: 'capitalize' }}>
                      {user}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Streak */}
        {streak > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              background: 'rgba(249,115,22,0.08)',
              border: '1px solid rgba(249,115,22,0.15)',
              borderRadius: 10,
            }}
          >
            <Flame size={18} color="var(--accent)" />
            <span style={{ fontWeight: 700, fontSize: 14 }}>
              <span className="streak-glow" style={{ color: 'var(--accent)' }}>{streak} day{streak !== 1 ? 's' : ''}</span>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}> straight — keep going!</span>
            </span>
          </div>
        )}

        {/* Install Prompt */}
        <InstallPrompt />

        {/* Today's Workout Hero */}
        <div>
          <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Today's Workout
          </p>
          <DayCard
            dayType={todayWorkout?.type || 'rest'}
            isCompleted={isCompleted}
            onSwitchPress={() => { setSelectedDay(todayKey); setSheetOpen(true); }}
          />
        </div>

        {/* Week Timeline */}
        <div>
          <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            This Week
          </p>
          <WeekTimeline onDayPress={handleDayPress} />
        </div>

        {/* Quick tips */}
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '14px 16px',
          }}
        >
          <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Quick Tip
          </p>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {todayWorkout?.type?.startsWith('push')
              ? '💡 On push days, focus on mind-muscle connection. Feel the chest working, not just moving weight.'
              : todayWorkout?.type?.startsWith('pull')
              ? '💡 On pull days, initiate every row and pulldown with your shoulder blades before bending your elbows.'
              : todayWorkout?.type === 'legs'
              ? '💡 Legs day tip: Brace your core hard before every squat rep. A strong core = a stable lift.'
              : '💡 Rest is where you grow. Make sure you\'re eating enough protein today — aim for 1.6–2.2g per kg bodyweight.'}
          </p>
        </div>
      </div>

      {/* Switch Day Sheet */}
      {sheetOpen && (
        <SwitchDaySheet
          dayKey={selectedDay}
          currentType={weekPlan[selectedDay]?.type}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </div>
  );
}
