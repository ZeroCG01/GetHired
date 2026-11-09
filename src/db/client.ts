import * as SQLite from 'expo-sqlite';
import { DEFAULT_STATUSES } from '../constants/defaults';

const DATABASE_NAME = 'jobtrack.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync(DATABASE_NAME);
    initDatabase(dbInstance);
  }
  return dbInstance;
}

export function initDatabase(db: SQLite.SQLiteDatabase): void {
  // Enable foreign keys
  db.execSync('PRAGMA foreign_keys = ON;');

  // Create statuses table
  db.execSync(`
    CREATE TABLE IF NOT EXISTS statuses (
      id TEXT PRIMARY KEY,
      label_id TEXT NOT NULL,
      label_en TEXT NOT NULL,
      color_key TEXT NOT NULL,
      group_name TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      is_default INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);

  // Create applications table
  db.execSync(`
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      company_name TEXT NOT NULL,
      position TEXT NOT NULL,
      source TEXT NOT NULL,
      source_other TEXT,
      status_id TEXT NOT NULL,
      applied_date TEXT NOT NULL,
      salary_min REAL,
      salary_max REAL,
      salary_currency TEXT DEFAULT 'IDR',
      salary_period TEXT,
      salary_type TEXT,
      work_type TEXT,
      employment_type TEXT,
      location TEXT,
      job_url TEXT,
      contact_name TEXT,
      contact_info TEXT,
      follow_up_date TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (status_id) REFERENCES statuses (id)
    );
  `);

  // Create status_history table
  db.execSync(`
    CREATE TABLE IF NOT EXISTS status_history (
      id TEXT PRIMARY KEY,
      application_id TEXT NOT NULL,
      from_status_id TEXT,
      to_status_id TEXT NOT NULL,
      changed_at TEXT NOT NULL,
      note TEXT,
      FOREIGN KEY (application_id) REFERENCES applications (id) ON DELETE CASCADE,
      FOREIGN KEY (from_status_id) REFERENCES statuses (id),
      FOREIGN KEY (to_status_id) REFERENCES statuses (id)
    );
  `);

  // Seed default statuses if empty
  seedDefaultStatuses(db);
}

function seedDefaultStatuses(db: SQLite.SQLiteDatabase): void {
  const countRow = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM statuses');
  const count = countRow?.count ?? 0;

  if (count === 0) {
    const now = new Date().toISOString();
    for (const item of DEFAULT_STATUSES) {
      db.runSync(
        `INSERT INTO statuses (id, label_id, label_en, color_key, group_name, sort_order, is_default, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
        [item.id, item.labelId, item.labelEn, item.colorKey, item.group, item.sortOrder, now]
      );
    }
  }
}

