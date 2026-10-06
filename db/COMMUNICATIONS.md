# Admin communication exceptions

The `/admin` portal contains the Exception Dashboard above the payment queue. It refreshes every minute while open. Each registration has a Communication Status panel accessible from the queue or registration report.

- Missing means no matching confirmation is recorded; it does not establish that an older email was never sent.
- Accepted is not delivered. Accepted messages without a final event are flagged after 30 minutes. Attempts with no result are flagged after five minutes.
- The panel preserves every attempt and shows recipients, provider IDs, timestamps in Eastern Time, and the admin responsible for a resend.
- Resend uses the saved registration and current verified balance. It creates no registration or payment records. The admin reviews the saved recipients before sending.
- Recorded bounces, suppressions, and complaints require review by the email administrator before another send to the affected address. The control never removes provider suppressions.
- Check the existing registration before asking anyone to register again.

## Deployment

Apply `db/admin-communications.sql` before publishing the app. This additive SQL grants the resend function only to the service role and adds communication lookup/delivery deduplication indexes. It preserves existing rows and uses the application's existing server-side Supabase and Resend environment variables.

The Resend webhook must subscribe to sent, delivered, delivery_delayed, bounced, suppressed, failed, and complained events. Keep `RESEND_WEBHOOK_SECRET` synchronized with the configured endpoint. Database failures return HTTP 503 so the provider can retry. Replayed events are deduplicated, and dashboard status computation accounts for out-of-order events and mixed outcomes on multi-recipient messages.

Historical messages imported during rollout are marked `metadata.source=provider_history_backfill`. Their updated timestamp is when the status was observed, not an invented delivery timestamp.

## Verification

Run `node --experimental-strip-types --test tests/*.test.mjs` with Node 22+ and `npm run build`. The tests cover missing records, stalled sends, delivery events, recipient coverage, retry resolution, current-balance content, authentication, origin checks, duplicate claims, and provider failures. Database claim/cooldown/permission checks were additionally executed within a rolled-back transaction. No real attendee emails were sent during verification.
