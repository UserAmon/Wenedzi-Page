import type { APIRoute } from 'astro';
import { getDriveFileResponse } from '../../lib/drive';

export const GET: APIRoute = async ({ url }) => {
  const id = url.searchParams.get('id');
  if (!id) {
    return new Response('Brak identyfikatora pliku (id)', { status: 400 });
  }

  try {
    return await getDriveFileResponse(id);
  } catch (err: any) {
    console.error('Błąd serwowania zdjęcia z Google Drive:', err);
    return new Response(err.message || 'Błąd pobierania zdjęcia z Dysku Google', {
      status: 500,
    });
  }
};
