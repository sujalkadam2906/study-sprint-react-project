export const STORAGE_KEYS = {
  TASKS: 'studysprint_tasks',
  SESSIONS: 'studysprint_sessions',
  SETTINGS: 'studysprint_settings',
  TIMER_STATE: 'studysprint_timer_state',
};

export const DEFAULT_SETTINGS = {
  dailyGoalMinutes: 120,
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  soundEnabled: true,
};

export const TIMER_MODES = {
  FOCUS: 'focus',
  SHORT_BREAK: 'short_break',
  LONG_BREAK: 'long_break',
};

export const TIMER_MODE_LABELS = {
  [TIMER_MODES.FOCUS]: 'Focus',
  [TIMER_MODES.SHORT_BREAK]: 'Short Break',
  [TIMER_MODES.LONG_BREAK]: 'Long Break',
};

export const PRIORITIES = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

export const STATUSES = {
  PENDING: 'Pending',
  COMPLETED: 'Completed',
};

export const APP_VIEWS = {
  DASHBOARD: 'dashboard',
  TASKS: 'tasks',
  FOCUS: 'focus',
  INSIGHTS: 'insights',
};
