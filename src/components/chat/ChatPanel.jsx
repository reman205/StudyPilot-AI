import { useEffect, useMemo, useState } from 'react';
import { Bot, Send, Sparkles, Trash2, User } from 'lucide-react';

const QUICK_ACTIONS = [
  {
    id: 'explain',
    label: 'Explain this slide',
    buildPrompt: (course) =>
      `Explain the current slide from ${course?.name || 'this course'} in a simple way.`,
  },
  {
    id: 'summary',
    label: 'Summarize the course',
    buildPrompt: (course) =>
      `Summarize the most important ideas in ${course?.name || 'this course'}.`,
  },
  {
    id: 'example',
    label: 'Give me an example',
    buildPrompt: (course) =>
      `Give me a clear practical example related to ${course?.name || 'this course'}.`,
  },
  {
    id: 'quiz',
    label: 'Quiz me',
    buildPrompt: (course) =>
      `Ask me one multiple-choice question about ${course?.name || 'this course'}.`,
  },
];

function makeInitialMessages(course, language) {
  const isArabic = language === 'ar';

  return [
    {
      id: `nova-welcome-${course?.id || 'course'}`,
      role: 'assistant',
      text: isArabic
        ? `مرحبًا! أنا Nova. اسأليني أي سؤال عن مقرر ${course?.name || 'هذا المقرر'}.`
        : `Hi! I’m Nova. Ask me anything about ${course?.name || 'this course'}.`,
      createdAt: new Date().toISOString(),
    },
  ];
}

function safeReadMessages(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;

    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function buildLocalReply({ question, course, language }) {
  const isArabic = language === 'ar';
  const normalized = question.toLowerCase();

  if (normalized.includes('quiz') || normalized.includes('اختبر')) {
    return isArabic
      ? `سؤال سريع عن ${course?.name || 'المقرر'}: ما الفكرة الأساسية التي لاحظتِ تكرارها في الشرائح؟`
      : `Quick check for ${course?.name || 'the course'}: What main idea appears repeatedly across the slides?`;
  }

  if (normalized.includes('summary') || normalized.includes('لخص')) {
    const summary = isArabic
      ? course?.summaryArabic
      : course?.summaryEnglish;

    return (
      summary ||
      (isArabic
        ? 'الملخص غير متاح بعد. ارفعي ملف PDF وحلليه بواسطة Nova أولًا.'
        : 'A course summary is not available yet. Upload and analyze a PDF first.')
    );
  }

  if (normalized.includes('example') || normalized.includes('مثال')) {
    const example = isArabic
      ? course?.slides?.[0]?.exampleArabic
      : course?.slides?.[0]?.exampleEnglish;

    return (
      example ||
      (isArabic
        ? 'لا يوجد مثال جاهز بعد، لكن بعد تحليل الملف ستظهر أمثلة مرتبطة بالمحتوى.'
        : 'No generated example is available yet. Analyze the PDF to create course-based examples.')
    );
  }

  const firstSlide = course?.slides?.[0];
  const explanation = isArabic
    ? firstSlide?.explanationArabic
    : firstSlide?.explanationEnglish;

  return (
    explanation ||
    (isArabic
      ? 'هذه نسخة المحادثة المحلية الأولى. في الخطوة التالية سنربطها بخادم Nova ليجيب اعتمادًا على ملف المقرر.'
      : 'This is the first local chat version. Next, we will connect it to Nova Server so answers come from the uploaded course PDF.')
  );
}

export default function ChatPanel({ course, language = 'en' }) {
  const storageKey = useMemo(
    () => `spv3_chat_${course?.id || 'unknown'}`,
    [course?.id],
  );

  const initialMessages = useMemo(
    () => makeInitialMessages(course, language),
    [course?.id, course?.name, language],
  );

  const [messages, setMessages] = useState(() =>
    safeReadMessages(storageKey, initialMessages),
  );
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setMessages(safeReadMessages(storageKey, initialMessages));
  }, [storageKey, initialMessages]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, storageKey]);

  async function sendMessage(customText) {
    const text = (customText ?? input).trim();

    if (!text || sending) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => [...current, userMessage]);
    setInput('');
    setSending(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const assistantMessage = {
      id: `nova-${Date.now()}`,
      role: 'assistant',
      text: buildLocalReply({
        question: text,
        course,
        language,
      }),
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => [...current, assistantMessage]);
    setSending(false);
  }

  function clearChat() {
    const resetMessages = makeInitialMessages(course, language);
    setMessages(resetMessages);
    localStorage.setItem(storageKey, JSON.stringify(resetMessages));
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendMessage();
  }

  return (
    <section className="courseChat">
      <header className="courseChatHeader">
        <div className="courseChatIdentity">
          <div className="courseChatAvatar">
            <Bot />
          </div>

          <div>
            <span className="eyebrow">Chat with Course</span>
            <h2>Nova</h2>
            <p>
              {language === 'ar'
                ? `اسألي أي سؤال عن ${course?.name || 'هذا المقرر'}`
                : `Ask anything about ${course?.name || 'this course'}`}
            </p>
          </div>
        </div>

        <button
          className="secondary"
          type="button"
          onClick={clearChat}
        >
          <Trash2 />
          {language === 'ar' ? 'مسح المحادثة' : 'Clear chat'}
        </button>
      </header>

      <div className="courseChatSuggestions">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => sendMessage(action.buildPrompt(course))}
            disabled={sending}
          >
            <Sparkles />
            {action.label}
          </button>
        ))}
      </div>

      <div className="courseChatMessages">
        {messages.map((message) => (
          <article
            className={`courseChatMessage ${message.role}`}
            key={message.id}
          >
            <div className="courseChatMessageIcon">
              {message.role === 'assistant' ? <Bot /> : <User />}
            </div>

            <div className="courseChatBubble">
              <strong>
                {message.role === 'assistant'
                  ? 'Nova'
                  : language === 'ar'
                    ? 'أنتِ'
                    : 'You'}
              </strong>

              <p>{message.text}</p>
            </div>
          </article>
        ))}

        {sending && (
          <article className="courseChatMessage assistant">
            <div className="courseChatMessageIcon">
              <Bot />
            </div>

            <div className="courseChatBubble">
              <strong>Nova</strong>
              <p className="courseChatTyping">
                {language === 'ar'
                  ? 'Nova تكتب الآن...'
                  : 'Nova is typing...'}
              </p>
            </div>
          </article>
        )}
      </div>

      <form className="courseChatComposer" onSubmit={handleSubmit}>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={
            language === 'ar'
              ? 'اكتبي سؤالك عن المقرر...'
              : 'Ask a question about this course...'
          }
          rows="3"
        />

        <button
          className="primary"
          type="submit"
          disabled={!input.trim() || sending}
        >
          <Send />
          {language === 'ar' ? 'إرسال' : 'Send'}
        </button>
      </form>
    </section>
  );
}