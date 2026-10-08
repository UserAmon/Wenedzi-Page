import type { APIRoute } from 'astro';
import { uploadImageToDrive, normalizeDateString } from '../../../lib/drive';

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const dateInput = (formData.get('date') as string) || new Date().toISOString().slice(0, 10);
    const targetDate = normalizeDateString(dateInput);

    // Pobierz wszystkie przesłane pliki (klucz 'files' lub 'file')
    const fileEntries = [
      ...formData.getAll('files'),
      ...formData.getAll('file'),
    ];

    const validFiles = fileEntries.filter(
      (entry): entry is File => entry instanceof File && entry.size > 0
    );

    if (validFiles.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Nie przesłano żadnych plików graficznych.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const uploaded = [];
    for (const file of validFiles) {
      const buffer = await file.arrayBuffer();
      const res = await uploadImageToDrive(buffer, file.name, file.type, targetDate);
      uploaded.push(res);
    }

    return new Response(
      JSON.stringify({
        success: true,
        folderName: uploaded[0]?.folderName || targetDate,
        folderId: uploaded[0]?.folderId,
        files: uploaded,
        count: uploaded.length,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('Błąd uploadu na Google Drive:', err);
    return new Response(
      JSON.stringify({
        success: false,
        error: err.message || 'Wystąpił błąd podczas uploadu na Dysk Google',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
