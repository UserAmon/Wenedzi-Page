// Skrypt do pobierania 5 najnowszych postów z Facebooka ze zdjęciami (bez loga) i synchronizacji do Cloudflare D1
import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';

const FB_PAGE_URL = 'https://www.facebook.com/wenedzi/';
const BAD_MEDIA_IDS = new Set(['100067095955939', '241908756183484', '100070016604132']);

function decodeUnicode(str) {
  return str
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
    .replace(/\\\//g, '/');
}

async function run() {
  console.log('🔄 Pobieranie najnowszych postów ze strony Facebooka...');
  const res = await fetch(FB_PAGE_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      'Accept-Language': 'pl-PL,pl;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });

  if (!res.ok) {
    throw new Error(`Facebook zwrócił status HTTP ${res.status}`);
  }

  const html = await res.text();
  console.log(`📄 Pobrany HTML: ${html.length} bajtów.`);

  const posts = [];
  let cur = 0;

  while (cur < html.length) {
    const found = html.indexOf('"message":{"text":', cur);
    if (found === -1) break;
    cur = found + 18;

    const windowChunk = html.slice(found, found + 15000);
    const msgMatch = windowChunk.match(/"message":\s*\{\s*"text":\s*"((?:[^"\\]|\\.)*)"\}/);
    if (!msgMatch) continue;

    const text = decodeUnicode(msgMatch[1]).trim();
    if (text.length < 15) continue;

    if (posts.some((p) => p.content.slice(0, 50) === text.slice(0, 50))) continue;

    const context = html.slice(Math.max(0, found - 5000), Math.min(html.length, found + 25000));
    const searchRange = html.slice(Math.max(0, found - 25000), Math.min(html.length, found + 25000));
    const timeMatches = [...searchRange.matchAll(/"creation_time":\s*([0-9]{10})/g)].map((m) => ({
      timestamp: parseInt(m[1]),
      dist: Math.abs(25000 - searchRange.indexOf(m[0])),
    }));
    timeMatches.sort((a, b) => a.dist - b.dist);
    const bestTime = timeMatches[0]?.timestamp;
    const createdAt = bestTime ? new Date(bestTime * 1000).toISOString() : new Date().toISOString();

    const urlMatch = context.match(/"url":\s*"(https:\\\/\\\/www\.facebook\.com\\\/wenedzi\\\/posts\\\/[^"]+?)"/);
    const permalink = urlMatch ? urlMatch[1].replace(/\\\//g, '/') : FB_PAGE_URL;

    const mediaIdMatches = [
      ...context.matchAll(/media_id=([0-9]+)/g),
      ...context.matchAll(/"Photo","id":"([0-9]+)"/g),
      ...context.matchAll(/"Photo","__isNode":"Photo","id":"([0-9]+)"/g),
    ].map((m) => m[1]);

    const uniqueMediaIds = [...new Set(mediaIdMatches)].filter((id) => !BAD_MEDIA_IDS.has(id));
    const photos = uniqueMediaIds.slice(0, 4).map((id) => `/api/fb-image?id=${id}`);
    const postId = permalink.match(/posts\/([a-zA-Z0-9_-]+)/)?.[1] || `fb-${bestTime || Date.now()}-${posts.length}`;

    posts.push({
      id: `fb-${postId}`,
      content: text,
      created_at: createdAt,
      fb_permalink: permalink,
      fb_post_id: postId,
      photos: photos,
    });
  }

  posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const top5 = posts.slice(0, 5);

  console.log(`✅ Znaleziono ${top5.length} najnowszych postów:`);
  top5.forEach((p, idx) => {
    console.log(`  ${idx + 1}. [${p.created_at.slice(0, 10)}] ${p.content.slice(0, 60)}... (${p.photos.length} zdjęć)`);
  });

  // Generujemy plik SQL do zaaplikowania do bazy D1
  const sqlStatements = [
    `DELETE FROM posts WHERE source = 'facebook';`,
  ];

  for (const p of top5) {
    const escId = p.id.replace(/'/g, "''");
    const escContent = p.content.replace(/'/g, "''");
    const escImages = JSON.stringify(p.photos).replace(/'/g, "''");
    const escFbId = p.fb_post_id.replace(/'/g, "''");
    const escLink = p.fb_permalink.replace(/'/g, "''");
    const escDate = p.created_at.replace(/'/g, "''");

    sqlStatements.push(`INSERT INTO posts (id, source, title, content, images_json, fb_post_id, fb_permalink, author_name, is_pinned, created_at, updated_at)
VALUES ('${escId}', 'facebook', NULL, '${escContent}', '${escImages}', '${escFbId}', '${escLink}', '3 SDH Wenedzi (Facebook)', 0, '${escDate}', datetime('now'));`);
  }

  const tmpSqlPath = './temp-sync-fb.sql';
  writeFileSync(tmpSqlPath, sqlStatements.join('\n\n'), 'utf8');

  try {
    if (typeof process.loadEnvFile === 'function') {
      try { process.loadEnvFile(); } catch {}
    }
  } catch {}

  console.log('🚀 Zapisywanie 5 postów w bazie Cloudflare D1 (remote)...');
  try {
    const envVars = process.env.CLOUDFLARE_API_TOKEN
      ? `CLOUDFLARE_ACCOUNT_ID="${process.env.CLOUDFLARE_ACCOUNT_ID || ''}" CLOUDFLARE_API_TOKEN="${process.env.CLOUDFLARE_API_TOKEN}"`
      : '';
    const cmd = `${envVars ? envVars + ' ' : ''}npx wrangler d1 execute wenedzi-db --remote --yes --file=${tmpSqlPath}`;
    execSync(cmd, { stdio: 'inherit' });
    console.log('🎉 Sukces! 5 najnowszych postów z Facebooka ze zdjęciami (bez loga) zostało zapisanych w bazie D1!');
  } finally {
    try {
      unlinkSync(tmpSqlPath);
    } catch {}
  }
}

run().catch((err) => {
  console.error('❌ Błąd synchronizacji:', err);
  process.exit(1);
});
