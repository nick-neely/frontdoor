import { describe, expect, it } from "vitest";

import { siteConfig } from "./site-config.ts";
import { generatedSiteFiles } from "./site-files.ts";

describe("generated site files", () => {
  it("gives agents specific when-to-use and contact guidance", () => {
    const llms = generatedSiteFiles["llms.txt"];

    expect(llms.contentType).toBe("text/plain; charset=utf-8");
    expect(llms.source).toContain("## When to use Nick Neely");
    expect(llms.source).toContain("modernizing workflow software");
    expect(llms.source).toContain(siteConfig.links.contact);
    expect(llms.source).toContain(`${siteConfig.origin}/sitemap.xml`);
  });
});
