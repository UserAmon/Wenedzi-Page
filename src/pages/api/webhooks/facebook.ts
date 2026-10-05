import type { APIRoute } from 'astro';
import { upsertFacebookPost } from '../../../lib/db';

/**
 * Webhook do automatycznego dodawania postów z Facebooka do bazy D1
 * Może być wywoływany przez Make.com, Zapier, IFTTT, n8n lub automatyzacje FB
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json() as any;

    const message = body.message || body.text || body.content || '';
    const permalink = body.permalink || body.permalink_url || body.url || 'https://www.facebook.com/wenedzi/';
    const fbPostId = body.id || body.post_id || 'webhook-' + Date.now();
    
    let images: string[] = [];
    if (Array.isArray(body.images)) {
      images = body.images;
    } else if (typeof body.image === 'string' && body.image) {
      images = [body.image];
    } else if (typeof body.photo === 'string' && body.photo) {
      images = [body.photo];
    } else if (typeof body.full_picture === 'string' && body.full_picture) {
      images = [body.full_picture];
    }

    if (!message && images.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'Brak treści lub zdjęć w poście.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await upsertFacebookPost(locals, {
      fbPostId: String(fbPostId),
      message: message,
      images: images,
      permalink: permalink,
      createdAt: body.created_time || new Date().toISOString(),
    });

    return new Response(JSON.stringify({ success: true, message: 'Post z Facebooka został zapisany w D1!' }), {
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
