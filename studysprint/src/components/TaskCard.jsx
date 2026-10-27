import { getDueDateStatus, formatMinutes } from '../utils/dates';
import { IconCheck, IconClock, IconCalendar, IconPlay, IconEdit, IconTrash } from './Icons';
import { PRIORITIES } from '../constants';

export default function TaskCard({
  task,
  onToggleStatus,
  onEdit,
  onDelete,
  onStartFocus,
  compact = false,
}) {
  const isCompleted = task.status === 'Completed';
  const dueDateInfo = getDueDateStatus(task.dueDate);

  const priorityClass =
    task.priority === PRIORITIES.HIGH
      ? 'priority-high'
      : task.priority === PRIORITIES.LOW
      ? 'priority-low'
      : 'priority-medium';

  return (
    <article className={`task-card ${isCompleted ? 'is-completed' : ''} ${compact ? 'is-compact' : ''}`}>
      <div className="task-card-main">
        {/* Checkbox toggle */}
        <button
          type="button"
          role="checkbox"
          aria-checked={isCompleted}
          aria-label={isCompleted ? `Mark "${task.title}" as pending` : `Mark "${task.title}" as completed`}
          className={`task-checkbox ${isCompleted ? 'checked' : ''}`}
          onClick={() => onToggleStatus(task.id)}
        >
          {isCompleted && <IconCheck size={14} className="checkbox-check" />}
        </button>

        {/* Task Content */}
        <div className="task-body">
          <div className="task-header-row">
            <h3 className="task-title" title={task.title}>
              {task.title}
            </h3>
          </div>

          <div className="task-meta-row">
            {/* Subject Tag */}
            <span className="task-subject-tag">{task.subject}</span>

            {/* Priority Badge */}
            <span className={`task-priority-badge ${priorityClass}`}>
              {task.priority}
            </span>

            {/* Due Date Indicator */}
            {dueDateInfo && !isCompleted && (
              <span className={`task-due-badge due-${dueDateInfo.type}`}>
                <IconCalendar size={13} />
                <span>{dueDateInfo.label}</span>
              </span>
            )}

            {/* Duration Badge */}
            <span className="task-duration-badge" title="Estimated focus duration">
              <IconClock size={13} />
              <span>{formatMinutes(task.estimatedDuration)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Task Actions */}
      <div className="task-actions-group">
        {!isCompleted && onStartFocus && (
          <button
            type="button"
            className="btn-task-action btn-action-focus"
            onClick={() => onStartFocus(task)}
            title="Start focus timer on this task"
            aria-label={`Start focus session for ${task.title}`}
          >
            <IconPlay size={14} />
            <span className="action-text">Focus</span>
          </button>
        )}

        {onEdit && (
          <button
            type="button"
            className="btn-task-action btn-action-edit"
            onClick={() => onEdit(task)}
            title="Edit task"
            aria-label={`Edit task ${task.title}`}
          >
            <IconEdit size={15} />
          </button>
        )}

        {onDelete && (
          <button
            type="button"
            className="btn-task-action btn-action-delete"
            onClick={() => onDelete(task.id)}
            title="Delete task"
            aria-label={`Delete task ${task.title}`}
          >
            <IconTrash size={15} />
          </button>
        )}
      </div>
    </article>
  );
}
