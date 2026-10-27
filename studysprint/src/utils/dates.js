/**
 * Returns a local date in 'YYYY-MM-DD' format without timezone shifts.
 */
export function getLocalDateString(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns a human-friendly header date, e.g. "Tuesday, 27 October 2026"
 */
export function formatHeaderDate(date = new Date()) {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/**
 * Formats YYYY-MM-DD for readable display.
 */
export function formatDisplayDate(dateString) {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return dateString;
  const d = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  }).format(d);
}

/**
 * Determines if a due date (YYYY-MM-DD) is prior to today.
 */
export function isOverdue(dueDateString) {
  if (!dueDateString) return false;
  const today = getLocalDateString();
  return dueDateString < today;
}

/**
 * Determines if a due date is today.
 */
export function isDueToday(dueDateString) {
  if (!dueDateString) return false;
  return dueDateString === getLocalDateString();
}

/**
 * Calculates days remaining or overdue.
 * Negative = overdue days, 0 = today, positive = days away.
 */
export function getDaysDifference(dueDateString) {
  if (!dueDateString) return null;
  const [y1, m1, d1] = dueDateString.split('-').map(Number);
  const target = new Date(y1, m1 - 1, d1);
  const todayStr = getLocalDateString();
  const [y2, m2, d2] = todayStr.split('-').map(Number);
  const today = new Date(y2, m2 - 1, d2);

  const diffTime = target.getTime() - today.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Returns human-readable due date indicator with status tag.
 */
export function getDueDateStatus(dueDateString) {
  if (!dueDateString) return null;
  const diff = getDaysDifference(dueDateString);
  if (diff === null) return null;

  if (diff < 0) {
    const days = Math.abs(diff);
    return {
      type: 'overdue',
      label: days === 1 ? 'Overdue by 1 day' : `Overdue by ${days} days`,
      shortLabel: 'Overdue',
    };
  }
  if (diff === 0) {
    return {
      type: 'today',
      label: 'Due today',
      shortLabel: 'Today',
    };
  }
  if (diff === 1) {
    return {
      type: 'tomorrow',
      label: 'Due tomorrow',
      shortLabel: 'Tomorrow',
    };
  }
  if (diff <= 3) {
    return {
      type: 'soon',
      label: `Due in ${diff} days`,
      shortLabel: `In ${diff}d`,
    };
  }
  return {
    type: 'future',
    label: `Due ${formatDisplayDate(dueDateString)}`,
    shortLabel: formatDisplayDate(dueDateString),
  };
}

/**
 * Formats duration in minutes to readable hours and minutes.
 */
export function formatMinutes(totalMinutes) {
  const mins = Math.max(0, Math.round(totalMinutes || 0));
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  if (remainingMins === 0) return `${hours} hr${hours > 1 ? 's' : ''}`;
  return `${hours}h ${remainingMins}m`;
}

/**
 * Formats seconds into MM:SS format.
 */
export function formatTimerSeconds(seconds) {
  const s = Math.max(0, Math.floor(seconds || 0));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
