import { RouterProvider } from "@tanstack/react-router";
import { setup } from "goober";
import React from "react";
import { createRoot } from "react-dom/client";

import { AppDataProvider, PlaylistsProvider, TracksProvider } from "./data-providers.tsx";
import { router } from "./router.tsx";
import "./styles.css";

setup(React.createElement);

const rootElement = document.querySelector("#root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <React.StrictMode>
    <AppDataProvider>
      <PlaylistsProvider>
        <TracksProvider>
          <RouterProvider router={router} />
        </TracksProvider>
      </PlaylistsProvider>
    </AppDataProvider>
  </React.StrictMode>,
);
