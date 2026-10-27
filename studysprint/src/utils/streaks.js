import { getLocalDateString } from './dates.js';

/**
 * Returns a previous local date string shifted by N days.
 */
function shiftDateString(dateString, deltaDays) {
  const [y, m, d] = dateString.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + deltaDays);
  return getLocalDateString(date);
}

/**
 * Computes consecutive streaks and weekly stats from completed sessions.
 * Each session has { completedAt: ISO_STRING, durationMinutes: number }
 */
export function calculateStreakStats(sessions = []) {
  if (!Array.isArray(sessions) || sessions.length === 0) {
    return {
      currentStreak: 0,
      bestStreak: 0,
      studiedToday: false,
      studyDatesCount: 0,
    };
  }

  // Aggregate focus minutes by local calendar date
  const minutesByDate = new Map();
  sessions.forEach((s) => {
    if (!s || !s.completedAt || !s.durationMinutes) return;
    const localDate = getLocalDateString(new Date(s.completedAt));
    if (!localDate) return;
    const current = minutesByDate.get(localDate) || 0;
    minutesByDate.set(localDate, current + Number(s.durationMinutes));
  });

  // Filter to dates with at least 1 minute of completed study
  const studyDates = new Set();
  minutesByDate.forEach((mins, dateStr) => {
    if (mins >= 1) {
      studyDates.add(dateStr);
    }
  });

  const today = getLocalDateString();
  const yesterday = shiftDateString(today, -1);
  const studiedToday = studyDates.has(today);

  // Calculate current streak
  let currentStreak = 0;
  let cursor = studiedToday ? today : (studyDates.has(yesterday) ? yesterday : null);

  while (cursor && studyDates.has(cursor)) {
    currentStreak += 1;
    cursor = shiftDateString(cursor, -1);
  }

  // Calculate best historical streak
  const sortedDates = Array.from(studyDates).sort();
  let bestStreak = 0;
  let running = 0;
  let prevDate = null;

  for (const dateStr of sortedDates) {
    if (!prevDate) {
      running = 1;
    } else {
      const expectedNext = shiftDateString(prevDate, 1);
      if (dateStr === expectedNext) {
        running += 1;
      } else {
        running = 1;
      }
    }
    if (running > bestStreak) {
      bestStreak = running;
    }
    prevDate = dateStr;
  }

  return {
    currentStreak,
    bestStreak: Math.max(bestStreak, currentStreak),
    studiedToday,
    studyDatesCount: studyDates.size,
  };
}

/**
 * Computes study activity for the last 7 local calendar days (including today).
 */
export function getWeeklyActivity(sessions = [], dailyGoalMinutes = 120) {
  const today = getLocalDateString();
  const minutesByDate = new Map();

  (sessions || []).forEach((s) => {
    if (!s || !s.completedAt || !s.durationMinutes) return;
    const localDate = getLocalDateString(new Date(s.completedAt));
    if (!localDate) return;
    const current = minutesByDate.get(localDate) || 0;
    minutesByDate.set(localDate, current + Number(s.durationMinutes));
  });

  const days = [];
  // 6 days ago up to today (7 days total)
  for (let i = 6; i >= 0; i--) {
    const dateStr = shiftDateString(today, -i);
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);

    const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(dateObj);
    const dayNumber = String(dateObj.getDate());
    const minutes = minutesByDate.get(dateStr) || 0;
    const isToday = dateStr === today;
    const goalMet = minutes >= dailyGoalMinutes;

    days.push({
      date: dateStr,
      dayName,
      dayNumber,
      isToday,
      minutes,
      goalMet,
    });
  }

  // Determine max minutes for chart scale (minimum benchmark of 60 mins or dailyGoal)
  const maxMinutesInWeek = Math.max(
    dailyGoalMinutes,
    ...days.map((d) => d.minutes)
  );

  return {
    days,
    maxMinutesInWeek,
    totalWeeklyMinutes: days.reduce((sum, d) => sum + d.minutes, 0),
  };
}

/**
 * Returns total minutes studied on today's local date.
 */
export function getTodayStudyMinutes(sessions = []) {
  const today = getLocalDateString();
  let total = 0;
  (sessions || []).forEach((s) => {
    if (!s || !s.completedAt || !s.durationMinutes) return;
    const localDate = getLocalDateString(new Date(s.completedAt));
    if (localDate === today) {
      total += Number(s.durationMinutes);
    }
  });
  return total;
}
