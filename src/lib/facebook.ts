// Moduł integracji z Facebookiem dla Fanpage'a 3 SDH Wenedzi

import { executeD1Query, upsertFacebookPost, type Post } from './db';

export const FB_PAGE_ID = '241908756183484';
export const FB_PAGE_URL = 'https://www.facebook.com/wenedzi/';

// ID powiązane z awatarem/logo profilu lub stroną Facebooka – nie są to zdjęcia z postów
const BAD_MEDIA_IDS = new Set(['100067095955939', '241908756183484']);

function decodeUnicode(str: string): string {
  return str
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
    .replace(/\\\//g, '/');
}

/**
 * Dynamicznie pobiera 5 najnowszych unikalnych postów ze strony FB (ze zdjęciami, bez loga)
 */
export async function fetchLiveFacebookPosts(): Promise<Post[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(FB_PAGE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept-Language': 'pl-PL,pl;q=0.9',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`Facebook HTTP status: ${res.status}`);
      return [];
    }

    const html = await res.text();
    const idx = html.indexOf('"message":{"text":');
    if (idx === -1) {
      console.warn('Nie znaleziono bloku wiadomości w HTML Facebooka');
      return [];
    }

    const sStart = html.lastIndexOf('<script', idx);
    const sEnd = html.indexOf('</script>', idx);
    const s = sStart !== -1 && sEnd !== -1 ? html.slice(sStart, sEnd) : html;

    const posts: Post[] = [];
    let cur = 0;

    while (cur < s.length) {
      const found = s.indexOf('"message":{"text":', cur);
      if (found === -1) break;
      cur = found + 20;

      // Okno 15KB wokół wiadomości
      const windowChunk = s.slice(found, found + 15000);
      const msgMatch = windowChunk.match(/"message":\s*\{\s*"text":\s*"((?:[^"\\]|\\.)*)"\}/);
      if (!msgMatch) continue;

      const text = decodeUnicode(msgMatch[1]).trim();
      if (text.length < 15) continue;

      // Sprawdź duplikaty treści (zanim przetworzymy dalej)
      const cleanSnippet = text.slice(0, 50).toLowerCase();
      if (posts.some((p) => p.content.slice(0, 50).toLowerCase() === cleanSnippet)) {
        continue;
      }

      // Kontekst wokół wiadomości na potrzeby linku i zdjęć
      const context = s.slice(Math.max(0, found - 10000), Math.min(s.length, found + 15000));

      // Szukanie najbliższego creation_time (zakres +/- 25KB wokół wiadomości)
      const searchRange = s.slice(Math.max(0, found - 25000), Math.min(s.length, found + 25000));
      const offset = Math.max(0, found - 25000);
      const timeMatches = [...searchRange.matchAll(/"creation_time":\s*([0-9]{10})/g)].map((m) => ({
        timestamp: parseInt(m[1]),
        dist: Math.abs(offset + (m.index || 0) - found),
      }));
      timeMatches.sort((a, b) => a.dist - b.dist);
      const bestTime = timeMatches[0]?.timestamp;
      const createdAt = bestTime
        ? new Date(bestTime * 1000).toISOString()
        : new Date().toISOString();

      const urlMatch = context.match(/"url":\s*"(https:\\\/\\\/www\.facebook\.com\\\/wenedzi\\\/posts\\\/[^"]+?)"/);
      const permalink = urlMatch
        ? urlMatch[1].replace(/\\\//g, '/')
        : FB_PAGE_URL;

      // Wyciągamy media_id wszystkich zdjęć powiązanych z postem (wykluczając logo/avatar profilu)
      const mediaIdMatches = [
        ...context.matchAll(/media_id=([0-9]+)/g),
        ...context.matchAll(/"Photo","id":"([0-9]+)"/g),
        ...context.matchAll(/"Photo","__isNode":"Photo","id":"([0-9]+)"/g),
      ].map((m) => m[1]);

      const uniqueMediaIds = [...new Set(mediaIdMatches)].filter((id) => !BAD_MEDIA_IDS.has(id));
      const photos = uniqueMediaIds.map((id) => `/api/fb-image?id=${id}`);

      const postId = permalink.match(/posts\/([a-zA-Z0-9_-]+)/)?.[1] || `fb-${Date.now()}-${posts.length}`;
      posts.push({
        id: `fb-${postId}`,
        source: 'facebook',
        title: null,
        content: text,
        images_json: photos.length > 0 ? JSON.stringify(photos) : null,
        fb_post_id: postId,
        fb_permalink: permalink,
        author_name: '3 SDH Wenedzi (Facebook)',
        is_pinned: 0,
        created_at: createdAt,
        updated_at: new Date().toISOString(),
      });
    }

    // Sortujemy wszystkie znalezione posty chronologicznie od najnowszego
    posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Zwracamy dokładnie 5 najnowszych wpisów
    return posts.slice(0, 5);
  } catch (err) {
    console.warn('Błąd podczas pobierania postów z Facebooka na żywo:', err);
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Funkcja synchronizująca 5 najnowszych postów z FB do bazy D1
 */
export async function syncFacebookPosts(
  locals: any,
  _customToken?: string
): Promise<{ success: boolean; importedCount: number; message: string }> {
  try {
    const posts = await fetchLiveFacebookPosts();
    if (!posts || posts.length === 0) {
      return {
        success: false,
        importedCount: 0,
        message: 'Nie udało się pobrać postów z Facebooka (brak odpowiedzi od FB).',
      };
    }

    // Czyścimy dotychczasowe posty z FB, aby zachować czyste 5 najnowszych bez starych duplikatów i logotypów
    await executeD1Query(locals, `DELETE FROM posts WHERE source = 'facebook'`);

    for (const post of posts) {
      const images = post.images_json ? JSON.parse(post.images_json) : [];
      await upsertFacebookPost(locals, {
        fbPostId: post.fb_post_id || post.id,
        message: post.content,
        images,
        permalink: post.fb_permalink || FB_PAGE_URL,
        createdAt: post.created_at,
      });
    }

    return {
      success: true,
      importedCount: posts.length,
      message: `Pomyślnie zsynchronizowano ${posts.length} najnowszych postów z Facebooka (bez zbędnego loga).`,
    };
  } catch (err: any) {
    return {
      success: false,
      importedCount: 0,
      message: `Błąd podczas synchronizacji: ${err.message}`,
    };
  }
}
