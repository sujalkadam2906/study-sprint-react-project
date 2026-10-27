import { IconSearch, IconClose } from './Icons';
import { PRIORITIES } from '../constants';

export default function FilterBar({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  subjectFilter,
  setSubjectFilter,
  sortBy,
  setSortBy,
  availableSubjects = [],
  searchInputRef,
}) {
  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    statusFilter !== 'All' ||
    priorityFilter !== 'All' ||
    subjectFilter !== 'All';

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setPriorityFilter('All');
    setSubjectFilter('All');
  };

  return (
    <div className="filter-panel">
      <div className="filter-top-row">
        {/* Search input with shortcut hint */}
        <div className="search-input-wrapper">
          <IconSearch size={18} className="search-icon" />
          <input
            ref={searchInputRef}
            type="text"
            className="search-input"
            placeholder="Search tasks or subjects... (Press '/' to focus)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search tasks"
          />
          {searchQuery && (
            <button
              type="button"
              className="btn-clear-search"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search query"
            >
              <IconClose size={16} />
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="sort-wrapper">
          <label htmlFor="sort-select" className="sort-label">Sort:</label>
          <select
            id="sort-select"
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="priority">Priority (High to Low)</option>
            <option value="dueDate">Due Date (Soonest)</option>
            <option value="durationAsc">Duration (Shortest)</option>
            <option value="durationDesc">Duration (Longest)</option>
            <option value="newest">Recently Added</option>
          </select>
        </div>
      </div>

      <div className="filter-controls-row">
        {/* Status Filter Tabs */}
        <div className="status-tabs" role="tablist" aria-label="Task status filters">
          {['All', 'Pending', 'Completed'].map((status) => (
            <button
              key={status}
              type="button"
              role="tab"
              aria-selected={statusFilter === status}
              className={`status-tab ${statusFilter === status ? 'tab-active' : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="filter-dropdowns">
          {/* Priority filter */}
          <select
            className="filter-select-sm"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            aria-label="Filter by priority"
          >
            <option value="All">All Priorities</option>
            <option value={PRIORITIES.HIGH}>High Priority</option>
            <option value={PRIORITIES.MEDIUM}>Medium Priority</option>
            <option value={PRIORITIES.LOW}>Low Priority</option>
          </select>

          {/* Subject filter */}
          {availableSubjects.length > 0 && (
            <select
              className="filter-select-sm"
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              aria-label="Filter by subject"
            >
              <option value="All">All Subjects</option>
              {availableSubjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          )}

          {/* Reset button */}
          {hasActiveFilters && (
            <button
              type="button"
              className="btn-reset-filters"
              onClick={resetFilters}
              aria-label="Reset all filters"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
