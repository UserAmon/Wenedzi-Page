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

-- Przykładowe dane startowe, aby strona od razu żyła i wyglądała świetnie
INSERT OR IGNORE INTO posts (id, source, title, content, images_json, author_name, is_pinned, created_at)
VALUES (
  'welcome-post',
  'local',
  'Czuwaj! Witamy na nowej stronie 3 SDH "Wenedzi"',
  'Rozpoczynamy nowy rok harcerski pełen przygód, biwaków i leśnych wypraw. Znajdziecie tutaj najważniejsze informacje dla rodziców, materiały szkoleniowe dla harcerzy oraz galerię naszych wypraw. Do zobaczenia na zbiórce!',
  '["https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=1200&q=80"]',
  'Drużynowy',
  1,
  datetime('now', '-1 day')
);

INSERT OR IGNORE INTO posts (id, source, title, content, images_json, fb_post_id, fb_permalink, author_name, is_pinned, created_at)
VALUES (
  'sample-fb-post-1',
  'facebook',
  'Zbiórka w Puszczy Bukowej',
  'Ostatnia sobota upłynęła nam na ćwiczeniu technik pionierki i terenoznawstwa w sercu Puszczy Bukowej. Zastępy spisały się na medal, a ognisko po intensywnym marszu smakowało jak nigdy!',
  '["https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1200&q=80"]',
  '241908756183484_10158930291',
  'https://www.facebook.com/wenedzi/',
  '3 SDH Wenedzi (Facebook)',
  0,
  datetime('now', '-3 days')
);
