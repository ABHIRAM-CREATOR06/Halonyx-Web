# Halonyx Landing Page Design Specification

## Product direction

Halonyx is a private communications layer for people who want to understand and control what happens between **send** and **received**. The landing page should feel like a protocol console translated into a premium editorial interface: precise, inspectable, quiet, and slightly technical without becoming difficult to use.

The page introduces Halonyx as a secure messaging product and Atlas as its companion protocol-learning suite. It is not a generic SaaS marketing page. Every major visual and content decision should reinforce privacy, identity ownership, forward secrecy, and inspectability.

## Visual language

| Area | Decision |
| --- | --- |
| Palette | Black background `#050505`, warm white `#f4f4f0`, muted gray `#8e8e89`, structural line `#262624` |
| Typography | Space Grotesk for expressive headlines; DM Mono for protocol labels, metadata, document names, and trace output |
| Form language | Thin 1px rules, square cards, clipped hexagonal identity marks, generous negative space |
| Texture | Fine monochrome grid fields plus a restrained noise layer to avoid a flat digital black background |
| Accent | No chromatic accent. Contrast, line weight, and verified states provide hierarchy |
| Motion | Short opacity/transform entrances and a low-frequency signal pulse; all non-essential motion respects `prefers-reduced-motion` |

## Page structure

### 1. Global navigation

The header contains the Halonyx mark, text navigation for **Protocol**, **Principles**, and **Atlas**, plus a high-contrast **Open App** action. The header remains visually light and does not become a sticky dashboard bar.

### 2. Hero

The hero headline is:

> Messages without the middle.

The outlined word **without** gives the headline a glyph-like interruption and visually expresses the removal of unnecessary intermediaries. Supporting copy explains the product in plain language. The primary action opens the live encrypted messenger (external URL from `site.json` → `appUrl`); the secondary action scrolls to the protocol trace.

The right side contains a live-handshake visualization: three orbital paths, three protocol nodes, and an H core. It is conceptual rather than a literal cryptographic diagram. The session readout uses a masked key and a verified state so no secret material is exposed in the marketing UI.

### 3. Capability ticker

A narrow horizontal strip communicates the product boundary through short statements:

- End-to-end encrypted
- USID identity
- Forward secrecy
- No data brokers

The ticker is intentionally static and restrained. It should not become a distracting marquee.

### 4. Protocol trace

The trace panel makes privacy legible by showing three conceptual events:

1. Identity exchange
2. Session established
3. Message sealed

Each row includes a timestamp, event symbol, explanatory text, and an `OK` state. This section connects the marketing claim to the underlying protocol vocabulary: USID, X3DH, and Double Ratchet.

### 5. Principles

Three cards explain the product philosophy:

- **Identity is yours** — USID-based identity without making a phone number the product.
- **Secrets move forward** — Ratcheting means compromise does not imply permanent compromise.
- **Less to trust** — Minimal metadata and inspectable source reduce the trust surface.

The cards are outlined through the shared grid line rather than heavy shadows or rounded containers.

### 6. Repository document library

The landing page must expose the real project surface, not only the chat experience. The library links to:

- Project overview (`README.md`)
- Protocol modules (`/protocol`)
- Security analysis (`protocol/SECURITY_ANALYSIS.md`)
- Audit notes (`specification_docs/audit.md`)
- Test suite (`/tests`)
- AGPL-3.0 license (`LICENSE`)

Links should point directly to the corresponding GitHub paths so the page stays current with the repository.

### 7. Atlas companion section

Atlas is presented as the learning companion to Halonyx. The section describes its sequence diagrams, state machines, dependency graphs, and threat scenarios without overloading the landing page with implementation details. The primary action opens the Atlas repository.

## Interaction rules

- All primary buttons must be keyboard reachable and visibly focusable.
- Open App / Start a secure chat links open the live messenger URL (new tab), not a path in this repo.
- External GitHub and Atlas links open in a new tab with `rel="noreferrer"`.
- Hover states should change contrast or translate by a small amount; they should never introduce a new color family.
- The page should remain useful with JavaScript disabled because the landing page is static HTML and CSS.
- All decorative matrix, noise, and orbital elements must be `aria-hidden` or otherwise excluded from the accessibility tree.

## Responsive behavior

At widths below 780px:

- Hide the text navigation links while keeping the Open App action visible.
- Stack the hero content and handshake visualization.
- Convert the principles grid to a single column.
- Convert document rows from three columns to a compact two-row layout.
- Reduce section spacing while preserving large editorial headlines.
- Keep the Atlas section readable as a single-column card.

## Implementation map

| File | Responsibility |
| --- | --- |
| `frontend/landing/` | Modular landing source (`site.json`, partials, manifest) |
| `frontend/index.html` | Assembled landing page (`npm run build:landing`) |
| `frontend/css/landing.css` | Landing entry stylesheet; imports `css/landing/*` modules |
| `frontend/design.html` | Standalone design reference |
| Main [Halonyx](https://github.com/ABHIRAM-CREATOR06/Halonyx) repo | Messenger, protocol, backend, tests |

## Content guardrails

Use direct, technically grounded language. Avoid claims of formal verification, absolute anonymity, or guaranteed security. The project should describe what the implementation and documentation support, while directing visitors to the source, analysis, audit notes, and tests for further inspection.
