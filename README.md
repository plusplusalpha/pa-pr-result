# PAA Report Portal — Internal Library + Unlisted Client Links

This version separates the internal report library from client-facing share links.

## Structure

- `report.plusalpha.agency` → internal password screen
- `report.plusalpha.agency/dashboard` → PAA-only report library
- `report.plusalpha.agency/lullaboy-pr-aug2026` → direct client link, no login required

Client report links are **unlisted**, not access-controlled. Anyone who receives the URL can open it.

## Upload to GitHub root

Keep your existing report file:
- `lullaboy-pr-aug2026.html`

Add / replace:
- `index.html`
- `dashboard.html`
- `middleware.js`
- `api/login.js`
- `api/logout.js`
- `vercel.json`
- `package.json`
- `pa_logo.svg`

## Vercel setting

Project → Settings → Environment Variables

Add:

`REPORT_ACCESS_PASSWORD`

Set the internal PAA password. Enable Production (and Preview if desired), then redeploy.

## Adding future reports

1. Add a new HTML file to the repo, e.g. `sophie-asia-dec2026.html`
2. Open `dashboard.html`
3. Add one object to the `REPORTS` array:

```js
{
  talent: "Sophie Powers",
  description: "Asia Market Development · Dec 2026",
  updated: "Updated Dec 12, 2026",
  path: "/sophie-asia-dec2026"
}
```

4. Commit.

The dashboard will show Open + Copy client link buttons automatically.

## Privacy model

- Internal dashboard: password-protected
- Client reports: unlisted direct URLs
- Search indexing discouraged with `X-Robots-Tag` and page-level `noindex`
- This is not suitable for highly sensitive legal / financial / deal documents unless report-level authentication is added later
