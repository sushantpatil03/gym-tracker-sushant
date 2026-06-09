import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('pwa-install-dismissed') === 'true');

  useEffect(() => {
    if (dismissed) return;

    // Check if already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [dismissed]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showPrompt || dismissed) return null;

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(249,115,22,0.12) 0%, rgba(124,58,237,0.08) 100%)',
        border: '1px solid rgba(249,115,22,0.25)',
        borderRadius: 12,
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Download size={20} color="#fff" />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
          Install GymTracker
        </p>
        <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
          Add to home screen for the full app experience
        </p>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={handleInstall}
          className="btn btn-primary"
          style={{ padding: '8px 14px', fontSize: 13 }}
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
