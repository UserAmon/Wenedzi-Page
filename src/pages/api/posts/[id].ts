import type { APIRoute } from 'astro';
import { getPostById, updateLocalPost, deletePostById } from '../../../lib/db';

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ success: false, error: 'Brak ID posta' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const post = await getPostById(locals, id);
    if (!post) {
      return new Response(JSON.stringify({ success: false, error: 'Nie znaleziono posta' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, post }), {
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

export const PUT: APIRoute = async ({ params, request, locals }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ success: false, error: 'Brak ID posta' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { title, content, images, authorName, isPinned } = body;

    if (!content || typeof content !== 'string') {
      return new Response(JSON.stringify({ success: false, error: 'Treść posta jest wymagana.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await updateLocalPost(locals, id, {
      title: title || '',
      content,
      images: Array.isArray(images) ? images : [],
      authorName: authorName || 'Drużynowy',
      isPinned: Boolean(isPinned),
    });

    return new Response(JSON.stringify({ success: true, message: 'Post został pomyślnie zaktualizowany.' }), {
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

export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ success: false, error: 'Brak ID posta' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await deletePostById(locals, id);
    return new Response(JSON.stringify({ success: true, message: 'Post został usunięty.' }), {
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
