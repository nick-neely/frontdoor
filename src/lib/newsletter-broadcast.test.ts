import { describe, expect, it } from "vitest";

import { unsubscribeMergeTag } from "../emails/new-post.tsx";
import {
  broadcastMeta,
  buildBroadcastDraft,
  selectBroadcastPost,
} from "./newsletter-broadcast.ts";
import { siteConfig } from "./site-config.ts";
import type { WritingFrontmatter } from "./writing-schema.ts";

const published = {
  description: "Why the terminal résumé moved to a subdomain.",
  draft: false,
  kind: "post",
  pillar: "building-in-public",
  published: "2026-08-25",
  slug: "building-the-new-front-door",
  title: "Building the new front door",
} as const satisfies WritingFrontmatter;

const unpublished = {
  description: "Not finished.",
  draft: true,
  kind: "post",
  pillar: "practical-ai",
  published: "2026-09-01",
  slug: "half-written",
  title: "Half written",
} as const satisfies WritingFrontmatter;

const entries: WritingFrontmatter[] = [published, unpublished];

describe("choosing what to broadcast", () => {
  it("finds a published Post by slug", () => {
    expect(selectBroadcastPost(published.slug, entries)).toBe(published);
  });

  it("refuses an unknown slug and names the ones that exist", () => {
    expect(() => selectBroadcastPost("no-such-post", entries)).toThrow(
      /no-such-post[\s\S]*building-the-new-front-door/u
    );
  });

  it("does not offer drafts as alternatives", () => {
    expect(() => selectBroadcastPost("no-such-post", entries)).toThrow(
      /^(?![\s\S]*half-written)/u
    );
  });

  it("refuses a draft by saying it is one", () => {
    expect(() => selectBroadcastPost(unpublished.slug, entries)).toThrow(
      /still a draft/u
    );
  });
});

describe("the broadcast draft", () => {
  it("cannot ask Resend to send anything", async () => {
    // The whole safety property of `pnpm broadcast`, asserted on the shape
    // rather than on the script: nothing the script spreads into
    // `broadcasts.create` can turn a draft into a delivery.
    const draft = await buildBroadcastDraft(published);

    expect(Object.hasOwn(draft, "send")).toBeFalsy();
    expect(Object.hasOwn(draft, "scheduledAt")).toBeFalsy();
    expect(Object.keys(draft).toSorted()).toStrictEqual([
      "from",
      "html",
      "name",
      "replyTo",
      "subject",
      "text",
    ]);
  });

  it("carries the Post, its own URL, and the unsubscribe tag", async () => {
    const draft = await buildBroadcastDraft(published);
    const url = `${siteConfig.origin}/writing/${published.slug}`;

    expect(draft.subject).toBe(published.title);
    expect(draft.html).toContain(published.description);
    expect(draft.html).toContain(`href="${url}"`);
    expect(draft.html).toContain(unsubscribeMergeTag);
    expect(draft.text).toContain(unsubscribeMergeTag);
  });

  it("sends from the address ADR-0003 verified, and replies elsewhere", async () => {
    const draft = await buildBroadcastDraft(published);

    expect(draft.from).toBe("Nick Neely <hello@send.nickneely.dev>");
    expect(draft.replyTo).toBe("contact@nickneely.dev");
  });

  it("writes the metadata line as a date and a Pillar", () => {
    expect(broadcastMeta(published)).toBe(
      "August 25, 2026 · Building in Public"
    );
  });
});
