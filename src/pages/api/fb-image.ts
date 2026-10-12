import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url }) => {
  const id = url.searchParams.get('id') || url.searchParams.get('media_id');
  const BAD_IDS = new Set(['100067095955939', '241908756183484', '100070016604132']);
  if (!id || !/^[0-9]+$/.test(id) || BAD_IDS.has(id)) {
    return new Response('Not found or invalid media ID', { status: 404 });
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
