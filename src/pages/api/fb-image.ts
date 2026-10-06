import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url }) => {
  const id = url.searchParams.get('id');
  if (!id || !/^[0-9]+$/.test(id)) {
    return new Response('Invalid media ID', { status: 400 });
  }

  const fbUrl = `https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=${id}`;
  try {
    const res = await fetch(fbUrl, {
      headers: {
        'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
      },
    });

    if (!res.ok) {
      return new Response('Failed to fetch image from Facebook', { status: res.status });
    }

    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const body = await res.arrayBuffer();

    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=604800, s-maxage=604800, immutable',
      },
    });
  } catch (err: any) {
    return new Response(err.message || 'Error fetching Facebook image', { status: 500 });
  }
};
