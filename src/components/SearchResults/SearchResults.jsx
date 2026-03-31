/*
    SearchResults.jsx
*/

import "./SearchResults.css";

import { Link } from "react-router";

import DOMPurify from "dompurify";

function SearchResults({ results, className }) {
  return (
    <section className={`results ${className ? className : ""}`}>
      <table className="results__table">
        <thead className="results__header">
          <tr className="results__header-row">
            <td className="results__header-cell results__header-cell_type_description">
              Description
            </td>
            <td className="results__header-cell results__header-cell_type_details">
              Details
            </td>
          </tr>
        </thead>
        <tbody className="results__body">
          {!results || !results.length ? (
            <tr className="results__no-results">
              <td colSpan={2}>No results found</td>
            </tr>
          ) : (
            results.map((group) => (
              <tr className="results__result" key={group._id}>
                <td className="result__cell">
                  <Link to={`/group/${group._id}`} className="result__name">
                    {group.name}
                  </Link>
                  <p className="result__summary">
                    {DOMPurify.sanitize(group.summary, {
                      ALLOWED_TAGS: ["#text"],
                    })}
                  </p>
                </td>
                <td className="result__cell result__details">
                  <div className="result__group">
                    <div
                      className={`result__system result__system_type_${group.system.id}`}
                      dangerouslySetInnerHTML={{ __html: group.system.name }}
                    ></div>
                    <div className={`result__type result_type_${group.type}`}>
                      {group.type === "online" && "Online"}
                      {group.type === "hybrid" && "Hybrid"}
                      {group.type === "inperson" && "In Person"}
                    </div>
                  </div>

                  <div className="result__gm">
                    <span>GM: </span>
                    <Link
                      to={`/user/${group.owner.username}`}
                      className="result__gm-link"
                      reloadDocument
                    >
                      {group.owner.username}
                    </Link>
                  </div>
                  <div className="result__story">
                    <span className="result__story-label">Story:</span>
                    {group.story}
                  </div>
                  <div className="result__players">
                    <span className="result__players-label">Open seats:</span>
                    {group.slots.open} of {group.slots.total}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );
}
export default SearchResults;
