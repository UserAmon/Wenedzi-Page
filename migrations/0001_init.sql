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

-- Jedyny zhardkodowany post powitalny w bazie – z datą na dziś
INSERT OR REPLACE INTO posts (id, source, title, content, images_json, author_name, is_pinned, created_at, updated_at)
VALUES (
  'local-welcome',
  'local',
  'Czuwaj! Witamy na oficjalnej stronie 3 SDH »Wenedzi«',
  'Rozpoczynamy nowy rok harcerski pełen leśnych wyzwań, biwaków i wielkich przygód!\n\nNa naszej witrynie publikujemy najważniejsze komunikaty dla rodziców, materiały metodyczne dla harcerzy (w tym prawo harcerza i śpiewnik z chwytami) oraz relacje z życia drużyny. Do zobaczenia na zbiórkach!',
  '["https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=1200&q=80"]',
  'Drużynowy',
  1,
  datetime('now'),
  datetime('now')
);
