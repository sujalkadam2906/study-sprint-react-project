import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './App.css';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TaskManager from './components/TaskManager';
import FocusTimer from './components/FocusTimer';
import Insights from './components/Insights';
import TaskModal from './components/TaskModal';
import SettingsModal from './components/SettingsModal';
import StreakInfoModal from './components/StreakInfoModal';
import Toast from './components/Toast';

import { APP_VIEWS } from './constants';
import {
  loadTasks,
  saveTasks,
  loadSessions,
  saveSessions,
  loadSettings,
  saveSettings,
  clearAllStorage,
} from './utils/storage';
import { calculateStreakStats, getTodayStudyMinutes } from './utils/streaks';
import { formatMinutes } from './utils/dates';

function App() {
  // 1. Persistent State
  const [tasks, setTasks] = useState(() => loadTasks());
  const [sessions, setSessions] = useState(() => loadSessions());
  const [settings, setSettings] = useState(() => loadSettings());

  // 2. Navigation & UI View State
  const [currentView, setCurrentView] = useState(APP_VIEWS.DASHBOARD);
  const [toast, setToast] = useState(null);

  // 3. Modals State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isStreakInfoModalOpen, setIsStreakInfoModalOpen] = useState(false);

  // 4. Focus Session Linked Task
  const [focusSelectedTask, setFocusSelectedTask] = useState(null);

  const searchInputRef = useRef(null);

  // Save tasks on change
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  // Save sessions on change
  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  // Save settings on change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Today's stats derived from real data
  const todayFocusMinutes = useMemo(() => getTodayStudyMinutes(sessions), [sessions]);
  const streakStats = useMemo(() => calculateStreakStats(sessions), [sessions]);

  // Unique existing subjects for autofill
  const existingSubjects = useMemo(() => {
    const set = new Set();
    tasks.forEach((t) => {
      if (t.subject && t.subject.trim()) set.add(t.subject.trim());
    });
    return Array.from(set);
  }, [tasks]);

  // -------------------------------------------------------------
  // Task Handlers
  // -------------------------------------------------------------
  const handleCreateTask = useCallback((taskData) => {
    const newTask = {
      id: Date.now(),
      title: taskData.title,
      subject: taskData.subject,
      priority: taskData.priority,
      status: 'Pending',
      dueDate: taskData.dueDate || null,
      estimatedDuration: taskData.estimatedDuration || 25,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };

    setTasks((prev) => [newTask, ...prev]);
    setToast({
      type: 'success',
      message: `Task added: "${newTask.title}"`,
    });
  }, []);

  const handleUpdateTask = useCallback((taskData) => {
    if (!editingTask) return;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === editingTask.id
          ? {
              ...t,
              title: taskData.title,
              subject: taskData.subject,
              priority: taskData.priority,
              dueDate: taskData.dueDate || null,
              estimatedDuration: taskData.estimatedDuration || 25,
            }
          : t
      )
    );

    setToast({
      type: 'info',
      message: `Updated "${taskData.title}"`,
    });
    setEditingTask(null);
  }, [editingTask]);

  const handleToggleTaskStatus = useCallback((id) => {
    setTasks((prev) => {
      let toggledTo = null;
      const updated = prev.map((task) => {
        if (task.id === id) {
          const isPending = task.status === 'Pending';
          toggledTo = isPending ? 'Completed' : 'Pending';
          return {
            ...task,
            status: toggledTo,
            completedAt: isPending ? new Date().toISOString() : null,
          };
        }
        return task;
      });

      if (toggledTo === 'Completed') {
        setToast({
          type: 'success',
          message: 'Task completed! Great progress.',
        });
      }

      return updated;
    });
  }, []);

  const handleDeleteTask = useCallback((id) => {
    const taskToDelete = tasks.find((t) => t.id === id);
    if (!taskToDelete) return;

    // Remove from tasks
    setTasks((prev) => prev.filter((t) => t.id !== id));

    // Also clear from focus linked task if matched
    if (focusSelectedTask && focusSelectedTask.id === id) {
      setFocusSelectedTask(null);
    }

    // Offer undo option via toast
    setToast({
      type: 'undo',
      message: `Deleted "${taskToDelete.title}"`,
      action: () => {
        setTasks((prev) => [taskToDelete, ...prev]);
        setToast({
          type: 'info',
          message: `Restored "${taskToDelete.title}"`,
        });
      },
    });
  }, [tasks, focusSelectedTask]);

  const handleOpenEditTask = useCallback((task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  }, []);

  const handleStartFocus = useCallback((task) => {
    setFocusSelectedTask(task);
    setCurrentView(APP_VIEWS.FOCUS);
  }, []);

  // -------------------------------------------------------------
  // Focus Session Handlers
  // -------------------------------------------------------------
  const handleCompleteFocusSession = useCallback((sessionData) => {
    const newSession = {
      id: Date.now(),
      taskId: sessionData.taskId || null,
      taskTitle: sessionData.taskTitle || null,
      subject: sessionData.subject || null,
      durationMinutes: sessionData.durationMinutes || 25,
      completedAt: new Date().toISOString(),
    };

    setSessions((prev) => [newSession, ...prev]);

    // Check if this session completed the daily goal
    const newTotalToday = todayFocusMinutes + newSession.durationMinutes;
    if (newTotalToday >= settings.dailyGoalMinutes && todayFocusMinutes < settings.dailyGoalMinutes) {
      setToast({
        type: 'success',
        message: 'Daily study goal reached! Congratulations.',
        subtext: `${formatMinutes(newTotalToday)} focused today`,
      });
    } else {
      setToast({
        type: 'success',
        message: `Focus sprint recorded: ${formatMinutes(newSession.durationMinutes)}`,
      });
    }
  }, [todayFocusMinutes, settings.dailyGoalMinutes]);

  // -------------------------------------------------------------
  // Settings & Backup Handlers
  // -------------------------------------------------------------
  const handleSaveSettings = useCallback((newSettings) => {
    setSettings(newSettings);
    setToast({
      type: 'success',
      message: 'Preferences updated successfully.',
    });
  }, []);

  const handleImportData = useCallback((importedData, mode) => {
    if (mode === 'replace') {
      if (importedData.tasks) setTasks(importedData.tasks);
      if (importedData.sessions) setSessions(importedData.sessions);
      if (importedData.settings) setSettings(importedData.settings);
    } else {
      // Merge mode
      if (importedData.tasks) {
        setTasks((prev) => {
          const existingIds = new Set(prev.map((t) => t.id));
          const additions = importedData.tasks.filter((t) => !existingIds.has(t.id));
          return [...prev, ...additions];
        });
      }
      if (importedData.sessions) {
        setSessions((prev) => {
          const existingIds = new Set(prev.map((s) => s.id));
          const additions = importedData.sessions.filter((s) => !existingIds.has(s.id));
          return [...prev, ...additions];
        });
      }
      if (importedData.settings) {
        setSettings((prev) => ({ ...prev, ...importedData.settings }));
      }
    }
  }, []);

  const handleClearAllData = useCallback(() => {
    clearAllStorage();
    setTasks([]);
    setSessions([]);
    setFocusSelectedTask(null);
    setToast({
      type: 'info',
      message: 'All application data has been reset.',
    });
  }, []);

  // -------------------------------------------------------------
  // Keyboard Shortcuts (N for new task, / for search, Escape for modal)
  // -------------------------------------------------------------
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      const isInputActive =
        activeTag === 'input' ||
        activeTag === 'textarea' ||
        activeTag === 'select' ||
        document.activeElement?.isContentEditable;

      if (e.key === 'Escape') {
        if (isTaskModalOpen) setIsTaskModalOpen(false);
        if (isSettingsModalOpen) setIsSettingsModalOpen(false);
        if (isStreakInfoModalOpen) setIsStreakInfoModalOpen(false);
        return;
      }

      if (isInputActive) return;

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setEditingTask(null);
        setIsTaskModalOpen(true);
      } else if (e.key === '/') {
        e.preventDefault();
        setCurrentView(APP_VIEWS.TASKS);
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 100);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isTaskModalOpen, isSettingsModalOpen, isStreakInfoModalOpen]);

  return (
    <div className="app-layout">
      {/* Top Application Navigation */}
      <Header
        title="StudySprint"
        subtitle="Personal Study Planner"
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenNewTask={() => {
          setEditingTask(null);
          setIsTaskModalOpen(true);
        }}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* Main View Router */}
      <main className="main-viewport" id="main-content">
        {currentView === APP_VIEWS.DASHBOARD && (
          <Dashboard
            tasks={tasks}
            todayFocusMinutes={todayFocusMinutes}
            dailyGoalMinutes={settings.dailyGoalMinutes}
            currentStreak={streakStats.currentStreak}
            onNavigate={setCurrentView}
            onStartFocus={handleStartFocus}
            onToggleStatus={handleToggleTaskStatus}
            onEditTask={handleOpenEditTask}
            onDeleteTask={handleDeleteTask}
            onOpenNewTaskModal={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
            onOpenStreakInfo={() => setIsStreakInfoModalOpen(true)}
          />
        )}

        {currentView === APP_VIEWS.TASKS && (
          <TaskManager
            tasks={tasks}
            onToggleStatus={handleToggleTaskStatus}
            onEditTask={handleOpenEditTask}
            onDeleteTask={handleDeleteTask}
            onStartFocus={handleStartFocus}
            onOpenNewTaskModal={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
            searchInputRef={searchInputRef}
          />
        )}

        {currentView === APP_VIEWS.FOCUS && (
          <FocusTimer
            tasks={tasks}
            settings={settings}
            onCompleteFocusSession={handleCompleteFocusSession}
            onCompleteTask={handleToggleTaskStatus}
            selectedTask={focusSelectedTask}
            onClearSelectedTask={() => setFocusSelectedTask(null)}
            onSelectTask={setFocusSelectedTask}
          />
        )}

        {currentView === APP_VIEWS.INSIGHTS && (
          <Insights
            sessions={sessions}
            tasks={tasks}
            dailyGoalMinutes={settings.dailyGoalMinutes}
            onOpenStreakInfo={() => setIsStreakInfoModalOpen(true)}
          />
        )}
      </main>

      {/* Modals & Dialogs */}
      {isTaskModalOpen && (
        <TaskModal
          key={editingTask ? editingTask.id : 'new-task'}
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setEditingTask(null);
          }}
          onSave={editingTask ? handleUpdateTask : handleCreateTask}
          editingTask={editingTask}
          existingSubjects={existingSubjects}
        />
      )}

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        tasks={tasks}
        sessions={sessions}
        onImportData={handleImportData}
        onClearAllData={handleClearAllData}
      />

      <StreakInfoModal
        isOpen={isStreakInfoModalOpen}
        onClose={() => setIsStreakInfoModalOpen(false)}
      />

      {/* Non-intrusive Toast */}
      <Toast
        toast={toast}
        onClose={() => setToast(null)}
        onUndo={toast?.action}
      />
    </div>
  );
}

export default App;
