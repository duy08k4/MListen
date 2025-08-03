// Import libraries
import React from "react";
import ReactDOM from "react-dom/client";

// Import component
import App from "./App";

// Import css
import "./tailwind/tailwind.css"

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
