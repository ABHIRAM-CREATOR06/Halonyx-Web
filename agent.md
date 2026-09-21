# Halonyx Agent Guide (Web)

## Mission

Maintain the **Halonyx public website** — a static, protocol-aware landing experience. Do not add backend, protocol, or messenger code to this repository; those belong in [Halonyx](https://github.com/ABHIRAM-CREATOR06/Halonyx).

## Repository map

| Path | Purpose |
| --- | --- |
| `frontend/index.html` | Assembled landing page |
| `frontend/landing/` | `site.json`, partials, manifest |
| `frontend/css/landing.css` | Entry stylesheet |
| `frontend/css/landing/` | CSS modules (tokens, credits, …) |
| `frontend/design.html` | Design reference |
| `design.md` | Visual and content specification |
| `scripts/assemble-landing.mjs` | Build `index.html` from partials |

## Route contract

- `/` — landing page (`frontend/index.html`)
- `/design.html` — design reference
- **Messenger** — external: `site.json` → `appUrl` (default [halonyx.onrender.com](https://halonyx.onrender.com))
- **Source / protocol / tests** — links to main Halonyx GitHub repo (`sourceRepository` in `site.json`)

## Content hierarchy

1. Navigation and Open App (external)
2. Hero and handshake visualization
3. Capability ticker
4. Protocol trace
5. Security principles
6. Repository document library (Halonyx repo links)
7. Atlas companion
8. Team credits
9. Footer

## Workflow

1. Edit `frontend/landing/partials/` or `site.json`.
2. Run `npm run build:landing`.
3. Preview: `npm run preview` or `python -m http.server 4173 -d frontend`.
4. Check mobile layout and keyboard focus on interactive elements.

## Design constraints

- Monochrome palette; Space Grotesk + DM Mono.
- Static HTML/CSS only on the landing page (no required JavaScript).
- Decorative visuals: `aria-hidden` where appropriate.
- Respect `prefers-reduced-motion`.
- Do not claim formal verification or guaranteed security.

## Change boundaries

**In scope:** `frontend/landing/`, `frontend/css/`, `frontend/design.html`, `design.md`, `agent.md`, `README.md`, GitHub Pages workflow.

**Out of scope:** Express servers, SQLite, protocol modules, messenger UI — use the main Halonyx repository.
