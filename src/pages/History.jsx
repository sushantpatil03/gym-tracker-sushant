import { BarChart2, TrendingUp, Calendar } from 'lucide-react';

export default function History() {
  return (
    <div className="page-enter" style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div
        style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}
      >
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, fontFamily: 'DM Sans, sans-serif', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
          Progress
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
          Track your progressive overload
        </p>
      </div>

      <div style={{ padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, textAlign: 'center' }}>
        {/* Icon */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            background: 'rgba(249,115,22,0.1)',
            border: '1px solid rgba(249,115,22,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <BarChart2 size={40} color="var(--accent)" strokeWidth={1.5} />
        </div>

        <div>
          <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800, fontFamily: 'DM Sans, sans-serif', color: 'var(--text-primary)' }}>
            Charts Coming Soon
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 280 }}>
            Log a few sessions first, then your progressive overload charts will appear here.
          </p>
        </div>

        {/* Feature preview cards */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { icon: TrendingUp, label: 'Weight over time', sub: 'Line chart per exercise per set', color: '#F97316' },
            { icon: BarChart2, label: 'Personal bests', sub: 'Heaviest weight logged per exercise', color: '#A78BFA' },
            { icon: Calendar, label: 'Attendance heatmap', sub: 'GitHub-style gym calendar', color: '#4ADE80' },
          ].map(({ icon: Icon, label, sub, color }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 16px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                textAlign: 'left',
                opacity: 0.6,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: color + '18',
                  border: `1px solid ${color}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={20} color={color} strokeWidth={1.5} />
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{label}</p>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Phase 2 feature — log weight now to power the charts later 📈
        </p>
      </div>
    </div>
  );
}
