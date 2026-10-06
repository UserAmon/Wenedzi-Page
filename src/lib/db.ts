// Interfejsy i operacje bazy danych dla 3 SDH Wenedzi

import { fetchLiveFacebookPosts } from './facebook';

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

// Jedyny zhardkodowany post powitalny w bazie – z datą na dziś
export function getWelcomePost(): Post {
  return {
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

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

/**
 * Zwraca 1 post powitalny oraz 4 ostatnie z Facebooka posortowane chronologicznie.
 * Przy wejściu na stronę automatycznie zaciąga najnowsze dane ze strony na FB.
 */
export async function getAllPosts(locals: any): Promise<Post[]> {
  // 1. Przy wejściu na stronę zaciągamy dane na żywo z profilu na Facebooku
  try {
    const liveFbPosts = await fetchLiveFacebookPosts();
    if (liveFbPosts && liveFbPosts.length > 0) {
      for (const fbPost of liveFbPosts) {
        const images = fbPost.images_json ? JSON.parse(fbPost.images_json) : [];
        await upsertFacebookPost(locals, {
          fbPostId: fbPost.fb_post_id || fbPost.id,
          message: fbPost.content,
          images: images,
          permalink: fbPost.fb_permalink || 'https://www.facebook.com/wenedzi/',
          createdAt: fbPost.created_at,
        });
      }
    }
  } catch (err) {
    console.warn('Nie udało się odświeżyć postów z FB w locie:', err);
  }

  // 2. Pobieramy 1 post lokalny (Czuwaj! Witamy...) oraz 4 najnowsze z Facebooka z bazy D1
  try {
    const welcome = getWelcomePost();
    await executeD1Query(
      locals,
      `INSERT INTO posts (id, source, title, content, images_json, author_name, is_pinned, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
       ON CONFLICT(id) DO UPDATE SET
         title = excluded.title,
         content = excluded.content,
         images_json = excluded.images_json,
         created_at = datetime('now'),
         updated_at = datetime('now')`,
      [
        welcome.id,
        welcome.source,
        welcome.title,
        welcome.content,
        welcome.images_json,
        welcome.author_name,
        welcome.is_pinned,
      ]
    );

    const localPosts = await executeD1Query<Post>(
      locals,
      `SELECT * FROM posts WHERE source = 'local' ORDER BY created_at DESC LIMIT 1`
    );

    const fbPosts = await executeD1Query<Post>(
      locals,
      `SELECT * FROM posts WHERE source = 'facebook' ORDER BY created_at DESC LIMIT 4`
    );

    const combined: Post[] = [...(localPosts.length > 0 ? localPosts : [welcome]), ...fbPosts];

    // Sortowanie chronologiczne: najnowsze na górze
    combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return combined.slice(0, 5);
  } catch (err) {
    console.error('Błąd pobierania postów z bazy D1:', err);
  }

  return [getWelcomePost()];
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
      created_at = excluded.created_at,
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
