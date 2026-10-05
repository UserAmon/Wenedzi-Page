import type { APIRoute } from 'astro';
import { executeD1Query, DEFAULT_POSTS } from '../../lib/db';

export const POST: APIRoute = async ({ locals }) => {
  try {
    for (const post of DEFAULT_POSTS) {
      const sql = `
        INSERT INTO posts (id, source, title, content, images_json, fb_post_id, fb_permalink, author_name, is_pinned, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(id) DO UPDATE SET
          content = excluded.content,
          images_json = excluded.images_json,
          fb_permalink = excluded.fb_permalink,
          updated_at = datetime('now')
      `;
      await executeD1Query(locals, sql, [
        post.id,
        post.source,
        post.title,
        post.content,
        post.images_json,
        post.fb_post_id,
        post.fb_permalink,
        post.author_name,
        post.is_pinned,
        post.created_at,
      ]);
    }

    return new Response(JSON.stringify({ success: true, message: '5 startowych postów zostało zapisanych w D1!' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
