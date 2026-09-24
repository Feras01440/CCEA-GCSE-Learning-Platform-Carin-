/**
 * Download a Wikimedia Commons image with its attribution, for lesson photographs.
 *
 *   node scripts/fetch-commons-image.mjs "File:Flame_test_potassium.jpg" science/c1/flame-test-potassium [--width 1200]
 *
 * Writes public/img/<dest>.<ext> and appends a record to data/links/image-credits.json
 * { src, title, author, licence, licenceUrl, sourceUrl, fetchedAt }. Only CC0 / CC BY / CC BY-SA / public-domain files
 * are accepted; anything else is refused so nothing unlicensed reaches the app.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [, , fileTitle, dest, ...rest] = process.argv;
if (!fileTitle || !dest) {
  console.error('usage: node scripts/fetch-commons-image.mjs "File:Name.jpg" <subject>/<unit>/<slug> [--width 1200]');
  process.exit(1);
}
const width = rest.includes("--width") ? Number(rest[rest.indexOf("--width") + 1]) : 1200;
const UA = "CairnStudyPlatform/1.0 (personal study tool; contact via repository)";

const api = new URL("https://commons.wikimedia.org/w/api.php");
api.search = new URLSearchParams({
  action: "query",
  format: "json",
  prop: "imageinfo",
  iiprop: "url|extmetadata|mime",
  iiurlwidth: String(width),
  titles: fileTitle.startsWith("File:") ? fileTitle : `File:${fileTitle}`,
}).toString();

const res = await fetch(api, { headers: { "User-Agent": UA } });
if (!res.ok) throw new Error(`Commons API ${res.status}`);
const data = await res.json();
const page = Object.values(data.query.pages)[0];
if (!page?.imageinfo?.[0]) throw new Error("file not found on Commons");
const info = page.imageinfo[0];
const meta = info.extmetadata ?? {};
const licenceShort = (meta.LicenseShortName?.value ?? "").trim();
const licenceUrl = meta.LicenseUrl?.value ?? "";
const ok = /^(CC0|CC BY(-SA)?( [0-9.]+)?|Public domain)/i.test(licenceShort);
if (!ok) {
  console.error(`Refused: licence "${licenceShort}" is not CC0 / CC BY / CC BY-SA / public domain`);
  process.exit(2);
}
const author = (meta.Artist?.value ?? "Unknown author").replace(/<[^>]+>/g, "").trim();
const ext = (info.mime === "image/png" ? "png" : info.mime === "image/svg+xml" ? "svg" : "jpg");
const url = info.thumburl ?? info.url;
const bin = Buffer.from(await (await fetch(url, { headers: { "User-Agent": UA } })).arrayBuffer());
const out = path.join(ROOT, "public", "img", `${dest}.${ext}`);
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, bin);

const creditsPath = path.join(ROOT, "data", "links", "image-credits.json");
fs.mkdirSync(path.dirname(creditsPath), { recursive: true });
const credits = fs.existsSync(creditsPath) ? JSON.parse(fs.readFileSync(creditsPath, "utf8")) : {};
const src = `/img/${dest}.${ext}`;
credits[src] = {
  src,
  title: page.title,
  author,
  licence: licenceShort,
  licenceUrl,
  sourceUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title)}`,
  credit: `${author}, Wikimedia Commons, ${licenceShort}`,
  fetchedAt: new Date().toISOString().slice(0, 10),
  bytes: bin.length,
};
fs.writeFileSync(creditsPath, JSON.stringify(credits, null, 2));
console.log(JSON.stringify(credits[src], null, 2));
