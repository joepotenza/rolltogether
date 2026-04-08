/*
    SearchFilters.jsx
    Sub component of Main.jsx: Filter sidebar for the main group search page
*/

import "./SearchFilters.css";

function SearchFilters({ filters, onFilterChange }) {
  const handleFilterChange = () => {
    const hb = document.querySelector(".filter__isHomebrew").value;
    const newFilters = {
      system: document.querySelector(".filter__system").value,
      type: document.querySelector(".filter__type").value,
      isHomebrew: hb === "" ? null : hb === "true",
      openSlots: true,
    };
    onFilterChange(newFilters);
  };
  return (
    <aside className="sidebar sidebar__filters">
      <h2 className="filters__title">Filter Groups:</h2>
      <form className="filters__form">
        <select
          name="system"
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
          name="type"
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
          name="isHomebrew"
          className="filters__select filter__isHomebrew"
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
          <option value="true">Homebrew</option>
          <option value="false">Pre-Made</option>
        </select>
      </form>
    </aside>
  );
}

export default SearchFilters;
