const API_URL = 'http://localhost:3001';

export async function analyzePdf({
  file,
  courseName,
  examDate,
  language = 'bilingual',
}) {
  if (!file) {
    throw new Error('Please select a PDF file first.');
  }

  if (file.type !== 'application/pdf') {
    throw new Error('Only PDF files are supported.');
  }

  const maxFileSize = 25 * 1024 * 1024;

  if (file.size > maxFileSize) {
    throw new Error('The PDF must be smaller than 25 MB.');
  }

  const form = new FormData();

  form.append('pdf', file);
  form.append('courseName', courseName?.trim() || '');
  form.append('examDate', examDate || '');
  form.append('language', language);

  const endpoint = `${API_URL}/api/analyze-pdf`;

  console.log('Sending PDF to Nova:', {
    endpoint,
    fileName: file.name,
    fileSize: file.size,
    language,
  });

  let response;

  try {
    response = await fetch(endpoint, {
      method: 'POST',
      body: form,
    });
  } catch (error) {
    console.error('Nova network request failed:', error);

    throw new Error(
      'Could not connect to Nova Server. Make sure "npm run server" is running on port 3001.',
    );
  }

  const responseText = await response.text();

  console.log('Nova response status:', response.status);
  console.log('Nova raw response:', responseText);

  let payload = {};

  if (responseText) {
    try {
      payload = JSON.parse(responseText);
    } catch (error) {
      console.error('Nova returned invalid JSON:', error);

      throw new Error(
        `Nova returned an unreadable response. Status: ${response.status}.`,
      );
    }
  }

  if (!response.ok) {
    const serverMessage =
      payload?.error ||
      payload?.details ||
      `PDF analysis failed with status ${response.status}.`;

    throw new Error(serverMessage);
  }

  if (!payload?.success || !payload?.result) {
    throw new Error(
      'Nova completed the request but did not return a valid analysis.',
    );
  }

  return payload;
}

export async function getServerHealth() {
  let response;

  try {
    response = await fetch(`${API_URL}/`);
  } catch (error) {
    console.error('Nova health request failed:', error);

    throw new Error(
      'Nova Server is not reachable on http://localhost:3001.',
    );
  }

  const responseText = await response.text();

  let payload = {};

  try {
    payload = responseText ? JSON.parse(responseText) : {};
  } catch {
    throw new Error('Nova Server returned an invalid health response.');
  }

  if (!response.ok) {
    throw new Error(
      payload?.error || 'Nova Server is unavailable.',
    );
  }

  return payload;
}