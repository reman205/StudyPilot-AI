import {
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Plus,
  Upload,
} from 'lucide-react';

export default function Dashboard({
  t,
  user,
  courses,
  active,
  readiness,
  onAdd,
  onOpen,
}) {
  return (
  <>
    <section className="stack">
    <div className="dashboardHero">
  <div className="dashboardHeroContent">
    <span className="dashboardBadge">
      ✨ StudyPilot AI
    </span>

    <h1>
      Welcome back, {user} 👋
    </h1>

    <p>
      Continue building your knowledge.
      Nova has prepared your next study session.
    </p>

    <div className="dashboardActions">
      <button
        className="primary"
        onClick={active ? () => onOpen(active.id) : onAdd}
      >
        Continue Learning
      </button>

      <button className="secondary" onClick={onAdd}>
        <Plus />
        New Course
      </button>
    </div>
  </div>

  <div className="dashboardQuickStats">
    <div className="quickCard">
      <span>🔥</span>
      <strong>18</strong>
      <small>Day Streak</small>
    </div>

    <div className="quickCard">
      <span>⭐</span>
      <strong>2140</strong>
      <small>XP</small>
    </div>

    <div className="quickCard">
      <span>📚</span>
      <strong>{courses.length}</strong>
      <small>Courses</small>
    </div>

    <div className="quickCard">
      <span>🌱</span>
      <strong>Lv.5</strong>
      <small>Garden</small>
    </div>
  </div>
</div>

      <article className="hero">
        <div>
          <span className="eyebrow">Nova Orchestrator</span>

          <h2>{active?.name || t.noCourses}</h2>

          <p>
            {active
              ? `${active.slides.length} ${t.slides}`
              : 'PDF → Nova → Agents → Learning package'}
          </p>
        </div>

        <button
          className="primary"
          onClick={active ? () => onOpen(active.id) : onAdd}
        >
          {active ? t.open : t.add}
        </button>
      </article>
      <div className="dashboardGrid">

  <article className="focusCard">
  <span className="eyebrow">🎯 Today's Focus</span>

  <h2>{active?.name || "No Active Course"}</h2>

  <div className="progressLine">
    <div
      className="progressFill"
      style={{ width: `${readiness}%` }}
    />
  </div>

  <p>{readiness}% Exam Readiness</p>

  <div className="focusButtons">
    <button
      className="primary"
      onClick={active ? () => onOpen(active.id) : onAdd}
    >
      Continue Learning
    </button>

    <button className="secondary">
      Generate Quiz
    </button>
  </div>
</article>

  <article className="focusCard">
  <span className="eyebrow">🤖 Nova Recommendation</span>

  <h2>Next Best Action</h2>

  <ul className="recommendList">
    <li>Review Slide 2</li>
    <li>Generate 10 Quiz Questions</li>
    <li>Practice Flashcards</li>
    <li>Study for 20 minutes</li>
  </ul>

  <button className="secondary">
    Ask Nova
  </button>
</article>

</div>
<div className="quickActions">

  <button className="actionCard" onClick={onAdd}>
    <span>📄</span>
    <strong>Upload PDF</strong>
    <small>Add a new lecture</small>
  </button>

  <button className="actionCard">
    <span>🧠</span>
    <strong>Generate Quiz</strong>
    <small>Create practice questions</small>
  </button>

  <button className="actionCard">
    <span>📝</span>
    <strong>Flashcards</strong>
    <small>Quick revision</small>
  </button>

  <button className="actionCard">
    <span>🤖</span>
    <strong>Ask Nova</strong>
    <small>Chat with your AI tutor</small>
  </button>

</div>
<div className="analyticsRow">

  <article className="analyticsCard">
    <span className="eyebrow">📈 Weekly Progress</span>

    <div className="bars">

      <div className="bar"><span style={{height:"35%"}}></span><small>Mon</small></div>
      <div className="bar"><span style={{height:"60%"}}></span><small>Tue</small></div>
      <div className="bar"><span style={{height:"50%"}}></span><small>Wed</small></div>
      <div className="bar"><span style={{height:"80%"}}></span><small>Thu</small></div>
      <div className="bar"><span style={{height:"70%"}}></span><small>Fri</small></div>
      <div className="bar"><span style={{height:"95%"}}></span><small>Sat</small></div>
      <div className="bar"><span style={{height:"65%"}}></span><small>Sun</small></div>

    </div>

  </article>

  <article className="analyticsCard">
    <span className="eyebrow">🌱 Study Garden</span>

    <div className="gardenPreview">

      🌱

      <h2>Level 5</h2>

      <p>
        Keep studying daily to grow your garden.
      </p>

    </div>

  </article>

</div>
      <div className="metrics">
        <Metric
          icon={<CheckCircle2 />}
          label="Exam readiness"
          value={`${readiness}%`}
        />

        <Metric
          icon={<BookOpen />}
          label="Active courses"
          value={courses.length}
        />

        <Metric
          icon={<BrainCircuit />}
          label="AI agents"
          value="6"
        />
      </div>

      <div className="sectionTitle">
        <div>
          <h2>{t.courses}</h2>
          <p>Your analyzed lecture files.</p>
        </div>

        <button className="secondary" onClick={onAdd}>
          <Plus />
          {t.add}
        </button>
      </div>

      {courses.length ? (
        <div className="courseGrid">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              t={t}
              onOpen={onOpen}
            />
          ))}
        </div>
      ) : (
        <Empty t={t} onAdd={onAdd} />
      )}
    </section>
    </>
  );
}

function Metric({ icon, label, value }) {
  return (
    <article className="metric">
      <div>{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function Empty({ t, onAdd }) {
  return (
    <div className="empty">
      <Upload />
      <h2>{t.noCourses}</h2>

      <button className="primary" onClick={onAdd}>
        {t.add}
      </button>
    </div>
  );
}

function CourseCard({ course, t, onOpen }) {
  return (
    <article className="courseCard">

  <div className="courseHeader">
    <div>
      <span className="courseTag">Active Course</span>
      <h3>{course.name}</h3>
    </div>

    <span className="coursePercent">
      {course.progress}%
    </span>
  </div>

  <div className="progressLine">
    <div
      className="progressFill"
      style={{ width: `${course.progress}%` }}
    />
  </div>

  <div className="courseInfo">
    <span>📚 {course.slides.length} Slides</span>
    <span>📝 Quiz Ready</span>
  </div>

  <div className="courseActions">
    <button
      className="primary"
      onClick={() => onOpen(course.id)}
    >
      Continue
    </button>

    <button className="secondary">
      Summary
    </button>

    <button className="secondary">
      Quiz
    </button>
  </div>

</article>
  );
}