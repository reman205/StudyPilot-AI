export default function Analytics({
  courses = [],
  active,
  readiness = 0,
}) {
  const totalSlides = courses.reduce(
    (sum, course) => sum + (course.slides?.length || 0),
    0
  );

  const analyzedCourses = courses.filter(
    (course) => (course.slides?.length || 0) > 0
  ).length;

  const averageSlides =
    courses.length > 0
      ? Math.round(totalSlides / courses.length)
      : 0;

  return (
    <section className="stack">

      <div className="heading">
        <span className="eyebrow">
          Study Analytics
        </span>

        <h1>Learning Insights</h1>

        <p>
          Monitor your learning progress and stay ready for your exams.
        </p>
      </div>

      <div className="metrics">

        <article className="metric">
          <span>📚</span>
          <strong>{courses.length}</strong>
          <p>Total Courses</p>
        </article>

        <article className="metric">
          <span>📄</span>
          <strong>{totalSlides}</strong>
          <p>Total Slides</p>
        </article>

        <article className="metric">
          <span>🤖</span>
          <strong>{analyzedCourses}</strong>
          <p>AI Analyzed</p>
        </article>

        <article className="metric">
          <span>🎯</span>
          <strong>{readiness}%</strong>
          <p>Exam Readiness</p>
        </article>

      </div>

      <div className="courseGrid">

        <article className="courseCard">
          <h3>Current Course</h3>

          <p>
            {active ? active.name : "No course selected"}
          </p>

          <strong>
            {active?.slides?.length || 0} Slides
          </strong>
        </article>

        <article className="courseCard">
          <h3>Average Slides</h3>

          <strong>{averageSlides}</strong>

          <p>Per Course</p>
        </article>

        <article className="courseCard">
          <h3>Study Streak</h3>

          <strong>18 Days 🔥</strong>

          <p>Keep going!</p>
        </article>

      </div>

      <article className="info">

        <div className="infoTitle">
          <h3>Weekly Goal</h3>
        </div>

        <div
          style={{
            width: "100%",
            height: 14,
            background: "#e5e7eb",
            borderRadius: 999,
            overflow: "hidden",
            marginTop: 12,
          }}
        >
          <div
            style={{
              width: `${readiness}%`,
              height: "100%",
              background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
            }}
          />
        </div>

        <p style={{ marginTop: 12 }}>
          You're currently <strong>{readiness}%</strong> ready for your next
          exam.
        </p>

      </article>

    </section>
  );
}