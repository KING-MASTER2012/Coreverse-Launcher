import { Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/use-theme";
import { THEMES, isTheme } from "@/lib/theme";

export function ThemeToggle() {
    const { t } = useTranslation();
    const { theme, resolvedTheme, setTheme } = useTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={t("common.toggleTheme")}>
                    {resolvedTheme === "dark" ? <Moon /> : <Sun />}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start">
                <DropdownMenuRadioGroup
                    value={theme}
                    onValueChange={(value) => {
                        if (isTheme(value)) {
                            setTheme(value);
                        }
                    }}
                >
                    {THEMES.map((item) => (
                        <DropdownMenuRadioItem key={item} value={item}>
                            {t(`theme.${item}`)}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
