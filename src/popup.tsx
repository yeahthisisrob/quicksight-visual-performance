// popup.tsx
import React, { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";

const App = lazy(() => import("./components/App"));

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <Suspense fallback={<div>Loading...</div>}>
      <App />
    </Suspense>,
  );
}
