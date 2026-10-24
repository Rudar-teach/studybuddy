/**
 * Data access layer. All app code goes through the helpers here, so the
 * backend can be swapped without touching route handlers.
 *
 * Providers:
 *  - firebase: Firestore (enabled by setting NEXT_PUBLIC_FIREBASE_* env vars)
 *  - json:     local file store (dev fallback; keeps the app runnable
 *              before Firebase is configured)
 */
import {
  getOne,
  putDoc,
  patchDoc,
  removeDoc,
  getAllWithIds,
  isFirebaseConfigured,
} from "./firebase";

type Provider = "firebase" | "json";
let provider: Provider = "json";

/** Choose the live provider. Safe to call repeatedly. */
export function initStore(): Provider {
  provider = isFirebaseConfigured() ? "firebase" : "json";
  return provider;
}

export function activeProvider(): Provider {
  return provider;
}

// ---- JSON fallback (only used when Firebase env vars are absent) ----
let jsonStore: Record<string, Record<string, any>> | null = null;

function jsonGet(table: string): Record<string, any> {
  if (!jsonStore) jsonStore = loadJson();
  return jsonStore[table] || (jsonStore[table] = {});
}

function loadJson(): Record<string, Record<string, any>> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require("fs");
    const path = require("path");
    const p = path.join(process.cwd(), "data", "studybuddy.json");
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, "utf-8")) || {};
  } catch {
    /* empty store */
  }
  return {};
}

function jsonPersist() {
  if (!jsonStore) return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require("fs");
    const path = require("path");
    const p = path.join(process.cwd(), "data", "studybuddy.json");
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, JSON.stringify(jsonStore, null, 2));
  } catch (e) {
    console.error("json store persist failed", e);
  }
}

// ---- Public API ----

export async function getAllRows<T = Record<string, any>>(table: string): Promise<{ id: string; data: T }[]> {
  if (provider === "firebase") {
    return getAllWithIds<T>(table);
  }
  const map = jsonGet(table);
  return Object.entries(map).map(([id, data]) => ({ id, data: data as T }));
}

export async function getRow<T = Record<string, any>>(table: string, id: string): Promise<T | null> {
  if (provider === "firebase") {
    const doc = await getOne(table, id);
    return doc ? { ...doc, id: id } as unknown as T : null;
  }
  const map = jsonGet(table);
  return (map[id] as T) || null;
}

export async function writeRow(table: string, id: string, data: Record<string, any>): Promise<void> {
  if (provider === "firebase") {
    await putDoc(table, id, data);
    return;
  }
  jsonGet(table)[id] = data;
  jsonPersist();
}

export async function mergeRow(table: string, id: string, data: Record<string, any>): Promise<void> {
  if (provider === "firebase") {
    await patchDoc(table, id, data);
    return;
  }
  jsonGet(table)[id] = { ...(jsonGet(table)[id] || {}), ...data };
  jsonPersist();
}

export async function deleteRow(table: string, id: string): Promise<void> {
  if (provider === "firebase") {
    await removeDoc(table, id);
    return;
  }
  delete jsonGet(table)[id];
  jsonPersist();
}
