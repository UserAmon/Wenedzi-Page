// Moduł integracji z Facebook Graph API dla Fanpage'a 3 SDH Wenedzi

import { upsertFacebookPost } from './db';

export const FB_PAGE_ID = '241908756183484';
export const FB_PAGE_URL = 'https://www.facebook.com/wenedzi/';

export interface FbSyncResult {
  success: boolean;
  importedCount: number;
  message: string;
}

/**
 * Pobiera najnowsze posty z Fanpage'a drużyny i zapisuje je w SQLite (D1)
 */
export async function syncFacebookPosts(locals: any, customToken?: string): Promise<FbSyncResult> {
  let envToken: string | undefined;
  try {
    const { env } = await import('cloudflare:workers');
    envToken = (env as any)?.FB_PAGE_ACCESS_TOKEN;
  } catch {}

  const token = customToken || envToken || (typeof process !== 'undefined' ? process.env?.FB_PAGE_ACCESS_TOKEN : undefined);

  if (!token) {
    return {
      success: false,
      importedCount: 0,
      message: 'Brak tokena dostępu do Facebooka (FB_PAGE_ACCESS_TOKEN). Podaj token w oknie panelu admina.',
    };
  }

  try {
    const fields = 'id,message,created_time,permalink_url,attachments{media,subattachments}';
    const url = `https://graph.facebook.com/v19.0/${FB_PAGE_ID}/posts?fields=${encodeURIComponent(
      fields
    )}&limit=15&access_token=${encodeURIComponent(token)}`;

    const res = await fetch(url);
    const data = await res.json() as any;

    if (data.error) {
      console.error('Błąd Meta Graph API:', data.error);
      return {
        success: false,
        importedCount: 0,
        message: `Błąd Facebook API: ${data.error.message || 'Nieznany błąd autoryzacji'}`,
      };
    }

    const posts = data.data || [];
    let count = 0;

    for (const p of posts) {
      const message = p.message || '';
      if (!message && (!p.attachments || !p.attachments.data?.length)) {
        continue;
      }

      // Wyciąganie zdjęć z załączników posta
      const images: string[] = [];
      if (p.attachments && p.attachments.data) {
        for (const att of p.attachments.data) {
          // Pojedyncze zdjęcie
          if (att.media?.image?.src) {
            images.push(att.media.image.src);
          }
          // Album / galeria zdjęć w poście
          if (att.subattachments?.data) {
            for (const sub of att.subattachments.data) {
              if (sub.media?.image?.src && !images.includes(sub.media.image.src)) {
                images.push(sub.media.image.src);
              }
            }
          }
        }
      }

      await upsertFacebookPost(locals, {
        fbPostId: p.id,
        message: message,
        images: images,
        permalink: p.permalink_url || `${FB_PAGE_URL}`,
        createdAt: p.created_time || new Date().toISOString(),
      });
      count++;
    }

    return {
      success: true,
      importedCount: count,
      message: `Pomyślnie zsynchronizowano ${count} postów z Facebooka.`,
    };
  } catch (err: any) {
    console.error('Błąd podczas synchronizacji postów FB:', err);
    return {
      success: false,
      importedCount: 0,
      message: `Wyjątek podczas łączenia z Facebookiem: ${err.message}`,
    };
  }
}
