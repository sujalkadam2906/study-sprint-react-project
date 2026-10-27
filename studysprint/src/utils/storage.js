import { STORAGE_KEYS, DEFAULT_SETTINGS, PRIORITIES, STATUSES } from '../constants/index.js';

/**
 * Migrates and normalises a single task object to ensure consistent schema.
 */
export function migrateTask(task) {
  if (!task || typeof task !== 'object') return null;

  const validPriority = [PRIORITIES.HIGH, PRIORITIES.MEDIUM, PRIORITIES.LOW].includes(task.priority)
    ? task.priority
    : PRIORITIES.MEDIUM;

  const validStatus = task.status === STATUSES.COMPLETED ? STATUSES.COMPLETED : STATUSES.PENDING;

  // Derive createdAt safely without inventing arbitrary dates
  let createdAt = task.createdAt;
  if (!createdAt) {
    if (typeof task.id === 'number' && task.id > 1500000000000) {
      createdAt = new Date(task.id).toISOString();
    } else {
      createdAt = new Date().toISOString();
    }
  }

  return {
    id: task.id || Date.now() + Math.random(),
    title: String(task.title || '').trim(),
    subject: String(task.subject || '').trim(),
    priority: validPriority,
    status: validStatus,
    dueDate: task.dueDate || null,
    estimatedDuration: Math.max(5, Math.min(360, Number(task.estimatedDuration) || 25)),
    createdAt,
    completedAt: task.completedAt || null,
  };
}

/**
 * Loads tasks safely from localStorage with schema migration.
 */
export function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(migrateTask).filter(Boolean);
  } catch (error) {
    console.error('StudySprint: Failed to load tasks from localStorage', error);
    return [];
  }
}

/**
 * Saves tasks to localStorage.
 */
export function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    return true;
  } catch (error) {
    console.error('StudySprint: Failed to save tasks to localStorage', error);
    return false;
  }
}

/**
 * Loads focus sessions from localStorage.
 */
export function loadSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((s) => s && s.completedAt && typeof s.durationMinutes === 'number');
  } catch (error) {
    console.error('StudySprint: Failed to load sessions from localStorage', error);
    return [];
  }
}

/**
 * Saves focus sessions to localStorage.
 */
export function saveSessions(sessions) {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    return true;
  } catch (error) {
    console.error('StudySprint: Failed to save sessions to localStorage', error);
    return false;
  }
}

/**
 * Loads user settings merged with defaults.
 */
export function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      dailyGoalMinutes: Math.max(15, Math.min(720, Number(parsed.dailyGoalMinutes) || DEFAULT_SETTINGS.dailyGoalMinutes)),
      focusDuration: Math.max(5, Math.min(120, Number(parsed.focusDuration) || DEFAULT_SETTINGS.focusDuration)),
      shortBreakDuration: Math.max(1, Math.min(30, Number(parsed.shortBreakDuration) || DEFAULT_SETTINGS.shortBreakDuration)),
      longBreakDuration: Math.max(5, Math.min(60, Number(parsed.longBreakDuration) || DEFAULT_SETTINGS.longBreakDuration)),
      soundEnabled: parsed.soundEnabled !== false,
    };
  } catch (error) {
    console.error('StudySprint: Failed to load settings', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Saves user settings to localStorage.
 */
export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('StudySprint: Failed to save settings', error);
    return false;
  }
}

/**
 * Loads active timer state for refresh recovery.
 */
export function loadTimerState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TIMER_STATE);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.error('StudySprint: Failed to load timer state', error);
    return null;
  }
}

/**
 * Saves active timer state.
 */
export function saveTimerState(state) {
  try {
    if (!state) {
      localStorage.removeItem(STORAGE_KEYS.TIMER_STATE);
      return;
    }
    localStorage.setItem(STORAGE_KEYS.TIMER_STATE, JSON.stringify(state));
  } catch (error) {
    console.error('StudySprint: Failed to save timer state', error);
  }
}

/**
 * Validates and prepares imported JSON payload.
 */
export function validateImportData(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'File content must be a valid JSON object.' };
    }

    const tasks = Array.isArray(parsed.tasks) ? parsed.tasks.map(migrateTask).filter(Boolean) : null;
    const sessions = Array.isArray(parsed.sessions) ? parsed.sessions : null;

    if (!tasks && !sessions && !parsed.settings) {
      return { success: false, error: 'No recognizable StudySprint tasks, sessions, or settings found.' };
    }

    return {
      success: true,
      data: {
        tasks: tasks || [],
        sessions: sessions || [],
        settings: parsed.settings ? { ...DEFAULT_SETTINGS, ...parsed.settings } : null,
      },
      preview: {
        taskCount: tasks ? tasks.length : 0,
        sessionCount: sessions ? sessions.length : 0,
        hasSettings: Boolean(parsed.settings),
      },
    };
  } catch (err) {
    return { success: false, error: `Invalid JSON format: ${err.message}` };
  }
}

/**
 * Clears all StudySprint data from localStorage.
 */
export function clearAllStorage() {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}
