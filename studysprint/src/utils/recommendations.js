import { getDaysDifference } from './dates.js';

const PRIORITY_WEIGHTS = {
  High: 3,
  Medium: 2,
  Low: 1,
};

/**
 * Deterministically recommends the next best pending task.
 * Factors:
 *  1. Overdue status (urgency)
 *  2. Due today status
 *  3. Due within 3 days
 *  4. Priority level (High > Medium > Low)
 *  5. Shorter estimated duration (faster to clear momentum builder)
 */
export function getNextBestTask(tasks = []) {
  const pendingTasks = tasks.filter((t) => t.status === 'Pending');
  if (pendingTasks.length === 0) return null;

  const scoredTasks = pendingTasks.map((task) => {
    let score = 0;
    const diff = getDaysDifference(task.dueDate);
    const pWeight = PRIORITY_WEIGHTS[task.priority] || 2;
    const duration = Number(task.estimatedDuration) || 25;

    // Reason generation helpers
    let reasonType = 'standard';

    if (diff !== null && diff < 0) {
      // Overdue: massive urgency score
      score += 1000 + Math.abs(diff) * 20 + pWeight * 10;
      reasonType = 'overdue';
    } else if (diff === 0) {
      // Due today
      score += 500 + pWeight * 15;
      reasonType = 'today';
    } else if (diff !== null && diff <= 3) {
      // Due in 1-3 days
      score += 200 + (4 - diff) * 20 + pWeight * 10;
      reasonType = 'soon';
    } else {
      // No due date or future date
      score += pWeight * 30;
      if (task.priority === 'High') {
        reasonType = 'high_priority';
      }
    }

    // Shorter duration bonus (momentum builder: up to 15 points for tasks under 30 mins)
    if (duration <= 30) {
      score += (30 - duration) * 0.5;
    }

    // Compose human-readable deterministic rationale
    let reason;
    const durationText = `${duration} min`;
    const priorityText = `${task.priority} priority`;

    if (reasonType === 'overdue') {
      const days = Math.abs(diff);
      const dayLabel = days === 1 ? '1 day' : `${days} days`;
      reason = `Overdue by ${dayLabel} · ${priorityText} · ${durationText}`;
    } else if (reasonType === 'today') {
      reason = `Due today · ${priorityText} · ${durationText}`;
    } else if (reasonType === 'soon') {
      const dayLabel = diff === 1 ? 'tomorrow' : `in ${diff} days`;
      reason = `Due ${dayLabel} · ${priorityText} · ${durationText}`;
    } else if (reasonType === 'high_priority') {
      reason = `High priority · ${task.subject || 'Core subject'} · ${durationText}`;
    } else {
      reason = `${priorityText} · Estimated ${durationText}`;
    }

    return {
      task,
      score,
      reason,
    };
  });

  // Sort descending by score
  scoredTasks.sort((a, b) => b.score - a.score);

  return scoredTasks[0];
}
