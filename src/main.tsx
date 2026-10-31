import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router";

import "./i18n";
import "./index.css";

import { App } from "@/App";
import { SettingsBridge } from "@/components/settings-bridge";
import { ThemeProvider } from "@/components/theme-provider";
import { applyTheme, readStoredTheme } from "@/lib/theme";

// Apply the saved theme before the first render so there is no flash of the wrong theme.
applyTheme(readStoredTheme());

const container = document.getElementById("root");
if (!container) {
    throw new Error("Root element #root was not found.");
}

createRoot(container).render(
    <StrictMode>
        <ThemeProvider>
            <SettingsBridge />
            <HashRouter>
                <App />
            </HashRouter>
        </ThemeProvider>
    </StrictMode>,
);
