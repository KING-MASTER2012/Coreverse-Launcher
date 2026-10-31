import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SUPPORTED_LANGUAGES, isLanguage, setLanguage } from "@/i18n";

// Language names are always shown in their own language.
const LANGUAGE_NAMES: Record<(typeof SUPPORTED_LANGUAGES)[number], string> = {
    en: "English",
    tr: "Türkçe",
};

export function LanguageSwitcher() {
    const { t, i18n } = useTranslation();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={t("common.changeLanguage")}>
                    <Languages />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start">
                <DropdownMenuRadioGroup
                    value={i18n.resolvedLanguage}
                    onValueChange={(value) => {
                        if (isLanguage(value)) {
                            void setLanguage(value);
                        }
                    }}
                >
                    {SUPPORTED_LANGUAGES.map((language) => (
                        <DropdownMenuRadioItem key={language} value={language}>
                            {LANGUAGE_NAMES[language]}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
