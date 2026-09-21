# Halonyx-Web

Static public website for [Halonyx](https://github.com/ABHIRAM-CREATOR06/Halonyx): monochrome landing page, design reference, and links to the live app, source, and [Atlas](https://github.com/ABHIRAM-CREATOR06/Atlas).

## What's in this repo

| Path | Purpose |
| --- | --- |
| `frontend/index.html` | Built landing page (served at site root) |
| `frontend/landing/` | Modular source — `site.json`, partials, manifest |
| `frontend/css/` | Landing styles (`landing.css` + `landing/*` modules) |
| `frontend/design.html` | Standalone design reference |
| `scripts/assemble-landing.mjs` | Stitches partials into `index.html` |
| `design.md` / `agent.md` | Product and editing guide |

Implementation, protocol, backend, and tests live in the main [Halonyx](https://github.com/ABHIRAM-CREATOR06/Halonyx) repository. The encrypted messenger opens at [halonyx.onrender.com](https://halonyx.onrender.com).

## Local preview

```bash
npm run build:landing
npm run preview
```

Or with Python:

```bash
npm run build:landing
python -m http.server 4173 -d frontend
```

Open `http://localhost:4173/`.

## Edit the landing page

1. Change copy or layout in `frontend/landing/partials/`.
2. Update team, version, or URLs in `frontend/landing/site.json`.
3. Run `npm run build:landing` before commit.

## Team

Built at **SNGCE, Kerala** · APJ Abdul Kalam Technological University · 2026

| Name | Role |
| --- | --- |
| Abhiram P | Backend · Signal Protocol · Safety Numbers |
| Geo Jose | Frontend · UI/UX · Theme System |
| Anirudh | Frontend · Testing · WebTorrent Integration |
| Antony S Kannampuzha | Database · Infrastructure · Key Storage |

## License

AGPL-3.0. See [LICENSE](LICENSE).
