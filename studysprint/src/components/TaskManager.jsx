import { useState, useMemo } from 'react';
import FilterBar from './FilterBar';
import TaskCard from './TaskCard';
import { PRIORITIES } from '../constants';
import { IconPlus, IconListTodo, IconSearch } from './Icons';

const PRIORITY_RANK = {
  [PRIORITIES.HIGH]: 3,
  [PRIORITIES.MEDIUM]: 2,
  [PRIORITIES.LOW]: 1,
};

export default function TaskManager({
  tasks = [],
  onToggleStatus,
  onEditTask,
  onDeleteTask,
  onStartFocus,
  onOpenNewTaskModal,
  searchInputRef,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [sortBy, setSortBy] = useState('priority');

  // Extract unique subjects
  const availableSubjects = useMemo(() => {
    const set = new Set();
    tasks.forEach((t) => {
      if (t.subject && t.subject.trim()) {
        set.add(t.subject.trim());
      }
    });
    return Array.from(set).sort();
  }, [tasks]);

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = (task.title || '').toLowerCase().includes(q);
          const matchSub = (task.subject || '').toLowerCase().includes(q);
          if (!matchTitle && !matchSub) return false;
        }

        // Status filter
        if (statusFilter !== 'All' && task.status !== statusFilter) {
          return false;
        }

        // Priority filter
        if (priorityFilter !== 'All' && task.priority !== priorityFilter) {
          return false;
        }

        // Subject filter
        if (subjectFilter !== 'All' && task.subject !== subjectFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'priority') {
          const diff = (PRIORITY_RANK[b.priority] || 2) - (PRIORITY_RANK[a.priority] || 2);
          if (diff !== 0) return diff;
          return (a.title || '').localeCompare(b.title || '');
        }

        if (sortBy === 'dueDate') {
          // Soonest first, undated tasks last
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        }

        if (sortBy === 'durationAsc') {
          return (Number(a.estimatedDuration) || 25) - (Number(b.estimatedDuration) || 25);
        }

        if (sortBy === 'durationDesc') {
          return (Number(b.estimatedDuration) || 25) - (Number(a.estimatedDuration) || 25);
        }

        if (sortBy === 'newest') {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime;
        }

        return 0;
      });
  }, [tasks, searchQuery, statusFilter, priorityFilter, subjectFilter, sortBy]);

  const pendingCount = tasks.filter((t) => t.status === 'Pending').length;
  const completedCount = tasks.filter((t) => t.status === 'Completed').length;

  return (
    <div className="task-manager-view">
      {/* View Header */}
      <div className="view-header-row">
        <div>
          <h1 className="view-title">Study Tasks</h1>
          <p className="view-subtitle">
            Organise, schedule, and track all your academic commitments. ({pendingCount} pending, {completedCount} completed)
          </p>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={onOpenNewTaskModal}
          title="Create a new task (Shortcut: N)"
        >
          <IconPlus size={16} />
          <span>New Task</span>
          <kbd className="kbd-shortcut">N</kbd>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <FilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        subjectFilter={subjectFilter}
        setSubjectFilter={setSubjectFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        availableSubjects={availableSubjects}
        searchInputRef={searchInputRef}
      />

      {/* Task List */}
      <div className="task-list" role="list">
        {filteredAndSortedTasks.length > 0 ? (
          filteredAndSortedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleStatus={onToggleStatus}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onStartFocus={onStartFocus}
            />
          ))
        ) : (
          <div className="empty-state-card">
            <div className="empty-state-icon">
              {searchQuery.trim() !== '' ? <IconSearch size={32} /> : <IconListTodo size={32} />}
            </div>
            <h3>
              {searchQuery.trim() !== ''
                ? 'No matching tasks found'
                : statusFilter === 'Completed'
                ? 'No completed tasks yet'
                : 'No study tasks on this list'}
            </h3>
            <p>
              {searchQuery.trim() !== ''
                ? `No tasks match your search "${searchQuery}". Try a different keyword or reset filters.`
                : statusFilter === 'Completed'
                ? 'Complete focus sessions and check off tasks to build your record of finished work.'
                : 'Add tasks with subjects, deadlines, and durations to start organising your study workflow.'}
            </p>
            {tasks.length === 0 ? (
              <button
                type="button"
                className="btn-primary"
                onClick={onOpenNewTaskModal}
              >
                <IconPlus size={16} />
                <span>Create First Task</span>
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
