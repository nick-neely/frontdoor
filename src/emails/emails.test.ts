import { beforeAll, describe, expect, it } from "vitest";

import { confirmationLifetimeHours } from "../lib/newsletter.ts";
import { renderConfirmSubscription } from "./confirm-subscription.tsx";
import type { EmailContent } from "./layout.tsx";
import { renderNewPost, unsubscribeMergeTag } from "./new-post.tsx";
import { renderWelcome } from "./welcome.tsx";

const confirmUrl = "https://nickneely.dev/subscribe?token=abc.123.def";

const newPost = {
  description: "What a two-hour import taught me about upload workflows.",
  meta: "August 25, 2026 · Product Engineering",
  title: "The two-minute import",
  url: "https://nickneely.dev/writing/the-two-minute-import",
};

let confirm: EmailContent;
let welcome: EmailContent;
let broadcast: EmailContent;

describe("newsletter mail", () => {
  beforeAll(async () => {
    [confirm, welcome, broadcast] = await Promise.all([
      renderConfirmSubscription({ confirmUrl }),
      renderWelcome(),
      renderNewPost(newPost),
    ]);
  });

  function everyEmail(): [string, EmailContent][] {
    return [
      ["confirm", confirm],
      ["welcome", welcome],
      ["new post", broadcast],
    ];
  }

  it("renders every template as a complete document", () => {
    for (const [, mail] of everyEmail()) {
      expect(mail.html.startsWith("<!DOCTYPE html")).toBeTruthy();
      expect(mail.html).toContain('lang="en"');
    }
  });

  it("gives every template a subject and a plain-text body", () => {
    for (const [, mail] of everyEmail()) {
      expect(mail.subject.length).toBeGreaterThan(0);
      expect(mail.text.length).toBeGreaterThan(0);
    }
  });

  it("embeds nothing remote in any template", () => {
    // PRODUCT.md and ADR-0003 both rule out open tracking. There is no image
    // in these templates, so there is nowhere for a pixel to hide - asserting
    // it here is what keeps that true when someone adds a logo one day.
    for (const [, mail] of everyEmail()) {
      expect(mail.html).not.toContain("<img");
      expect(mail.html).not.toContain("<script");
      expect(mail.html).not.toContain("<link ");
    }
  });

  it("gives the confirm mail exactly one destination", () => {
    // React Email's Button emits Outlook fallback markup around the anchor, so
    // the assertion is on the set of destinations rather than on a tag count.
    const destinations = new Set(
      [...confirm.html.matchAll(/href="(?<url>[^"]+)"/gu)].map(
        (match) => match.groups?.url
      )
    );

    expect(destinations).toStrictEqual(new Set([confirmUrl]));
  });

  it("states the expiry and that ignoring the confirm mail is enough", () => {
    expect(confirm.html).toContain(`${confirmationLifetimeHours} hours`);
    expect(confirm.html).toContain("ignore this email");
    expect(confirm.text).toContain("ignore this email");
    expect(confirm.text).toContain(confirmUrl);
  });

  it("promises no cadence in the welcome mail", () => {
    for (const word of ["weekly", "monthly", "every week", "each week"]) {
      expect(welcome.html.toLowerCase()).not.toContain(word);
    }
  });

  it("carries the Post in a broadcast", () => {
    expect(broadcast.subject).toBe(newPost.title);
    expect(broadcast.html).toContain(newPost.description);
    expect(broadcast.html).toContain(newPost.meta);
    expect(broadcast.html).toContain(`href="${newPost.url}"`);
  });

  it("carries Resend's unsubscribe tag in both bodies of a broadcast", () => {
    // Resend substitutes this per recipient, so the triple braces have to
    // survive rendering exactly.
    expect(broadcast.html).toContain(`href="${unsubscribeMergeTag}"`);
    expect(broadcast.text).toContain(unsubscribeMergeTag);
  });

  it("keeps the merge tag out of mail Resend cannot substitute it in", () => {
    // The tag only resolves inside a broadcast. In a transactional send it
    // would reach the reader as literal braces.
    expect(confirm.html).not.toContain(unsubscribeMergeTag);
    expect(welcome.html).not.toContain(unsubscribeMergeTag);
  });

  it("says the same thing in both bodies", () => {
    // The text alternative is rendered from the same tree, so this is really a
    // check that `plainText` is producing prose rather than an empty string.
    // `html-to-text` sets a heading in capitals, which is a plain-text
    // convention rather than a difference in what the mail says.
    expect(broadcast.text).toContain(newPost.title.toUpperCase());
    expect(broadcast.text).toContain(newPost.description);
    expect(broadcast.text).toContain(newPost.url);
  });
});
