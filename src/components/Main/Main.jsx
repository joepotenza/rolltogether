/*
  Main.jsx
  Site homepage controller
*/
import { useEffect, useState } from "react";

import "./Main.css";

import SearchFilters from "../SearchFilters/SearchFilters";
import SearchResults from "../SearchResults/SearchResults";

function Main({ groupAPI, onFetchError }) {
  const defaultFilters = { system: "", type: "", isHomebrew: null };
  const [filters, setFilters] = useState(defaultFilters);
  const [results, setResults] = useState([]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const filterResults = () => {
    const filtered = getGroupList(filters);
    setResults(filtered);
  };

  const getGroupList = () => {
    const myFilters = { ...filters };
    if (myFilters.isHomebrew === null) {
      delete myFilters.isHomebrew;
    }
    groupAPI
      .getGroups(myFilters)
      .then((result) => {
        setResults(result.groups);
      })
      .catch(onFetchError);
  };

  useEffect(() => {
    filterResults();
  }, [filters]);

  return (
    <main className="main">
      <SearchFilters filters={filters} onFilterChange={handleFilterChange} />
      <SearchResults results={results} />
    </main>
  );
}

export default Main;
