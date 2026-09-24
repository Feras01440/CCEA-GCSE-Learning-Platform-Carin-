/**
 * fetch-specs.mjs — download the comparison exam-board specifications and extract their text.
 *
 *   node pipeline/enrichment/fetch-specs.mjs              # fetch anything missing, then extract
 *   node pipeline/enrichment/fetch-specs.mjs --force      # re-download everything
 *   node pipeline/enrichment/fetch-specs.mjs --only aqa-8464-combined
 *   node pipeline/enrichment/fetch-specs.mjs --list       # print the register and exit
 *
 * Writes docs/sources/cross-board/<id>.pdf and <id>.txt. Nothing is written anywhere else.
 *
 * ---------------------------------------------------------------------------
 * COPYRIGHT. These PDFs belong to AQA and Pearson. They are downloaded here for
 * the same reason the CCEA corpus under docs/sources/ exists: to READ, so that a
 * CCEA statement can be matched to the other boards' reference codes.
 *   - Never copy statement text into a dossier, a note or a question. A reference
 *     code ("AQA 4.5.3.3", "Edexcel CB7.4") is an address, not content, and is the
 *     only thing that should travel out of this directory.
 *   - Never redistribute or re-host the PDFs or the extracted .txt.
 *   - docs/sources/cross-board/ is gitignored for this reason, like docs/sources/papers/.
 * See docs/research/11-cross-board-enrichment.md section 4 for the full rule.
 * ---------------------------------------------------------------------------
 *
 * TWO TRAPS, both of which cost an hour the first time and both of which fail SILENTLY
 * by returning a small HTML error page with HTTP 200:
 *
 *   1. AQA's filestore path is PER SUBJECT, not per suite. The Physics specification is at
 *      resources/physics/specifications/AQA-8463-SP-2016.PDF, NOT resources/science/...
 *      The science path returns an HTML error document of about 123 KB. Every AQA subject
 *      folder is named after the subject: biology, chemistry, physics, science, mathematics.
 *
 *   2. Pearson's own link for the Combined Science specification
 *      (qualifications.pearson.com/.../GCSE_CombinedScience_Spec.pdf) served a 152 KB stub
 *      in September 2026, not the 3 MB document. The Science Clinic mirror served the full
 *      file. Whenever a Pearson URL is short, try the mirror recorded below.
 *
 * So this script checks, for every download: the magic bytes are %PDF, and the size is at
 * least `minBytes`. A file that fails either check is deleted and reported, never extracted.
 *
 * Extraction uses `pdftotext -layout` (poppler; present at /mingw64/bin/pdftotext in this
 * environment). -layout is not optional: the AQA specifications are laid out as a two-column
 * table ("Content" | "Key opportunities for skills development") and without -layout the two
 * columns interleave line by line and the text becomes unreadable. If poppler is missing,
 * scripts/extract-spec-pdf.mjs (pdfjs-dist) is the in-repo fallback, but it emits JSON with
 * font runs rather than laid-out text, so the indexers in this directory would need changing.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const DEST = path.join(ROOT, "docs", "sources", "cross-board");
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36";

/** The register. `minBytes` is the stub-detector: every real file here is over 700 KB. */
export const SPECS = [
  {
    id: "aqa-8464-combined",
    title: "AQA GCSE Combined Science: Trilogy 8464",
    url: "https://filestore.aqa.org.uk/resources/science/specifications/AQA-8464-SP-2016.PDF",
    minBytes: 2_000_000,
    refStyle: "decimal sections; Biology 4.x, Chemistry 5.x, Physics 6.x, up to four levels deep",
  },
  {
    id: "aqa-8461-biology",
    title: "AQA GCSE Biology 8461",
    url: "https://filestore.aqa.org.uk/resources/biology/specifications/AQA-8461-SP-2016.PDF",
    minBytes: 700_000,
    refStyle: "decimal sections 4.x; content absent from Trilogy is marked '(biology only)'",
  },
  {
    id: "aqa-8462-chemistry",
    title: "AQA GCSE Chemistry 8462",
    url: "https://filestore.aqa.org.uk/resources/chemistry/specifications/AQA-8462-SP-2016.PDF",
    minBytes: 2_000_000,
    refStyle: "decimal sections 4.x; '(chemistry only)' marks content absent from Trilogy",
  },
  {
    id: "aqa-8463-physics",
    // TRAP 1: resources/physics/, not resources/science/.
    url: "https://filestore.aqa.org.uk/resources/physics/specifications/AQA-8463-SP-2016.PDF",
    title: "AQA GCSE Physics 8463",
    minBytes: 1_500_000,
    refStyle: "decimal sections 4.x; '(physics only)' marks content absent from Trilogy",
  },
  {
    id: "aqa-8300",
    title: "AQA GCSE Mathematics 8300",
    url: "https://filestore.aqa.org.uk/resources/mathematics/specifications/AQA-8300-SP-2015.PDF",
    minBytes: 500_000,
    refStyle:
      "DfE subject-content reference codes N1-N16, A1-A25, R1-R16, G1-G25, P1-P9, S1-S6, grouped under sections 3.1-3.6, with three tier columns (Basic foundation / Additional foundation / Higher content only)",
  },
  {
    id: "edexcel-1sc0",
    title: "Pearson Edexcel GCSE (9-1) Combined Science 1SC0",
    // TRAP 2: Pearson's own .../GCSE_CombinedScience_Spec.pdf served a 152 KB stub.
    url: "https://www.scienceclinic.co.uk/uploads/all_subject/pdf/Edexcel-GCSE-Combined-Science-9-1-Specification.pdf",
    fallbackUrls: [
      "https://qualifications.pearson.com/content/dam/pdf/GCSE/Science/2016/Specification/gcse-combinedscience-spec.pdf",
    ],
    minBytes: 2_000_000,
    refStyle:
      "Topic number + statement number per science; prefix CB biology, CC chemistry, CP physics (so CB7.4 = biology topic 7, statement 4)",
  },
  {
    id: "edexcel-1ma1",
    title: "Pearson Edexcel GCSE (9-1) Mathematics 1MA1",
    url: "https://qualifications.pearson.com/content/dam/pdf/GCSE/mathematics/2015/specification-and-sample-assesment/gcse-maths-2015-specification.pdf",
    minBytes: 700_000,
    refStyle:
      "the same DfE codes as AQA 8300, printed twice: a Foundation list (pp.3-9) and a Higher list (pp.10-18), with bold marking the highest-attainment content",
  },
  // --- Further Mathematics comparison qualifications ---
  {
    id: "aqa-8365-further-maths",
    title: "AQA Level 2 Certificate in Further Mathematics 8365",
    url: "https://filestore.aqa.org.uk/resources/mathematics/specifications/AQA-8365-SP-2018.PDF",
    minBytes: 300_000,
    refStyle:
      "six content sections (1 Number, 2 Algebra, 3 Coordinate Geometry, 4 Calculus, 5 Matrix Transformations, 6 Geometry) with statements numbered within each, e.g. 2.12, 4.3. Carries no logarithms, no integration and no statistics",
  },
  {
    id: "ocr-6993",
    title: "OCR Level 3 FSMQ Additional Mathematics 6993",
    // The PDF path is not guessable; it is in the HTML of the qualification page
    // (ocr.org.uk/qualifications/fsmq/additional-mathematics/) as /Images/<id>-specification-from-2018-.pdf.
    // ocr.org.uk also 404s several plausible paths, so always take the path from that page.
    url: "https://www.ocr.org.uk/Images/457916-specification-from-2018-.pdf",
    referer: "https://www.ocr.org.uk/qualifications/fsmq/additional-mathematics/",
    minBytes: 5_000_000,
    refStyle:
      "seven sections: Algebra, Enumeration, Coordinate Geometry, Pythagoras and Trigonometry, Calculus, Numerical Methods, Exponentials and Logarithms. NOTE: the content tables in section 2c are IMAGES; neither pdftotext nor scripts/extract-spec-pdf.mjs (pdfjs) can linearise them, so statement-level codes cannot be read and the crosswalk references this specification by section name at medium confidence",
  },
  {
    id: "edexcel-4pm1",
    title: "Pearson Edexcel International GCSE (9-1) Further Pure Mathematics 4PM1",
    url: "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Further%20Pure%20Mathematics/2016/Specification%20and%20sample%20assessments/international-gcse-in-further-pure-mathematics-spec.pdf",
    minBytes: 700_000,
    refStyle:
      "ten sections numbered 1-10, each with lettered content points, referenced as section+letter, e.g. 1B, 9D. States in terms that 'knowledge of statistics and matrices will not be required'",
  },
  {
    id: "aqa-8382-statistics",
    title: "AQA GCSE Statistics 8382",
    url: "https://filestore.aqa.org.uk/resources/mathematics/specifications/AQA-8382-SP-2017.PDF",
    minBytes: 500_000,
    refStyle:
      "section 3.5.x with a letter-number content code, referenced by the code, e.g. E10b (binomial), E11a/E11b (Normal), E11d (standardising). Three tier columns as in 8300. This is the closest LEVEL 2 comparison for CCEA Further Mathematics FM3, which no further-maths qualification covers - but note it stops at interpretation: 8382 states that 'other than the results in E11b, no calculations for values or normal probabilities are expected'",
  },
  {
    id: "dfe-alevel-maths",
    title: "DfE GCE AS and A level subject content for mathematics",
    url: "https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/516949/GCE_AS_and_A_level_subject_content_for_mathematics_with_appendices.pdf",
    minBytes: 700_000,
    refStyle:
      "lettered sections A-S. The mechanics sections are P Quantities and units in mechanics, Q Kinematics, R Forces and Newton's laws, S Moments. (Section H is Integration, not mechanics — a common misquotation.) Used as the reference for CCEA FM2, which no Level 2 qualification carries",
  },
];

/** Qualifications we tried and could not obtain, recorded so nobody repeats the search. */
export const UNOBTAINED = [
  {
    id: "ocr-j250",
    title: "OCR Gateway Combined Science A J250",
    tried: [
      "https://www.ocr.org.uk/Images/234598-specification-gcse-gateway-science-suite-combined-science-a.pdf",
      "https://www.ocr.org.uk/images/234596-specification-accredited-gcse-gateway-science-suite-combined-science-a-j250.pdf",
      "https://pastpapers.co/ocr/gcse/combined-science-a-j250/specifications/234596-specification-accredited-gcse-gateway-science-suite-combined-science-a-j250.pdf",
    ],
    result: "all returned HTML error pages of 30-50 KB (September 2026)",
    consequence: "no OCR column is recorded in data/enrichment/crosswalk.json; do not guess one",
  },
  {
    id: "edexcel-1bi0-1ch0-1ph0",
    title: "Pearson Edexcel separate GCSE sciences",
    tried: ["several qualifications.pearson.com dam/pdf paths"],
    result: "152 KB stubs, the same failure as trap 2",
    consequence:
      "rows that mention Edexcel separate sciences are flagged as unverified in the crosswalk's note field",
  },
];

const args = process.argv.slice(2);
const force = args.includes("--force");
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;

if (args.includes("--list")) {
  for (const s of SPECS) console.log(`${s.id.padEnd(24)} ${s.title}\n${" ".repeat(25)}${s.refStyle}`);
  console.log("\nNot obtainable:");
  for (const u of UNOBTAINED) console.log(`  ${u.id.padEnd(22)} ${u.result}`);
  process.exit(0);
}

function looksLikePdf(file, minBytes) {
  const size = fs.statSync(file).size;
  const head = Buffer.alloc(5);
  const fd = fs.openSync(file, "r");
  fs.readSync(fd, head, 0, 5, 0);
  fs.closeSync(fd);
  if (head.toString("latin1") !== "%PDF-") return { ok: false, why: `not a PDF (starts "${head.toString("latin1")}")`, size };
  if (size < minBytes) return { ok: false, why: `only ${size} bytes, expected at least ${minBytes} — probably a stub`, size };
  return { ok: true, size };
}

async function download(url, dest, referer) {
  const headers = { "User-Agent": UA };
  // ocr.org.uk serves its specification PDFs only to requests that carry a Referer from the
  // qualification page; without it the same URL returns a 404 HTML page.
  if (referer) headers.Referer = referer;
  const res = await fetch(url, { headers, redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

fs.mkdirSync(DEST, { recursive: true });
let fetched = 0;
let extracted = 0;
const failures = [];

for (const spec of SPECS) {
  if (only && spec.id !== only) continue;
  const pdf = path.join(DEST, `${spec.id}.pdf`);
  const txt = path.join(DEST, `${spec.id}.txt`);

  if (force || !fs.existsSync(pdf)) {
    const urls = [spec.url, ...(spec.fallbackUrls ?? [])];
    let got = false;
    for (const url of urls) {
      try {
        await download(url, pdf, spec.referer);
        const check = looksLikePdf(pdf, spec.minBytes);
        if (!check.ok) {
          fs.rmSync(pdf);
          console.log(`  x ${spec.id}: ${url}\n      ${check.why}`);
          continue;
        }
        console.log(`  + ${spec.id}: ${(check.size / 1024).toFixed(0)} KB`);
        got = true;
        fetched += 1;
        break;
      } catch (err) {
        console.log(`  x ${spec.id}: ${url}\n      ${err.message}`);
      }
    }
    if (!got) {
      if (!spec.optional) failures.push(spec.id);
      continue;
    }
  }

  if (force || !fs.existsSync(txt) || fs.statSync(txt).mtimeMs < fs.statSync(pdf).mtimeMs) {
    try {
      execFileSync("pdftotext", ["-layout", pdf, txt], { stdio: "pipe" });
      console.log(`  = ${spec.id}.txt (${(fs.statSync(txt).size / 1024).toFixed(0)} KB)`);
      extracted += 1;
    } catch (err) {
      failures.push(`${spec.id} (pdftotext: ${err.message.split("\n")[0]})`);
    }
  }
}

console.log(`\nfetched ${fetched}, extracted ${extracted}`);
if (failures.length) {
  console.log(`failed: ${failures.join(", ")}`);
  process.exitCode = 1;
}
