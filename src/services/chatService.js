const API_URL = 'http://localhost:3001';

export async function askNovaAboutCourse({
  course,
  question,
  language = 'bilingual',
  conversationHistory = [],
  profile = null,
}) {
  if (!course?.slides?.length) {
    throw new Error(
      'Open an analyzed course before starting the chat.',
    );
  }

  if (!question?.trim()) {
    throw new Error('Write a question for Nova.');
  }

  let response;

  try {
    response = await fetch(`${API_URL}/api/chat-course`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        course: {
          id: course.id,
          name: course.name,
          summaryEnglish: course.summaryEnglish,
          summaryArabic: course.summaryArabic,
          slides: course.slides,
        },
        question: question.trim(),
        language,
        conversationHistory: conversationHistory
          .slice(-10)
          .map((message) => ({
            role: message.role,
            text:
              message.text ||
              message.mainIdea ||
              message.detailedExplanation ||
              '',
          })),
        profile,
      }),
    });
  } catch (error) {
    console.error('Course chat network error:', error);

    throw new Error(
      'Could not connect to Nova Server. Make sure "npm run server" is running on port 3001.',
    );
  }

  const responseText = await response.text();

  let payload = {};

  try {
    payload = responseText ? JSON.parse(responseText) : {};
  } catch {
    throw new Error(
      `Nova returned an unreadable chat response. Status: ${response.status}.`,
    );
  }

  if (!response.ok) {
    throw new Error(
      payload?.error ||
        payload?.details ||
        `Nova chat failed with status ${response.status}.`,
    );
  }

  if (!payload?.result?.mainIdea) {
    throw new Error(
      'Nova did not return a valid tutor response.',
    );
  }

  return payload.result;
}
