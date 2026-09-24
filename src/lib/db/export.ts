"use client";

import { getDB } from "./db";
import { companionExportExclusions, EXPORT_NOTES_SETTING } from "@/lib/companion";
import { getSetting } from "@/lib/plan/store";

const SCHEMA_ID = "cairn-study-db";

export interface ExportFile {
  schema: typeof SCHEMA_ID;
  version: number;
  exportedAt: string;
  tables: Record<string, unknown[]>;
}

/** Everything she owns, as one JSON file. Dates are ISO strings. */
export async function exportAll(): Promise<ExportFile> {
  const db = getDB();
  const tables: Record<string, unknown[]> = {};
  // Her companion notes are free text she typed: left out unless she turned the export toggle on in Settings.
  const skip = new Set(companionExportExclusions(await getSetting(EXPORT_NOTES_SETTING, false)));
  for (const t of db.tables) {
    if (skip.has(t.name)) continue;
    tables[t.name] = await t.toArray();
  }
  return { schema: SCHEMA_ID, version: db.verno, exportedAt: new Date().toISOString(), tables };
}

export function downloadJson(file: ExportFile, name = `cairn-progress-${file.exportedAt.slice(0, 10)}.json`): void {
  const blob = new Blob([JSON.stringify(file)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const DATE_KEYS = new Set(["at", "due", "createdAt", "lastEvidenceAt", "updatedAt", "startedAt", "endedAt", "last_review"]);

function revive(row: unknown): unknown {
  if (Array.isArray(row)) return row.map(revive);
  if (row && typeof row === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(row as Record<string, unknown>)) {
      out[k] = DATE_KEYS.has(k) && typeof v === "string" ? new Date(v) : revive(v);
    }
    return out;
  }
  return row;
}

/** Restores a file. `mode` replace clears each table first; merge upserts by primary key. */
export async function importAll(file: ExportFile, mode: "replace" | "merge"): Promise<{ tables: number; rows: number }> {
  if (file.schema !== SCHEMA_ID) throw new Error("Not a Cairn progress file");
  const db = getDB();
  let rows = 0;
  let tables = 0;
  await db.transaction("rw", db.tables, async () => {
    for (const t of db.tables) {
      const data = file.tables[t.name];
      if (!Array.isArray(data)) continue;
      tables += 1;
      if (mode === "replace") await t.clear();
      const revived = data.map(revive) as object[];
      await t.bulkPut(revived);
      rows += revived.length;
    }
  });
  return { tables, rows };
}
