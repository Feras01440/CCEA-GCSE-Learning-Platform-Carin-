// Serves the static export (out/) on a port and restarts `serve` whenever it dies.
// Why: serve-handler opens a file for every "304 Not Modified" reply and never closes it (measured 25 Sep 2026:
// 50 conditional requests, 50 leaked handles), so under load `serve`
// crashes with EMFILE on Windows (seen 24 Sep 2026, 18:45) and every later request is refused. A
// supervisor turns a dead server into a two-second gap, and --no-etag stops the 304s (and the leak) at the source.
// Usage: node scripts/serve-export.mjs [port]
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";

const port = process.argv[2] || "3200";
const require = createRequire(import.meta.url);
const servePkg = require("serve/package.json");
const serveBin = path.join(path.dirname(require.resolve("serve/package.json")), typeof servePkg.bin === "string" ? servePkg.bin : servePkg.bin.serve);

let stopping = false;
let child = null;
let restarts = 0;

function start() {
  child = spawn(process.execPath, [serveBin, "out", "-l", port, "--no-etag"], { stdio: "inherit" });
  child.on("exit", (code, signal) => {
    if (stopping) return;
    restarts += 1;
    console.error(`[serve-export] serve exited (${code ?? signal}); restart ${restarts} in 2 s`);
    setTimeout(start, 2000);
  });
}

for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(sig, () => {
    stopping = true;
    if (child && child.exitCode === null) child.kill();
    process.exit(0);
  });
}
process.on("exit", () => { stopping = true; if (child && child.exitCode === null) child.kill(); });

start();
