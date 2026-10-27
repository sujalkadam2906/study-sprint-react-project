import { useState } from 'react';
import { PRIORITIES } from '../constants';

export default function TaskForm({ addTask }) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState(PRIORITIES.MEDIUM);
  const [dueDate, setDueDate] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState(25);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim()) {
      return;
    }

    const newTask = {
      id: Date.now(),
      title: title.trim(),
      subject: subject.trim(),
      priority,
      status: 'Pending',
      dueDate: dueDate || null,
      estimatedDuration: Number(estimatedDuration) || 25,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };

    addTask(newTask);

    setTitle('');
    setSubject('');
    setPriority(PRIORITIES.MEDIUM);
    setDueDate('');
    setEstimatedDuration(25);
  };

  return (
    <form className="task-form inline-task-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="What to study?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        aria-label="Task Title"
      />

      <input
        type="text"
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        required
        aria-label="Task Subject"
      />

      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        aria-label="Task Priority"
      >
        <option value={PRIORITIES.HIGH}>High</option>
        <option value={PRIORITIES.MEDIUM}>Medium</option>
        <option value={PRIORITIES.LOW}>Low</option>
      </select>

      <button type="submit" className="btn-submit">Add</button>
    </form>
  );
}
