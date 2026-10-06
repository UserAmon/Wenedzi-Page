import type { APIRoute } from 'astro';
import { fetchLiveFacebookPosts } from '../../lib/facebook';
import { upsertFacebookPost, getWelcomePost, executeD1Query } from '../../lib/db';

const handler: APIRoute = async ({ locals }) => {
  try {
    // 1. Zapewnij obecność posta powitalnego z datą na dziś
    const welcome = getWelcomePost();
    await executeD1Query(
      locals,
      `INSERT INTO posts (id, source, title, content, images_json, author_name, is_pinned, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
       ON CONFLICT(id) DO UPDATE SET created_at = datetime('now')`,
      [
        welcome.id,
        welcome.source,
        welcome.title,
        welcome.content,
        welcome.images_json,
        welcome.author_name,
      ]
    );

    // 2. Wyczyść stare wpisy z bazy, aby zachować tylko świeże 4 posty z Facebooka
    await executeD1Query(locals, `DELETE FROM posts WHERE id != 'local-welcome'`);

    // 3. Pobierz na żywo 4 najnowsze posty z Facebooka ze zdjęciami
    const fbPosts = await fetchLiveFacebookPosts();
    let imported = 0;

    for (const post of fbPosts) {
      const images = post.images_json ? JSON.parse(post.images_json) : [];
      await upsertFacebookPost(locals, {
        fbPostId: post.fb_post_id || post.id,
        message: post.content,
        images,
        permalink: post.fb_permalink || 'https://www.facebook.com/wenedzi/',
        createdAt: post.created_at,
      });
      imported++;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Zsynchronizowano post powitalny oraz ${imported} postów z Facebooka (ze zdjęciami).`,
        posts: fbPosts,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const GET: APIRoute = handler;
export const POST: APIRoute = handler;
