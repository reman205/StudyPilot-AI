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


const chatResponseSchema = {
  type: 'OBJECT',
  properties: {
    mainIdea: { type: 'STRING' },
    detailedExplanation: { type: 'STRING' },
    example: { type: 'STRING' },
    commonMistake: { type: 'STRING' },
    examTip: { type: 'STRING' },
    quickQuiz: {
      type: 'OBJECT',
      properties: {
        question: { type: 'STRING' },
        options: {
          type: 'ARRAY',
          items: { type: 'STRING' },
          minItems: 4,
          maxItems: 4,
        },
        correctAnswerIndex: {
          type: 'INTEGER',
          minimum: 0,
          maximum: 3,
        },
        explanation: { type: 'STRING' },
      },
      required: [
        'question',
        'options',
        'correctAnswerIndex',
        'explanation',
      ],
    },
    nextStep: { type: 'STRING' },
    sources: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          pageNumber: { type: 'INTEGER' },
          title: { type: 'STRING' },
        },
        required: ['pageNumber', 'title'],
      },
    },
    suggestedFollowUps: {
      type: 'ARRAY',
      items: { type: 'STRING' },
    },
  },
  required: [
    'mainIdea',
    'detailedExplanation',
    'example',
    'commonMistake',
    'examTip',
    'quickQuiz',
    'nextStep',
    'sources',
    'suggestedFollowUps',
  ],
};

function buildCourseChatContext(course) {
  const slides = Array.isArray(course?.slides)
    ? course.slides.slice(0, 30)
    : [];

  return {
    courseName: String(course?.name || 'Untitled course').slice(0, 140),
    summaryEnglish: String(course?.summaryEnglish || '').slice(0, 5000),
    summaryArabic: String(course?.summaryArabic || '').slice(0, 5000),
    slides: slides.map((slide, index) => ({
      pageNumber: Number(slide?.pageNumber) || index + 1,
      title: String(slide?.title || `Slide ${index + 1}`).slice(0, 300),
      keyPoints: Array.isArray(slide?.keyPoints)
        ? slide.keyPoints.slice(0, 8).map((point) => String(point).slice(0, 800))
        : [],
      explanationEnglish: String(slide?.explanationEnglish || '').slice(0, 2500),
      explanationArabic: String(slide?.explanationArabic || '').slice(0, 2500),
      exampleEnglish: String(slide?.exampleEnglish || '').slice(0, 1500),
      exampleArabic: String(slide?.exampleArabic || '').slice(0, 1500),
    })),
  };
}

function sanitizeChatResult(data) {
  const sources = Array.isArray(data?.sources)
    ? data.sources
        .filter((source) => source && typeof source === 'object')
        .slice(0, 6)
        .map((source) => ({
          pageNumber: Number(source.pageNumber) || 1,
          title: String(source.title || 'Course slide').slice(0, 240),
        }))
    : [];

  const options =
    Array.isArray(data?.quickQuiz?.options) &&
    data.quickQuiz.options.length === 4
      ? data.quickQuiz.options.map((option) =>
          String(option).slice(0, 500),
        )
      : ['Option A', 'Option B', 'Option C', 'Option D'];

  const correctAnswerIndex =
    Number.isInteger(data?.quickQuiz?.correctAnswerIndex)
      ? Math.max(0, Math.min(3, data.quickQuiz.correctAnswerIndex))
      : 0;

  return {
    mainIdea:
      String(data?.mainIdea || '').trim() ||
      'The uploaded material does not provide enough information for a clear main idea.',
    detailedExplanation:
      String(data?.detailedExplanation || '').trim() ||
      'A detailed explanation could not be generated from the available course content.',
    example:
      String(data?.example || '').trim() ||
      'No supported example was found in the uploaded material.',
    commonMistake:
      String(data?.commonMistake || '').trim() ||
      'No specific common mistake was identified from the course content.',
    examTip:
      String(data?.examTip || '').trim() ||
      'Focus on the definitions, relationships, and examples shown in the lecture.',
    quickQuiz: {
      question:
        String(data?.quickQuiz?.question || '').trim() ||
        'Which statement best matches the main idea?',
      options,
      correctAnswerIndex,
      explanation:
        String(data?.quickQuiz?.explanation || '').trim() ||
        'Review the main idea and compare it with each option.',
    },
    nextStep:
      String(data?.nextStep || '').trim() ||
      'Review the cited slides, then ask Nova for another example.',
    sources,
    suggestedFollowUps: Array.isArray(data?.suggestedFollowUps)
      ? data.suggestedFollowUps
          .slice(0, 4)
          .map((item) => String(item).slice(0, 220))
      : [],
  };
}

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


app.post('/api/chat-course', async (req, res) => {
  try {
    if (!API_KEY) {
      return jsonError(
        res,
        500,
        'GEMINI_API_KEY is missing from .env.',
      );
    }

    const question = String(req.body?.question || '').trim();
    const followUpPatterns = [
  /^ليش/i,
  /^كيف/i,
  /^وضح/i,
  /^اشرح أكثر/i,
  /^ما فهمت/i,
  /^اعطني مثال/i,
  /^أعطني مثال/i,
  /^مثال/i,
  /^قارن/i,
  /^طيب/i,
  /^طيب ليش/i,
  /^why/i,
  /^how/i,
  /^explain more/i,
  /^another example/i,
  /^compare/i,
];

const isFollowUp = followUpPatterns.some((pattern) =>
  pattern.test(question),
);

    const language = ['ar', 'en', 'bilingual'].includes(
      req.body?.language,
    )
      ? req.body.language
      : 'bilingual';

    const profile =
      req.body?.profile && typeof req.body.profile === 'object'
        ? req.body.profile
        : {};

    const conversationHistory = Array.isArray(
      req.body?.conversationHistory,
    )
      ? req.body.conversationHistory
          .slice(-10)
          .filter(
            (message) =>
              message &&
              ['user', 'assistant'].includes(message.role) &&
              typeof message.text === 'string',
          )
          .map((message) => ({
            role: message.role,
            text: message.text.slice(0, 4000),
          }))
      : [];

    if (!question) {
      return jsonError(
        res,
        400,
        'A course question is required.',
      );
    }

    if (question.length > 4000) {
      return jsonError(res, 400, 'The question is too long.');
    }

    const context = buildCourseChatContext(req.body?.course);

    if (!context.slides.length) {
      return jsonError(
        res,
        400,
        'The selected course has no analyzed slides.',
      );
    }

    const languageRule =
      language === 'ar'
        ? 'Answer in clear Arabic. Keep useful English technical terms in parentheses.'
        : language === 'en'
          ? 'Answer in clear English.'
          : 'Answer in the same language as the student. When helpful, include concise Arabic and English technical terminology.';

    const learnerContext = {
      name: String(profile?.name || 'Student').slice(0, 100),
      university: String(profile?.university || '').slice(0, 150),
      major: String(profile?.major || '').slice(0, 150),
      level: String(profile?.level || '').slice(0, 100),
      preferredLanguage: String(
        profile?.language || language,
      ).slice(0, 50),
      dailyStudyTime: String(
        profile?.dailyStudyTime || '',
      ).slice(0, 100),
    };

    const prompt = `
You are Nova, the personal AI tutor inside StudyPilot AI.

ROLE
You are not a general chatbot.
You are a patient and highly skilled university tutor.

Your goal is not only to answer.
Your goal is to help the student understand, remember, connect ideas, and prepare for exams.

GROUNDING RULES
- Use only the supplied uploaded-course context.
- Never invent facts, definitions, examples, relationships, or slide numbers.
- If the course material is insufficient, clearly say so.
- Cite only real page numbers and titles from the supplied context.
- Use recent conversation history to understand references such as:
  "it", "that idea", "explain it again", "make it simpler", and "give another example".
- When the student asks about a specific slide, focus on that slide first.
- Connect it to other slides only when the relationship is supported by the course.
- If the student says they did not understand, do not repeat the same wording.
  Change the teaching method using a simpler analogy, smaller steps, or a different example.

LEARNER PROFILE
${JSON.stringify(learnerContext)}

LANGUAGE RULE
${languageRule}

TEACHING STYLE
- Begin with the core idea in the simplest useful words.
- Explain step by step and in logical order.
- Define important technical terms the first time they appear.
- Connect each new idea to the previous one.
- Use short, readable paragraphs.
- Prefer concrete examples over abstract wording.
- When helpful, use phrases such as "Think of it like..." or "Imagine that...".
- Keep useful English technical terms inside Arabic explanations.
- Adapt the explanation to the learner's academic level.
- Focus on exam-relevant differences, keywords, and likely confusion points.
- Avoid robotic wording, vague filler, and unnecessary repetition.
- Make the response feel like a supportive private tutor.

CONVERSATION MODE

${
isFollowUp
? `
This is a FOLLOW-UP question.

The student is continuing the previous discussion.

Do NOT restart the full tutoring structure.

Do NOT repeat:
- Main Idea
- Detailed Explanation
- Example
- Exam Tip
- Quick Quiz
- Next Step

Answer ONLY what the student asked.

If they ask "Why?", explain only the reason.

If they ask for another example, provide only a new example.

If they ask to simplify, explain the same concept differently.

Speak naturally like ChatGPT.
`
: `
This is a NEW topic.

Return the complete tutoring structure.
`
}
COURSE CONTEXT
${JSON.stringify(context)}

RECENT CONVERSATION
${JSON.stringify(conversationHistory)}

STUDENT QUESTION
${question}
`;

    const model = await resolveModel();

    const endpoint =
      `https://generativelanguage.googleapis.com/v1beta/models/` +
      `${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(API_KEY)}`;

    const apiResponse = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: chatResponseSchema,
        },
      }),
    });

    const payload = await apiResponse.json().catch(() => ({}));

    if (!apiResponse.ok) {
      return jsonError(
        res,
        apiResponse.status,
        payload?.error?.message ||
          `Gemini chat request failed (${apiResponse.status}).`,
      );
    }

    const raw =
      payload?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!raw) {
      return jsonError(
        res,
        502,
        'Gemini returned an empty chat response.',
      );
    }

    let parsed;

    try {
      parsed = JSON.parse(raw);
    } catch {
      return jsonError(
        res,
        502,
        'Gemini returned invalid chat JSON.',
      );
    }

    return res.json({
      success: true,
      model,
      result: sanitizeChatResult(parsed),
    });
  } catch (error) {
    console.error('Course chat failed:', error);

    return jsonError(
      res,
      error?.status || 500,
      error?.message ||
        'Nova could not answer the course question.',
    );
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
