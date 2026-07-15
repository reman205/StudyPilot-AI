import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3001);
const API_KEY = process.env.GEMINI_API_KEY || '';
const CONFIGURED_MODEL = process.env.GEMINI_MODEL || 'gemini-flash-latest';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    callback(null, file.mimetype === 'application/pdf');
  },
});

app.use(cors());
app.use(express.json({ limit: '2mb' }));

function jsonError(response, status, message, details) {
  return response.status(status).json({ error: message, details });
}

async function listModels() {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(API_KEY)}`,
  );
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error?.message || 'Could not list Gemini models.');
  return Array.isArray(payload.models) ? payload.models : [];
}

async function resolveModel() {
  const models = await listModels();
  const usable = models.filter((model) =>
    model.supportedGenerationMethods?.includes('generateContent'),
  );

  const configuredName = CONFIGURED_MODEL.startsWith('models/')
    ? CONFIGURED_MODEL
    : `models/${CONFIGURED_MODEL}`;

  const configured = usable.find((model) => model.name === configuredName);
  if (configured) return configured.name.replace(/^models\//, '');

  const flash = usable.find((model) => /gemini.*flash/i.test(model.name));
  const fallback = flash || usable[0];
  if (!fallback) throw new Error('No Gemini model supporting generateContent is available for this API key.');
  return fallback.name.replace(/^models\//, '');
}

function buildCoursePrompt({ courseName, examDate, language }) {
  const languageRule = language === 'ar'
    ? 'Write learner-facing explanations in Arabic, keeping useful English technical terms in parentheses.'
    : language === 'en'
      ? 'Write learner-facing explanations in clear English.'
      : 'Provide both English and Arabic explanations. Keep useful technical terms in English inside Arabic text.';

  return `
You are Nova, the orchestrator of StudyPilot AI.
Analyze the attached university lecture PDF as a slide deck.

Course: ${courseName || 'Untitled course'}
Exam date: ${examDate || 'Not provided'}
Language rule: ${languageRule}

Return a structured learning package for up to the first 30 pages. Treat each PDF page as one slide.
For every page return:
- page number
- concise title
- 3 to 6 key points grounded in the page
- English explanation
- Arabic explanation
- English example
- Arabic example
- one common mistake in English and Arabic
- one multiple-choice quick check with exactly four options and a zero-based correct answer index

Also return:
- a short course summary in English and Arabic
- 5 to 10 flashcards
- a practical study plan of 3 to 7 days
- workflow notes for Atlas, Clarity, Quanta, Orbit, and Sentinel

Do not invent unsupported facts. If a page is mostly an image, diagram, table, or Arabic text, use visual document understanding instead of relying only on extracted text.
`;
}

const responseSchema = {
  type: 'OBJECT',
  properties: {
    courseTitle: { type: 'STRING' },
    summaryEnglish: { type: 'STRING' },
    summaryArabic: { type: 'STRING' },
    slides: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          pageNumber: { type: 'INTEGER' },
          title: { type: 'STRING' },
          keyPoints: { type: 'ARRAY', items: { type: 'STRING' } },
          explanationEnglish: { type: 'STRING' },
          explanationArabic: { type: 'STRING' },
          exampleEnglish: { type: 'STRING' },
          exampleArabic: { type: 'STRING' },
          commonMistakeEnglish: { type: 'STRING' },
          commonMistakeArabic: { type: 'STRING' },
          quickCheck: {
            type: 'OBJECT',
            properties: {
              question: { type: 'STRING' },
              options: { type: 'ARRAY', items: { type: 'STRING' }, minItems: 4, maxItems: 4 },
              correctAnswerIndex: { type: 'INTEGER', minimum: 0, maximum: 3 },
              explanation: { type: 'STRING' },
            },
            required: ['question', 'options', 'correctAnswerIndex', 'explanation'],
          },
        },
        required: [
          'pageNumber', 'title', 'keyPoints', 'explanationEnglish', 'explanationArabic',
          'exampleEnglish', 'exampleArabic', 'commonMistakeEnglish', 'commonMistakeArabic', 'quickCheck',
        ],
      },
    },
    flashcards: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: { front: { type: 'STRING' }, back: { type: 'STRING' } },
        required: ['front', 'back'],
      },
    },
    studyPlan: { type: 'ARRAY', items: { type: 'STRING' } },
    agentTrace: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: { agent: { type: 'STRING' }, message: { type: 'STRING' } },
        required: ['agent', 'message'],
      },
    },
  },
  required: [
    'courseTitle', 'summaryEnglish', 'summaryArabic', 'slides', 'flashcards', 'studyPlan', 'agentTrace',
  ],
};

async function analyzePdfWithModel({ model, file, courseName, examDate, language }) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(API_KEY)}`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        role: 'user',
        parts: [
          { inlineData: { mimeType: 'application/pdf', data: file.buffer.toString('base64') } },
          { text: buildCoursePrompt({ courseName, examDate, language }) },
        ],
      }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema,
      },
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload?.error?.message || `Gemini request failed (${response.status}).`);
    error.status = response.status;
    throw error;
  }
  const raw = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new Error('Gemini returned an empty response.');
  return JSON.parse(raw);
}

function sanitizeAnalysis(data, fallbackName) {
  const slides = Array.isArray(data?.slides) ? data.slides : [];
  return {
    courseTitle: data?.courseTitle || fallbackName || 'Untitled course',
    summaryEnglish: data?.summaryEnglish || '',
    summaryArabic: data?.summaryArabic || '',
    slides: slides.map((slide, index) => {
      const options = Array.isArray(slide?.quickCheck?.options) && slide.quickCheck.options.length === 4
        ? slide.quickCheck.options
        : ['Option A', 'Option B', 'Option C', 'Option D'];
      const answer = Number.isInteger(slide?.quickCheck?.correctAnswerIndex)
        ? Math.max(0, Math.min(3, slide.quickCheck.correctAnswerIndex))
        : 0;
      return {
        pageNumber: Number(slide?.pageNumber) || index + 1,
        title: slide?.title || `Slide ${index + 1}`,
        keyPoints: Array.isArray(slide?.keyPoints) ? slide.keyPoints : [],
        explanationEnglish: slide?.explanationEnglish || 'Explanation unavailable.',
        explanationArabic: slide?.explanationArabic || 'الشرح غير متاح.',
        exampleEnglish: slide?.exampleEnglish || 'Example unavailable.',
        exampleArabic: slide?.exampleArabic || 'المثال غير متاح.',
        commonMistakeEnglish: slide?.commonMistakeEnglish || '',
        commonMistakeArabic: slide?.commonMistakeArabic || '',
        quickCheck: {
          question: slide?.quickCheck?.question || 'Quick check',
          options,
          correctAnswerIndex: answer,
          explanation: slide?.quickCheck?.explanation || '',
        },
      };
    }),
    flashcards: Array.isArray(data?.flashcards) ? data.flashcards : [],
    studyPlan: Array.isArray(data?.studyPlan) ? data.studyPlan : [],
    agentTrace: Array.isArray(data?.agentTrace) ? data.agentTrace : [],
  };
}

app.get('/', async (_req, res) => {
  let model = CONFIGURED_MODEL;
  try {
    if (API_KEY) model = await resolveModel();
  } catch {
    // health route should still respond
  }
  res.json({
    status: 'StudyPilot AI Server Running',
    geminiConfigured: Boolean(API_KEY),
    model,
  });
});

app.post('/api/analyze-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!API_KEY) return jsonError(res, 500, 'GEMINI_API_KEY is missing from .env.');
    if (!req.file) return jsonError(res, 400, 'A PDF file is required.');

    const courseName = String(req.body.courseName || req.file.originalname.replace(/\.pdf$/i, '')).slice(0, 120);
    const examDate = String(req.body.examDate || '').slice(0, 30);
    const language = ['ar', 'en', 'bilingual'].includes(req.body.language) ? req.body.language : 'bilingual';
    const model = await resolveModel();
    const result = await analyzePdfWithModel({ model, file: req.file, courseName, examDate, language });
    const analysis = sanitizeAnalysis(result, courseName);

    return res.json({
      success: true,
      model,
      file: { name: req.file.originalname, size: req.file.size },
      result: analysis,
    });
  } catch (error) {
    console.error('PDF analysis failed:', error);
    return jsonError(res, error?.status || 500, error?.message || 'Nova failed to analyze the PDF.');
  }
});

app.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    return jsonError(res, 413, 'The PDF must be smaller than 25 MB.');
  }
  console.error(error);
  return jsonError(res, 500, error?.message || 'Unexpected server error.');
});

app.listen(PORT, () => {
  console.log(`Nova Server running on http://localhost:${PORT}`);
  console.log(`Gemini configured: ${API_KEY ? 'Yes' : 'No'}`);
  console.log(`Configured model: ${CONFIGURED_MODEL}`);
});
