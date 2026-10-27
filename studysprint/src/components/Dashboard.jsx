import { formatHeaderDate, formatMinutes, isDueToday, isOverdue } from '../utils/dates';
import { getNextBestTask } from '../utils/recommendations';
import DashboardStats from './DashboardStats';
import TaskCard from './TaskCard';
import {
  IconPlay,
  IconSparkles,
  IconArrowRight,
  IconPlus,
  IconCheckCircle,
  IconTarget,
} from './Icons';

export default function Dashboard({
  tasks = [],
  todayFocusMinutes = 0,
  dailyGoalMinutes = 120,
  currentStreak = 0,
  onNavigate,
  onStartFocus,
  onToggleStatus,
  onEditTask,
  onDeleteTask,
  onOpenNewTaskModal,
  onOpenStreakInfo,
}) {
  const nextBest = getNextBestTask(tasks);
  const goalAchieved = todayFocusMinutes >= dailyGoalMinutes && dailyGoalMinutes > 0;
  const remainingMinutes = Math.max(0, dailyGoalMinutes - todayFocusMinutes);

  // Today's priority tasks: Overdue, Due Today, or High Priority
  const urgentTasks = tasks
    .filter(
      (t) =>
        t.status === 'Pending' &&
        (isOverdue(t.dueDate) || isDueToday(t.dueDate) || t.priority === 'High')
    )
    .slice(0, 4);

  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <div className="dashboard-welcome-header">
        <div className="welcome-text-group">
          <span className="current-date-badge">{formatHeaderDate()}</span>
          <h1 className="welcome-heading">StudySprint Dashboard</h1>
          <p className="welcome-subheading">
            Decide what to study and focus deeply. {remainingMinutes > 0 ? `${formatMinutes(remainingMinutes)} remaining to hit your daily goal.` : 'Daily goal achieved!'}
          </p>
        </div>

        <div className="welcome-actions">
          <button
            type="button"
            className="btn-primary btn-hero-focus"
            onClick={() => {
              if (nextBest?.task) {
                onStartFocus(nextBest.task);
              } else {
                onNavigate('focus');
              }
            }}
          >
            <IconPlay size={16} />
            <span>Start Focus Sprint</span>
          </button>
        </div>
      </div>

      {/* Goal Achieved Milestone Banner */}
      {goalAchieved && (
        <div className="milestone-banner" role="status">
          <div className="milestone-icon">
            <IconTarget size={22} />
          </div>
          <div className="milestone-content">
            <h4>Daily Study Goal Reached!</h4>
            <p>
              You have completed {formatMinutes(todayFocusMinutes)} of focused study today, hitting your {formatMinutes(dailyGoalMinutes)} target.
            </p>
          </div>
        </div>
      )}

      {/* 4 Core Stat Cards */}
      <DashboardStats
        tasks={tasks}
        todayFocusMinutes={todayFocusMinutes}
        dailyGoalMinutes={dailyGoalMinutes}
        currentStreak={currentStreak}
        onOpenStreakInfo={onOpenStreakInfo}
      />

      {/* Next Best Task Recommendation Section */}
      <section className="recommendation-section" aria-labelledby="recommendation-heading">
        <div className="section-header-row">
          <div className="section-title-flex">
            <IconSparkles size={20} className="sparkle-icon" />
            <h2 id="recommendation-heading" className="section-heading">
              Next Best Task
            </h2>
          </div>
          <span className="section-explanation-badge">Deterministic Priority Engine</span>
        </div>

        {nextBest ? (
          <div className="recommendation-card">
            <div className="recommendation-badge-row">
              <span className="recommendation-reason-tag">{nextBest.reason}</span>
            </div>

            <div className="recommendation-body">
              <div className="recommendation-task-details">
                <span className="recommendation-subject">{nextBest.task.subject}</span>
                <h3 className="recommendation-title">{nextBest.task.title}</h3>
                <p className="recommendation-explanation">
                  Prioritised based on deadline proximity, priority weighting, and focused duration.
                </p>
              </div>

              <div className="recommendation-actions">
                <button
                  type="button"
                  className="btn-primary btn-focus-now"
                  onClick={() => onStartFocus(nextBest.task)}
                  aria-label={`Start focus session on ${nextBest.task.title}`}
                >
                  <IconPlay size={16} />
                  <span>Focus on This Task</span>
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => onToggleStatus(nextBest.task.id)}
                  aria-label={`Mark ${nextBest.task.title} complete`}
                >
                  <IconCheckCircle size={16} />
                  <span>Mark Done</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-recommendation-card">
            <div className="empty-state-icon">
              <IconCheckCircle size={32} />
            </div>
            <h3>All caught up for now!</h3>
            <p>You have no pending tasks on your study sprint list. Add your next study objective to stay in flow.</p>
            <button
              type="button"
              className="btn-primary"
              onClick={onOpenNewTaskModal}
            >
              <IconPlus size={16} />
              <span>Add New Study Task</span>
            </button>
          </div>
        )}
      </section>

      {/* Urgent / Today's Priority Tasks */}
      <section className="urgent-tasks-section" aria-labelledby="urgent-heading">
        <div className="section-header-row">
          <div>
            <h2 id="urgent-heading" className="section-heading">
              Today&apos;s Focus &amp; High Priority Tasks
            </h2>
            <p className="section-subtext">
              Tasks needing attention today or carrying high priority.
            </p>
          </div>

          <button
            type="button"
            className="btn-link"
            onClick={() => onNavigate('tasks')}
            aria-label="View all tasks"
          >
            <span>View all tasks ({tasks.length})</span>
            <IconArrowRight size={15} />
          </button>
        </div>

        {urgentTasks.length > 0 ? (
          <div className="task-list">
            {urgentTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleStatus={onToggleStatus}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onStartFocus={onStartFocus}
              />
            ))}
          </div>
        ) : (
          <div className="empty-list-notice">
            <p>No urgent deadlines or high priority tasks pending. Great work keeping on top of your schedule!</p>
          </div>
        )}
      </section>
    </div>
  );
}
