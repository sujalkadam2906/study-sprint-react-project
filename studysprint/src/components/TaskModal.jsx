import { useState, useEffect, useRef } from 'react';
import { PRIORITIES } from '../constants';
import { getLocalDateString } from '../utils/dates';
import { IconClose } from './Icons';

export default function TaskModal({ isOpen, onClose, onSave, editingTask = null, existingSubjects = [] }) {
  const [title, setTitle] = useState(() => (editingTask ? editingTask.title || '' : ''));
  const [subject, setSubject] = useState(() => (editingTask ? editingTask.subject || '' : existingSubjects[0] || ''));
  const [priority, setPriority] = useState(() => (editingTask ? editingTask.priority || PRIORITIES.MEDIUM : PRIORITIES.MEDIUM));
  const [dueDate, setDueDate] = useState(() => (editingTask ? editingTask.dueDate || '' : ''));
  const [estimatedDuration, setEstimatedDuration] = useState(() => (editingTask ? editingTask.estimatedDuration || 25 : 25));
  const [errors, setErrors] = useState({});

  const titleInputRef = useRef(null);

  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) {
      newErrors.title = 'Task title is required.';
    }
    if (!subject.trim()) {
      newErrors.subject = 'Subject is required.';
    }
    const durationNum = Number(estimatedDuration);
    if (!durationNum || durationNum < 5 || durationNum > 360) {
      newErrors.estimatedDuration = 'Duration must be between 5 and 360 minutes.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const taskData = {
      title: title.trim(),
      subject: subject.trim(),
      priority,
      dueDate: dueDate || null,
      estimatedDuration: Number(estimatedDuration),
    };

    onSave(taskData);
    onClose();
  };

  const setQuickDate = (type) => {
    const today = new Date();
    if (type === 'today') {
      setDueDate(getLocalDateString(today));
    } else if (type === 'tomorrow') {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDueDate(getLocalDateString(tomorrow));
    } else if (type === 'clear') {
      setDueDate('');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">
            {editingTask ? 'Edit Study Task' : 'New Study Task'}
          </h2>
          <button
            type="button"
            className="btn-icon"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <IconClose size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form" noValidate>
          <div className="form-group">
            <label htmlFor="task-title" className="form-label">
              Task Title <span className="required-star">*</span>
            </label>
            <input
              id="task-title"
              ref={titleInputRef}
              type="text"
              className={`form-input ${errors.title ? 'input-error' : ''}`}
              placeholder="e.g. Complete Chapter 4 Practice Problems"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="task-subject" className="form-label">
                Subject <span className="required-star">*</span>
              </label>
              <input
                id="task-subject"
                type="text"
                list="subject-suggestions"
                className={`form-input ${errors.subject ? 'input-error' : ''}`}
                placeholder="e.g. Linear Algebra, Chemistry"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={40}
              />
              <datalist id="subject-suggestions">
                {existingSubjects.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
              {errors.subject && <span className="error-message">{errors.subject}</span>}
            </div>

            <div className="form-group flex-1">
              <label htmlFor="task-priority" className="form-label">
                Priority
              </label>
              <select
                id="task-priority"
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value={PRIORITIES.HIGH}>High Priority</option>
                <option value={PRIORITIES.MEDIUM}>Medium Priority</option>
                <option value={PRIORITIES.LOW}>Low Priority</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="task-due-date" className="form-label">
                Due Date <span className="label-hint">(optional)</span>
              </label>
              <input
                id="task-due-date"
                type="date"
                className="form-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
              <div className="quick-date-pills">
                <button
                  type="button"
                  className="btn-pill"
                  onClick={() => setQuickDate('today')}
                >
                  Today
                </button>
                <button
                  type="button"
                  className="btn-pill"
                  onClick={() => setQuickDate('tomorrow')}
                >
                  Tomorrow
                </button>
                {dueDate && (
                  <button
                    type="button"
                    className="btn-pill-muted"
                    onClick={() => setQuickDate('clear')}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="form-group flex-1">
              <label htmlFor="task-duration" className="form-label">
                Estimated Focus Time
              </label>
              <div className="duration-input-wrapper">
                <input
                  id="task-duration"
                  type="number"
                  min="5"
                  max="360"
                  step="5"
                  className={`form-input ${errors.estimatedDuration ? 'input-error' : ''}`}
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                />
                <span className="duration-unit">min</span>
              </div>
              <div className="quick-date-pills">
                {[15, 25, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    className={`btn-pill ${Number(estimatedDuration) === mins ? 'pill-active' : ''}`}
                    onClick={() => setEstimatedDuration(mins)}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
              {errors.estimatedDuration && (
                <span className="error-message">{errors.estimatedDuration}</span>
              )}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
