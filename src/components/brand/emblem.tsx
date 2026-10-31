import emblemUrl from "@/assets/coreverse-emblem.png";
import { cn } from "@/lib/utils";

/**
 * The Coreverse emblem, painted with the current text colour so it follows the theme.
 * The PNG is only used as an alpha mask.
 */
export function Emblem({ className }: { className?: string }) {
    const mask = `url(${emblemUrl})`;

    return (
        <span
            aria-hidden="true"
            className={cn("inline-block aspect-[1710/1422] shrink-0 bg-current", className)}
            style={{
                maskImage: mask,
                WebkitMaskImage: mask,
                maskRepeat: "no-repeat",
                WebkitMaskRepeat: "no-repeat",
                maskPosition: "center",
                WebkitMaskPosition: "center",
                maskSize: "contain",
                WebkitMaskSize: "contain",
            }}
        />
    );
}
