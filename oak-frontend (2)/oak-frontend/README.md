# OAK Partner Convening 2026 — Frontend

Frontend for the OAK Zimbabwe Partner Gathering registration & attendance platform.
Built with Next.js (App Router) + TypeScript + Tailwind CSS.

## Running it

```bash
npm install
npm run dev
```

Then open http://localhost:3000 — it redirects straight to `/register`.

No environment variables are required to run it right now: all data currently
lives in the browser's `localStorage`, seeded with sample attendees, partners
and sessions so every screen has something to show. See "Handing off to the
backend" below for how that becomes real data.

## Pages

| Route | What it is |
|---|---|
| `/register` | Public registration form |
| `/pass/[id]` | Entry pass with QR code after registering |
| `/admin/login` | Coordination-team login (gates the two routes below) |
| `/checkin/scan` | Camera QR scanner + manual entry + simulate-scan list |
| `/checkin/result` | Success / already-checked-in / not-recognised outcome |
| `/programme` | Day tabs → Schedule (sessions) and Docs (notes, photos, resources) |
| `/partners` | Partner directory: search, region filters, sub-partners |
| `/partners/[id]` | Partner detail |
| `/attendance` | Live headcount, searchable check-in table, CSV export |

## QR scanning

Uses `html5-qrcode` against the device's rear camera (`facingMode: environment`).
It needs HTTPS (or localhost) to get camera permission — that's a browser
requirement, not a bug, so Vercel's preview/production URLs work fine but
scanning from a plain `http://` LAN address on a phone will not prompt for
camera access. If the camera can't start (permissions, no camera, desktop
without one), the page falls back to the manual code entry field and the
"Simulate QR Scan" list, both of which run the exact same check-in logic.

## Handing off to the backend (Supabase)

All data access goes through **`lib/db.ts`** and all admin auth goes through
**`lib/auth.ts`**. Every function in those two files is `async` and already
shaped like a Supabase query — that's deliberate, so the backend teammate can
replace the body of each function with a real `supabase.from(...)` /
`supabase.auth...` call without touching any page component.

For example, `registerAttendee()` currently pushes to localStorage; it should
become an `insert` into an `attendees` table that returns the generated row.
`checkInByQr()` should become an insert into a `checkins` table guarded by a
unique constraint on `(attendee_id, day)` to prevent double counting — the
mock version already enforces that same rule.

Two things called out in the brief that matter here:
- **Row-level security**: dietary/accessibility/travel/contact fields must
  only be selectable by authenticated admins. `lib/db.ts` already separates
  `getAllAttendeesAdmin()` (full PII) from `getPublicAttendeeList()`
  (name/org/role/QR code only) — mirror that split with two Postgres views or
  RLS policies, not just by hiding fields in the UI.
- **No double check-in per day**: enforce it in the database (unique
  constraint), not only in the frontend, since the frontend's guard can be
  bypassed by calling the API directly.

Once real Supabase env vars exist, add them to `.env.local` (see
`.env.example`) and wire `@supabase/supabase-js` (already in
`package.json`) inside `lib/db.ts` / `lib/auth.ts`.

## Deploying

Push to a GitHub repo and import it in Vercel — no special build settings
needed. Add the Supabase env vars in Vercel's project settings once they
exist.
