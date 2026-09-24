import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const ROOT = process.argv[2] || "out";
const PORT = Number(process.argv[3] || 3211);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
};

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url);
  let p = decodeURIComponent(parsed.pathname);
  if (p.endsWith("/")) p += "index.html";
  let file = path.join(ROOT, p);
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    const alt = path.join(ROOT, p + ".html");
    const alt2 = path.join(ROOT, p, "index.html");
    if (fs.existsSync(alt)) file = alt;
    else if (fs.existsSync(alt2)) file = alt2;
    else {
      res.writeHead(404, { "content-type": "text/plain" });
      res.end("404 " + p);
      return;
    }
  }
  const ext = path.extname(file).toLowerCase();
  res.writeHead(200, { "content-type": TYPES[ext] || "application/octet-stream", "cache-control": "no-store" });
  fs.createReadStream(file).pipe(res);
});

server.listen(PORT, () => console.log("serving " + ROOT + " on http://localhost:" + PORT));
