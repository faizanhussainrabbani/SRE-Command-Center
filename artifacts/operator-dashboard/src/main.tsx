import { createRoot } from "react-dom/client";
import { configureApiClient } from "@/lib/api/client";
import { AppProviders } from "@/app/providers";
import { AppRouter } from "@/app/router";
import "@/styles/index.css";

configureApiClient();

createRoot(document.getElementById("root")!).render(
  <AppProviders>
    <AppRouter />
  </AppProviders>,
);