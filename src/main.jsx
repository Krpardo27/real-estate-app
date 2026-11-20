import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import router from "./router.jsx";
import { RouterProvider } from "react-router-dom";
import MotionProvider from "./components/MotionProvider.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MotionProvider><RouterProvider router={router} /></MotionProvider>
  </StrictMode>,
);
