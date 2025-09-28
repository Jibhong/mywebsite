import sqlite3 from "sqlite3";
import { open } from "sqlite";

const dbString = await open({
  filename: "./tmp/dbString.sqlite",
  driver: sqlite3.Database
});

await dbString.exec("CREATE TABLE IF NOT EXISTS store (key TEXT PRIMARY KEY, value TEXT)");

export async function dbSetString(key:string, value:string) {
  await dbString.run("INSERT OR REPLACE INTO store (key, value) VALUES (?, ?)", [key, value]);
}

export async function dbGetString(key:string) {
  const row = await dbString.get("SELECT value FROM store WHERE key = ?", [key]);
  return row?.value ?? null;
}

export async function dbRemoveString(key: string) {
    await dbString.run("DELETE FROM store WHERE key = ?", [key]);
}