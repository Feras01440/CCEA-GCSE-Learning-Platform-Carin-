/**
 * "Something wrong?" reports: what she says looks off about an item, kept on the device with the item it is about,
 * so the item can be re-checked and the outcome shown beside it (engine item 10.4, 23 Sep 2026). A backup carries
 * them with every other table (export.ts writes every table).
 */
import { getDB, type ItemReport } from "./db";

/** Stores a report and returns its id; an empty report is not stored (null). */
export async function saveReport(input: Omit<ItemReport, "id" | "at">, now = new Date()): Promise<number | null> {
  const text = input.text.trim();
  if (text.length === 0) return null;
  const id = await getDB().reports.add({ ...input, text, at: now });
  return Number(id);
}

/** Every report on an item, oldest first. */
export async function reportsFor(itemId: string): Promise<ItemReport[]> {
  const rows = await getDB().reports.where("itemId").equals(itemId).toArray();
  return rows.sort((a, b) => a.at.getTime() - b.at.getTime());
}
