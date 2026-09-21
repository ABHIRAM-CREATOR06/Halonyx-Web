# Landing page modules

The public landing page is assembled from modular partials so sections stay editable in isolation.

| Path | Role |
| --- | --- |
| `site.json` | Version, this repo URL, Halonyx source repo, live app URL, Atlas, team |
| `manifest.json` | Ordered list of partials to stitch into `frontend/index.html` |
| `partials/*.html` | Section markup; use `{{REPO_URL}}`, `{{VERSION}}`, etc. for shared values |

## Regenerate `index.html`

```bash
npm run build:landing
```

Edit partials or `site.json`, then run the command above before commit. `frontend/index.html` is the built artifact served at `/`.

## Styles

CSS lives under `frontend/css/landing/` and is imported from `frontend/css/landing.css`.
