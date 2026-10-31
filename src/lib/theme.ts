import { createContext } from "react";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEMES: readonly Theme[] = ["light", "dark", "system"];
export const THEME_STORAGE_KEY = "coreverse-launcher.theme";

export interface ThemeContextValue {
    theme: Theme;
    resolvedTheme: ResolvedTheme;
    /** Changes the theme and saves it to the launcher's settings. */
    setTheme: (theme: Theme) => void;
    /** Applies a theme that already comes from the saved settings, without saving it again. */
    syncTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function isTheme(value: string): value is Theme {
    return THEMES.some((theme) => theme === value);
}

export function readStoredTheme(): Theme {
    try {
        const value = window.localStorage.getItem(THEME_STORAGE_KEY);
        return value !== null && isTheme(value) ? value : "system";
    } catch {
        return "system";
    }
}

export function storeTheme(theme: Theme): void {
    try {
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
        // Storage may be unavailable; the theme then only lasts for this session.
    }
}

export function resolveTheme(theme: Theme): ResolvedTheme {
    if (theme !== "system") {
        return theme;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(theme: Theme): ResolvedTheme {
    const resolved = resolveTheme(theme);
    const root = document.documentElement;
    root.classList.toggle("dark", resolved === "dark");
    root.style.colorScheme = resolved;
    return resolved;
}
