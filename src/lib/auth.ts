// Narzędzia autoryzacji sesji administratora dla 3 SDH Wenedzi
// Używa natywnego Web Crypto API (HMAC-SHA256) zgodnego z Cloudflare Workers i Node.js.

export const SESSION_COOKIE_NAME = 'wenedzi_admin_session';
export const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 dni w sekundach
export const DEFAULT_ADMIN_PASSWORD = 'wenedzi367';
const DEFAULT_AUTH_SECRET = 'wenedzi-3sdh-golisz-2026-auth-salt-c4f7b2e981da4b';

/**
 * Bezpieczne pobieranie zmiennej środowiskowej
 */
export async function getEnvVar(name: string, _locals?: any): Promise<string | undefined> {
  // 1. Natywny binding z cloudflare:workers (Astro v6+ na Cloudflare Workers)
  try {
    const { env } = await import('cloudflare:workers');
    if (env && (env as any)[name]) {
      return (env as any)[name];
    }
  } catch {}

  // 2. Zmienne process.env (Node.js dev / build / SSR)
  if (typeof process !== 'undefined' && process.env?.[name]) {
    return process.env[name];
  }

  return undefined;
}

/**
 * Zwraca hasło administratora (zmienna ADMIN_PASSWORD lub domyślne wenedzi367)
 */
export async function getAdminPassword(locals?: any): Promise<string> {
  const envVal = await getEnvVar('ADMIN_PASSWORD', locals);
  return envVal || DEFAULT_ADMIN_PASSWORD;
}

/**
 * Zwraca klucz szyfrowania podpisu HMAC
 */
export async function getAuthSecret(locals?: any): Promise<string> {
  const envVal = await getEnvVar('AUTH_SECRET', locals);
  return envVal || DEFAULT_AUTH_SECRET;
}

/**
 * Porównanie łańcuchów w stałym czasie (ochrona przed timing attacks)
 */
export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Generowanie podpisu HMAC-SHA256 przy użyciu Web Crypto API
 */
async function computeHmacSha256(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Parsowanie ciasteczek z nagłówka Cookie
 */
export function parseCookies(cookieHeader: string | null): Record<string, string> {
  const list: Record<string, string> = {};
  if (!cookieHeader) return list;

  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    const name = parts[0]?.trim();
    if (!name) return;
    const value = parts.slice(1).join('=').trim();
    try {
      list[name] = decodeURIComponent(value);
    } catch {
      list[name] = value;
    }
  });

  return list;
}

/**
 * Tworzy wartość nagłówka Set-Cookie z podpisanym tokenem sesji
 */
export async function createSessionCookie(locals?: any, isSecure: boolean = true): Promise<string> {
  const secret = await getAuthSecret(locals);
  const issuedAt = Date.now().toString();
  const signature = await computeHmacSha256(issuedAt, secret);
  const token = `${issuedAt}.${signature}`;

  const securePart = isSecure ? ' Secure;' : '';
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE};${securePart}`;
}

/**
 * Tworzy nagłówek Set-Cookie unieważniający ciasteczko sesji
 */
export function clearSessionCookie(): string {
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

/**
 * Weryfikacja hasła logowania
 */
export async function verifyPassword(password: string, locals?: any): Promise<boolean> {
  if (!password || typeof password !== 'string') return false;
  const adminPassword = await getAdminPassword(locals);
  return constantTimeEqual(password.trim(), adminPassword.trim());
}

/**
 * Weryfikacja uprawnień administratora dla przychodzącego żądania HTTP
 */
export async function verifyAdminAuth(request: Request, locals?: any): Promise<boolean> {
  try {
    // 1. Sprawdzenie nagłówka Authorization lub X-Admin-Password (dla API / testów / curl)
    const authHeader = request.headers.get('Authorization') || request.headers.get('X-Admin-Password');
    if (authHeader) {
      const adminPassword = await getAdminPassword(locals);
      const provided = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();
      if (constantTimeEqual(provided, adminPassword)) {
        return true;
      }
    }

    // 2. Sprawdzenie ciasteczka sesji wenedzi_admin_session
    const cookieHeader = request.headers.get('Cookie');
    const cookies = parseCookies(cookieHeader);
    const token = cookies[SESSION_COOKIE_NAME];
    if (!token) return false;

    const parts = token.split('.');
    if (parts.length !== 2) return false;

    const [issuedAtStr, signatureHex] = parts;
    const issuedAt = parseInt(issuedAtStr, 10);
    if (isNaN(issuedAt)) return false;

    const now = Date.now();
    // Sesja ważna 30 dni, dopuszczenie 60 sekund rozjazdu zegara
    if (now - issuedAt > SESSION_MAX_AGE * 1000 || issuedAt > now + 60000) {
      return false;
    }

    const secret = await getAuthSecret(locals);
    const expectedSignature = await computeHmacSha256(issuedAtStr, secret);

    return constantTimeEqual(signatureHex, expectedSignature);
  } catch (err) {
    console.error('Błąd podczas weryfikacji autoryzacji:', err);
    return false;
  }
}
