import { invoke, isTauri } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export interface AppInfo {
    name: string;
    version: string;
}

export type ThemeSetting = "light" | "dark" | "system";
export type LanguageSetting = "en" | "tr";

/** Mirrors `launcher_core::Settings`. `language` is `null` until the user picks one. */
export interface Settings {
    theme: ThemeSetting;
    language: LanguageSetting | null;
}

/** Mirrors `launcher_core::SettingsPatch`: only the given fields are changed. */
export interface SettingsPatch {
    theme?: ThemeSetting;
    language?: LanguageSetting;
}

/** Mirrors the serialized `launcher_core::Error`. */
export interface LauncherError {
    code: string;
    message: string;
}

/** Mirrors `events::SETTINGS_CHANGED` in `src-tauri/src/events.rs`. */
export const SETTINGS_CHANGED_EVENT = "settings-changed";

export function isLauncherError(value: unknown): value is LauncherError {
    return (
        typeof value === "object" &&
        value !== null &&
        "code" in value &&
        "message" in value &&
        typeof value.code === "string" &&
        typeof value.message === "string"
    );
}

/** Turns anything thrown by a command into a readable message. */
export function describeError(error: unknown): string {
    if (isLauncherError(error)) {
        return `${error.message} (${error.code})`;
    }
    return error instanceof Error ? error.message : String(error);
}

/**
 * Asks the Rust side for application info.
 * Returns `null` when the UI runs in a plain browser (e.g. `pnpm dev` without Tauri).
 */
export async function getAppInfo(): Promise<AppInfo | null> {
    if (!isTauri()) {
        return null;
    }
    return invoke<AppInfo>("app_info");
}

/** Reads the settings stored in SQLite. `null` in a plain browser. */
export async function getSettings(): Promise<Settings | null> {
    if (!isTauri()) {
        return null;
    }
    return invoke<Settings>("get_settings");
}

/** Saves a partial settings update. `null` in a plain browser. */
export async function updateSettings(patch: SettingsPatch): Promise<Settings | null> {
    if (!isTauri()) {
        return null;
    }
    return invoke<Settings>("update_settings", { patch });
}

/** Subscribes to settings changes. Resolves to the function that unsubscribes again. */
export async function onSettingsChanged(handler: (settings: Settings) => void): Promise<() => void> {
    if (!isTauri()) {
        return () => undefined;
    }
    return listen<Settings>(SETTINGS_CHANGED_EVENT, (event) => handler(event.payload));
}
