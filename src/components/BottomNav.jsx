import { Link, useLocation } from 'react-router-dom';
import { Home, Dumbbell, BarChart2, Search } from 'lucide-react';

const tabs = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/workout', icon: Dumbbell, label: 'Workout' },
  { to: '/library', icon: Search, label: 'Library' },
  { to: '/history', icon: BarChart2, label: 'History' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(15,15,15,0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--border)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex items-center justify-around" style={{ height: 60 }}>
        {tabs.map(({ to, icon: Icon, label }) => {
          const isActive =
            to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(to);

          return (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center justify-center gap-1 no-select"
              style={{
                flex: 1,
                height: '100%',
                textDecoration: 'none',
                color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                transition: 'color 0.15s',
              }}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.8}
                style={{
                  transition: 'transform 0.15s',
                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                }}
              />
              <span style={{ fontSize: 11, fontWeight: isActive ? 700 : 500, letterSpacing: '0.02em' }}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
