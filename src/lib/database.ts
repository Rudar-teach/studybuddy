import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "studybuddy.json");

interface Database {
  users: any[];
  study_groups: any[];
  projects: any[];
  collaboration_requests: any[];
  messages: any[];
}

function readDb(): Database {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, "utf-8");
      return JSON.parse(data);
    }
  } catch {
    // corrupted file, start fresh
  }
  return {
    users: [],
    study_groups: [],
    projects: [],
    collaboration_requests: [],
    messages: [],
  };
}

function writeDb(data: Database) {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export function insert(table: keyof Database, row: Record<string, any>): any {
  const db = readDb();
  const record = { id: row.id || globalThis.crypto?.randomUUID?.() || Date.now().toString(), ...row };
  db[table].push(record);
  writeDb(db);
  return record;
}

export function selectAll(table: keyof Database): any[] {
  return readDb()[table] || [];
}

export function selectOne(table: keyof Database, predicate: (row: any) => boolean): any | undefined {
  return (readDb()[table] || []).find(predicate);
}

export function dbUpdate(table: keyof Database, predicate: (row: any) => boolean, updates: Record<string, any>): any | undefined {
  const db = readDb();
  const idx = db[table].findIndex(predicate);
  if (idx === -1) return undefined;
  db[table][idx] = { ...db[table][idx], ...updates };
  writeDb(db);
  return db[table][idx];
}

export function dbRemove(table: keyof Database, predicate: (row: any) => boolean): boolean {
  const db = readDb();
  const idx = db[table].findIndex(predicate);
  if (idx === -1) return false;
  db[table].splice(idx, 1);
  writeDb(db);
  return true;
}
