#!/usr/bin/env node
/**
 * Export the Zod content schemas (src/lib/content/schema.ts) as JSON Schema files for
 * editor validation and structured drafting (master plan §3.6 G0, §3.9).
 *
 *   npm run schema:export                          -> pipeline/schema/<name>.schema.json
 *   npx tsx scripts/export-json-schema.mjs [outDir]
 *
 * The schema module is TypeScript, so this must run under tsx (a devDependency): the
 * modules import each other without extensions, which Node's own type stripping rejects.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { writeJsonSchemas } from "../src/lib/content/json-schema.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(process.argv[2] ?? path.join(here, "..", "pipeline", "schema"));

const written = await writeJsonSchemas(outDir);
for (const file of written) console.log(`wrote ${path.relative(process.cwd(), file)}`);
console.log(`${written.length} JSON Schema files written to ${outDir}`);
