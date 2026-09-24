/**
 * check-commons-licence.mjs — find candidate photographs on Wikimedia Commons and check the
 * licence BEFORE a dossier recommends them, using the same accept rule as
 * scripts/fetch-commons-image.mjs so nothing is recommended that the fetcher would refuse.
 *
 *   node pipeline/enrichment/check-commons-licence.mjs search "human sperm micrograph" 10
 *   node pipeline/enrichment/check-commons-licence.mjs check "File:Icsi.JPG" "File:Kondom.jpg"
 *
 * Output, one row per file:
 *   OK | File:… | CC0 | 2048x1152 | author | description
 *   NO | File:… | Attribution | …            <- would be refused by the fetcher
 *
 * ACCEPTED: CC0, CC BY, CC BY-SA, Public domain.
 * REFUSED:  everything else. Two Commons tags look open and are not — a bare "Attribution"
 *           licence and "No restrictions" — and several otherwise perfect images carry them
 *           (the Tr icsi 0*.jpg IVF series, File:Antibabypille.jpg). The refusals are worth
 *           recording in the dossier so nobody re-finds them.
 *
 * RATE LIMITS. Commons returns HTTP 429 quickly. This client sleeps 500 ms between calls and
 * backs off on 429 or 5xx; an earlier version without that crashed halfway through a batch.
 * Send a real User-Agent: anonymous ones are throttled harder.
 *
 * Record in the dossier, for every file: the File: name, the licence exactly as returned, the
 * pixel size, and the question an examiner would ask about the photograph. A photograph
 * without a question is decoration, which the house rules forbid.
 */
const UA = "CairnStudyPlatform/1.0 (personal study tool; contact via repository)";
const ACCEPT = /^(CC0|CC BY(-SA)?( [0-9.]+)?|Public domain|PD)/i;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(params) {
  const u = new URL("https://commons.wikimedia.org/w/api.php");
  u.search = new URLSearchParams({ format: "json", formatversion: "2", ...params }).toString();
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const res = await fetch(u, { headers: { "User-Agent": UA } });
    if (res.ok) { await sleep(500); return res.json(); }
    if (res.status === 429 || res.status >= 500) { await sleep(2000 * (attempt + 1)); continue; }
    throw new Error(`Commons API ${res.status}`);
  }
  throw new Error("Commons API gave up after 6 attempts");
}

async function info(titles) {
  const rows = [];
  for (let i = 0; i < titles.length; i += 20) {
    const data = await api({
      action: "query",
      prop: "imageinfo",
      iiprop: "url|extmetadata|mime|size",
      titles: titles.slice(i, i + 20).join("|"),
    });
    for (const page of data.query?.pages ?? []) {
      const ii = page.imageinfo?.[0];
      if (!ii) { rows.push({ title: page.title, licence: "NOT FOUND", ok: false }); continue; }
      const meta = ii.extmetadata ?? {};
      const licence = (meta.LicenseShortName?.value ?? "").trim();
      const strip = (v) => (v ?? "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
      rows.push({
        title: page.title,
        licence,
        ok: ACCEPT.test(licence),
        size: `${ii.width}x${ii.height}`,
        mime: ii.mime,
        author: strip(meta.Artist?.value).slice(0, 70),
        desc: strip(meta.ImageDescription?.value).slice(0, 120),
        url: `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title)}`,
      });
    }
  }
  return rows;
}

const print = (r) =>
  console.log(`${r.ok ? "OK " : "NO "}| ${r.title} | ${r.licence} | ${r.size ?? ""} | ${r.author ?? ""} | ${r.desc ?? ""}`);

const [mode, ...rest] = process.argv.slice(2);

if (mode === "search") {
  const query = rest[0];
  const limit = Number(rest[1] ?? 12);
  if (!query) { console.error('usage: … search "<query>" [limit]'); process.exit(1); }
  const data = await api({
    action: "query",
    list: "search",
    srsearch: `${query} filetype:bitmap|drawing`,
    srnamespace: "6",
    srlimit: String(limit),
  });
  const titles = (data.query?.search ?? []).map((s) => s.title);
  if (!titles.length) { console.log("(no results)"); process.exit(0); }
  (await info(titles)).forEach(print);
} else if (mode === "check") {
  if (!rest.length) { console.error('usage: … check "File:Name.jpg" …'); process.exit(1); }
  (await info(rest)).forEach(print);
} else {
  console.error(
    'usage:\n  node pipeline/enrichment/check-commons-licence.mjs search "<query>" [limit]\n' +
      '  node pipeline/enrichment/check-commons-licence.mjs check "File:Name.jpg" ...',
  );
  process.exit(1);
}
