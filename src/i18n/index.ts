import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { describeError, updateSettings } from "@/lib/tauri";

import en from "./locales/en.json";
import tr from "./locales/tr.json";

export const SUPPORTED_LANGUAGES = ["en", "tr"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_STORAGE_KEY = "coreverse-launcher.language";

export function isLanguage(value: string): value is Language {
    return SUPPORTED_LANGUAGES.some((language) => language === value);
}

function detectLanguage(): Language {
    try {
        const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (stored !== null && isLanguage(stored)) {
            return stored;
        }
    } catch {
        // Storage may be unavailable; fall back to the system language.
    }
    return navigator.language.toLowerCase().startsWith("tr") ? "tr" : "en";
}

/** Applies a language that already comes from the saved settings, without saving it again. */
export async function syncLanguage(language: Language): Promise<void> {
    try {
        window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
        // The language then only lasts for this session.
    }
    await i18n.changeLanguage(language);
}

/** Changes the language and saves it to the launcher's settings. */
export async function setLanguage(language: Language): Promise<void> {
    await syncLanguage(language);
    updateSettings({ language }).catch((error: unknown) => {
        console.error(`Could not save the language: ${describeError(error)}`);
    });
}

i18n.on("languageChanged", (language) => {
    document.documentElement.lang = language;
});

void i18n
    .use(initReactI18next)
    .init({
        resources: { en: { translation: en }, tr: { translation: tr } },
        lng: detectLanguage(),
        fallbackLng: "en",
        interpolation: { escapeValue: false },
    })
    .then(() => {
        document.documentElement.lang = i18n.language;
    });

export default i18n;
