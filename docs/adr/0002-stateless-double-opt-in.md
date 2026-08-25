# Newsletter uses double opt-in with no stored pending state

A person submits their address, receives a confirm email carrying an HMAC-signed payload of address plus issue time, and only on following that link does a contact get created in Resend. Nothing is written anywhere between submission and confirmation: the signature is the state, and the timestamp inside it is the expiry.

## Considered options

**Single opt-in** was rejected because any typo or bot submission lands in the audience permanently and degrades deliverability for everyone else on the list.

**A `pending_subscribers` table** in Postgres was genuinely available: this application is free to add persistence even though the template it grew from deliberately declined to choose one. It was rejected on its own merits, not for lack of permission. A table introduces rows that must be swept, a race between confirmation and cleanup, and a second failure mode inside the subscribe request. A signature has none of these and expires by arithmetic.

## Consequences

The signing secret is load-bearing. Rotating it invalidates every confirm link in flight, which is acceptable because links are short-lived, but it means rotation is a deliberate act rather than routine hygiene.

Resend holds the subscriber list and owns unsubscribe through `{{{RESEND_UNSUBSCRIBE_URL}}}`, so this site stores nothing about Subscribers and needs no preference centre. The question "which page drives signups" is answered by an analytics event carrying the source path, not by a table.
