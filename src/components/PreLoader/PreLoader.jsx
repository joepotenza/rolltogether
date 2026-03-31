/*
  PreLoader.jsx
  PreLoader spinning icon
*/

import "./PreLoader.css";

function PreLoader({ fill = false }) {
  if (fill) {
    // Fill the screen (otherwise assume there's a surrounding container already)
    return (
      <div style={{ position: "relative", width: "100%", minHeight: "250px" }}>
        <div className="circle-preloader"></div>
      </div>
    );
  }
  return <div className="circle-preloader"></div>;
}

export default PreLoader;
