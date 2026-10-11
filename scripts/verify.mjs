#!/usr/bin/env node
// The one-shot local loop (npm run verify): tsc → vitest → content check → build → the export server on :3200 →
// every Playwright spec file alone, one after another → a summary table. Everything printed also goes to
// scratchpad/state/verify/<ISO>.log, with a JSON copy of the summary beside it and, for each spec file that failed,
// its HTML report and traces under scratchpad/state/verify/<ISO>/<spec>/.
//
//   node scripts/verify.mjs                      the whole loop
//   node scripts/verify.mjs --no-build           everything but the build: the specs run against what :3200 serves
//   node scripts/verify.mjs --specs today,papers only these spec files (names as in e2e/, without .spec.ts)
//   node scripts/verify.mjs --skip-unit          no tsc and no vitest
//   --skip-content   no content check            --skip-specs   no export server and no specs
//   --lints          also figure-leaks and shingles (shingles needs the private corpus, so it runs only here)
//   --workers <n>    Playwright workers per spec file (default: the config's, half the cores)
//   --root <dir>     verify another checkout, e.g. the build worktree ../cairn-build (default: this repository)
//   --no-wait        do not wait for another content build or Playwright run on the machine to finish first
//
// Rules it keeps (docs/dev/README.md, "Verification"): never two Playwright files at once (and, unless --no-wait, it
// first waits, 20 minutes at most over the whole run, while another Playwright run or a content build of the same
// checkout is going on this machine: ten agents share it, and a spec under load times out without being wrong); it
// says "build exit N" and the out/index.html time; it starts the export server
// (scripts/serve-export.mjs, left running afterwards) only when nothing answers on :3200, and it says which build :3200
// serves, because a server started from another worktree serves another export.
import { spawn, spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = 3200;
const BASE = `http://localhost:${PORT}`;
const WAIT_MAX_MS = 20 * 60_000;

// ── arguments ───────────────────────────────────────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
const value = (name) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
};
if (flag("--help") || flag("-h")) {
  const head = fs.readFileSync(fileURLToPath(import.meta.url), "utf8").split("\n").slice(1, 21);
  console.log(head.map((l) => l.replace(/^\/\/ ?/, "")).join("\n"));
  process.exit(0);
}
const known = new Set(["--no-build", "--skip-unit", "--skip-content", "--skip-specs", "--lints", "--no-wait", "--specs", "--workers", "--root", "--help", "-h"]);
const unknown = argv.filter((a, i) => a.startsWith("-") && !known.has(a) && !["--specs", "--workers", "--root"].includes(argv[i - 1]));
if (unknown.length) {
  console.error(`verify: unknown option(s) ${unknown.join(" ")} (node scripts/verify.mjs --help)`);
  process.exit(2);
}
const opts = {
  build: !flag("--no-build"),
  unit: !flag("--skip-unit"),
  content: !flag("--skip-content"),
  specs: !flag("--skip-specs"),
  lints: flag("--lints"),
  wait: !flag("--no-wait"),
  only: (value("--specs") ?? "").split(",").map((s) => s.trim().replace(/\.spec\.ts$/, "").replace(/^e2e[\\/]/, "")).filter(Boolean),
  workers: value("--workers"),
  root: path.resolve(value("--root") ?? HERE),
};
if (opts.workers !== undefined && !/^\d+%?$/.test(opts.workers)) {
  console.error(`verify: --workers takes a number (or a percentage), not "${opts.workers}"`);
  process.exit(2);
}
const ROOT = opts.root;
if (!fs.existsSync(path.join(ROOT, "package.json")) || !fs.existsSync(path.join(ROOT, "playwright.config.ts"))) {
  console.error(`verify: ${ROOT} is not a checkout of this repository (no package.json and playwright.config.ts)`);
  process.exit(2);
}

// ── the log ─────────────────────────────────────────────────────────────────────────────────────────────────────────
const pad = (n, w = 2) => String(n).padStart(w, "0");
function isoBasic(d) {
  const off = -d.getTimezoneOffset();
  const sign = off >= 0 ? "+" : "-";
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}${sign}${pad(Math.floor(Math.abs(off) / 60))}${pad(Math.abs(off) % 60)}`;
}
function localTime(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
const started = new Date();
const STAMP = isoBasic(started);
const LOG_DIR = path.join(HERE, "scratchpad", "state", "verify");
const RUN_DIR = path.join(LOG_DIR, STAMP);
fs.mkdirSync(RUN_DIR, { recursive: true });
const LOG = path.join(LOG_DIR, `${STAMP}.log`);
const logFd = fs.openSync(LOG, "a");
const ANSI = /\u001b\[[0-9;?]*[A-Za-z]/g;
function log(text = "") {
  process.stdout.write(`${text}\n`);
  fs.writeSync(logFd, `${String(text).replace(ANSI, "")}\n`);
}
const rel = (p) => path.relative(process.cwd(), p) || ".";
const seconds = (ms) => (ms >= 60_000 ? `${Math.floor(ms / 60_000)}m ${String(Math.round((ms % 60_000) / 1000)).padStart(2, "0")}s` : `${(ms / 1000).toFixed(1)}s`);

// ── running a step ──────────────────────────────────────────────────────────────────────────────────────────────────
/** Runs a command line in ROOT through the shell, streaming to the console and the log; resolves { code, ms, out }. */
function run(command, { env = {}, timeoutMs = 60 * 60_000 } = {}) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    fs.writeSync(logFd, `$ ${command}\n`);
    const child = spawn(command, { cwd: ROOT, shell: true, env: { ...process.env, ...env }, windowsHide: true, detached: process.platform !== "win32" });
    let out = "";
    const take = (chunk) => {
      const s = chunk.toString();
      out += s;
      if (out.length > 4_000_000) out = out.slice(-2_000_000);
      process.stdout.write(s);
      fs.writeSync(logFd, s.replace(ANSI, ""));
    };
    child.stdout.on("data", take);
    child.stderr.on("data", take);
    const timer = setTimeout(() => {
      log(`\nverify: ${command} ran past ${seconds(timeoutMs)}; stopping it`);
      killTree(child.pid);
    }, timeoutMs);
    child.on("close", (code, signal) => {
      clearTimeout(timer);
      resolve({ code: code ?? (signal ? 1 : 0), ms: Date.now() - t0, out: out.replace(ANSI, "") });
    });
    child.on("error", (err) => {
      clearTimeout(timer);
      resolve({ code: 1, ms: Date.now() - t0, out: String(err) });
    });
  });
}
function killTree(pid) {
  if (!pid) return;
  if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(pid), "/T", "/F"], { windowsHide: true });
  else {
    try {
      process.kill(-pid, "SIGTERM");
    } catch {
      /* already gone */
    }
  }
}

// ── other processes on the machine ──────────────────────────────────────────────────────────────────────────────────
/** Every process with its parent and command line, or null when the listing failed (never read as "nothing runs"). */
function processes() {
  try {
    if (process.platform === "win32") {
      const r = spawnSync(
        "powershell.exe",
        ["-NoProfile", "-NonInteractive", "-Command", "Get-CimInstance Win32_Process | Select-Object ProcessId,ParentProcessId,CommandLine | ConvertTo-Json -Compress"],
        { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, windowsHide: true, timeout: 60_000 },
      );
      if (r.status !== 0 || !r.stdout?.trim()) return null;
      const rows = JSON.parse(r.stdout);
      return (Array.isArray(rows) ? rows : [rows]).map((p) => ({ pid: p.ProcessId, ppid: p.ParentProcessId, cmd: p.CommandLine ?? "" }));
    }
    const r = spawnSync("ps", ["-eo", "pid=,ppid=,args="], { encoding: "utf8", timeout: 60_000 });
    if (r.status !== 0 || !r.stdout?.trim()) return null;
    return r.stdout
      .split("\n")
      .map((l) => l.trim().match(/^(\d+)\s+(\d+)\s+(.*)$/))
      .filter(Boolean)
      .map((m) => ({ pid: Number(m[1]), ppid: Number(m[2]), cmd: m[3] }));
  } catch {
    return null;
  }
}
/** Processes other than this one, its children and its parents whose command line matches; null when unknown. */
function others(test) {
  const all = processes();
  if (!all) return null;
  const byPid = new Map(all.map((p) => [p.pid, p]));
  const mine = new Set([process.pid]);
  for (let grew = true; grew; ) {
    grew = false;
    for (const p of all)
      if (!mine.has(p.pid) && mine.has(p.ppid)) {
        mine.add(p.pid);
        grew = true;
      }
  }
  for (let p = byPid.get(process.pid); p && byPid.has(p.ppid) && !mine.has(p.ppid); p = byPid.get(p.ppid)) mine.add(p.ppid);
  return all.filter((p) => !mine.has(p.pid) && test(p.cmd));
}
function norm(s) {
  let t = String(s);
  try {
    t = decodeURIComponent(t.replace(/%(?![0-9a-f]{2})/gi, "%25"));
  } catch {
    /* not URI-encoded text: compare it as it is */
  }
  return t.replace(/\\/g, "/").toLowerCase();
}
const ROOT_NORM = norm(ROOT);
/** A content build writing this checkout's public/content (two at once collide on the same files: EBUSY). */
const isContentBuild = (cmd) => /build-content\.mts/.test(cmd) && norm(cmd).includes(ROOT_NORM);
/** A Playwright test run anywhere on the machine (it loads the machine, and it may use :3200 too). */
const isPlaywrightRun = (cmd) => /(@playwright[\\/]test[\\/]cli\.js|[\\/\s"]playwright(\.cmd)?)["']?\s+test(\s|$)/i.test(cmd);
/** Waiting is budgeted over the whole run (WAIT_MAX_MS), so a long run elsewhere delays verify once, not per spec. */
let waitBudgetMs = WAIT_MAX_MS;
async function waitForQuiet(what, test) {
  if (!opts.wait) return null;
  const t0 = Date.now();
  let said = 0;
  let waited = false;
  let quiet = 0;
  let unknown = 0;
  for (;;) {
    const busy = others(test);
    if (busy === null) {
      // The listing failed (PowerShell is slow under load): try twice more before going ahead blind.
      if (++unknown >= 3) return `could not list the machine's processes, so did not wait for ${what}`;
      await new Promise((r) => setTimeout(r, 5000));
      continue;
    }
    if (!busy.length) {
      if (!waited) return null;
      // Quiet twice in a row, a few seconds apart, before going: one listing can miss a run between two of its steps.
      if (++quiet < 2) {
        await new Promise((r) => setTimeout(r, 5000));
        continue;
      }
      waitBudgetMs = Math.max(0, waitBudgetMs - (Date.now() - t0));
      return `waited ${seconds(Date.now() - t0)} for ${what}`;
    }
    quiet = 0;
    waited = true;
    if (Date.now() - t0 >= waitBudgetMs) {
      waitBudgetMs = 0;
      return `ran alongside ${what} (pid ${busy.map((p) => p.pid).join(", ")}): the ${seconds(WAIT_MAX_MS)} of waiting this run allows were spent; rerun a failure alone`;
    }
    if (Date.now() - said > 60_000) {
      said = Date.now();
      const show = busy.map((p) => `pid ${p.pid}: …${(p.cmd.replace(/\s+/g, " ").match(/(playwright|build-content).{0,70}/i)?.[0] ?? p.cmd.slice(-70)).trim()}`).join("; ");
      log(`verify: waiting for ${what} to finish (${show})`);
    }
    await new Promise((r) => setTimeout(r, 15_000));
  }
}

// ── the export and the server ───────────────────────────────────────────────────────────────────────────────────────
const OUT = path.join(ROOT, "out");
function outState() {
  const index = path.join(OUT, "index.html");
  const sw = path.join(OUT, "sw.js");
  const mtime = fs.existsSync(index) ? fs.statSync(index).mtime : null;
  const swText = fs.existsSync(sw) ? fs.readFileSync(sw, "utf8") : null;
  return { mtime, version: swText?.match(/const VERSION = "([^"]+)"/)?.[1] ?? null, hash: swText ? crypto.createHash("sha256").update(swText).digest("hex") : null };
}
async function get(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000), redirect: "manual" });
    return { status: res.status, text: res.ok ? await res.text() : "" };
  } catch {
    return { status: 0, text: "" };
  }
}
async function served() {
  const home = await get(`${BASE}/`);
  if (home.status === 0) return { up: false };
  const sw = await get(`${BASE}/sw.js`);
  return {
    up: true,
    status: home.status,
    version: sw.text.match(/const VERSION = "([^"]+)"/)?.[1] ?? null,
    hash: sw.text ? crypto.createHash("sha256").update(sw.text).digest("hex") : null,
  };
}
async function startServer() {
  const serveLog = path.join(LOG_DIR, `serve-${PORT}.log`);
  const fd = fs.openSync(serveLog, "a");
  fs.writeSync(fd, `\n--- started by verify ${localTime(new Date())} for ${OUT}\n`);
  const child = spawn(process.execPath, [path.join(ROOT, "scripts", "serve-export.mjs"), String(PORT), OUT], { cwd: ROOT, detached: true, stdio: ["ignore", fd, fd], windowsHide: true });
  let exited = null;
  child.on("exit", (code) => (exited = code ?? 1));
  child.unref();
  for (let i = 0; i < 60; i += 1) {
    await new Promise((r) => setTimeout(r, 1000));
    if (exited !== null) break;
    if ((await served()).up) return { ok: true, pid: child.pid, log: serveLog };
  }
  const tail = fs.readFileSync(serveLog, "utf8").trim().split("\n").slice(-3).join(" | ");
  return { ok: false, pid: child.pid, log: serveLog, why: exited !== null ? `the supervisor exited (${exited}): ${tail}` : `nothing answered within 60 s: ${tail}` };
}

// ── summary helpers ─────────────────────────────────────────────────────────────────────────────────────────────────
const rows = [];
function record(step, status, ms, detail) {
  rows.push({ step, status, ms, detail });
  log(`verify: ${step}: ${status}${detail ? ` (${detail})` : ""}${ms ? `, ${seconds(ms)}` : ""}`);
}
const lastLine = (out, re) => out.split("\n").map((l) => l.trim()).filter((l) => re.test(l)).pop() ?? "";
function heading(text) {
  log("");
  log(`== ${text} ${"=".repeat(Math.max(3, 100 - text.length))}`);
}

// ── the loop ────────────────────────────────────────────────────────────────────────────────────────────────────────
const git = (args) => spawnSync("git", ["-C", ROOT, ...args], { encoding: "utf8" }).stdout?.trim() ?? "";
const before = outState();
log(`verify ${STAMP} · ${ROOT}`);
log(`node ${process.version} · ${git(["log", "-1", "--format=%h %s"]).slice(0, 110)} · ${git(["status", "--porcelain"]).split("\n").filter(Boolean).length} uncommitted path(s)`);
log(`out/index.html ${before.mtime ? localTime(before.mtime) : "missing"} · out/sw.js ${before.version ?? "missing"}`);
log(`log ${rel(LOG)}`);

const generated = ["manifest.json", "decks-manifest.json"].map((f) => path.join(ROOT, "src", "generated", f));
if ((opts.unit || opts.specs) && generated.some((f) => !fs.existsSync(f))) {
  heading("prepare: src/generated is missing (a fresh checkout); tsc, vitest and two specs import it");
  const a = await run("npx tsx pipeline/build-content.mts");
  const b = a.code === 0 ? await run("npx tsx pipeline/build-decks.mts") : a;
  record("prepare src/generated", b.code === 0 ? "ok" : "FAILED", a.ms + (b === a ? 0 : b.ms), b.code === 0 ? "content and decks built" : `exit ${b.code}`);
}

if (opts.unit) {
  heading("tsc --noEmit -p .");
  const r = await run("npx tsc --noEmit -p .");
  const errors = (r.out.match(/error TS\d+/g) ?? []).length;
  record("tsc", r.code === 0 ? "ok" : "FAILED", r.ms, r.code === 0 ? "no type errors" : `exit ${r.code}, ${errors} error(s)`);

  // 30 s a test instead of vitest's 5 s: the surveys over every published lesson ran 6 to 14 s under this machine's
  // load (11 Oct 2026) and timed out without being wrong; a hang still fails.
  heading("vitest run --testTimeout=30000");
  const v = await run("npx vitest run --testTimeout=30000");
  const files = lastLine(v.out, /^Test Files\s/).replace(/\s+/g, " ");
  const tests = lastLine(v.out, /^Tests\s/).replace(/\s+/g, " ");
  record("vitest", v.code === 0 ? "ok" : "FAILED", v.ms, [files, tests].filter(Boolean).join("; ") || `exit ${v.code}`);
} else {
  record("tsc", "skipped", 0, "--skip-unit");
  record("vitest", "skipped", 0, "--skip-unit");
}

if (opts.content) {
  heading("content check (npm run content:check: build-content --strict, then lesson-v2)");
  const waited = await waitForQuiet("another content build of this checkout", isContentBuild);
  let r = await run("npm run content:check");
  if (r.code !== 0 && /EBUSY/.test(r.out)) {
    log("verify: EBUSY (another process holds a file in public/content); trying once more in 60 s");
    await new Promise((res) => setTimeout(res, 60_000));
    r = await run("npm run content:check");
  }
  const published = lastLine(r.out, /topic bundle\(s\) published/).slice(0, 90);
  const lesson = lastLine(r.out, /^lesson-v2: /);
  record("content check", r.code === 0 ? "ok" : "FAILED", r.ms, [published, lesson, waited].filter(Boolean).join("; ") || `exit ${r.code}`);
} else record("content check", "skipped", 0, "--skip-content");

if (opts.lints) {
  heading("figure-leaks");
  const f = await run("node scripts/qa/figure-leaks.mjs --quiet");
  record("figure-leaks", f.code === 0 ? "ok" : "FAILED", f.ms, lastLine(f.out, /^figure-leaks: /) || `exit ${f.code}`);
  heading("shingles (the private corpus, this machine only)");
  const s = await run("node scripts/qa/shingles.mjs");
  // Its verdict is the last "N breach(es) across M unit(s):" line with the unit lines under it, or the no-corpus line.
  const lines = s.out.split("\n");
  const at = lines.map((l) => /breach\(es\) across|No breach\.|no corpus/i.test(l)).lastIndexOf(true);
  const verdict = at < 0 ? `exit ${s.code}` : [lines[at], ...lines.slice(at + 1, at + 6).filter((l) => /^\s+\S/.test(l))].map((l) => l.trim()).join(" ");
  record("shingles", s.code === 0 ? "ok" : "FAILED", s.ms, verdict.slice(0, 200));
}

let buildExit = null;
if (opts.build) {
  heading("npm run build");
  const r = await run("npm run build");
  buildExit = r.code;
  const after = outState();
  log(`build exit ${r.code}`);
  log(`out/index.html ${after.mtime ? localTime(after.mtime) : "missing"} · out/sw.js ${after.version ?? "missing"}`);
  const fresh = after.mtime && (!before.mtime || after.mtime > before.mtime);
  record("build", r.code === 0 && fresh ? "ok" : "FAILED", r.ms, `build exit ${r.code}; out/index.html ${after.mtime ? localTime(after.mtime) : "missing"}${r.code === 0 && !fresh ? " (not rewritten by this build)" : ""}`);
} else {
  log(`build skipped (--no-build) · out/index.html ${before.mtime ? localTime(before.mtime) : "missing"}`);
  record("build", "skipped", 0, `--no-build; out/index.html ${before.mtime ? localTime(before.mtime) : "missing"}`);
}

const specRows = [];
if (opts.specs) {
  heading(`export server on :${PORT}`);
  const local = outState();
  let srv = await served();
  let serverOk = true;
  let serverNote = "";
  if (!srv.up) {
    if (!local.mtime) {
      serverOk = false;
      serverNote = `nothing answers on :${PORT} and ${rel(OUT)} has no export to serve (build first)`;
    } else {
      const s = await startServer();
      if (s.ok) {
        srv = await served();
        serverNote = `started scripts/serve-export.mjs for ${rel(OUT)} (pid ${s.pid}; left running; log ${rel(s.log)})`;
      } else {
        serverOk = false;
        serverNote = `could not start the export server: ${s.why}`;
      }
    }
  }
  const same = srv.up && local.hash && srv.hash === local.hash;
  if (srv.up && !same) {
    const what = `:${PORT} serves ${srv.version ?? "an export without a service worker"}, but ${rel(OUT)} is ${local.version ?? "missing"}`;
    if (buildExit !== null) {
      serverOk = false;
      serverNote = `${what}: the build just made is not the one served (another worktree's server?), so the specs would test the wrong export. Stop that server or verify that worktree (--root).`;
    } else serverNote = `${what}; with --no-build the specs run against what :${PORT} serves (${srv.version ?? "?"})`;
  } else if (srv.up && !serverNote) serverNote = `serves ${srv.version} = ${rel(OUT)}`;
  record("export server", serverOk ? (same ? "ok" : "WARNING") : "FAILED", 0, serverNote);

  const specDir = path.join(ROOT, "e2e");
  const all = fs.readdirSync(specDir).filter((f) => f.endsWith(".spec.ts")).sort();
  const wanted = opts.only.length ? all.filter((f) => opts.only.includes(f.replace(/\.spec\.ts$/, ""))) : all;
  const missing = opts.only.filter((n) => !all.includes(`${n}.spec.ts`));
  if (missing.length) record("specs", "FAILED", 0, `no such spec file: ${missing.join(", ")} (have: ${all.map((f) => f.replace(/\.spec\.ts$/, "")).join(", ")})`);

  for (const file of serverOk ? wanted : []) {
    const name = file.replace(/\.spec\.ts$/, "");
    heading(`e2e/${file}`);
    const waited = await waitForQuiet("another Playwright run", isPlaywrightRun);
    if (waited) log(`verify: ${waited}`);
    const dir = path.join(RUN_DIR, name);
    fs.mkdirSync(dir, { recursive: true });
    const results = path.join(dir, "results.json");
    const report = path.join(dir, "report");
    const workers = opts.workers ? ` --workers=${opts.workers}` : "";
    const r = await run(`npx playwright test "e2e/${file}" --reporter=list,json,html --output "${path.join(dir, "test-results")}"${workers}`, {
      env: { PLAYWRIGHT_JSON_OUTPUT_FILE: results, PLAYWRIGHT_HTML_OUTPUT_DIR: report, PLAYWRIGHT_HTML_OPEN: "never" },
    });
    let stats = null;
    try {
      stats = JSON.parse(fs.readFileSync(results, "utf8")).stats;
    } catch {
      /* no report: the run failed before it started */
    }
    if (r.code === 0) for (const d of [report, path.join(dir, "test-results")]) fs.rmSync(d, { recursive: true, force: true });
    specRows.push({
      spec: name,
      exit: r.code,
      passed: stats?.expected ?? null,
      failed: stats?.unexpected ?? null,
      flaky: stats?.flaky ?? null,
      skipped: stats?.skipped ?? null,
      ms: stats?.duration ?? r.ms,
      report: r.code === 0 ? null : rel(report),
      note: waited,
    });
  }
  if (!serverOk) record("specs", "SKIPPED", 0, "not run: the export server step failed (above)");
} else record("specs", "skipped", 0, "--skip-specs");

// ── summary ─────────────────────────────────────────────────────────────────────────────────────────────────────────
heading("summary");
const w = Math.max(...rows.map((r) => r.step.length), 14);
for (const r of rows) log(`${r.step.padEnd(w)}  ${r.status.padEnd(8)} ${(r.ms ? seconds(r.ms) : "").padStart(8)}  ${r.detail ?? ""}`);
if (specRows.length) {
  log("");
  log(`${"spec".padEnd(22)} exit  passed failed  flaky skipped      time`);
  for (const s of specRows) {
    const n = (v) => String(v ?? "?").padStart(6);
    const alongside = s.note?.startsWith("ran alongside") ? "  (ran alongside another Playwright run)" : "";
    log(`${s.spec.padEnd(22)} ${String(s.exit).padStart(4)}  ${n(s.passed)} ${n(s.failed)} ${n(s.flaky)} ${n(s.skipped).padStart(7)} ${seconds(s.ms).padStart(9)}${alongside}${s.report ? `  report: npx playwright show-report "${s.report}"` : ""}`);
  }
  const red = specRows.filter((s) => s.exit !== 0);
  log(`${specRows.length - red.length} of ${specRows.length} spec file(s) green${red.length ? `; red: ${red.map((s) => s.spec).join(", ")} (rerun one alone before calling it a regression)` : ""}`);
}
const after = outState();
log("");
log(buildExit === null ? "build exit: not run (--no-build)" : `build exit ${buildExit}`);
log(`out/index.html ${after.mtime ? localTime(after.mtime) : "missing"} · out/sw.js ${after.version ?? "missing"}`);
const failed = rows.some((r) => r.status === "FAILED" || r.status === "SKIPPED") || specRows.some((s) => s.exit !== 0);
const finished = new Date();
log(`verify ${failed ? "RED" : "GREEN"} · ${localTime(started)} → ${localTime(finished)} (${seconds(finished - started)}) · log ${rel(LOG)}`);
fs.writeFileSync(
  path.join(LOG_DIR, `${STAMP}.json`),
  `${JSON.stringify({ stamp: STAMP, root: ROOT, options: opts, started: started.toISOString(), finished: finished.toISOString(), green: !failed, buildExit, out: { indexHtml: after.mtime?.toISOString() ?? null, sw: after.version }, steps: rows, specs: specRows }, null, 2)}\n`,
);
fs.closeSync(logFd);
process.exit(failed ? 1 : 0);
