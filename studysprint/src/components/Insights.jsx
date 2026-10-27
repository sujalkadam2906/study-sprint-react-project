import { getWeeklyActivity, calculateStreakStats } from '../utils/streaks';
import { formatMinutes } from '../utils/dates';
import {
  IconFlame,
  IconClock,
  IconBarChart,
  IconCheckCircle,
} from './Icons';

export default function Insights({
  sessions = [],
  tasks = [],
  dailyGoalMinutes = 120,
  onOpenStreakInfo,
}) {
  const streakStats = calculateStreakStats(sessions);
  const weeklyData = getWeeklyActivity(sessions, dailyGoalMinutes);

  const totalFocusMinutes = sessions.reduce((sum, s) => sum + (Number(s.durationMinutes) || 0), 0);
  const completedTasksCount = tasks.filter((t) => t.status === 'Completed').length;
  const totalTasksCount = tasks.length;
  const completionRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  // Recent 10 focus sessions
  const recentSessions = [...sessions].reverse().slice(0, 8);

  return (
    <div className="insights-view">
      {/* Header */}
      <div className="view-header-row">
        <div>
          <h1 className="view-title">Study Insights &amp; Consistency</h1>
          <p className="view-subtitle">
            Measurable data on your focus sessions, study streaks, and weekly momentum.
          </p>
        </div>
      </div>

      {/* Top 3 High-Level Metrics */}
      <div className="insights-stats-grid">
        <div className="insight-metric-card">
          <div className="metric-icon-box metric-blue">
            <IconClock size={20} />
          </div>
          <div className="metric-info">
            <span className="metric-label">All-Time Focus</span>
            <span className="metric-number">{formatMinutes(totalFocusMinutes)}</span>
            <span className="metric-hint">{sessions.length} sessions logged</span>
          </div>
        </div>

        <div className="insight-metric-card">
          <div className="metric-icon-box metric-amber">
            <IconFlame size={20} />
          </div>
          <div className="metric-info">
            <div className="metric-label-row">
              <span className="metric-label">Study Streak</span>
              <button
                type="button"
                className="btn-info-inline"
                onClick={onOpenStreakInfo}
                title="How streaks work"
                aria-label="How streaks are calculated"
              >
                info
              </button>
            </div>
            <span className="metric-number">
              {streakStats.currentStreak} {streakStats.currentStreak === 1 ? 'day' : 'days'}
            </span>
            <span className="metric-hint">Personal best: {streakStats.bestStreak} days</span>
          </div>
        </div>

        <div className="insight-metric-card">
          <div className="metric-icon-box metric-green">
            <IconCheckCircle size={20} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Task Completion</span>
            <span className="metric-number">{completionRate}%</span>
            <span className="metric-hint">
              {completedTasksCount} of {totalTasksCount} tasks done
            </span>
          </div>
        </div>
      </div>

      {/* Weekly Activity CSS Bar Chart */}
      <section className="chart-card" aria-labelledby="chart-heading">
        <div className="chart-header">
          <div>
            <h2 id="chart-heading" className="chart-title">
              Weekly Activity (Last 7 Days)
            </h2>
            <p className="chart-subtext">
              Focused minutes recorded per local calendar day vs. your {dailyGoalMinutes}m daily target.
            </p>
          </div>
          <div className="chart-legend">
            <span className="legend-item">
              <span className="legend-swatch swatch-active" /> Met Daily Goal
            </span>
            <span className="legend-item">
              <span className="legend-swatch swatch-standard" /> Focused Time
            </span>
          </div>
        </div>

        <div className="css-bar-chart" role="region" aria-label="Study time for the last 7 days">
          {weeklyData.days.map((day) => {
            const heightPercent =
              weeklyData.maxMinutesInWeek > 0
                ? Math.min(100, Math.round((day.minutes / weeklyData.maxMinutesInWeek) * 100))
                : 0;

            return (
              <div
                key={day.date}
                className={`chart-column ${day.isToday ? 'column-today' : ''}`}
                title={`${day.dayName}, ${day.date}: ${formatMinutes(day.minutes)}`}
              >
                <div className="bar-track">
                  <div
                    className={`bar-fill ${day.goalMet ? 'bar-goal-met' : ''}`}
                    style={{ height: `${Math.max(6, heightPercent)}%` }}
                    aria-label={`${day.dayName}: ${formatMinutes(day.minutes)}`}
                  >
                    {day.minutes > 0 && (
                      <span className="bar-value-tooltip">{formatMinutes(day.minutes)}</span>
                    )}
                  </div>
                </div>

                <div className="column-label-group">
                  <span className="column-day-name">{day.dayName}</span>
                  <span className="column-day-number">{day.dayNumber}</span>
                  {day.isToday && <span className="today-dot" title="Today" />}
                </div>
              </div>
            );
          })}
        </div>

        <div className="chart-footer">
          <span>
            Total this week: <strong>{formatMinutes(weeklyData.totalWeeklyMinutes)}</strong>
          </span>
          <span>Target benchmark: {formatMinutes(dailyGoalMinutes)} / day</span>
        </div>
      </section>

      {/* Completed Study Sessions Log */}
      <section className="session-history-section" aria-labelledby="history-heading">
        <h2 id="history-heading" className="section-heading">
          Recent Focus Sessions
        </h2>
        <p className="section-subtext">
          Verified study sessions recorded upon timer completion.
        </p>

        {recentSessions.length > 0 ? (
          <div className="session-history-table-container">
            <table className="session-table">
              <thead>
                <tr>
                  <th scope="col">Task / Subject</th>
                  <th scope="col">Duration</th>
                  <th scope="col">Completed At</th>
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((session) => {
                  const dateObj = new Date(session.completedAt);
                  const timeFormatted = new Intl.DateTimeFormat('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  }).format(dateObj);
                  const dateFormatted = new Intl.DateTimeFormat('en-US', {
                    month: 'short',
                    day: 'numeric',
                  }).format(dateObj);

                  return (
                    <tr key={session.id}>
                      <td>
                        <div className="table-task-cell">
                          <span className="table-task-title">
                            {session.taskTitle || 'Self-Directed Focus Sprint'}
                          </span>
                          {session.subject && (
                            <span className="table-task-subject">{session.subject}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="table-duration-badge">
                          <IconClock size={13} />
                          <span>{formatMinutes(session.durationMinutes)}</span>
                        </span>
                      </td>
                      <td className="table-date-cell">
                        <span>{dateFormatted}</span>
                        <span className="table-time-sub">{timeFormatted}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state-card">
            <div className="empty-state-icon">
              <IconBarChart size={30} />
            </div>
            <h3>No study sessions recorded yet</h3>
            <p>
              Complete your first focus session using the Pomodoro timer to start building your consistency graph.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
