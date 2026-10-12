import type { APIRoute } from 'astro';
import { syncFacebookPosts, parseFacebookHtml, type Post } from '../../lib/facebook';

const handler: APIRoute = async ({ request, locals }) => {
  try {
    let providedPosts: Post[] | undefined;

    if (request.method === 'POST') {
      try {
        const body = await request.json() as any;
        if (body?.html && typeof body.html === 'string') {
          providedPosts = parseFacebookHtml(body.html);
        } else if (Array.isArray(body?.posts) && body.posts.length > 0) {
          providedPosts = body.posts;
        }
      } catch {
        // brak treści JSON - kontynuujemy ze standardową próbą live fetch
      }
    }

    const result = await syncFacebookPosts(locals, providedPosts);
    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 400,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        importedCount: 0,
        message: err.message || 'Wystąpił błąd synchronizacji.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

export const GET: APIRoute = handler;
export const POST: APIRoute = handler;
