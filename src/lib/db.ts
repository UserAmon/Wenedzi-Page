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
  const db = await getD1Binding(locals);
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

// Pobieranie postów (sortowane: najpierw przypięte, potem najnowsze)
export async function getAllPosts(locals: any): Promise<Post[]> {
  const sql = `
    SELECT * FROM posts 
    ORDER BY is_pinned DESC, created_at DESC 
    LIMIT 50
  `;
  return executeD1Query<Post>(locals, sql);
}

// Dodawanie posta lokalnego
export async function createLocalPost(
  locals: any,
  data: {
    title: string;
    content: string;
    images: string[];
    authorName?: string;
    isPinned?: boolean;
  }
): Promise<boolean> {
  const id = 'local-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
  const imagesJson = data.images && data.images.length > 0 ? JSON.stringify(data.images) : null;
  const sql = `
    INSERT INTO posts (id, source, title, content, images_json, author_name, is_pinned, created_at, updated_at)
    VALUES (?, 'local', ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `;
  const params = [
    id,
    data.title || null,
    data.content,
    imagesJson,
    data.authorName || 'Drużynowy',
    data.isPinned ? 1 : 0,
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
