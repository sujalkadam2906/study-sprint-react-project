import { IconClose, IconFlame, IconCheckCircle } from './Icons';

export default function StreakInfoModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="streak-modal-title"
      >
        <div className="modal-header">
          <div className="modal-title-flex">
            <IconFlame size={20} className="flame-accent" />
            <h2 id="streak-modal-title" className="modal-title">
              How Study Streaks Work
            </h2>
          </div>
          <button
            type="button"
            className="btn-icon"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <IconClose size={20} />
          </button>
        </div>

        <div className="streak-explanation-content">
          <p className="explanation-lead">
            StudySprint streaks reward genuine, consistent daily focus. Here is the exact, transparent logic used:
          </p>

          <ul className="streak-rules-list">
            <li>
              <div className="rule-bullet">
                <IconCheckCircle size={16} />
              </div>
              <div className="rule-text">
                <strong>Local Calendar Days:</strong> A streak day is credited when you complete at least 1 verified focus session on your local calendar date.
              </div>
            </li>

            <li>
              <div className="rule-bullet">
                <IconCheckCircle size={16} />
              </div>
              <div className="rule-text">
                <strong>Grace Period Today:</strong> If you studied yesterday but haven&apos;t started today yet, your streak remains active. Complete a session before midnight to keep extending it.
              </div>
            </li>

            <li>
              <div className="rule-bullet">
                <IconCheckCircle size={16} />
              </div>
              <div className="rule-text">
                <strong>No Unearned Progress:</strong> Rest breaks, paused sessions, or incomplete timers never count toward study streak records.
              </div>
            </li>

            <li>
              <div className="rule-bullet">
                <IconCheckCircle size={16} />
              </div>
              <div className="rule-text">
                <strong>Best Streak:</strong> Your profile permanently records the longest unbroken run achieved in your browser history.
              </div>
            </li>
          </ul>

          <div className="modal-actions">
            <button type="button" className="btn-primary" onClick={onClose}>
              Understood
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
