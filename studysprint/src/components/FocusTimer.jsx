import { useState, useEffect, useRef, useCallback } from 'react';
import { TIMER_MODES, TIMER_MODE_LABELS } from '../constants';
import { formatTimerSeconds, formatMinutes } from '../utils/dates';
import { playCompletionChime } from '../utils/sound';
import { loadTimerState, saveTimerState } from '../utils/storage';
import {
  IconPlay,
  IconPause,
  IconRotateCcw,
  IconCheck,
  IconClock,
  IconBook,
  IconCheckCircle,
} from './Icons';

export default function FocusTimer({
  tasks = [],
  settings,
  onCompleteFocusSession,
  onCompleteTask,
  selectedTask = null,
  onClearSelectedTask,
  onSelectTask,
}) {
  // Compute initial state from localStorage once
  const [initialData] = useState(() => {
    const saved = loadTimerState();
    const defaultFocusSec = (settings.focusDuration || 25) * 60;
    if (!saved) {
      return {
        mode: TIMER_MODES.FOCUS,
        isRunning: false,
        remainingSeconds: defaultFocusSec,
        totalSessionSeconds: defaultFocusSec,
        targetEndTime: null,
        expiredSession: null,
      };
    }

    const savedMode = saved.mode || TIMER_MODES.FOCUS;
    let modeDuration = defaultFocusSec;
    if (savedMode === TIMER_MODES.SHORT_BREAK) {
      modeDuration = (settings.shortBreakDuration || 5) * 60;
    } else if (savedMode === TIMER_MODES.LONG_BREAK) {
      modeDuration = (settings.longBreakDuration || 15) * 60;
    }

    const totalSeconds = saved.totalSessionSeconds || modeDuration;

    if (saved.isRunning && saved.targetEndTime) {
      const now = Date.now();
      const diffSeconds = Math.round((saved.targetEndTime - now) / 1000);
      if (diffSeconds > 0) {
        return {
          mode: savedMode,
          isRunning: true,
          remainingSeconds: diffSeconds,
          totalSessionSeconds: totalSeconds,
          targetEndTime: saved.targetEndTime,
          expiredSession: null,
        };
      } else {
        let expired = null;
        if (savedMode === TIMER_MODES.FOCUS && !saved.completionRecorded) {
          expired = {
            durationMinutes: Math.round(totalSeconds / 60),
            taskId: saved.activeTaskId || null,
            taskTitle: saved.activeTaskTitle || null,
            subject: saved.activeTaskSubject || null,
          };
        }
        return {
          mode: savedMode,
          isRunning: false,
          remainingSeconds: 0,
          totalSessionSeconds: totalSeconds,
          targetEndTime: null,
          expiredSession: expired,
        };
      }
    }

    return {
      mode: savedMode,
      isRunning: false,
      remainingSeconds: saved.remainingSeconds || modeDuration,
      totalSessionSeconds: totalSeconds,
      targetEndTime: null,
      expiredSession: null,
    };
  });

  const [mode, setMode] = useState(initialData.mode);
  const [isRunning, setIsRunning] = useState(initialData.isRunning);
  const [remainingSeconds, setRemainingSeconds] = useState(initialData.remainingSeconds);
  const [totalSessionSeconds, setTotalSessionSeconds] = useState(initialData.totalSessionSeconds);
  const [completedCycle, setCompletedCycle] = useState(Boolean(initialData.expiredSession));
  const [justFinishedSession, setJustFinishedSession] = useState(initialData.expiredSession);

  const targetEndTimeRef = useRef(initialData.targetEndTime);
  const timerIntervalRef = useRef(null);
  const completionHandledRef = useRef(false);

  // If initial load restored an expired session, report it once on mount
  useEffect(() => {
    if (initialData.expiredSession) {
      onCompleteFocusSession(initialData.expiredSession);
      saveTimerState(null);
    }
  }, [initialData.expiredSession, onCompleteFocusSession]);

  // Helper to get duration in seconds for a given mode
  const getModeDurationSeconds = useCallback(
    (currentMode) => {
      switch (currentMode) {
        case TIMER_MODES.SHORT_BREAK:
          return (settings.shortBreakDuration || 5) * 60;
        case TIMER_MODES.LONG_BREAK:
          return (settings.longBreakDuration || 15) * 60;
        case TIMER_MODES.FOCUS:
        default:
          return (settings.focusDuration || 25) * 60;
      }
    },
    [settings]
  );

  // Handle mode switch when user manually clicks Focus / Short Break / Long Break
  const handleModeChange = (newMode) => {
    if (isRunning) {
      const confirmSwitch = window.confirm('Switching session will reset the current timer. Continue?');
      if (!confirmSwitch) return;
    }

    clearInterval(timerIntervalRef.current);
    const duration = getModeDurationSeconds(newMode);
    setMode(newMode);
    setIsRunning(false);
    setRemainingSeconds(duration);
    setTotalSessionSeconds(duration);
    setCompletedCycle(false);
    setJustFinishedSession(null);
    completionHandledRef.current = false;
    targetEndTimeRef.current = null;
    saveTimerState(null);
  };

  // Timer tick effect using exact timestamp diffs to avoid drift
  useEffect(() => {
    if (isRunning) {
      completionHandledRef.current = false;

      // Persist running state
      saveTimerState({
        mode,
        totalSessionSeconds,
        remainingSeconds: Math.max(0, Math.round((targetEndTimeRef.current - Date.now()) / 1000)),
        isRunning: true,
        targetEndTime: targetEndTimeRef.current,
        activeTaskId: selectedTask ? selectedTask.id : null,
        activeTaskTitle: selectedTask ? selectedTask.title : null,
        activeTaskSubject: selectedTask ? selectedTask.subject : null,
        completionRecorded: false,
      });

      timerIntervalRef.current = setInterval(() => {
        const now = Date.now();
        const diff = Math.max(0, Math.round((targetEndTimeRef.current - now) / 1000));
        setRemainingSeconds(diff);

        if (diff <= 0) {
          clearInterval(timerIntervalRef.current);
          setIsRunning(false);
          saveTimerState(null);

          if (!completionHandledRef.current) {
            completionHandledRef.current = true;

            if (settings.soundEnabled) {
              playCompletionChime();
            }

            // Only focus sessions record study time
            if (mode === TIMER_MODES.FOCUS) {
              const sessionMinutes = Math.round(totalSessionSeconds / 60);
              const sessionData = {
                durationMinutes: sessionMinutes,
                taskId: selectedTask ? selectedTask.id : null,
                taskTitle: selectedTask ? selectedTask.title : null,
                subject: selectedTask ? selectedTask.subject : null,
              };
              onCompleteFocusSession(sessionData);
              setJustFinishedSession(sessionData);
            }

            setCompletedCycle(true);
          }
        }
      }, 500);
    } else {
      clearInterval(timerIntervalRef.current);
    }

    return () => clearInterval(timerIntervalRef.current);
  }, [
    isRunning,
    mode,
    totalSessionSeconds,
    selectedTask,
    settings.soundEnabled,
    onCompleteFocusSession,
  ]);

  // Update document title with remaining time
  useEffect(() => {
    const timeFormatted = formatTimerSeconds(remainingSeconds);
    const modeLabel = TIMER_MODE_LABELS[mode] || 'Focus';

    if (isRunning) {
      document.title = `(${timeFormatted}) ${modeLabel} — StudySprint`;
    } else if (completedCycle) {
      document.title = `Session Complete! — StudySprint`;
    } else {
      document.title = `StudySprint — Personal Study Planner`;
    }

    return () => {
      document.title = `StudySprint — Personal Study Planner`;
    };
  }, [remainingSeconds, isRunning, completedCycle, mode]);

  // Start or resume timer
  const handleStart = () => {
    setCompletedCycle(false);
    setJustFinishedSession(null);
    completionHandledRef.current = false;

    const secondsToRun = remainingSeconds > 0 ? remainingSeconds : totalSessionSeconds;
    targetEndTimeRef.current = Date.now() + secondsToRun * 1000;
    setIsRunning(true);
  };

  // Pause timer
  const handlePause = () => {
    setIsRunning(false);
    clearInterval(timerIntervalRef.current);
    if (remainingSeconds > 0 && remainingSeconds < totalSessionSeconds) {
      saveTimerState({
        mode,
        totalSessionSeconds,
        remainingSeconds,
        isRunning: false,
        activeTaskId: selectedTask ? selectedTask.id : null,
        activeTaskTitle: selectedTask ? selectedTask.title : null,
        activeTaskSubject: selectedTask ? selectedTask.subject : null,
      });
    }
  };

  // Reset timer
  const handleReset = () => {
    setIsRunning(false);
    clearInterval(timerIntervalRef.current);
    const duration = getModeDurationSeconds(mode);
    setRemainingSeconds(duration);
    setTotalSessionSeconds(duration);
    setCompletedCycle(false);
    setJustFinishedSession(null);
    completionHandledRef.current = false;
    targetEndTimeRef.current = null;
    saveTimerState(null);
  };

  // Calculate circular progress percentage
  const progressRatio = totalSessionSeconds > 0 ? (totalSessionSeconds - remainingSeconds) / totalSessionSeconds : 0;
  const progressPercent = Math.min(100, Math.max(0, Math.round(progressRatio * 100)));

  // Circular SVG dimensions
  const circleRadius = 135;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (progressRatio * circumference);

  const pendingTasks = tasks.filter((t) => t.status === 'Pending');

  return (
    <div className="focus-view-container">
      {/* Mode Selector Tabs */}
      <div className="timer-mode-nav" role="tablist" aria-label="Timer mode selection">
        <button
          type="button"
          role="tab"
          aria-selected={mode === TIMER_MODES.FOCUS}
          className={`btn-mode-tab ${mode === TIMER_MODES.FOCUS ? 'mode-active' : ''}`}
          onClick={() => handleModeChange(TIMER_MODES.FOCUS)}
        >
          <IconClock size={16} />
          <span>Focus ({settings.focusDuration}m)</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={mode === TIMER_MODES.SHORT_BREAK}
          className={`btn-mode-tab ${mode === TIMER_MODES.SHORT_BREAK ? 'mode-active' : ''}`}
          onClick={() => handleModeChange(TIMER_MODES.SHORT_BREAK)}
        >
          <span>Short Break ({settings.shortBreakDuration}m)</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={mode === TIMER_MODES.LONG_BREAK}
          className={`btn-mode-tab ${mode === TIMER_MODES.LONG_BREAK ? 'mode-active' : ''}`}
          onClick={() => handleModeChange(TIMER_MODES.LONG_BREAK)}
        >
          <span>Long Break ({settings.longBreakDuration}m)</span>
        </button>
      </div>

      {/* Associated Task Card or Selector */}
      <div className="associated-task-panel">
        <label htmlFor="associated-task-select" className="associated-task-label">
          <IconBook size={15} />
          <span>Linked Study Task:</span>
        </label>

        {selectedTask ? (
          <div className="linked-task-pill">
            <span className="linked-task-subject">{selectedTask.subject}</span>
            <span className="linked-task-title">{selectedTask.title}</span>
            <button
              type="button"
              className="btn-unlink-task"
              onClick={onClearSelectedTask}
              title="Unlink task"
              aria-label="Unlink task"
            >
              Change
            </button>
          </div>
        ) : (
          <select
            id="associated-task-select"
            className="associated-task-select"
            value=""
            onChange={(e) => {
              const taskId = e.target.value;
              const found = tasks.find((t) => String(t.id) === String(taskId));
              if (found) onSelectTask(found);
            }}
          >
            <option value="">Select a task to focus on (optional)...</option>
            {pendingTasks.map((t) => (
              <option key={t.id} value={t.id}>
                [{t.subject}] {t.title} ({t.priority})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Primary Timer Circle */}
      <div
        className="timer-ring-container"
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label={`${TIMER_MODE_LABELS[mode]} progress: ${progressPercent}%`}
      >
        <svg className="timer-ring-svg" width="320" height="320" viewBox="0 0 320 320" aria-hidden="true">
          {/* Background track */}
          <circle
            cx="160"
            cy="160"
            r={circleRadius}
            className="timer-ring-bg"
            strokeWidth="10"
          />
          {/* Active progress */}
          <circle
            cx="160"
            cy="160"
            r={circleRadius}
            className={`timer-ring-progress mode-${mode}`}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        <div className="timer-digits-overlay">
          <span className="timer-mode-tag">{TIMER_MODE_LABELS[mode]}</span>
          <span className="timer-time-display" aria-live="polite" aria-atomic="true">
            {formatTimerSeconds(remainingSeconds)}
          </span>
          <span className="timer-status-hint">
            {isRunning ? 'Session in progress' : completedCycle ? 'Session complete' : 'Ready to begin'}
          </span>
        </div>
      </div>

      {/* Timer Controls */}
      <div className="timer-controls">
        {isRunning ? (
          <button
            type="button"
            className="btn-timer-primary btn-timer-pause"
            onClick={handlePause}
            aria-label="Pause timer"
          >
            <IconPause size={20} />
            <span>Pause</span>
          </button>
        ) : (
          <button
            type="button"
            className="btn-timer-primary btn-timer-start"
            onClick={handleStart}
            aria-label="Start timer"
          >
            <IconPlay size={20} />
            <span>{remainingSeconds < totalSessionSeconds ? 'Resume' : 'Start Focus'}</span>
          </button>
        )}

        <button
          type="button"
          className="btn-timer-secondary"
          onClick={handleReset}
          aria-label="Reset timer to beginning"
        >
          <IconRotateCcw size={18} />
          <span>Reset</span>
        </button>
      </div>

      {/* Session Finished Card */}
      {completedCycle && (
        <div className="session-complete-banner" role="status">
          <div className="complete-banner-icon">
            <IconCheckCircle size={28} />
          </div>
          <div className="complete-banner-text">
            <h4>{mode === TIMER_MODES.FOCUS ? 'Focus Session Completed!' : 'Break Completed!'}</h4>
            {mode === TIMER_MODES.FOCUS ? (
              <p>
                Recorded {formatMinutes(justFinishedSession?.durationMinutes || settings.focusDuration)} of dedicated study time.
              </p>
            ) : (
              <p>You recharged. Ready for another sprint?</p>
            )}
          </div>

          <div className="complete-banner-actions">
            {selectedTask && mode === TIMER_MODES.FOCUS && selectedTask.status === 'Pending' && (
              <button
                type="button"
                className="btn-complete-task-prompt"
                onClick={() => {
                  onCompleteTask(selectedTask.id);
                  onClearSelectedTask();
                }}
              >
                <IconCheck size={16} />
                <span>Mark &quot;{selectedTask.title}&quot; Complete</span>
              </button>
            )}

            {mode === TIMER_MODES.FOCUS ? (
              <button
                type="button"
                className="btn-primary-sm"
                onClick={() => handleModeChange(TIMER_MODES.SHORT_BREAK)}
              >
                Take a 5-min Break
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary-sm"
                onClick={() => handleModeChange(TIMER_MODES.FOCUS)}
              >
                Start Next Focus Sprint
              </button>
            )}
          </div>
        </div>
      )}

      {/* Helpful focus tips footer */}
      <div className="focus-tips-panel">
        <div className="tip-item">
          <strong>Single-Tasking:</strong> Commit exclusively to the chosen task until the timer reaches zero.
        </div>
        <div className="tip-item">
          <strong>Tab-Aware:</strong> The countdown remains synchronized in your browser tab title.
        </div>
      </div>
    </div>
  );
}
