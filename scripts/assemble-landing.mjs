import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const landingDir = path.join(root, "frontend", "landing");
const outFile = path.join(root, "frontend", "index.html");

const site = JSON.parse(
  fs.readFileSync(path.join(landingDir, "site.json"), "utf8"),
);
const manifest = JSON.parse(
  fs.readFileSync(path.join(landingDir, "manifest.json"), "utf8"),
);

const vars = {
  VERSION: site.project.version,
  LICENSE: site.project.license,
  REPO_URL: site.project.repository,
  SOURCE_REPO: site.project.sourceRepository,
  APP_URL: site.project.appUrl,
  ATLAS_URL: site.project.atlasRepository,
  INSTITUTION_SHORT: site.institution.short,
  INSTITUTION_NAME: site.institution.name,
  INSTITUTION_AFFILIATION: site.institution.affiliation,
  YEAR: String(site.institution.year),
  TAGLINE: site.project.tagline,
};

function applyVars(html) {
  return html.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "");
}

const creditCards = site.team
  .map(
    (member) => `          <article class="credit-card">
            <div class="credit-id">${member.id}</div>
            <h3>${member.name}</h3>
            <p>${member.role}</p>
          </article>`,
  )
  .join("\n");

const creditNames = site.team.map((m) => m.name).join(" · ");

vars.CREDIT_CARDS = creditCards;
vars.CREDIT_NAMES = creditNames;

const parts = manifest.map((rel) => {
  const filePath = path.join(landingDir, rel);
  return applyVars(fs.readFileSync(filePath, "utf8"));
});

const html = `${parts.join("\n")}\n`;
fs.writeFileSync(outFile, html, "utf8");
console.log(`Wrote ${path.relative(root, outFile)} (${site.team.length} team credits)`);
