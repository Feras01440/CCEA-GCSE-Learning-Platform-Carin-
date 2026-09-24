/**
 * Saved runs (Dexie `mocks` table) for the Paper Runner. Browser only.
 */
import { useLiveQuery } from "dexie-react-hooks";
import { getDB, type Mock } from "@/lib/db/db";

function hasIndexedDB(): boolean {
  return typeof indexedDB !== "undefined";
}

/** Persist one run; resolves to its id. */
export async function saveMock(mock: Omit<Mock, "id">): Promise<number> {
  const id = await getDB().mocks.add(mock as Mock);
  return Number(id);
}

export async function deleteMock(id: number): Promise<void> {
  await getDB().mocks.delete(id);
}

/** Every saved run, newest first; `undefined` while loading, `[]` on the server. */
export function useAllMocks(): Mock[] | undefined {
  return useLiveQuery(async () => {
    if (!hasIndexedDB()) return [];
    return getDB().mocks.orderBy("at").reverse().toArray();
  }, []);
}

/** Saved runs of one paper, newest first. */
export function useRunsForPaper(paperId: string): Mock[] | undefined {
  return useLiveQuery(async () => {
    if (!hasIndexedDB()) return [];
    const rows = await getDB().mocks.where("paperId").equals(paperId).toArray();
    return rows.sort((a, b) => +new Date(b.at) - +new Date(a.at));
  }, [paperId]);
}
