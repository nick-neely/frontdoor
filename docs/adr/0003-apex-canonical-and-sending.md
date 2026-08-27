# The apex is the canonical origin; Resend sends from send.nickneely.dev

`nickneely.dev` is canonical and `www` redirects to it, reversing today's arrangement. Newsletter mail sends as `Nick Neely <hello@send.nickneely.dev>` with `Reply-To: contact@nickneely.dev`. The From domain is the one verified in Resend: `send.nickneely.dev`. Replies go to the apex, which Cloudflare Email Routing still owns.

Resend refuses a From address whose domain is not the verified one. Verifying the apex would still leave inbound mail alone only if nobody touched the apex MX, but the object Resend actually verifies, and the address it will send as, is `send.nickneely.dev`. Bounce MX and SPF live on a `send.` label of that domain; DKIM CNAMEs live under `_domainkey.send.nickneely.dev`. The apex `MX` and `v=spf1 include:_spf.mx.cloudflare.net ~all` stay untouched. DKIM signs as `d=send.nickneely.dev`. The return path is under the same organizational domain as the From address, so DMARC aligns.

## Considered options

**Sending From the apex (`hello@nickneely.dev`)** would look cleaner in the inbox. Rejected because Resend requires the From domain to match a verified domain exactly, and the verified domain is `send.nickneely.dev`. Adding `nickneely.dev` in Resend and then sending as `hello@nickneely.dev` is refused with a 403 until that domain is verified, which this site does not do.

**A different sending subdomain (`mail.`, `news.`)** is the usual advice for isolating bulk reputation. `mail.` is occupied by orphaned Mailgun records, and `send.` is the label Resend already claims. Revisit if volume ever reaches the thousands.

**Keeping `www` canonical** would preserve the existing site's search equity. Rejected because that equity is effectively nil, and the shorter apex is what gets spoken aloud and printed on banners.

## Consequences

Open and click tracking are disabled, so no `links.` tracking subdomain exists, no pixel is embedded, and no URL is rewritten. This costs open-rate reporting and is chosen deliberately: a site that runs no third-party surveillance should not surveil its own mail.

`_dmarc` stays at `p=none` through launch and tightens to `p=quarantine` once Resend has been sending cleanly for a couple of weeks.
