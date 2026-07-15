import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Bot,
  CheckCircle2,
  FileText,
  GraduationCap,
  Lightbulb,
  Send,
  Sparkles,
  Target,
  Trash2,
  User,
} from 'lucide-react';

import { askNovaAboutCourse } from '../../services/chatService';

const QUICK_ACTIONS = [
  {
    id: 'simple',
    labelEn: 'Explain simply',
    labelAr: 'اشرح ببساطة',
    promptEn: 'Explain the most important concept in a very simple way.',
    promptAr: 'اشرح أهم مفهوم في المقرر بطريقة بسيطة جدًا.',
  },
  {
    id: 'example',
    labelEn: 'Give another example',
    labelAr: 'أعطني مثالًا آخر',
    promptEn: 'Give me another clear example from this course.',
    promptAr: 'أعطني مثالًا آخر واضحًا من هذا المقرر.',
  },
  {
    id: 'exam',
    labelEn: 'Exam-focused review',
    labelAr: 'مراجعة للاختبار',
    promptEn: 'Explain the most important exam points from this course.',
    promptAr: 'اشرح أهم النقاط المتوقعة في الاختبار من هذا المقرر.',
  },
  {
    id: 'quiz',
    labelEn: 'Quiz me',
    labelAr: 'اختبرني',
    promptEn: 'Quiz me on one important concept from this course.',
    promptAr: 'اختبرني في مفهوم مهم من هذا المقرر.',
  },
];

function getStoredProfile() {
  try {
    const value = localStorage.getItem('studypilot_profile');
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function makeWelcomeMessage(course, language) {
  const arabic = language === 'ar';

  return {
    id: `nova-welcome-${course?.id || 'course'}`,
    role: 'assistant',
    text: arabic
      ? `مرحبًا! أنا Nova، مدرسك الشخصي لمقرر ${course?.name || 'هذا المقرر'}. اسأليني عن أي مفهوم وسأشرحه خطوة بخطوة.`
      : `Hi! I’m Nova, your personal tutor for ${course?.name || 'this course'}. Ask me about any concept and I’ll explain it step by step.`,
    createdAt: new Date().toISOString(),
  };
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

function TutorSection({ icon, title, children, className = '' }) {
  return (
    <section className={`novaTutorSection ${className}`}>
      <header>
        {icon}
        <h3>{title}</h3>
      </header>

      <div>{children}</div>
    </section>
  );
}

export default function ChatPanel({ course, language = 'en' }) {
  const arabic = language === 'ar';

  const storageKey = useMemo(
    () => `spv3_chat_${course?.id || 'unknown'}`,
    [course?.id],
  );

  const welcomeMessage = useMemo(
    () => makeWelcomeMessage(course, language),
    [course?.id, course?.name, language],
  );

  const [messages, setMessages] = useState(() =>
    safeReadMessages(storageKey, [welcomeMessage]),
  );

  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [revealedAnswers, setRevealedAnswers] = useState({});

  useEffect(() => {
    setMessages(safeReadMessages(storageKey, [welcomeMessage]));
    setRevealedAnswers({});
  }, [storageKey, welcomeMessage]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, storageKey]);

  async function sendMessage(customText) {
    const text = (customText ?? input).trim();

    if (!text || sending) return;

    const previousMessages = messages;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => [...current, userMessage]);
    setInput('');
    setSending(true);

    try {
      const result = await askNovaAboutCourse({
        course,
        question: text,
        language: arabic ? 'ar' : 'bilingual',
        conversationHistory: previousMessages,
        profile: getStoredProfile(),
      });

      const assistantMessage = {
        id: `nova-${Date.now()}`,
        role: 'assistant',
        ...result,
        text: [
          result.mainIdea,
          result.detailedExplanation,
          result.example,
        ]
          .filter(Boolean)
          .join('\n\n'),
        createdAt: new Date().toISOString(),
      };

      setMessages((current) => [...current, assistantMessage]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: `nova-error-${Date.now()}`,
          role: 'assistant',
          text:
            error instanceof Error
              ? error.message
              : 'Nova could not answer this question.',
          isError: true,
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  function clearChat() {
    const reset = [makeWelcomeMessage(course, language)];
    setMessages(reset);
    setRevealedAnswers({});
    localStorage.setItem(storageKey, JSON.stringify(reset));
  }

  function toggleAnswer(messageId) {
    setRevealedAnswers((current) => ({
      ...current,
      [messageId]: !current[messageId],
    }));
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
            <span className="eyebrow">Nova Tutor v2</span>
            <h2>{arabic ? 'اسأل Nova' : 'Chat with Nova'}</h2>
            <p>
              {arabic
                ? `شرح مخصص اعتمادًا على مقرر ${course?.name || ''}`
                : `Personalized tutoring grounded in ${course?.name || 'your course'}`}
            </p>
          </div>
        </div>

        <button className="secondary" type="button" onClick={clearChat}>
          <Trash2 />
          {arabic ? 'مسح المحادثة' : 'Clear chat'}
        </button>
      </header>

      <div className="courseChatSuggestions">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() =>
              sendMessage(arabic ? action.promptAr : action.promptEn)
            }
            disabled={sending}
          >
            <Sparkles />
            {arabic ? action.labelAr : action.labelEn}
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
                  : arabic
                    ? 'أنتِ'
                    : 'You'}
              </strong>

              {message.isError ? (
                <p className="courseChatError">{message.text}</p>
              ) : message.mainIdea ? (
                <div className="novaTutorCards">
                  <TutorSection
                    icon={<Lightbulb />}
                    title={arabic ? 'الفكرة الأساسية' : 'Main Idea'}
                    className="mainIdea"
                  >
                    <p>{message.mainIdea}</p>
                  </TutorSection>

                  <TutorSection
                    icon={<BookOpen />}
                    title={arabic ? 'الشرح بالتفصيل' : 'Detailed Explanation'}
                  >
                    <p>{message.detailedExplanation}</p>
                  </TutorSection>

                  <TutorSection
                    icon={<Sparkles />}
                    title={arabic ? 'مثال' : 'Example'}
                  >
                    <p>{message.example}</p>
                  </TutorSection>

                  <TutorSection
                    icon={<AlertTriangle />}
                    title={arabic ? 'خطأ شائع' : 'Common Mistake'}
                    className="warning"
                  >
                    <p>{message.commonMistake}</p>
                  </TutorSection>

                  <TutorSection
                    icon={<GraduationCap />}
                    title={arabic ? 'نصيحة للاختبار' : 'Exam Tip'}
                    className="examTip"
                  >
                    <p>{message.examTip}</p>
                  </TutorSection>

                  <TutorSection
                    icon={<CheckCircle2 />}
                    title={arabic ? 'سؤال سريع' : 'Quick Quiz'}
                    className="quizSection"
                  >
                    <h4>{message.quickQuiz?.question}</h4>

                    <div className="novaTutorOptions">
                      {message.quickQuiz?.options?.map(
                        (option, optionIndex) => (
                          <div key={optionIndex}>
                            {String.fromCharCode(65 + optionIndex)}. {option}
                          </div>
                        ),
                      )}
                    </div>

                    <button
                      className="secondary"
                      type="button"
                      onClick={() => toggleAnswer(message.id)}
                    >
                      {revealedAnswers[message.id]
                        ? arabic
                          ? 'إخفاء الإجابة'
                          : 'Hide answer'
                        : arabic
                          ? 'إظهار الإجابة'
                          : 'Show answer'}
                    </button>

                    {revealedAnswers[message.id] && (
                      <div className="novaTutorAnswer">
                        <strong>
                          {message.quickQuiz.options[
                            message.quickQuiz.correctAnswerIndex
                          ]}
                        </strong>

                        <p>{message.quickQuiz.explanation}</p>
                      </div>
                    )}
                  </TutorSection>

                  <TutorSection
                    icon={<ArrowRight />}
                    title={arabic ? 'الخطوة التالية' : 'Next Step'}
                    className="nextStep"
                  >
                    <p>{message.nextStep}</p>
                  </TutorSection>
                </div>
              ) : (
                <p>{message.text}</p>
              )}

              {Array.isArray(message.sources) &&
                message.sources.length > 0 && (
                  <div className="courseChatSources">
                    <strong>{arabic ? 'المصادر' : 'Sources'}</strong>

                    <div>
                      {message.sources.map((source, sourceIndex) => (
                        <span key={`${source.pageNumber}-${sourceIndex}`}>
                          <FileText />
                          {arabic ? 'الشريحة' : 'Slide'} {source.pageNumber}:{' '}
                          {source.title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {Array.isArray(message.suggestedFollowUps) &&
                message.suggestedFollowUps.length > 0 && (
                  <div className="courseChatFollowUps">
                    {message.suggestedFollowUps.map(
                      (suggestion, suggestionIndex) => (
                        <button
                          key={`${suggestion}-${suggestionIndex}`}
                          type="button"
                          onClick={() => sendMessage(suggestion)}
                          disabled={sending}
                        >
                          {suggestion}
                        </button>
                      ),
                    )}
                  </div>
                )}
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
                {arabic
                  ? 'Nova تبني الشرح خطوة بخطوة...'
                  : 'Nova is building your explanation step by step...'}
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
            arabic
              ? 'اسألي عن مفهوم، شريحة، مثال، أو مراجعة للاختبار...'
              : 'Ask about a concept, slide, example, or exam review...'
          }
          rows="3"
        />

        <button
          className="primary"
          type="submit"
          disabled={!input.trim() || sending}
        >
          <Send />
          {arabic ? 'إرسال' : 'Send'}
        </button>
      </form>
    </section>
  );
}