import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider, Toaster, TooltipProvider } from "@ashmore-studios/ui";
import { App } from "./App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="brays-intune-theme">
      <TooltipProvider>
        <App />
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>,
);
