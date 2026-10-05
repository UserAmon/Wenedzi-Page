import type { APIRoute } from 'astro';
import { getAllPosts, createLocalPost } from '../../lib/db';

export const GET: APIRoute = async ({ locals }) => {
  try {
    const posts = await getAllPosts(locals);
    return new Response(JSON.stringify({ success: true, posts }), {
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

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const { title, content, images, authorName, isPinned, source, fbPermalink } = body;

    if (!content || typeof content !== 'string') {
      return new Response(JSON.stringify({ success: false, error: 'Treść posta jest wymagana.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await createLocalPost(locals, {
      source: source === 'facebook' ? 'facebook' : 'local',
      title: title || '',
      content,
      images: Array.isArray(images) ? images : [],
      authorName: authorName || (source === 'facebook' ? '3 SDH Wenedzi (Facebook)' : 'Drużynowy'),
      fbPermalink: fbPermalink || undefined,
      isPinned: Boolean(isPinned),
    });

    return new Response(JSON.stringify({ success: true, message: 'Post został pomyślnie dodany.' }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
