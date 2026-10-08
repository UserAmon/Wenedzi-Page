-- Migracja początkowa bazy SQLite (Cloudflare D1)
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  source TEXT CHECK(source IN ('facebook', 'local')) NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  images_json TEXT, -- JSON array: ["url1", "url2"]
  fb_post_id TEXT UNIQUE,
  fb_permalink TEXT,
  author_name TEXT,
  is_pinned INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_pinned ON posts(is_pinned DESC);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
