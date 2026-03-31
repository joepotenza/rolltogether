/*
    SearchFilters.jsx
*/

import "./SearchFilters.css";

function SearchFilters({ filters, onFilterChange }) {
  const handleFilterChange = () => {
    const newFilters = {
      system: document.querySelector(".filter__system").value,
      type: document.querySelector(".filter__type").value,
      isHomebrew: null,
    };
    const story = document.querySelector(".filter__story").value;
    if (story === "Homebrew") {
      newFilters.isHomebrew = true;
    } else if (story === "Pre-Made") {
      newFilters.isHomebrew = false;
    }
    onFilterChange(newFilters);
  };
  return (
    <aside className="sidebar sidebar__filters">
      <h2 className="filters__title">Filters</h2>
      <form className="filters__form">
        <select
          className="filters__select filter__system"
          onChange={handleFilterChange}
          defaultValue={filters.system}
        >
          <option value="">
            {filters.system === "" ? "Game Edition" : "All Games"}
          </option>
          {/* For now this list is hard coded on the front end but there is a db table "systems" for future expansion */}
          <option value="69c9a1262f30caed2bb17327">D&amp;D 3.5e</option>
          <option value="69c9a14e2f30caed2bb17328">D&amp;D 5e</option>
          <option value="69c9a1572f30caed2bb17329">D&amp;D 5.5e</option>
        </select>
        <select
          className="filters__select filter__type"
          onChange={handleFilterChange}
          defaultValue={filters.type}
        >
          <option value="">
            {filters.type === "" ? "Game Type" : "All Types"}
          </option>
          <option value="online">Online</option>
          <option value="live">In Person</option>
          <option value="hybrid">Hybrid</option>
        </select>
        <select
          className="filters__select filter__story"
          onChange={handleFilterChange}
          defaultValue={
            filters.isHomebrew
              ? "Homebrew"
              : filters.isHomebrew === false
                ? "Pre-Made"
                : ""
          }
        >
          <option value="">
            {filters.isHomebrew === null ? "Story Type" : "All Stories"}
          </option>
          <option value="Homebrew">Homebrew</option>
          <option value="Pre-Made">Pre-Made</option>
        </select>
      </form>
    </aside>
  );
}

export default SearchFilters;
