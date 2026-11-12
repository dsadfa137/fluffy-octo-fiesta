'use strict';
/** SQLite 저장소 초기화 및 스키마 */
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const ATTACH_DIR = path.join(DATA_DIR, 'attachments');
const UPLOAD_DIR = path.join(DATA_DIR, 'public-uploads'); // 사이트 편집용 이미지(공개)
fs.mkdirSync(ATTACH_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'reports.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS reports (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  report_no     TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  category      TEXT NOT NULL,
  dept_enc      BLOB,
  title_enc     BLOB NOT NULL,
  occurred_at   TEXT,
  content_enc   BLOB NOT NULL,
  status        TEXT NOT NULL DEFAULT 'received',
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS messages (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id  INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  sender     TEXT NOT NULL,            -- 'admin' | 'reporter'
  body_enc   BLOB NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS attachments (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id    INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  filename_enc BLOB NOT NULL,
  mime         TEXT,
  size         INTEGER,
  store_name   TEXT NOT NULL,          -- data/attachments/<store_name>.enc
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS status_history (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id  INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  status     TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS admins (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS content (
  key        TEXT NOT NULL,
  lang       TEXT NOT NULL,          -- 'ko' | 'en' | '*'(언어 무관: 이미지 등)
  value      TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (key, lang)
);

CREATE INDEX IF NOT EXISTS idx_reports_no ON reports(report_no);
CREATE INDEX IF NOT EXISTS idx_messages_report ON messages(report_id);
`);

module.exports = { db, DATA_DIR, ATTACH_DIR, UPLOAD_DIR };
