import { siteConfig } from "@/lib/site-config.ts";
import { cn } from "@/lib/utils.ts";

interface SiteMarkProps {
  className?: string;
}

/**
 * The generated Ajar Threshold mark. Its structure follows the current page
 * ink while the amber doorway remains identical in both themes.
 */
export function SiteMark({ className }: SiteMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-grid shrink-0 place-items-center", className)}
    >
      <img
        alt=""
        className="max-h-full max-w-full object-contain dark:hidden"
        height={64}
        src={siteConfig.mark.light.src}
        srcSet={`${siteConfig.mark.light.src} 1x, ${siteConfig.mark.light.src2x} 2x`}
        width={37}
      />
      <img
        alt=""
        className="hidden max-h-full max-w-full object-contain dark:block"
        height={64}
        src={siteConfig.mark.dark.src}
        srcSet={`${siteConfig.mark.dark.src} 1x, ${siteConfig.mark.dark.src2x} 2x`}
        width={37}
      />
    </span>
  );
}
