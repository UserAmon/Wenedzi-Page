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

-- 5 startowych postów (komunikaty drużyny oraz posty z profilu FB drużyny)
INSERT OR IGNORE INTO posts (id, source, title, content, images_json, author_name, is_pinned, created_at)
VALUES (
  'local-welcome',
  'local',
  'Czuwaj! Witamy na oficjalnej stronie 3 SDH »Wenedzi«',
  'Rozpoczynamy nowy rok harcerski pełen leśnych wyzwań, biwaków i wielkich przygód!\n\nNa naszej witrynie publikujemy najważniejsze komunikaty dla rodziców, materiały metodyczne dla harcerzy (w tym prawo harcerza i śpiewnik z chwytami) oraz relacje z życia drużyny. Do zobaczenia na zbiórkach!',
  '["https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=1200&q=80"]',
  'Drużynowy',
  1,
  datetime('now', '-1 day')
);

INSERT OR IGNORE INTO posts (id, source, title, content, images_json, fb_post_id, fb_permalink, author_name, is_pinned, created_at)
VALUES (
  'fb-hopr-kurs',
  'facebook',
  NULL,
  '🚒 W miniony weekend nasi starsi wędrownicy – druh Adam i druh Michał – wraz z przybocznym, druhem Dominikiem, wzięli udział w zaawansowanym kursie pierwszej pomocy – HOPR Okręg Północno-Zachodni.\n\nPrzez trzy dni intensywnych ćwiczeń nasi druhowie mierzyli się z realistycznymi pozoracjami wypadków, ćwiczyli resuscytację krążeniowo-oddechową, zaopatrywanie urazów w trudnych warunkach leśnych oraz koordynację działań ratowniczych.\n\nWiedza i umiejętności zdobyte na kursie będą procentować na każdej zbiórce, biwaku i obozie naszej drużyny. Gratulacje dla uczestników za determinację i zdany egzamin ratowniczy! Czuwaj!',
  '["https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=1200&q=80"]',
  '1419090903670761',
  'https://www.facebook.com/wenedzi/posts/-w-miniony-weekend-nasi-starsi-w%C4%99drownicy-druh-adam-i-druh-micha%C5%82-wraz-z-przyboc/1419090903670761/',
  '3 SDH Wenedzi (Facebook)',
  0,
  datetime('now', '-3 days')
);

INSERT OR IGNORE INTO posts (id, source, title, content, images_json, fb_post_id, fb_permalink, author_name, is_pinned, created_at)
VALUES (
  'fb-puszcza-bukowa',
  'facebook',
  NULL,
  '🌲 Jesienny marsz patrolowy i zbiórka w Puszczy Bukowej!\n\nW minioną sobotę Zastępy „Wilki”, „Jastrzębie” i „Bory” ruszyły na trasę gry terenowej w sercu Puszczy Bukowej. Zadaniem harcerzy było bezbłędne przejście trasy z mapą i kompasem, odnalezienie punktów kontrolnych oraz rozwiązanie szyfrów przygotowanych przez kadrę.\n\nNa mecie czekała na wszystkich zasłużona leśna herbata gotowana w kociołku na ognisku i wspólna pionierka obozowa. Dziękujemy wszystkim za zaangażowanie i harcerskiego ducha!',
  '["https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80"]',
  '1418501234567890',
  'https://www.facebook.com/wenedzi/',
  '3 SDH Wenedzi (Facebook)',
  0,
  datetime('now', '-6 days')
);

INSERT OR IGNORE INTO posts (id, source, title, content, images_json, fb_post_id, fb_permalink, author_name, is_pinned, created_at)
VALUES (
  'fb-przyrzeczenie',
  'facebook',
  NULL,
  '⚜️ Bieg na stopień i Przyrzeczenie Harcerskie na Polanie Sosnowej.\n\nKolejni druhowie po wielomiesięcznej próbie udowodnili, że zasługują na miano pełnoprawnych harcerzy. W blasku harcerskiego ogniska, w obecności całej drużyny i instruktorów, złożyli uroczyste Przyrzeczenie Harcerskie na krzyż harcerski:\n\n„Mam szczerą wolę całym życiem pełnić służbę Bogu i Polsce, nieść chętną pomoc bliźnim i być posłusznym Prawu Harcerskiemu”.\n\nWielkie brawa dla młodych druhów – witamy w braterskim kręgu!',
  '["https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80"]',
  '1417809876543210',
  'https://www.facebook.com/wenedzi/',
  '3 SDH Wenedzi (Facebook)',
  0,
  datetime('now', '-10 days')
);

INSERT OR IGNORE INTO posts (id, source, title, content, images_json, author_name, is_pinned, created_at)
VALUES (
  'local-biwak-info',
  'local',
  'Informacja dla Rodziców: Ekwipunek na biwak jesienny',
  'Drodzy Rodzice i Harcerze!\nZbliża się nasz doroczny biwak drużyny. W zakładkach »Dla Rodziców« oraz »Dla Harcerzy -> Ekwipunek na biwaki« opublikowaliśmy szczegółową listę rzeczy, które każdy harcerz musi mieć spakowane do plecaka.\n\nPrzypominamy o ciepłym śpiworze, karimacie, latarce czołówce, menażce oraz aktualnej legitymacji szkolnej. W razie pytań zapraszamy do kontaktu z drużynowym!',
  '["https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=1200&q=80"]',
  'Drużynowy',
  0,
  datetime('now', '-14 days')
);
