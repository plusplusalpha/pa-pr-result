# PA Client Report Portal

## Routes

- `report.plusalpha.agency` → client sign-in
- `report.plusalpha.agency/lullaboy-pr-aug2026` → authenticated client report

The report route is protected by the same signed, HTTP-only session cookie as the sign-in page.

## Vercel environment variables

Required:

- `REPORT_ACCESS_PASSWORD` — keep the existing password value

Optional:

- `REPORT_ACCESS_ID` — defaults to `client`

Enable the variables for Production and Preview, then redeploy.

## Files

- `index.html` — compact client sign-in
- `lullaboy-pr-aug2026.html` — report
- `middleware.js` — route protection
- `api/login.js` — ID/password validation
- `api/logout.js` — session removal
- `pa-logo.png` — current PA logo

## Search visibility

The report portal intentionally uses `noindex, nofollow, noarchive` and must not appear in search results.
