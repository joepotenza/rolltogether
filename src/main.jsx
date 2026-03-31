/*
  /main.jsx
  Wraps the whole site in React
*/

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App/App.jsx";
import { BrowserRouter } from "react-router";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter basename={import.meta.env.BASE_URL}>
    <App />
  </BrowserRouter>,
);
