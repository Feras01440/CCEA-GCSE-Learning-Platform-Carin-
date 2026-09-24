/**
 * JSON Schema export of the content schemas (master plan §3.6 G0: "z.toJSONSchema() exported
 * for editor validation and for structured drafting").
 *
 * `buildJsonSchemas()` is pure; `writeJsonSchemas(outDir)` writes one file per schema and is
 * what `scripts/export-json-schema.mjs` (npm run schema:export) calls.
 */
import { z } from "zod";
import * as S from "./schema";

export const JSON_SCHEMA_EXPORTS = {
  TopicBundle: S.TopicBundle,
  Question: S.Question,
  DiagnosticSet: S.DiagnosticSet,
  WorkedExample: S.WorkedExample,
  NoteFrontmatter: S.NoteFrontmatter,
  RetrievalPrompt: S.RetrievalPrompt,
  FindTheMistake: S.FindTheMistake,
  ExaminerInsight: S.ExaminerInsight,
  Practical: S.Practical,
  PhysicsEquation: S.PhysicsEquation,
  QwcItem: S.QwcItem,
  SubjectPack: S.SubjectPack,
} as const;

export type JsonSchemaName = keyof typeof JSON_SCHEMA_EXPORTS;
export const JSON_SCHEMA_NAMES = Object.keys(JSON_SCHEMA_EXPORTS) as JsonSchemaName[];

export type BuiltJsonSchema = { name: JsonSchemaName; fileName: string; schema: Record<string, unknown> };

/** TopicBundle -> topic-bundle.schema.json */
export function schemaFileName(name: JsonSchemaName): string {
  return `${name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()}.schema.json`;
}

export function buildJsonSchema(name: JsonSchemaName): BuiltJsonSchema {
  const fileName = schemaFileName(name);
  const generated = z.toJSONSchema(JSON_SCHEMA_EXPORTS[name], {
    target: "draft-2020-12",
    metadata: S.contentRegistry,
  }) as Record<string, unknown>;
  const { $schema, ...rest } = generated;
  return {
    name,
    fileName,
    schema: { $schema, $id: fileName, title: name, ...rest },
  };
}

export function buildJsonSchemas(): BuiltJsonSchema[] {
  return JSON_SCHEMA_NAMES.map(buildJsonSchema);
}

/** Writes `<outDir>/<name>.schema.json` for every export; returns the paths written. Node only. */
export async function writeJsonSchemas(outDir: string): Promise<string[]> {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  await fs.mkdir(outDir, { recursive: true });
  const written: string[] = [];
  for (const { fileName, schema } of buildJsonSchemas()) {
    const file = path.join(outDir, fileName);
    await fs.writeFile(file, `${JSON.stringify(schema, null, 2)}\n`, "utf8");
    written.push(file);
  }
  return written;
}
