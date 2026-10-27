# StudySprint — Personal Study Planner & Focus Engine

StudySprint is a premium personal study planner designed to help students decide what to study, focus deeply without distraction, build daily consistency, and measure real academic progress.

Built with React 19, Vite, vanilla CSS custom properties, and browser LocalStorage, StudySprint combines a modern productivity dashboard, an advanced task manager, a drift-free Pomodoro focus timer, streak tracking, and an explainable recommendation engine.

---

## Key Features

### 1. Unified Productivity Dashboard
- **Real-Time Study Metrics**: Live count of today's focused minutes, tasks completed today, pending tasks, and daily goal percentage.
- **Explainable "Next Best Task" Engine**: Deterministically scores and recommends your most urgent, high-value task based on deadline proximity, priority weighting, and estimated duration.
- **Prominent Focus CTA**: Launch directly into a timed study session linked to your top task in one click.
- **Urgent Deadlines Overview**: Surface tasks due today or overdue with immediate visual cues.

### 2. Advanced Task Management
- **Rich Task Metadata**: Title, subject, priority (`High`, `Medium`, `Low`), status (`Pending`, `Completed`), optional due date (`YYYY-MM-DD`), estimated focus duration in minutes, and accurate timestamps.
- **Multi-Factor Search & Filtering**: Instant search across titles and subjects, status tabs (`All`, `Pending`, `Completed`), priority filters, dynamic subject filters, and multiple sort modes (Priority, Due Date, Duration, Newest).
- **Safe Operations with Undo**: Complete and reopen tasks with instant feedback; delete tasks with a 6-second non-intrusive Undo toast banner.
- **Due Date Indicators**: Real-time badges for *Overdue by X days*, *Due today*, *Due tomorrow*, and upcoming deadlines.

### 3. Drift-Free Pomodoro Focus Timer
- **Session Types**: Focus (default 25 min), Short Break (5 min), and Long Break (15 min) with custom duration configuration in Settings.
- **Timestamp Accuracy**: Uses wall-clock timestamp offsets (`Date.now()` vs `targetEndTime`) rather than simple interval increments, preventing timer drift across background tabs and system pauses.
- **Page Refresh Recovery**: Automatically detects and restores active sessions or records completed timers across page refreshes.
- **Session Linking**: Associate timer sessions directly with pending study tasks.
- **Tab-Aware Synchronization**: Live session status and countdown display in the browser document title (e.g. `(24:45) Focus — StudySprint`).
- **Acoustic Completion Chime**: Soft dual-tone audio notification powered by the native Web Audio API with zero external media files.

### 4. Study Consistency & Activity Tracking
- **Consecutive Day Streaks**: Tracks daily study streaks based on local calendar dates. Includes a smart grace period (streaks held active until midnight if studied yesterday).
- **Accessible Weekly Bar Chart**: Pure CSS bar visualization depicting the last 7 calendar days of focused study time against your daily target.
- **Transparent Logic**: In-app modal detailing the exact criteria used for streak and milestone calculations.
- **Session History Log**: Verified table of completed focus sessions with timestamps and durations.

### 5. Privacy-First Local Persistence & Backups
- **100% Client-Side**: All data is stored in the browser's `localStorage` (`studysprint_tasks`, `studysprint_sessions`, `studysprint_settings`, `studysprint_timer_state`).
- **Safe Schema Migration**: Backward-compatible with legacy versions; automatically upgrades stored tasks while preserving IDs and avoiding fabricated historical timestamps.
- **JSON Export & Import**: Full backup download (`studysprint-backup-YYYY-MM-DD.json`) and validated import utility with data preview and choice between *Merge* or *Replace*.

### 6. Accessibility & Keyboard Shortcuts
- **Keyboard Navigation**:
  - `N`: Create a new study task
  - `/`: Focus search input
  - `Escape`: Close any active modal or dialog
- **WCAG Compliant**: High-contrast light interface, visible `:focus-visible` rings, semantic ARIA attributes, and full support for `prefers-reduced-motion`.
- **Zero Emojis**: Crisp, cohesive SVG line icons exclusively.

---

## Visual Design System

- **Background**: Cool White (`#F7F9FC`)
- **Main Surfaces**: Pure White (`#FFFFFF`) with subtle cool borders (`#E2E8F0`)
- **Primary Brand**: Royal Blue (`#2563EB`) & Primary Hover (`#1D4ED8`)
- **Primary Text**: Deep Navy (`#17243A`)
- **Secondary Text**: Muted Slate (`#64748B`)
- **Semantic Accents**: Emerald Green for achievements, Amber for warnings/medium priority, Crimson for overdue/high priority.

---

## Tech Stack

- **Framework**: React 19 (Functional Components, Hooks)
- **Bundler & Dev Server**: Vite 8
- **Styling**: Vanilla CSS3 with CSS Custom Properties, Flexbox, CSS Grid
- **Audio**: Web Audio API (native browser synthesis)
- **Code Quality**: ESLint 10 (React Flat Config)

---

## Local Setup & Development

### Prerequisites
- Node.js (v18.0.0 or later recommended)
- npm or yarn

### Installation
```bash
# Navigate to the application root directory
cd studysprint

# Install project dependencies
npm install

# Start the local development server
npm run dev
```

Visit the local development server (typically `http://localhost:5173`) in your browser.

### Quality Checks
```bash
# Run ESLint validation
npm run lint

# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## Data Persistence & Limitations

StudySprint uses browser `localStorage`. Please take note of the following:
1. **Browser-Specific**: StudySprint data is private to the browser and profile where it was created. It does not automatically synchronize across different devices or browsers.
2. **Cache Clearing**: Clearing website data or browser storage will remove stored tasks and history.
3. **Recommended Backup**: Use the **Export JSON Backup** feature in Settings periodically to preserve your study history and transfer data between machines.

---

## Deployment Instructions

### Deploying to Vercel (Recommended)
1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Log in to [Vercel](https://vercel.com).
3. Click **Add New Project** and import the repository.
4. Set the **Root Directory** to `studysprint` if deploying from the monorepo, or leave as root if using the inner repository.
5. Vercel will automatically detect Vite:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Click **Deploy**.

### Static Host Deployment (Netlify, Cloudflare Pages, GitHub Pages)
Build the production assets:
```bash
npm run build
```
The output files in `dist/` can be deployed to any static web hosting provider.

---

## License

MIT License. Built by Sujal Kadam.
