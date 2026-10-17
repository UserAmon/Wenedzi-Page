import type { APIRoute } from 'astro';
import { verifyPassword, createSessionCookie } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json().catch(() => null);
    const password = body?.password;

    if (!password || typeof password !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Wymagane jest podanie hasła.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const isValid = await verifyPassword(password, locals);
    if (!isValid) {
      return new Response(
        JSON.stringify({ success: false, error: 'Nieprawidłowe hasło.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const isSecure =
      request.url.startsWith('https:') ||
      request.headers.get('x-forwarded-proto') === 'https' ||
      !request.url.includes('localhost');

    const cookieValue = await createSessionCookie(locals, isSecure);

    return new Response(
      JSON.stringify({ success: true, message: 'Zalogowano pomyślnie.' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': cookieValue,
        },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Błąd serwera podczas logowania.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
