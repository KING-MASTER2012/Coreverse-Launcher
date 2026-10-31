import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";

export function NotFoundPage() {
    const { t } = useTranslation();

    return (
        <div className="mx-auto flex max-w-3xl flex-col items-start gap-4">
            <h1 className="text-3xl font-semibold tracking-tight">{t("notFound.title")}</h1>
            <p className="text-muted-foreground">{t("notFound.description")}</p>
            <Button asChild>
                <Link to="/">{t("notFound.back")}</Link>
            </Button>
        </div>
    );
}
