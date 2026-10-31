import { useEffect } from "react";

import { useTheme } from "@/hooks/use-theme";
import { syncLanguage } from "@/i18n";
import { describeError, getSettings, onSettingsChanged, type Settings } from "@/lib/tauri";

/**
 * Keeps the UI in step with the settings stored by the Rust side: loads them once at startup
 * and applies every later `settings-changed` event. Renders nothing.
 */
export function SettingsBridge() {
    const { syncTheme } = useTheme();

    useEffect(() => {
        let disposed = false;
        let unlisten: (() => void) | undefined;

        const apply = (settings: Settings) => {
            syncTheme(settings.theme);
            if (settings.language !== null) {
                void syncLanguage(settings.language);
            }
        };

        getSettings()
            .then((settings) => {
                if (!disposed && settings) {
                    apply(settings);
                }
            })
            .catch((error: unknown) => {
                console.error(`Could not load the settings: ${describeError(error)}`);
            });

        onSettingsChanged(apply)
            .then((dispose) => {
                if (disposed) {
                    dispose();
                } else {
                    unlisten = dispose;
                }
            })
            .catch((error: unknown) => {
                console.error(`Could not listen for settings changes: ${describeError(error)}`);
            });

        return () => {
            disposed = true;
            unlisten?.();
        };
    }, [syncTheme]);

    return null;
}
