import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, BarChart2 } from 'lucide-react';
import exercisesData from '../data/exercises.json';
import VideoEmbed from '../components/VideoEmbed';
import WeightLogger from '../components/WeightLogger';

const TIP_ICONS = {
  '🚫': { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', color: '#FCA5A5' },
  '✅': { bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)', color: '#86EFAC' },
  '⚠️': { bg: 'rgba(234,179,8,0.08)', border: 'rgba(234,179,8,0.2)', color: '#FDE047' },
};

function FormTip({ tip }) {
  const icon = tip.startsWith('🚫') ? '🚫' : tip.startsWith('✅') ? '✅' : tip.startsWith('⚠️') ? '⚠️' : null;
  const style = TIP_ICONS[icon] || { bg: 'rgba(156,163,175,0.08)', border: 'rgba(156,163,175,0.2)', color: '#D1D5DB' };
  const text = icon ? tip.slice(icon.length + 1).trim() : tip;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '10px 14px',
        background: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: 10,
      }}
    >
      {icon && <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{icon}</span>}
      <span style={{ fontSize: 13, color: style.color, lineHeight: 1.5 }}>{text}</span>
    </div>
  );
}

export default function ExerciseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('howto');

  const exercise = exercisesData.exercises.find((e) => e.id === id);

  if (!exercise) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Exercise not found</p>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  const tabs = [
    { id: 'howto', label: 'How To', icon: BookOpen },
    { id: 'log', label: 'Log Weight', icon: BarChart2 },
  ];

  return (
    <div className="page-enter" style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: 'rgba(15,15,15,0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          padding: '12px 20px 0',
        }}
      >
        {/* Back + title */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, paddingBottom: 12 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              marginTop: 2,
            }}
          >
            <ArrowLeft size={18} color="var(--text-primary)" />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, fontFamily: 'DM Sans, sans-serif', color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {exercise.name}
            </h1>
            {/* Muscle tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 6, padding: '2px 8px' }}>
                {exercise.muscle_group}
              </span>
              {exercise.secondary_muscles?.map((m) => (
                <span key={m} style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, padding: '2px 8px' }}>
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0 }}>
          {tabs.map(({ id: tabId, label, icon: Icon }) => (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId)}
              style={{
                flex: 1,
                padding: '10px 0',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                color: activeTab === tabId ? 'var(--accent)' : 'var(--text-muted)',
                fontWeight: activeTab === tabId ? 700 : 500,
                fontSize: 14,
                borderBottom: activeTab === tabId ? '2px solid var(--accent)' : '2px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {activeTab === 'howto' ? (
          <>
            {/* Video embed */}
            {exercise.youtube_video_id && (
              <VideoEmbed videoId={exercise.youtube_video_id} title={`${exercise.name} — demonstration`} />
            )}

            {/* Prescription badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '12px 16px',
              }}
            >
              <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Prescription</span>
              <span className="font-mono" style={{ fontWeight: 700, fontSize: 20, color: 'var(--accent)' }}>
                {exercise.default_sets} × {exercise.default_reps}
              </span>
            </div>

            {/* Instructions */}
            {exercise.instructions?.length > 0 && (
              <div>
                <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Step-by-step
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {exercise.instructions.map((step, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12,
                        padding: '12px 14px',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: 'rgba(249,115,22,0.15)',
                          border: '1px solid rgba(249,115,22,0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: 1,
                        }}
                      >
                        <span className="font-mono" style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>
                          {i + 1}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Form tips */}
            {exercise.form_tips?.length > 0 && (
              <div>
                <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Form Tips
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {exercise.form_tips.map((tip, i) => (
                    <FormTip key={i} tip={tip} />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <WeightLogger exercise={exercise} />
        )}
      </div>
    </div>
  );
}
