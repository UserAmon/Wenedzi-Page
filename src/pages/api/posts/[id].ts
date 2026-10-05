import type { APIRoute } from 'astro';
import { deletePostById } from '../../../lib/db';

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
