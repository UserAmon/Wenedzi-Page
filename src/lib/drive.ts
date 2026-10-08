// Google Drive Integration for 3 SDH Wenedzi
// Folder główny 'Foty': 1q_BnktblfpDlu-9OLf4jlO_KcUsECGp9

export const GOOGLE_DRIVE_ROOT_FOLDER_ID = '1q_BnktblfpDlu-9OLf4jlO_KcUsECGp9';

const SERVICE_ACCOUNT = {
  client_email: 'wenedzi-bot@boreal-analog-369208.iam.gserviceaccount.com',
  private_key: `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCdemvjDRq9Vbk8
4stiG8RIJA1QdIPEYGDC34z+nYhC1BLA7rfmVA8Fr31u251gXJ1nUAkNE+bDNjag
7Dv07MY1J0Iv5tfOmbn7wyS/TWNS5R6WVfcqkegaStQapBlviwjMurZTBghWlOOx
7PEsOOwkqdWpHFwbt0UhHvqHSZQbK/i23aHpoqYOktgeJtGAP84XaQ2ebUl4h2F2
sSQLY83J5GeSaC8QeRea7aDab5E/Qox3k7g2WeMw7Y+uh7RUKNdbCMo+mHOPrHZL
mOsLeec8ypAIpshp3MqZBZBbb+O8djhLEOILiN3SmCjBt0N26C79/5dVBTk26q+K
kkxlKFdrAgMBAAECggEABPn0ZNVqLeeClgj4sl38QudYwF0eONtu01mrI/SodKws
94nTp+SqINzd0t3/yCbFFpmx34bseOjCqy0r6957mPxnnAnoce/rr6gIBj+Uzu7M
m6WVzPOVaRdKQplC8IJtQcL4tgDvzISh+WJqcKJP3Ay94r0xr/KHrbdD5XiOxJj/
b1haoI5h6JgGxlXnR+Hu/FJYcpUbqc1xr5PrIIYTQx+MBhnLG/1qPd2D5XqMKQBV
yWeKBEoFGCAf1pD6AQSGO7+7iryA6TiJIP6zrrC3ulQ6YtIGkyb2i3+skCh+StXc
Nc5e4inWCGEL6cCE/38Tucjx9t53w3BAF1rEYsR2iQKBgQDKQPnEeDu1EvvSimZa
gnTLjham6aOxuvo1ZpzSxaMv7mRK7M95XLpCtSeGWQc92TtocTfdBqzy5ieB+82P
qZk8EY/AC2RpFrEqLrm079p+kC0KiZRiV9lAVA+tLVPbn/UBZw9dBHAVI8NVwXJq
tXrBe4k2810dylbAmpFilmGwrwKBgQDHU22yEPvWCdA1XsMbqzGfvTKpV4P4C4mG
6i3xDD94AfegVkKmZqukp4DpD8DgXysDq7YKbVpxM4HyqlgsFWt7HTlYBHjvrtI3
CH80c9UBNJf+gZ3oVc9p03UzLXwFuNrTy5UmhbW/I2MwWlQU89oOGS+T81dvHvKt
mIEB2I9cBQKBgCXsCOjNomRRKuZPDOHrk/qWqaiiJg8s/70DgGQEqpRSHnvt6vjW
ahYX4VFPYAw4rurmT5MhrUvd24qDrAdDxXd903YurKUHnDBMkoVac51HayqOoUPP
NOza1hWiahbD5yxcJoVKT7mm+vkZTFq1rE6a2x9yggMT7TAvyxKxH6ABAoGAZAkX
5aUmbt5P82kSrIE3j37JvTlhzwwjQmWnFvHZrKX4HC0OmCqw/Brg1JcGatT4Zog3
/XWyTVvXXO1nAQDjB0+8ZtMfytLHR71o8e8sOMWnfqCYmnDufqMUj9HFC64hjOgA
e+vhMgNVlX/P8RANIMQ9H5iiCe/TRZJjNIT2Ne0CgYB8/d9Bf1Y7e3wI8YHx7qQw
cqHhp4agSc9Yjcew8Kdeslksoe8ECV4QLOQtUPPmS08KMW02xP6PVW4VLZ0lu68i
DgcHa/28lw/7kUUj+rVJMfcCnscpskKM8WKWQewocMCbfTnEU/RZr2xqRyacsrwk
Y9ODxWU8Yz857q9z1CKmaA==
-----END PRIVATE KEY-----`,
};

// Pomocnicze funkcje base64url dla Web Crypto API
function base64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64urlStr(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

let cachedToken: { token: string; expiresAt: number } | null = null;

// Pobieranie tokenu dostępu OAuth2 przez podpisanie JWT kluczem prywatnym
export async function getDriveAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.expiresAt > now + 60) {
    return cachedToken.token;
  }

  const pemContents = SERVICE_ACCOUNT.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s+/g, '');

  const binaryDerString = atob(pemContents);
  const binaryDer = new Uint8Array(binaryDerString.length);
  for (let i = 0; i < binaryDerString.length; i++) {
    binaryDer[i] = binaryDerString.charCodeAt(i);
  }

  const key = await crypto.subtle.importKey(
    'pkcs8',
    binaryDer.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: SERVICE_ACCOUNT.client_email,
    scope: 'https://www.googleapis.com/auth/drive',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const toSign = `${base64urlStr(JSON.stringify(header))}.${base64urlStr(JSON.stringify(claim))}`;
  const encoder = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    encoder.encode(toSign)
  );

  const jwt = `${toSign}.${base64url(signatureBuffer)}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google OAuth error: ${res.status} - ${errText}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    token: data.access_token,
    expiresAt: now + (data.expires_in || 3600),
  };

  return data.access_token;
}

// Normalizacja formatu daty do 'YYYY.MM.DD'
export function normalizeDateString(dateInput: string): string {
  const trimmed = dateInput.trim();
  // Jeśli podano 'YYYY-MM-DD', zamień na 'YYYY.MM.DD'
  const formatted = trimmed.replace(/-/g, '.');
  return formatted;
}

export interface DriveFolderInfo {
  folderId: string;
  folderName: string;
  isNewlyCreated: boolean;
}

// Wyszukiwanie folderu w 'Foty' na zasadzie 'contains':
// 1. Sprawdź czy jakikolwiek folder zawiera pełną datę (np. '2026.11.11' lub '2026.11.11 - Dzień...')
// 2. Jeśli nie, sprawdź czy jakikolwiek folder zawiera miesiąc (np. '2026.11')
// 3. Jeśli nie, stwórz nowy folder 'YYYY.MM.DD' w folderze głównym
export async function findOrCreateDateFolder(
  dateInput: string,
  parentFolderId = GOOGLE_DRIVE_ROOT_FOLDER_ID
): Promise<DriveFolderInfo> {
  const token = await getDriveAccessToken();
  const targetDate = normalizeDateString(dateInput);
  const parts = targetDate.split('.');
  const monthPrefix = parts.length >= 2 ? `${parts[0]}.${parts[1]}` : targetDate;

  // Pobierz listę podfolderów w parentFolderId
  const q = `'${parentFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
    q
  )}&supportsAllDrives=true&includeItemsFromAllDrives=true&fields=files(id,name)`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Błąd pobierania listy folderów z Google Drive: ${errText}`);
  }

  const data = (await res.json()) as { files?: { id: string; name: string }[] };
  const folders = data.files || [];

  // 1. Dopasowanie pełnej daty (contains)
  const fullDateMatch = folders.find((f) => f.name.includes(targetDate));
  if (fullDateMatch) {
    return {
      folderId: fullDateMatch.id,
      folderName: fullDateMatch.name,
      isNewlyCreated: false,
    };
  }

  // 2. Dopasowanie miesiąca (contains)
  const monthMatch = folders.find((f) => f.name.includes(monthPrefix));
  if (monthMatch) {
    return {
      folderId: monthMatch.id,
      folderName: monthMatch.name,
      isNewlyCreated: false,
    };
  }

  // 3. Tworzenie nowego folderu o nazwie targetDate
  const createRes = await fetch(
    'https://www.googleapis.com/drive/v3/files?supportsAllDrives=true',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: targetDate,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentFolderId],
      }),
    }
  );

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Błąd tworzenia folderu na Dysku Google: ${errText}`);
  }

  const newFolder = (await createRes.json()) as { id: string; name: string };
  return {
    folderId: newFolder.id,
    folderName: newFolder.name,
    isNewlyCreated: true,
  };
}

export interface UploadedDriveImage {
  fileId: string;
  fileName: string;
  folderId: string;
  folderName: string;
  proxyUrl: string;
  directUrl: string;
}

// Upload pojedynczego pliku graficznego do Google Drive
export async function uploadImageToDrive(
  fileBuffer: ArrayBuffer,
  fileName: string,
  mimeType: string,
  targetDate: string
): Promise<UploadedDriveImage> {
  const token = await getDriveAccessToken();
  const folderInfo = await findOrCreateDateFolder(targetDate);

  const boundary = '-------' + Math.random().toString(36).substring(2);
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelim = `\r\n--${boundary}--`;

  const metadata = {
    name: fileName,
    parents: [folderInfo.folderId],
    mimeType: mimeType || 'image/jpeg',
  };

  const metadataPart =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${metadata.mimeType}\r\n\r\n`;

  const enc = new TextEncoder();
  const metaBytes = enc.encode(metadataPart);
  const closeBytes = enc.encode(closeDelim);
  const fileBytes = new Uint8Array(fileBuffer);

  // Scalanie buforów w jeden ciągły Uint8Array
  const combined = new Uint8Array(metaBytes.length + fileBytes.length + closeBytes.length);
  combined.set(metaBytes, 0);
  combined.set(fileBytes, metaBytes.length);
  combined.set(closeBytes, metaBytes.length + fileBytes.length);

  const uploadRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: combined,
    }
  );

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`Błąd uploadu pliku na Dysk Google: ${errText}`);
  }

  const uploadedFile = (await uploadRes.json()) as { id: string; name: string };

  // Nadanie uprawnienia do publicznego odczytu (aby można było serwować zdjęcie)
  try {
    await fetch(
      `https://www.googleapis.com/drive/v3/files/${uploadedFile.id}/permissions?supportsAllDrives=true`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: 'reader', type: 'anyone' }),
      }
    );
  } catch (permErr) {
    console.warn('Ostrzeżenie: nie udało się nadać uprawnień publicznych (używamy proxy):', permErr);
  }

  return {
    fileId: uploadedFile.id,
    fileName: uploadedFile.name,
    folderId: folderInfo.folderId,
    folderName: folderInfo.folderName,
    proxyUrl: `/api/drive-image?id=${uploadedFile.id}`,
    directUrl: `https://lh3.googleusercontent.com/d/${uploadedFile.id}`,
  };
}

// Pobieranie binarnej zawartości pliku z Google Drive dla proxy
export async function getDriveFileResponse(fileId: string): Promise<Response> {
  const token = await getDriveAccessToken();

  // Najpierw pobierz metadane, aby poznać MIME type i nazwę pliku
  const metaRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?fields=name,mimeType&supportsAllDrives=true`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  let contentType = 'image/jpeg';
  if (metaRes.ok) {
    const meta = (await metaRes.json()) as { mimeType?: string };
    if (meta.mimeType) contentType = meta.mimeType;
  }

  // Pobierz zawartość binarną pliku
  const downloadRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&supportsAllDrives=true`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!downloadRes.ok) {
    return new Response('Nie znaleziono pliku na Dysku Google', { status: downloadRes.status });
  }

  return new Response(downloadRes.body, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
