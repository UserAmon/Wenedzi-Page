import type { APIRoute } from 'astro';
import { clearSessionCookie } from '../../../lib/auth';

const handleLogout: APIRoute = async () => {
  return new Response(
    JSON.stringify({ success: true, message: 'Wylogowano pomyślnie.' }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': clearSessionCookie(),
      },
    }
  );
};

export const POST: APIRoute = handleLogout;
export const GET: APIRoute = handleLogout;
