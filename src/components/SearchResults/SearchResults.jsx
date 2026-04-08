/*
    SearchResults.jsx
    Displays group search results 
    Used in Main.jsx and Profile.jsx
*/

import "./SearchResults.css";

import { Link } from "react-router";

import DOMPurify from "dompurify";

function SearchResults({ results, className }) {
  return (
    <section className={`results ${className ? className : ""}`}>
      <div className="results__table">
        <div className="results__body">
          {!results || !results.length ? (
            <div className="results__result">
              <div
                colSpan={2}
                className="result__cell result__cell_type_noresult"
              >
                No results found
              </div>
            </div>
          ) : (
            results.map((group) => (
              <Link
                to={`/group/${group._id}`}
                className="results__result"
                key={group._id}
              >
                <div className="result__cell">
                  <span className="result__name">{group.name}</span>
                  <p className="result__summary">
                    {DOMPurify.sanitize(group.summary, {
                      ALLOWED_TAGS: ["#text"],
                    })}
                  </p>
                </div>
                <div className="result__cell result__details">
                  <div className="result__group">
                    <div
                      className={`result__system result__system_type_${group.system.id}`}
                      dangerouslySetInnerHTML={{ __html: group.system.name }}
                    ></div>
                    <div className={`result__type result_type_${group.type}`}>
                      {group.type === "online" && "Online"}
                      {group.type === "hybrid" && "Hybrid"}
                      {group.type === "inperson" && "In-Person"}
                    </div>
                  </div>

                  <div className="result__gm">
                    <span className="result__gm-label">GM: </span>
                    {group.owner.username}
                  </div>
                  <div className="result__story">
                    <span className="result__story-label">Story:</span>
                    {group.isHomebrew ? "Homebrew" : group.story}
                  </div>
                  <div className="result__players">
                    <span className="result__players-label">Open seats:</span>
                    {group.slots.open} of {group.slots.total}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
export default SearchResults;
