"use client";

import { openDB, type IDBPDatabase } from "idb";

export interface HistoryRecord {
  id: string;
  name: string;
  size: number;
  engine: string;
  outputName: string;
  outputSize: number;
  ts: number;
}

const DB_NAME = "lowdoc-history";
const STORE = "records";

let _db: IDBPDatabase | null = null;

async function db(): Promise<IDBPDatabase> {
  if (_db) return _db;
  _db = await openDB(DB_NAME, 1, {
    upgrade(d) {
      if (!d.objectStoreNames.contains(STORE)) {
        d.createObjectStore(STORE, { keyPath: "id" });
      }
    },
  });
  return _db;
}

export async function saveHistory(record: HistoryRecord): Promise<void> {
  try {
    const d = await db();
    await d.put(STORE, record);
  } catch {
    /* storage unavailable — non-fatal */
  }
}

export async function loadHistory(): Promise<HistoryRecord[]> {
  try {
    const d = await db();
    const all = await d.getAll(STORE);
    return all.sort((a, b) => b.ts - a.ts).slice(0, 50);
  } catch {
    return [];
  }
}

export async function clearHistory(): Promise<void> {
  try {
    const d = await db();
    await d.clear(STORE);
  } catch {
    /* noop */
  }
}