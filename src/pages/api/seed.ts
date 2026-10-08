import type { APIRoute } from 'astro';
import { fetchLiveFacebookPosts } from '../../lib/facebook';
import { upsertFacebookPost } from '../../lib/db';

const handler: APIRoute = async ({ locals }) => {
  try {
    // Pobierz na żywo najnowsze posty z Facebooka ze zdjęciami
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
        message: `Zsynchronizowano ${imported} postów z Facebooka (ze zdjęciami).`,
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
