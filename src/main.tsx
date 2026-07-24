import posthog from "posthog-js";
import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";

import App from "./App.tsx";

posthog.init("phc_TiL3OcCTNhP8FJ73Gw4jXKXSwwzKYJ2RJBFxlpPDkjH", {
  api_host: "https://us.i.posthog.com",
  defaults: "2026-05-30",
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
