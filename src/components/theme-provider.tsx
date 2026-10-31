import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import {
    ThemeContext,
    applyTheme,
    readStoredTheme,
    resolveTheme,
    storeTheme,
    type ResolvedTheme,
    type Theme,
} from "@/lib/theme";
import { describeError, updateSettings } from "@/lib/tauri";

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(readStoredTheme);
    const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => resolveTheme(theme));

    useEffect(() => {
        setResolvedTheme(applyTheme(theme));
        if (theme !== "system") {
            return;
        }
        const media = window.matchMedia("(prefers-color-scheme: dark)");
        const onChange = () => setResolvedTheme(applyTheme("system"));
        media.addEventListener("change", onChange);
        return () => media.removeEventListener("change", onChange);
    }, [theme]);

    // localStorage is only a fast cache so the first paint already has the right theme;
    // the SQLite settings are the source of truth.
    const syncTheme = useCallback((next: Theme) => {
        storeTheme(next);
        setThemeState(next);
    }, []);

    const setTheme = useCallback(
        (next: Theme) => {
            syncTheme(next);
            updateSettings({ theme: next }).catch((error: unknown) => {
                console.error(`Could not save the theme: ${describeError(error)}`);
            });
        },
        [syncTheme],
    );

    const value = useMemo(
        () => ({ theme, resolvedTheme, setTheme, syncTheme }),
        [theme, resolvedTheme, setTheme, syncTheme],
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
