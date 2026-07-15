import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen, BrainCircuit, CheckCircle2, ChevronLeft, ChevronRight,
  FileText, GraduationCap, Home, Languages, LogOut, Moon, Play,
  Plus, Settings, Sparkles, Sun, Upload, X,
} from 'lucide-react';
import { analyzePdf, getServerHealth } from './services/api';
import Onboarding from './pages/Onboarding';
import { clearProfile, getProfile } from './services/profileStorage';
import ChatPanel from './components/chat/ChatPanel';

const copy = {
  en: {
    dashboard: 'Dashboard', courses: 'Courses', workspace: 'AI Workspace', agents: 'Agents', settings: 'Settings',
    welcome: 'Welcome back', subtitle: 'Turn lecture PDFs into explanations, quizzes, flashcards, and study plans.',
    add: 'Add course', open: 'Open course', noCourses: 'Upload your first lecture PDF to begin.',
    slides: 'slides', analyze: 'Analyze PDF with Nova', previous: 'Previous', next: 'Next',
    explanation: 'Nova explanation', keyPoints: 'Key points', example: 'Example', mistake: 'Common mistake',
    quickCheck: 'Quick check', show: 'Show answer', hide: 'Hide answer', summary: 'Course summary',
    flashcards: 'Flashcards', plan: 'Study plan', run: 'Run workflow', logout: 'Sign out',
  },
  ar: {
    dashboard: 'لوحة التحكم', courses: 'المقررات', workspace: 'مساحة التعلم', agents: 'الوكلاء', settings: 'الإعدادات',
    welcome: 'مرحبًا بعودتك', subtitle: 'حوّلي ملفات المحاضرات إلى شرح واختبارات وبطاقات وخطة مذاكرة.',
    add: 'إضافة مقرر', open: 'فتح المقرر', noCourses: 'ارفعي أول ملف محاضرة PDF للبدء.',
    slides: 'شريحة', analyze: 'تحليل PDF بواسطة Nova', previous: 'السابق', next: 'التالي',
    explanation: 'شرح Nova', keyPoints: 'النقاط المهمة', example: 'مثال', mistake: 'خطأ شائع',
    quickCheck: 'تحقق سريع', show: 'إظهار الإجابة', hide: 'إخفاء الإجابة', summary: 'ملخص المقرر',
    flashcards: 'بطاقات المراجعة', plan: 'خطة المذاكرة', run: 'تشغيل سير العمل', logout: 'تسجيل الخروج',
  },
};

function safeCourses() {
  try {
    const value = JSON.parse(localStorage.getItem('spv3_courses') || '[]');
    return Array.isArray(value) ? value.filter(Boolean) : [];
  } catch { return []; }
}

export default function App() {
  const [profile, setProfile] = useState(() => getProfile());
  const [user, setUser] = useState(() => {
    const savedProfile = getProfile();
    return savedProfile?.name || localStorage.getItem('spv3_user') || '';
  });
  const [lang, setLang] = useState(() => localStorage.getItem('spv3_lang') || 'en');
  const [theme, setTheme] = useState(() => localStorage.getItem('spv3_theme') || 'light');
  const [page, setPage] = useState('dashboard');
  const [courses, setCourses] = useState(safeCourses);
  const [activeId, setActiveId] = useState(() => localStorage.getItem('spv3_active') || '');
  const [slideIndex, setSlideIndex] = useState(0);
  const [modal, setModal] = useState(false);
  const [server, setServer] = useState({ status: 'checking' });
  const t = copy[lang];
  const active = courses.find((course) => course.id === activeId) || courses[0] || null;

  useEffect(() => { localStorage.setItem('spv3_courses', JSON.stringify(courses)); }, [courses]);
  useEffect(() => { localStorage.setItem('spv3_lang', lang); document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'; }, [lang]);
  useEffect(() => { localStorage.setItem('spv3_theme', theme); document.documentElement.dataset.theme = theme; }, [theme]);
  useEffect(() => { if (activeId) localStorage.setItem('spv3_active', activeId); }, [activeId]);
  useEffect(() => { getServerHealth().then(setServer).catch(() => setServer({ status: 'offline' })); }, []);

  const readiness = useMemo(() => active ? Math.min(95, 35 + Math.round((active.slides?.length || 0) * 1.5)) : 0, [active]);

  if (!profile) {
    return (
      <Onboarding
        onComplete={(newProfile) => {
          const value = newProfile.name?.trim() || 'Student';

          setProfile(newProfile);
          setUser(value);
          localStorage.setItem('spv3_user', value);

          // واجهة الموقع تدعم العربية أو الإنجليزية.
          setLang(newProfile.language === 'ar' ? 'ar' : 'en');
        }}
      />
    );
  }

  function openCourse(id) { setActiveId(id); setSlideIndex(0); setPage('workspace'); }
  function addCourse(course) { setCourses((current) => [course, ...current]); setActiveId(course.id); setSlideIndex(0); setModal(false); setPage('workspace'); }
  function removeCourse(id) { const next = courses.filter((course) => course.id !== id); setCourses(next); setActiveId(next[0]?.id || ''); setPage('courses'); }

  return <div className="shell">
    <aside className="sidebar">
      <div className="brand"><div className="brandMark"><GraduationCap /></div><div><strong>StudyPilot AI</strong><small>Multi-Agent Learning System</small></div></div>
      <nav>
        {[
          ['dashboard', Home, t.dashboard], ['courses', BookOpen, t.courses], ['workspace', FileText, t.workspace],
          ['agents', BrainCircuit, t.agents], ['settings', Settings, t.settings],
        ].map(([id, Icon, label]) => <button key={id} disabled={id === 'workspace' && !active} className={page === id ? 'active' : ''} onClick={() => setPage(id)}><Icon />{label}</button>)}
      </nav>
      <div className="serverStatus"><span className={server.status === 'StudyPilot AI Server Running' ? 'online' : 'offline'} /><div><strong>Nova Server</strong><small>{server.status === 'StudyPilot AI Server Running' ? `${server.model} connected` : 'Offline'}</small></div></div>
    </aside>
    <main>
      <header className="topbar"><div><strong>{profile?.name || user}</strong><small>{profile?.major || 'AI Student'}{profile?.university ? ` • ${profile.university}` : ''}</small></div><div className="topActions"><select value={lang} onChange={(e) => setLang(e.target.value)}><option value="en">English</option><option value="ar">العربية</option></select><button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>{theme === 'light' ? <Moon /> : <Sun />}</button></div></header>
      <div className="content">
        {page === 'dashboard' && <Dashboard t={t} user={profile?.name || user} courses={courses} active={active} readiness={readiness} onAdd={() => setModal(true)} onOpen={openCourse} />}
        {page === 'courses' && <Courses t={t} courses={courses} onAdd={() => setModal(true)} onOpen={openCourse} />}
        {page === 'workspace' && active && <Workspace t={t} course={active} index={slideIndex} setIndex={setSlideIndex} lang={lang} onDelete={() => removeCourse(active.id)} />}
        {page === 'agents' && <Agents t={t} course={active} />}
        {page === 'settings' && <SettingsPage t={t} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} onLogout={() => {
          clearProfile();
          localStorage.removeItem('spv3_user');
          setProfile(null);
          setUser('');
        }} />}
      </div>
    </main>
    {modal && <UploadModal t={t} lang={lang} onClose={() => setModal(false)} onCreate={addCourse} />}
  </div>;
}


function Dashboard({ t, user, courses, active, readiness, onAdd, onOpen }) {
  return <section className="stack"><div className="heading"><span className="eyebrow">Study workspace</span><h1>{t.welcome}, {user}</h1><p>{t.subtitle}</p></div><article className="hero"><div><span className="eyebrow">Nova Orchestrator</span><h2>{active?.name || t.noCourses}</h2><p>{active ? `${active.slides.length} ${t.slides}` : 'PDF → Nova → Agents → Learning package'}</p></div><button className="primary" onClick={active ? () => onOpen(active.id) : onAdd}>{active ? t.open : t.add}</button></article><div className="metrics"><Metric icon={<CheckCircle2 />} label="Exam readiness" value={`${readiness}%`} /><Metric icon={<BookOpen />} label="Active courses" value={courses.length} /><Metric icon={<BrainCircuit />} label="AI agents" value="6" /></div><div className="sectionTitle"><div><h2>{t.courses}</h2><p>Your analyzed lecture files.</p></div><button className="secondary" onClick={onAdd}><Plus />{t.add}</button></div>{courses.length ? <div className="courseGrid">{courses.map((course) => <CourseCard key={course.id} course={course} t={t} onOpen={onOpen} />)}</div> : <Empty t={t} onAdd={onAdd} />}</section>;
}
function Courses({ t, courses, onAdd, onOpen }) { return <section className="stack"><div className="heading row"><div><span className="eyebrow">Course library</span><h1>{t.courses}</h1><p>Upload lecture PDFs and let Gemini understand text, diagrams, tables, and Arabic content.</p></div><button className="primary" onClick={onAdd}><Upload />{t.add}</button></div>{courses.length ? <div className="courseGrid">{courses.map((course) => <CourseCard key={course.id} course={course} t={t} onOpen={onOpen} />)}</div> : <Empty t={t} onAdd={onAdd} />}</section>; }
function Metric({ icon, label, value }) { return <article className="metric"><div>{icon}</div><span>{label}</span><strong>{value}</strong></article>; }
function Empty({ t, onAdd }) { return <div className="empty"><Upload /><h2>{t.noCourses}</h2><button className="primary" onClick={onAdd}>{t.add}</button></div>; }
function CourseCard({ course, t, onOpen }) { return <article className="courseCard"><div className="courseTop"><div className="courseMark">{course.name.slice(0, 2).toUpperCase()}</div><span>AI analyzed</span></div><h3>{course.name}</h3><p>{course.slides.length} {t.slides} · {course.model}</p><button className="secondary" onClick={() => onOpen(course.id)}>{t.open}<ChevronRight /></button></article>; }

function Workspace({ t, course, index, setIndex, lang, onDelete }) {
  const [activeTab, setActiveTab] = useState('slides');
  const [showAnswer, setShowAnswer] = useState(false);

  const slide = course?.slides?.[index];
  const arabic = lang === 'ar';

  useEffect(() => {
    setShowAnswer(false);
  }, [index]);

  useEffect(() => {
    setActiveTab('slides');
  }, [course?.id]);

  return (
    <section className="workspace">
      <div className="workspaceBar">
        <div>
          <span className="eyebrow">{course.name}</span>

          <strong>
            {activeTab === 'slides'
              ? `${t.slides} ${index + 1}/${course.slides.length}`
              : arabic
                ? 'محادثة المقرر'
                : 'Course Chat'}
          </strong>
        </div>

        <button className="dangerText" onClick={onDelete}>
          {arabic ? 'حذف المقرر' : 'Delete course'}
        </button>
      </div>

      <div className="workspaceTabs" role="tablist">
        <button
          className={activeTab === 'slides' ? 'active' : ''}
          type="button"
          onClick={() => setActiveTab('slides')}
        >
          <FileText />
          {arabic ? 'الشرائح' : 'Slides'}
        </button>

        <button
          className={activeTab === 'chat' ? 'active' : ''}
          type="button"
          onClick={() => setActiveTab('chat')}
        >
          <BrainCircuit />
          {arabic ? 'المحادثة' : 'Chat'}
        </button>
      </div>

      {activeTab === 'chat' ? (
        <ChatPanel course={course} language={lang} />
      ) : !slide ? (
        <div className="empty">
          <h2>Slide unavailable</h2>
        </div>
      ) : (
        <>
          <div className="workspaceGrid">
            <article className="slidePanel">
              <div className="slideSheet">
                <span className="slideNumber">
                  {String(slide.pageNumber).padStart(2, '0')}
                </span>

                <span className="eyebrow">{course.name}</span>
                <h1>{slide.title}</h1>

                <ul>
                  {slide.keyPoints.map((point, pointIndex) => (
                    <li key={pointIndex}>{point}</li>
                  ))}
                </ul>
              </div>

              <div className="slideNav">
                <button
                  className="secondary"
                  disabled={index === 0}
                  onClick={() => setIndex(index - 1)}
                >
                  <ChevronLeft />
                  {t.previous}
                </button>

                <div className="dots">
                  {course.slides.map((_, slideNumber) => (
                    <button
                      key={slideNumber}
                      className={slideNumber === index ? 'active' : ''}
                      onClick={() => setIndex(slideNumber)}
                    />
                  ))}
                </div>

                <button
                  className="primary"
                  disabled={index === course.slides.length - 1}
                  onClick={() => setIndex(index + 1)}
                >
                  {t.next}
                  <ChevronRight />
                </button>
              </div>
            </article>

            <aside className="explanation">
              <div className="agentHeader">
                <div className="novaAvatar">N</div>

                <div>
                  <strong>{t.explanation}</strong>
                  <small>Clarity · Explanation Agent</small>
                </div>
              </div>

              <Info title={t.explanation} icon={<Sparkles />}>
                <p className={arabic ? 'rtl' : ''}>
                  {arabic
                    ? slide.explanationArabic
                    : slide.explanationEnglish}
                </p>
              </Info>

              <Info title={t.keyPoints} icon={<BookOpen />}>
                <ul>
                  {slide.keyPoints.map((point, pointIndex) => (
                    <li key={pointIndex}>{point}</li>
                  ))}
                </ul>
              </Info>

              <Info title={t.example} icon={<FileText />}>
                <p className={arabic ? 'rtl' : ''}>
                  {arabic ? slide.exampleArabic : slide.exampleEnglish}
                </p>
              </Info>

              <Info title={t.mistake} icon={<BrainCircuit />}>
                <p className={arabic ? 'rtl' : ''}>
                  {arabic
                    ? slide.commonMistakeArabic
                    : slide.commonMistakeEnglish}
                </p>
              </Info>

              <div className="quiz">
                <span className="eyebrow">{t.quickCheck}</span>
                <h3>{slide.quickCheck.question}</h3>

                {slide.quickCheck.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="option">
                    {String.fromCharCode(65 + optionIndex)}. {option}
                  </div>
                ))}

                <button
                  className="secondary full"
                  onClick={() => setShowAnswer((current) => !current)}
                >
                  {showAnswer ? t.hide : t.show}
                </button>

                {showAnswer && (
                  <p className="answer">
                    <CheckCircle2 />
                    {
                      slide.quickCheck.options[
                        slide.quickCheck.correctAnswerIndex
                      ]
                    }{' '}
                    — {slide.quickCheck.explanation}
                  </p>
                )}
              </div>
            </aside>
          </div>

          <div className="learningExtras">
            <Info title={t.summary} icon={<BookOpen />}>
              <p>
                {lang === 'ar'
                  ? course.summaryArabic
                  : course.summaryEnglish}
              </p>
            </Info>

            <Info title={t.flashcards} icon={<Languages />}>
              <div className="flashcards">
                {course.flashcards.map((card, cardIndex) => (
                  <article key={cardIndex}>
                    <strong>{card.front}</strong>
                    <p>{card.back}</p>
                  </article>
                ))}
              </div>
            </Info>

            <Info title={t.plan} icon={<Play />}>
              <ol>
                {course.studyPlan.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ol>
            </Info>
          </div>
        </>
      )}
    </section>
  );
}
function Info({ title, icon, children }) { return <article className="info"><div className="infoTitle">{icon}<h3>{title}</h3></div>{children}</article>; }

function Agents({ t, course }) {
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const agents = course?.agentTrace?.length ? course.agentTrace : [
    { agent: 'Nova', message: 'Waiting for a course PDF.' }, { agent: 'Atlas', message: 'Document analyst ready.' },
    { agent: 'Clarity', message: 'Explanation agent ready.' }, { agent: 'Quanta', message: 'Quiz agent ready.' },
    { agent: 'Orbit', message: 'Planner agent ready.' }, { agent: 'Sentinel', message: 'Evaluation agent ready.' },
  ];
  async function run() { if (running) return; setRunning(true); setLogs([]); for (const item of agents) { await new Promise((r) => setTimeout(r, 550)); setLogs((v) => [...v, item]); } setRunning(false); }
  return <section className="stack"><div className="heading row"><div><span className="eyebrow">AI Agents Bootcamp</span><h1>Multi-agent workflow</h1><p>Transparent orchestration across document understanding, explanation, assessment, planning, and evaluation.</p></div><button className="primary" disabled={!course || running} onClick={run}><Play />{running ? 'Running...' : t.run}</button></div><div className="agentGrid">{agents.map((item, i) => <article key={i}><div>{item.agent[0]}</div><h3>{item.agent}</h3><p>{item.message}</p></article>)}</div><article className="logPanel"><h2>Execution logs</h2>{logs.length ? logs.map((item, i) => <div className="logRow" key={i}><span /><strong>{item.agent}</strong><p>{item.message}</p></div>) : <p>Run the workflow to replay the agent trace.</p>}</article></section>;
}
function SettingsPage({ t, lang, setLang, theme, setTheme, onLogout }) { return <section className="stack"><div className="heading"><span className="eyebrow">Personalization</span><h1>{t.settings}</h1></div><article className="settings"><label>Language<select value={lang} onChange={(e) => setLang(e.target.value)}><option value="en">English</option><option value="ar">العربية</option></select></label><label>Theme<select value={theme} onChange={(e) => setTheme(e.target.value)}><option value="light">Light</option><option value="dark">Dark</option></select></label><button className="danger" onClick={onLogout}><LogOut />{t.logout}</button></article></section>; }

function UploadModal({ t, lang, onClose, onCreate }) {
  const [name, setName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(e) {
    e.preventDefault();
    if (!file || file.type !== 'application/pdf' || file.size > 25 * 1024 * 1024) { setError('Choose a PDF smaller than 25 MB.'); return; }
    setBusy(true); setError('');
    try {
      const payload = await analyzePdf({ file, courseName: name, examDate, language: lang === 'ar' ? 'ar' : 'bilingual' });
      const result = payload.result;
      onCreate({
        id: `course-${Date.now()}`,
        name: result.courseTitle || name || file.name.replace(/\.pdf$/i, ''),
        examDate,
        fileName: file.name,
        model: payload.model,
        summaryEnglish: result.summaryEnglish,
        summaryArabic: result.summaryArabic,
        slides: result.slides,
        flashcards: result.flashcards,
        studyPlan: result.studyPlan,
        agentTrace: result.agentTrace,
        createdAt: new Date().toISOString(),
      });
    } catch (err) { setError(err instanceof Error ? err.message : 'Analysis failed.'); }
    finally { setBusy(false); }
  }
  return <div className="modalBackdrop"><form className="modal" onSubmit={submit}><div className="modalHead"><div><span className="eyebrow">Native Gemini PDF understanding</span><h2>{t.add}</h2></div><button type="button" onClick={onClose}><X /></button></div><label>Course name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. AI Agent Security" /></label><label>Exam date<input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} /></label><label className="dropzone"><Upload /><strong>{file?.name || 'Choose lecture PDF'}</strong><span>Maximum 25 MB · Arabic, English, diagrams, and tables supported</span><input hidden type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} /></label>{error && <p className="error">{error}</p>}<button className="primary full" disabled={busy}>{busy ? 'Nova and the agents are analyzing the PDF...' : t.analyze}</button></form></div>;
}