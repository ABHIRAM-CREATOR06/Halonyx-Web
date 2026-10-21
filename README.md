# Halonyx Web

The public landing site for [Halonyx](https://github.com/ABHIRAM-CREATOR06/Halonyx), an open-source, end-to-end encrypted messenger. This repository contains the static website, its design reference, and links to the live app and companion projects.

> **Live app:** [halonyx.onrender.com](https://halonyx.onrender.com) · **Main project:** [Halonyx](https://github.com/ABHIRAM-CREATOR06/Halonyx) · **Learning companion:** [Atlas](https://github.com/ABHIRAM-CREATOR06/Atlas)

## What the site covers

- Halonyx’s Signal Protocol foundations and interactive X3DH handshake visualization.
- Current messenger capabilities, including private group messaging, client-side DLP, and encrypted threads.
- Links to the source, protocol documentation, audits, tests, and benchmarks.
- Standalone [Privacy Policy](frontend/privacy.html) and [Terms of Use](frontend/terms.html) pages.
- A homepage blog preview and dedicated [project blog](frontend/blog.html), with the complete text of the long-form article and three DEV.to posts presented as local articles with original-source links.
- Responsive layouts for phones, tablets, and desktop screens.

The messenger implementation, backend, protocol, and tests live in the [main Halonyx repository](https://github.com/ABHIRAM-CREATOR06/Halonyx). This repository is the landing site only.

## Run locally

Requires Node.js and npm.

### Windows

Run the setup script from the repository root:

```bat
scripts\start_preview.bat
```

It rebuilds the landing page and starts the local server at [http://localhost:4173](http://localhost:4173). Keep the terminal window open while browsing; press `Ctrl+C` to stop the server.

### macOS, Linux, or manual setup

```bash
npm run build:landing
npm run preview
```

The preview command serves the `frontend/` directory on port `4173`. If you prefer Python, you can run:

```bash
npm run build:landing
python -m http.server 4173 -d frontend
```

## Edit and build

1. Edit page copy and section markup in `frontend/landing/partials/`.
2. Edit project URLs, version, and team details in `frontend/landing/site.json`.
3. Run `npm run build:landing` to assemble the partials into `frontend/index.html`.
4. Preview the site locally and check both desktop and phone layouts.

`frontend/index.html` is generated from the ordered list in `frontend/landing/manifest.json`; make content changes in the partials so they are preserved by the next build.

## Project structure

| Path | Purpose |
| --- | --- |
| `frontend/index.html` | Generated landing page |
| `frontend/privacy.html` | Privacy policy for the landing site and hosted messenger |
| `frontend/terms.html` | Terms for the landing site and hosted messenger |
| `frontend/blog.html` / `frontend/blog/` | Blog index and long-form project article |
| `frontend/landing/` | Page partials, site data, and assembly order |
| `frontend/css/landing.css` | Main styles and responsive breakpoints |
| `frontend/css/blog.css` | Blog and article styles, using the landing page theme |
| `frontend/css/landing/` | Styles for landing-page sections, including credits |
| `frontend/js/handshake.js` | Interactive X3DH handshake visualization |
| `frontend/design.html` | Standalone design reference |
| `scripts/assemble-landing.mjs` | Builds the landing page from partials |
| `scripts/start_preview.bat` | Windows build and local-preview launcher |
| `design.md` / `agent.md` | Design specification and contributor guide |

## Project team

| Name | Focus |
| --- | --- |
| Abhiram P | Backend · Signal Protocol · Safety Numbers |
| Geo Jose | Frontend · UI/UX · Theme System |
| Anirudh | Frontend · Documentation |
| Antony S Kannampuzha | Database · Infrastructure · Key Storage |

### Contributor thanks

Thanks to [@amrithavdev](https://github.com/amrithavdev) for the cross-platform contributor setup guide and troubleshooting improvements for Windows, Linux, macOS, SQLite, and ports ([PR #13](https://github.com/ABHIRAM-CREATOR06/Halonyx/pull/13)).

## License

This repository is licensed under [AGPL-3.0](LICENSE).
