import type { APIRoute } from 'astro';
import { syncFacebookPosts } from '../../lib/facebook';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    let customToken: string | undefined;
    try {
      const body = await request.json();
      if (body && body.token) {
        customToken = body.token;
      }
    } catch {
      // Body may be empty
    }

    const result = await syncFacebookPosts(locals, customToken);

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
