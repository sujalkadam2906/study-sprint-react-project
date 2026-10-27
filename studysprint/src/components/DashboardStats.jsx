import { formatMinutes } from '../utils/dates';
import { IconClock, IconCheckCircle, IconFlame, IconTarget } from './Icons';

export default function DashboardStats({
  tasks = [],
  todayFocusMinutes = 0,
  dailyGoalMinutes = 120,
  currentStreak = 0,
  onOpenStreakInfo,
}) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.status === 'Completed').length;
  const pending = total - completed;

  const goalPercent = Math.min(100, Math.round((todayFocusMinutes / (dailyGoalMinutes || 120)) * 100));

  return (
    <div className="stats-grid">
      {/* 1. Today's Focus Time */}
      <div className="stat-card">
        <div className="stat-icon-wrapper stat-icon-blue">
          <IconClock size={20} />
        </div>
        <div className="stat-content">
          <span className="stat-label">Focus Today</span>
          <div className="stat-value-group">
            <span className="stat-value">{formatMinutes(todayFocusMinutes)}</span>
          </div>
          <span className="stat-subtext">of {formatMinutes(dailyGoalMinutes)} daily goal</span>
        </div>
      </div>

      {/* 2. Daily Goal Progress */}
      <div className="stat-card">
        <div className="stat-icon-wrapper stat-icon-indigo">
          <IconTarget size={20} />
        </div>
        <div className="stat-content">
          <span className="stat-label">Goal Progress</span>
          <div className="stat-value-group">
            <span className="stat-value">{goalPercent}%</span>
          </div>
          <div className="stat-progress-bar-track">
            <div
              className="stat-progress-bar-fill"
              style={{ width: `${goalPercent}%` }}
              role="progressbar"
              aria-valuenow={goalPercent}
              aria-valuemin="0"
              aria-valuemax="100"
            />
          </div>
        </div>
      </div>

      {/* 3. Study Streak */}
      <div className="stat-card">
        <div className="stat-icon-wrapper stat-icon-amber">
          <IconFlame size={20} />
        </div>
        <div className="stat-content">
          <div className="stat-header-flex">
            <span className="stat-label">Active Streak</span>
            {onOpenStreakInfo && (
              <button
                type="button"
                className="btn-info-inline"
                onClick={onOpenStreakInfo}
                title="How streaks work"
                aria-label="Streak calculation details"
              >
                info
              </button>
            )}
          </div>
          <div className="stat-value-group">
            <span className="stat-value">
              {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
            </span>
          </div>
          <span className="stat-subtext">
            {currentStreak > 0 ? 'Consistency on track' : 'Complete 1 session today'}
          </span>
        </div>
      </div>

      {/* 4. Task Overview */}
      <div className="stat-card">
        <div className="stat-icon-wrapper stat-icon-green">
          <IconCheckCircle size={20} />
        </div>
        <div className="stat-content">
          <span className="stat-label">Tasks Pending</span>
          <div className="stat-value-group">
            <span className="stat-value">{pending}</span>
            <span className="stat-value-secondary">/ {total} total</span>
          </div>
          <span className="stat-subtext">{completed} finished</span>
        </div>
      </div>
    </div>
  );
}
