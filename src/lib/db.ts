import * as SQLite from 'expo-sqlite';

export type PhotoRow = {
  id: number;
  uri: string;
  description: string;
  tags: string;
  created_at: string;
};

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('pipeline-lab.db');
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS photos (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          uri TEXT NOT NULL,
          description TEXT NOT NULL,
          tags TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
      `);
      return db;
    })();
  }
  return dbPromise;
}

export async function listPhotos(): Promise<PhotoRow[]> {
  const db = await getDb();
  return db.getAllAsync<PhotoRow>(
    'SELECT id, uri, description, tags, created_at FROM photos ORDER BY id DESC',
  );
}

export async function insertPhoto(input: {
  uri: string;
  description: string;
  tags: string[];
}): Promise<PhotoRow> {
  const db = await getDb();
  const createdAt = new Date().toISOString();
  const tagsJson = JSON.stringify(input.tags);
  const result = await db.runAsync(
    'INSERT INTO photos (uri, description, tags, created_at) VALUES (?, ?, ?, ?)',
    input.uri,
    input.description,
    tagsJson,
    createdAt,
  );

  return {
    id: result.lastInsertRowId,
    uri: input.uri,
    description: input.description,
    tags: tagsJson,
    created_at: createdAt,
  };
}

export function parseTags(tagsJson: string): string[] {
  try {
    const parsed = JSON.parse(tagsJson);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}
