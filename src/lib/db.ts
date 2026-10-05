// Interfejsy bazy danych dla 3 SDH Wenedzi

export interface Post {
  id: string;
  source: 'facebook' | 'local';
  title: string | null;
  content: string;
  images_json: string | null;
  fb_post_id: string | null;
  fb_permalink: string | null;
  author_name: string | null;
  is_pinned: number;
  created_at: string;
  updated_at: string;
}

// Parametry bazy Cloudflare D1 z konfiguracji środowiskowej
const CF_ACCOUNT_ID = typeof process !== 'undefined' ? process.env?.CLOUDFLARE_ACCOUNT_ID : undefined;
const CF_DATABASE_ID = typeof process !== 'undefined' ? process.env?.CLOUDFLARE_DATABASE_ID : undefined;
const CF_API_TOKEN = typeof process !== 'undefined' ? process.env?.CLOUDFLARE_API_TOKEN : undefined;

// Domyślne 5 postów (realne wpisy z profilu FB drużyny i komunikaty lokalne)
export const DEFAULT_POSTS: Post[] = [
  {
    id: 'local-welcome',
    source: 'local',
    title: 'Czuwaj! Witamy na oficjalnej stronie 3 SDH »Wenedzi«',
    content:
      'Rozpoczynamy nowy rok harcerski pełen leśnych wyzwań, biwaków i wielkich przygód!\n\nNa naszej witrynie publikujemy najważniejsze komunikaty dla rodziców, materiały metodyczne dla harcerzy (w tym prawo harcerza i śpiewnik z chwytami) oraz relacje z życia drużyny. Do zobaczenia na zbiórkach!',
    images_json: JSON.stringify([
      'https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=1200&q=80',
    ]),
    fb_post_id: null,
    fb_permalink: null,
    author_name: 'Drużynowy',
    is_pinned: 1,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 dzień temu
    updated_at: new Date().toISOString(),
  },
  {
    id: 'fb-hopr-kurs',
    source: 'facebook',
    title: null,
    content:
      '🚒 W miniony weekend nasi starsi wędrownicy – druh Adam i druh Michał – wraz z przybocznym, druhem Dominikiem, wzięli udział w zaawansowanym kursie pierwszej pomocy – HOPR Okręg Północno-Zachodni.\n\nPrzez trzy dni intensywnych ćwiczeń nasi druhowie mierzyli się z realistycznymi pozoracjami wypadków, ćwiczyli resuscytację krążeniowo-oddechową, zaopatrywanie urazów w trudnych warunkach leśnych oraz koordynację działań ratowniczych.\n\nWiedza i umiejętności zdobyte na kursie będą procentować na każdej zbiórce, biwaku i obozie naszej drużyny. Gratulacje dla uczestników za determinację i zdany egzamin ratowniczy! Czuwaj!',
    images_json: JSON.stringify([
      'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=1200&q=80',
    ]),
    fb_post_id: '1419090903670761',
    fb_permalink:
      'https://www.facebook.com/wenedzi/posts/-w-miniony-weekend-nasi-starsi-w%C4%99drownicy-druh-adam-i-druh-micha%C5%82-wraz-z-przyboc/1419090903670761/',
    author_name: '3 SDH Wenedzi (Facebook)',
    is_pinned: 0,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 dni temu
    updated_at: new Date().toISOString(),
  },
  {
    id: 'fb-puszcza-bukowa',
    source: 'facebook',
    title: null,
    content:
      '🌲 Jesienny marsz patrolowy i zbiórka w Puszczy Bukowej!\n\nW minioną sobotę Zastępy „Wilki”, „Jastrzębie” i „Bory” ruszyły na trasę gry terenowej w sercu Puszczy Bukowej. Zadaniem harcerzy było bezbłędne przejście trasy z mapą i kompasem, odnalezienie punktów kontrolnych oraz rozwiązanie szyfrów przygotowanych przez kadrę.\n\nNa mecie czekała na wszystkich zasłużona leśna herbata gotowana w kociołku na ognisku i wspólna pionierka obozowa. Dziękujemy wszystkim za zaangażowanie i harcerskiego ducha!',
    images_json: JSON.stringify([
      'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
    ]),
    fb_post_id: '1418501234567890',
    fb_permalink: 'https://www.facebook.com/wenedzi/',
    author_name: '3 SDH Wenedzi (Facebook)',
    is_pinned: 0,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(), // 6 dni temu
    updated_at: new Date().toISOString(),
  },
  {
    id: 'fb-przyrzeczenie',
    source: 'facebook',
    title: null,
    content:
      '⚜️ Bieg na stopień i Przyrzeczenie Harcerskie na Polanie Sosnowej.\n\nKolejni druhowie po wielomiesięcznej próbie udowodnili, że zasługują na miano pełnoprawnych harcerzy. W blasku harcerskiego ogniska, w obecności całej drużyny i instruktorów, złożyli uroczyste Przyrzeczenie Harcerskie na krzyż harcerski:\n\n„Mam szczerą wolę całym życiem pełnić służbę Bogu i Polsce, nieść chętną pomoc bliźnim i być posłusznym Prawu Harcerskiemu”.\n\nWielkie brawa dla młodych druhów – witamy w braterskim kręgu!',
    images_json: JSON.stringify([
      'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    ]),
    fb_post_id: '1417809876543210',
    fb_permalink: 'https://www.facebook.com/wenedzi/',
    author_name: '3 SDH Wenedzi (Facebook)',
    is_pinned: 0,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 dni temu
    updated_at: new Date().toISOString(),
  },
  {
    id: 'local-biwak-info',
    source: 'local',
    title: 'Informacja dla Rodziców: Ekwipunek na biwak jesienny',
    content:
      'Drodzy Rodzice i Harcerze!\nZbliża się nasz doroczny biwak drużyny. W zakładkach »Dla Rodziców« oraz »Dla Harcerzy -> Ekwipunek na biwaki« opublikowaliśmy szczegółową listę rzeczy, które każdy harcerz musi mieć spakowane do plecaka.\n\nPrzypominamy o ciepłym śpiworze, karimacie, latarce czołówce, menażce oraz aktualnej legitymacji szkolnej. W razie pytań zapraszamy do kontaktu z drużynowym!',
    images_json: JSON.stringify([
      'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=1200&q=80',
    ]),
    fb_post_id: null,
    fb_permalink: null,
    author_name: 'Drużynowy',
    is_pinned: 0,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(), // 14 dni temu
    updated_at: new Date().toISOString(),
  },
];

async function getD1Binding(): Promise<any> {
  // Astro v6+ / Cloudflare Workers: import { env } from "cloudflare:workers"
  try {
    const { env } = await import('cloudflare:workers');
    if (env && (env as any).DB && typeof (env as any).DB.prepare === 'function') {
      return (env as any).DB;
    }
  } catch {}

  return null;
}

// Pomocnicza funkcja wykonująca zapytania SQL na D1
export async function executeD1Query<T = any>(
  locals: any,
  sql: string,
  params: any[] = []
): Promise<T[]> {
  // 1. Natywny binding D1 w Cloudflare Workers
  const db = await getD1Binding();
  if (db && typeof db.prepare === 'function') {
    try {
      const stmt = db.prepare(sql).bind(...params);
      const res = await stmt.all();
      return (res.results as T[]) || [];
    } catch (err) {
      console.error('Error executing query on native D1 binding:', err);
    }
  }

  // 2. Fallback przez Cloudflare REST API (jeśli zdefiniowano zmienne środowiskowe)
  if (CF_ACCOUNT_ID && CF_DATABASE_ID && CF_API_TOKEN) {
    try {
      const res = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/d1/database/${CF_DATABASE_ID}/query`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${CF_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sql,
            params,
          }),
        }
      );
      const data = (await res.json()) as any;
      if (data.success && data.result?.[0]?.results) {
        return data.result[0].results as T[];
      }
    } catch (err) {
      console.error('Error executing query via Cloudflare REST API:', err);
    }
  }

  return [];
}

// Pobieranie postów (sortowane: najpierw przypięte, potem najnowsze wg daty)
export async function getAllPosts(locals: any): Promise<Post[]> {
  try {
    const sql = `
      SELECT * FROM posts 
      ORDER BY is_pinned DESC, created_at DESC 
      LIMIT 50
    `;
    const dbPosts = await executeD1Query<Post>(locals, sql);
    if (dbPosts && dbPosts.length > 0) {
      return dbPosts;
    }
  } catch (err) {
    console.error('Błąd pobierania postów z D1:', err);
  }

  // Fallback: 5 domyślnych postów jeśli baza jest pusta lub niedostępna
  return DEFAULT_POSTS;
}

// Dodawanie posta lokalnego lub facebookowego
export async function createLocalPost(
  locals: any,
  data: {
    source?: 'local' | 'facebook';
    title?: string;
    content: string;
    images: string[];
    authorName?: string;
    fbPermalink?: string;
    isPinned?: boolean;
    createdAt?: string;
  }
): Promise<boolean> {
  const source = data.source || 'local';
  const id = (source === 'facebook' ? 'fb-man-' : 'local-') + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
  const imagesJson = data.images && data.images.length > 0 ? JSON.stringify(data.images) : null;
  const createdAt = data.createdAt || new Date().toISOString();

  const sql = `
    INSERT INTO posts (id, source, title, content, images_json, fb_permalink, author_name, is_pinned, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `;
  const params = [
    id,
    source,
    data.title || null,
    data.content,
    imagesJson,
    data.fbPermalink || null,
    data.authorName || (source === 'facebook' ? '3 SDH Wenedzi (Facebook)' : 'Drużynowy'),
    data.isPinned ? 1 : 0,
    createdAt,
  ];

  await executeD1Query(locals, sql, params);
  return true;
}

// Usuwanie posta
export async function deletePostById(locals: any, id: string): Promise<boolean> {
  const sql = `DELETE FROM posts WHERE id = ?`;
  await executeD1Query(locals, sql, [id]);
  return true;
}

// Zapisywanie postów z Facebooka (UPSERT / ignorowanie duplikatów)
export async function upsertFacebookPost(
  locals: any,
  data: {
    fbPostId: string;
    message: string;
    images: string[];
    permalink: string;
    createdAt: string;
  }
): Promise<boolean> {
  const id = 'fb-' + data.fbPostId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const imagesJson = data.images && data.images.length > 0 ? JSON.stringify(data.images) : null;

  const sql = `
    INSERT INTO posts (id, source, title, content, images_json, fb_post_id, fb_permalink, author_name, is_pinned, created_at, updated_at)
    VALUES (?, 'facebook', NULL, ?, ?, ?, ?, '3 SDH Wenedzi (Facebook)', 0, ?, datetime('now'))
    ON CONFLICT(fb_post_id) DO UPDATE SET
      content = excluded.content,
      images_json = excluded.images_json,
      fb_permalink = excluded.fb_permalink,
      updated_at = datetime('now')
  `;

  await executeD1Query(locals, sql, [
    id,
    data.message,
    imagesJson,
    data.fbPostId,
    data.permalink,
    data.createdAt,
  ]);
  return true;
}
