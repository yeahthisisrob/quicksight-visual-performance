// viewerIndex.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import ViewerApp from "./components/ViewerApp";

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<ViewerApp />);
}
