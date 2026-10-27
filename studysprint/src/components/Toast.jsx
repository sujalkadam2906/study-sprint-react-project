import { useEffect } from 'react';
import { IconCheckCircle, IconClose, IconUndo, IconInfo } from './Icons';

export default function Toast({ toast, onClose, onUndo }) {
  useEffect(() => {
    if (!toast) return;
    const duration = toast.duration || (toast.action ? 6000 : 3500);
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isUndo = Boolean(toast.action);

  return (
    <div className={`toast-container ${isUndo ? 'toast-undo' : `toast-${toast.type || 'info'}`}`} role="status" aria-live="polite">
      <div className="toast-icon">
        {isUndo ? (
          <IconUndo size={18} />
        ) : toast.type === 'success' ? (
          <IconCheckCircle size={18} />
        ) : (
          <IconInfo size={18} />
        )}
      </div>

      <div className="toast-message">
        <p className="toast-text">{toast.message}</p>
        {toast.subtext && <p className="toast-subtext">{toast.subtext}</p>}
      </div>

      {isUndo && (
        <button
          type="button"
          className="btn-toast-action"
          onClick={() => {
            onUndo();
            onClose();
          }}
          aria-label="Undo action"
        >
          Undo
        </button>
      )}

      <button
        type="button"
        className="btn-toast-close"
        onClick={onClose}
        aria-label="Close notification"
      >
        <IconClose size={16} />
      </button>
    </div>
  );
}
