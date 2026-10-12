import type { APIRoute } from 'astro';
import { syncFacebookPosts } from '../../lib/facebook';

const handler: APIRoute = async ({ locals }) => {
  try {
    const result = await syncFacebookPosts(locals);
    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const GET: APIRoute = handler;
export const POST: APIRoute = handler;
