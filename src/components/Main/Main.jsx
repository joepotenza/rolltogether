/*
  Main.jsx
  Site homepage controller
*/
import { useEffect, useState, useContext } from "react";
import PageContext from "../../contexts/PageContext";
import { useLoadMonitor } from "../../hooks/useLoadMonitor";

import "./Main.css";

import SearchFilters from "../SearchFilters/SearchFilters";
import SearchResults from "../SearchResults/SearchResults";
import PreLoader from "../PreLoader/PreLoader";
import { useErrorHandler } from "../../hooks/useErrorHandler";

function Main() {
  const defaultFilters = {
    system: "",
    type: "",
    isHomebrew: null,
    openSlots: true,
  };
  const [filters, setFilters] = useState(defaultFilters);

  const { onFetchError, ErrorUI } = useErrorHandler(false);
  const { groupAPI } = useContext(PageContext);

  function handleFilterChange(newFilters) {
    setFilters(newFilters);
  }

  async function fetchGroupList() {
    const myFilters = { ...filters };
    if (myFilters.isHomebrew === null) {
      delete myFilters.isHomebrew;
    }
    try {
      const result = await groupAPI.getGroups(myFilters);
      return result?.groups || [];
    } catch (error) {
      onFetchError(error); // Handle error as before
      return []; // Return empty array on error to keep the hook happy
    }
  }

  const { isLoading, setIsLoading, results, setResults, getGroupList } =
    useLoadMonitor({
      variableName: "isLoading",
      variableSetterName: "setIsLoading",
      initialValue: true,
      loadingFunction: fetchGroupList,
      resultVariableName: "results",
      resultVariableSetterName: "setResults",
      initialResultValue: [],
      functionName: "getGroupList",
    });

  useEffect(() => {
    getGroupList();
  }, [filters]);

  return (
    ErrorUI || (
      <main className="main">
        <div className="banner">
          <div className="banner-content">
            <h1 className="banner-title">
              Find your group. Start your next campaign.
            </h1>
            <p className="banner-subtitle">
              Discover tables, connect with players, and keep your sessions
              organized—all in one place.
            </p>
          </div>
        </div>
        <h2 className="main__title">Available Groups</h2>
        <div className="main__content">
          <SearchFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />
          {isLoading ? (
            <PreLoader isLoading={isLoading} fill />
          ) : (
            <SearchResults results={results} isLoading={isLoading} />
          )}
        </div>
      </main>
    )
  );
}

export default Main;
