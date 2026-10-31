import { Library } from "lucide-react";
import { useTranslation } from "react-i18next";

export function LibraryPage() {
    const { t } = useTranslation();

    return (
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
            <h1 className="text-3xl font-semibold tracking-tight">{t("library.title")}</h1>
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
                <Library className="size-10 text-muted-foreground" aria-hidden="true" />
                <h2 className="text-lg font-medium">{t("library.emptyTitle")}</h2>
                <p className="max-w-sm text-sm text-muted-foreground">
                    {t("library.emptyDescription")}
                </p>
            </div>
        </div>
    );
}
