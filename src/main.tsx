import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import './index.css';

console.log("main.tsx executed", { envKeys: Object.keys(import.meta.env) });

const root = document.getElementById("root");
if (!root) {
  document.body.insertAdjacentHTML(
    "afterbegin",
    '<div style="color:red">NO ROOT FOUND</div>'
  );
} else {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
