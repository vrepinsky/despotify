import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { setup } from "goober";
import React from "react";
import { createRoot } from "react-dom/client";

import { router } from "./router.tsx";
import "./styles.css";

setup(React.createElement);

const queryClient = new QueryClient();
const rootElement = document.querySelector("#root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
);
