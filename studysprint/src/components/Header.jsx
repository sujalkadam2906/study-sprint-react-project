import {
  IconLogo,
  IconDashboard,
  IconListTodo,
  IconClock,
  IconBarChart,
  IconPlus,
  IconSettings,
} from './Icons';
import { APP_VIEWS } from '../constants';

export default function Header({
  title = 'StudySprint',
  subtitle = 'Your Personal Study Planner',
  currentView = APP_VIEWS.DASHBOARD,
  onNavigate,
  onOpenNewTask,
  onOpenSettings,
}) {
  const navItems = [
    { id: APP_VIEWS.DASHBOARD, label: 'Dashboard', icon: IconDashboard },
    { id: APP_VIEWS.TASKS, label: 'Tasks', icon: IconListTodo },
    { id: APP_VIEWS.FOCUS, label: 'Focus Mode', icon: IconClock },
    { id: APP_VIEWS.INSIGHTS, label: 'Insights', icon: IconBarChart },
  ];

  return (
    <header className="app-header">
      <div className="header-inner">
        {/* Brand identity */}
        <div
          className="brand-container"
          onClick={() => onNavigate && onNavigate(APP_VIEWS.DASHBOARD)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onNavigate && onNavigate(APP_VIEWS.DASHBOARD);
            }
          }}
          aria-label="Go to StudySprint Dashboard"
        >
          <IconLogo size={28} />
          <div className="brand-text-group">
            <span className="brand-name">{title}</span>
            <span className="brand-tagline">{subtitle}</span>
          </div>
        </div>

        {/* Primary Navigation */}
        {onNavigate && (
          <nav className="header-nav" aria-label="Main Navigation">
            {navItems.map((item) => {
              const IconComp = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`nav-button ${isActive ? 'nav-active' : ''}`}
                  onClick={() => onNavigate(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <IconComp size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* Quick Actions */}
        <div className="header-quick-actions">
          {onOpenNewTask && (
            <button
              type="button"
              className="btn-header-new-task"
              onClick={onOpenNewTask}
              title="Add a new task (Shortcut: N)"
            >
              <IconPlus size={16} />
              <span className="new-task-label">New Task</span>
            </button>
          )}

          {onOpenSettings && (
            <button
              type="button"
              className="btn-header-settings"
              onClick={onOpenSettings}
              title="StudySprint Settings"
              aria-label="Open settings"
            >
              <IconSettings size={18} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
