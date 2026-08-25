# The apex is both the canonical origin and the sending domain

`nickneely.dev` is canonical and `www` redirects to it, reversing today's arrangement. The same apex is verified in Resend, so newsletter mail sends as `Nick Neely <hello@nickneely.dev>` with `Reply-To: contact@nickneely.dev`.

Verifying the apex does not disturb inbound mail. Resend writes its records under `send.nickneely.dev` (an MX for the return path and its own SPF TXT) and DKIM CNAMEs under `_domainkey`, leaving the apex `MX` and `v=spf1 include:_spf.mx.cloudflare.net ~all` that Cloudflare Email Routing depends on untouched. DKIM signs as `d=nickneely.dev` and the return path is a subdomain of the same organizational domain, so DMARC aligns on both counts.

## Considered options

**A dedicated sending subdomain** is the usual advice for isolating bulk reputation, and was rejected for two reasons: `send.` is the label Resend claims automatically, `mail.` is occupied by orphaned Mailgun records, and at a few hundred Subscribers the better-looking From address is worth more than reputation isolation. Revisit if volume ever reaches the thousands.

**Keeping `www` canonical** would preserve the existing site's search equity. Rejected because that equity is effectively nil, and the shorter apex is what gets spoken aloud and printed on banners.

## Consequences

Open and click tracking are disabled, so no `links.` tracking subdomain exists, no pixel is embedded, and no URL is rewritten. This costs open-rate reporting and is chosen deliberately: a site that runs no third-party surveillance should not surveil its own mail.

`_dmarc` stays at `p=none` through launch and tightens to `p=quarantine` once Resend has been sending cleanly for a couple of weeks.
