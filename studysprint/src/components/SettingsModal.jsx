import { useState, useRef } from 'react';
import {
  IconClose,
  IconDownload,
  IconUpload,
  IconSettings,
  IconInfo,
  IconCheck,
} from './Icons';
import { validateImportData } from '../utils/storage';
import { getLocalDateString } from '../utils/dates';

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  tasks,
  sessions,
  onImportData,
  onClearAllData,
}) {
  const [dailyGoal, setDailyGoal] = useState(settings.dailyGoalMinutes || 120);
  const [focusDur, setFocusDur] = useState(settings.focusDuration || 25);
  const [shortBreakDur, setShortBreakDur] = useState(settings.shortBreakDuration || 5);
  const [longBreakDur, setLongBreakDur] = useState(settings.longBreakDuration || 15);
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled !== false);

  const [importStatus, setImportStatus] = useState(null);
  const [importPendingData, setImportPendingData] = useState(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleSavePreferences = (e) => {
    e.preventDefault();
    onSaveSettings({
      dailyGoalMinutes: Math.max(15, Math.min(720, Number(dailyGoal) || 120)),
      focusDuration: Math.max(5, Math.min(120, Number(focusDur) || 25)),
      shortBreakDuration: Math.max(1, Math.min(30, Number(shortBreakDur) || 5)),
      longBreakDuration: Math.max(5, Math.min(60, Number(longBreakDur) || 15)),
      soundEnabled,
    });
    onClose();
  };

  // Export JSON file
  const handleExport = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      tasks,
      sessions,
      settings: {
        dailyGoalMinutes: dailyGoal,
        focusDuration: focusDur,
        shortBreakDuration: shortBreakDur,
        longBreakDuration: longBreakDur,
        soundEnabled,
      },
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studysprint-backup-${getLocalDateString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Trigger file browser for import
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const result = validateImportData(content);
        if (result.success) {
          setImportStatus({
            type: 'preview',
            preview: result.preview,
          });
          setImportPendingData(result.data);
        } else {
          setImportStatus({
            type: 'error',
            message: result.error,
          });
          setImportPendingData(null);
        }
      }
    };
    reader.readAsText(file);
    // Reset file input so user can choose same file again if desired
    e.target.value = '';
  };

  const applyImport = (mode) => {
    if (!importPendingData) return;
    onImportData(importPendingData, mode);
    setImportStatus({
      type: 'success',
      message: `Successfully imported ${importPendingData.tasks.length} tasks and ${importPendingData.sessions.length} sessions.`,
    });
    setImportPendingData(null);
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-card settings-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <div className="modal-header">
          <div className="modal-title-flex">
            <IconSettings size={20} />
            <h2 id="settings-title" className="modal-title">
              StudySprint Settings
            </h2>
          </div>
          <button
            type="button"
            className="btn-icon"
            onClick={onClose}
            aria-label="Close settings"
          >
            <IconClose size={20} />
          </button>
        </div>

        <form onSubmit={handleSavePreferences} className="modal-form">
          {/* Target & Durations */}
          <div className="settings-section">
            <h3 className="settings-section-title">Study &amp; Timer Goals</h3>

            <div className="form-group">
              <label htmlFor="daily-goal-input" className="form-label">
                Daily Focus Target (Minutes)
              </label>
              <div className="duration-input-wrapper">
                <input
                  id="daily-goal-input"
                  type="number"
                  min="15"
                  max="720"
                  step="15"
                  className="form-input"
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(e.target.value)}
                />
                <span className="duration-unit">min/day</span>
              </div>
              <span className="form-helper-text">
                Target focused minutes needed to satisfy your daily study goal (e.g. 120m = 2 hours).
              </span>
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label htmlFor="focus-dur-input" className="form-label">
                  Focus Duration
                </label>
                <div className="duration-input-wrapper">
                  <input
                    id="focus-dur-input"
                    type="number"
                    min="5"
                    max="120"
                    step="5"
                    className="form-input"
                    value={focusDur}
                    onChange={(e) => setFocusDur(e.target.value)}
                  />
                  <span className="duration-unit">min</span>
                </div>
              </div>

              <div className="form-group flex-1">
                <label htmlFor="short-break-input" className="form-label">
                  Short Break
                </label>
                <div className="duration-input-wrapper">
                  <input
                    id="short-break-input"
                    type="number"
                    min="1"
                    max="30"
                    className="form-input"
                    value={shortBreakDur}
                    onChange={(e) => setShortBreakDur(e.target.value)}
                  />
                  <span className="duration-unit">min</span>
                </div>
              </div>

              <div className="form-group flex-1">
                <label htmlFor="long-break-input" className="form-label">
                  Long Break
                </label>
                <div className="duration-input-wrapper">
                  <input
                    id="long-break-input"
                    type="number"
                    min="5"
                    max="60"
                    className="form-input"
                    value={longBreakDur}
                    onChange={(e) => setLongBreakDur(e.target.value)}
                  />
                  <span className="duration-unit">min</span>
                </div>
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                />
                <span>Play subtle acoustic chime when study or break session finishes</span>
              </label>
            </div>
          </div>

          {/* Backup & Persistence */}
          <div className="settings-section">
            <h3 className="settings-section-title">Data Storage &amp; Backup</h3>

            <div className="storage-notice-box">
              <IconInfo size={18} className="notice-icon" />
              <p>
                All tasks, streaks, and focus sessions are stored locally in your browser&apos;s localStorage. Data is private to this browser and not synced automatically across devices.
              </p>
            </div>

            <div className="backup-actions-grid">
              <button
                type="button"
                className="btn-secondary btn-backup"
                onClick={handleExport}
              >
                <IconDownload size={16} />
                <span>Export JSON Backup</span>
              </button>

              <button
                type="button"
                className="btn-secondary btn-backup"
                onClick={() => fileInputRef.current?.click()}
              >
                <IconUpload size={16} />
                <span>Import JSON Backup</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
            </div>

            {/* Import Status / Preview */}
            {importStatus?.type === 'preview' && (
              <div className="import-preview-box">
                <h4>Backup File Validated:</h4>
                <p>
                  Found {importStatus.preview.taskCount} tasks and {importStatus.preview.sessionCount} recorded study sessions.
                </p>
                <div className="import-decision-row">
                  <button
                    type="button"
                    className="btn-primary-sm"
                    onClick={() => applyImport('merge')}
                  >
                    Merge with existing data
                  </button>
                  <button
                    type="button"
                    className="btn-secondary-sm"
                    onClick={() => applyImport('replace')}
                  >
                    Replace current data
                  </button>
                  <button
                    type="button"
                    className="btn-link"
                    onClick={() => {
                      setImportStatus(null);
                      setImportPendingData(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {importStatus?.type === 'error' && (
              <div className="import-error-box">
                <p>{importStatus.message}</p>
              </div>
            )}

            {importStatus?.type === 'success' && (
              <div className="import-success-box">
                <IconCheck size={16} />
                <p>{importStatus.message}</p>
              </div>
            )}
          </div>

          {/* Danger Zone: Clear Data */}
          <div className="settings-section danger-section">
            <h3 className="settings-section-title text-danger">Reset Application</h3>
            {confirmClearOpen ? (
              <div className="confirm-clear-box">
                <p>Are you sure? This will remove all tasks and session history permanently from this browser.</p>
                <div className="confirm-buttons-row">
                  <button
                    type="button"
                    className="btn-danger-sm"
                    onClick={() => {
                      onClearAllData();
                      setConfirmClearOpen(false);
                      onClose();
                    }}
                  >
                    Yes, Delete Everything
                  </button>
                  <button
                    type="button"
                    className="btn-secondary-sm"
                    onClick={() => setConfirmClearOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="btn-danger-outline"
                onClick={() => setConfirmClearOpen(true)}
              >
                Clear All StudySprint Data
              </button>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
