// Serves the static export on a port and restarts `serve` whenever it dies.
// Why: serve-handler opens a file for every "304 Not Modified" reply and never closes it (measured 25 Sep 2026:
// 50 conditional requests, 50 leaked handles), so under load `serve`
// crashes with EMFILE on Windows (seen 24 Sep 2026, 18:45) and every later request is refused. A
// supervisor turns a dead server into a two-second gap, and --no-etag stops the 304s (and the leak) at the source.
// The port (11 Oct 2026): when its port is taken, serve 14.2.6 quietly listens on a random port instead (it ignores
// --no-port-switching), which would leave a second copy looking as if it served :3200. So the supervisor checks the
// port before every start and stops with the reason when something already answers there; three exits within five
// seconds of starting also stop it instead of restarting forever.
// Usage: node scripts/serve-export.mjs [port] [dir]   (dir defaults to out/ in the current folder; a build worktree
// serves its own export: node scripts/serve-export.mjs 3200 ../cairn-build/out)
import { spawn } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import net from "node:net";
import path from "node:path";

const port = process.argv[2] || "3200";
const dir = path.resolve(process.argv[3] || "out");
const require = createRequire(import.meta.url);
const servePkg = require("serve/package.json");
const serveBin = path.join(path.dirname(require.resolve("serve/package.json")), typeof servePkg.bin === "string" ? servePkg.bin : servePkg.bin.serve);

if (!fs.existsSync(path.join(dir, "index.html"))) {
  console.error(`[serve-export] ${path.join(dir, "index.html")} is missing: build the export first (npm run build)`);
  process.exit(1);
}

const FAST_EXIT_MS = 5000;
const FAST_EXITS_MAX = 3;

let stopping = false;
let child = null;
let restarts = 0;
let fastExits = 0;

/** Whether anything accepts a connection on the port, over IPv4 or IPv6 loopback. */
function portAnswers(p) {
  const probe = (host) =>
    new Promise((resolve) => {
      const socket = net.connect({ port: Number(p), host });
      const done = (answered) => {
        socket.destroy();
        resolve(answered);
      };
      socket.setTimeout(1000);
      socket.once("connect", () => done(true));
      socket.once("timeout", () => done(false));
      socket.once("error", () => done(false));
    });
  return Promise.all([probe("127.0.0.1"), probe("::1")]).then(([v4, v6]) => v4 || v6);
}

async function start() {
  if (await portAnswers(port)) {
    console.error(`[serve-export] something already answers on :${port} (another export server?); not starting a second one`);
    process.exit(1);
  }
  const startedAt = Date.now();
  child = spawn(process.execPath, [serveBin, dir, "-l", port, "--no-etag", "--no-port-switching", "--no-clipboard"], { stdio: "inherit" });
  child.on("exit", (code, signal) => {
    if (stopping) return;
    fastExits = Date.now() - startedAt < FAST_EXIT_MS ? fastExits + 1 : 0;
    if (fastExits >= FAST_EXITS_MAX) {
      console.error(`[serve-export] serve exited ${fastExits} times within ${FAST_EXIT_MS / 1000} s of starting (last: ${code ?? signal}); stopping.`);
      process.exit(1);
    }
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

console.log(`[serve-export] serving ${dir} on :${port}`);
start();
