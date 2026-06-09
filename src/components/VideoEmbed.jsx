import { useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export default function VideoEmbed({ videoId, title }) {
  const [isOnline] = useState(navigator.onLine);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  if (!videoId) return null;

  const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`;

  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', background: '#000', position: 'relative' }}>
      {/* 16:9 aspect ratio box */}
      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
        {!isOnline || hasError ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 12,
            }}
          >
            <WifiOff size={32} color="var(--text-muted)" />
            <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', margin: 0 }}>
              Watch when online
            </p>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', opacity: 0.6 }}>
              {title || 'Video not available offline'}
            </span>
          </div>
        ) : (
          <>
            {/* Shimmer loader */}
            {!isLoaded && (
              <div className="shimmer" style={{ position: 'absolute', inset: 0, borderRadius: 12 }} />
            )}
            <iframe
              src={embedUrl}
              title={title || 'Exercise demonstration'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => setIsLoaded(true)}
              onError={() => setHasError(true)}
              style={{
                position: 'absolute',
                top: 0, left: 0,
                width: '100%',
                height: '100%',
                border: 'none',
                opacity: isLoaded ? 1 : 0,
                transition: 'opacity 0.3s',
              }}
            />
          </>
        )}
      </div>

      {/* Title below */}
      {title && isOnline && !hasError && (
        <div
          style={{
            padding: '8px 12px',
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{title}</span>
        </div>
      )}
    </div>
  );
}
