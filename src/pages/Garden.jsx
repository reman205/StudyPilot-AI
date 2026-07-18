function getPlantStage(progress) {
  if (progress >= 100) {
    return {
      icon: "🌳",
      name: "Mastered",
      message: "This course is fully grown.",
    };
  }

  if (progress >= 70) {
    return {
      icon: "🌲",
      name: "Strong Tree",
      message: "Excellent progress. You are close to mastery.",
    };
  }

  if (progress >= 40) {
    return {
      icon: "🌿",
      name: "Growing Plant",
      message: "Your knowledge is growing steadily.",
    };
  }

  if (progress >= 15) {
    return {
      icon: "🌱",
      name: "Young Sprout",
      message: "A good start. Keep studying.",
    };
  }

  return {
    icon: "🫘",
    name: "New Seed",
    message: "Begin studying to grow this course.",
  };
}

export default function Garden({
  courses = [],
  active,
  readiness = 0,
}) {
  const totalSlides = courses.reduce(
    (sum, course) => sum + (course.slides?.length || 0),
    0
  );

  const totalXP = courses.reduce((sum, course) => {
    const slides = course.slides?.length || 0;
    return sum + slides * 25;
  }, 0);

  const gardenLevel = Math.max(1, Math.floor(totalXP / 250) + 1);
  const currentLevelXP = totalXP % 250;
  const nextLevelProgress = Math.round((currentLevelXP / 250) * 100);

  function calculateCourseProgress(course) {
    const slideCount = course.slides?.length || 0;

    if (slideCount === 0) {
      return 0;
    }

    if (course.id === active?.id) {
      return Math.max(10, Math.min(100, readiness));
    }

    return Math.min(100, 25 + slideCount * 5);
  }

  return (
    <section className="stack">
      <div className="heading">
        <span className="eyebrow">Learning Garden</span>

        <h1>🌳 Your Learning Garden</h1>

        <p>
          Every course, slide, and study session helps your garden grow.
        </p>
      </div>

      <div className="metrics">
        <article className="metric">
          <span>⭐</span>
          <strong>{totalXP}</strong>
          <p>Total XP</p>
        </article>

        <article className="metric">
          <span>🌿</span>
          <strong>Level {gardenLevel}</strong>
          <p>Garden Level</p>
        </article>

        <article className="metric">
          <span>📚</span>
          <strong>{courses.length}</strong>
          <p>Growing Courses</p>
        </article>

        <article className="metric">
          <span>📄</span>
          <strong>{totalSlides}</strong>
          <p>Learning Seeds</p>
        </article>
      </div>

      <article className="info">
        <div className="infoTitle">
          <span>🌟</span>
          <h3>Level Progress</h3>
        </div>

        <p>
          Earn XP by uploading courses and studying lecture slides.
        </p>

        <div className="gardenProgressTrack">
          <div
            className="gardenProgressFill"
            style={{ width: `${nextLevelProgress}%` }}
          />
        </div>

        <div className="gardenProgressText">
          <span>{currentLevelXP} XP</span>
          <span>250 XP</span>
        </div>
      </article>

      {courses.length === 0 ? (
        <article className="empty">
          <div className="tree">🫘</div>

          <h2>Your garden is waiting</h2>

          <p>
            Upload your first course to plant your first learning seed.
          </p>
        </article>
      ) : (
        <div className="garden">
          {courses.map((course) => {
            const progress = calculateCourseProgress(course);
            const stage = getPlantStage(progress);

            return (
              <article className="gardenCard" key={course.id}>
                <div className="tree" aria-hidden="true">
                  {stage.icon}
                </div>

                <span className="eyebrow">{stage.name}</span>

                <h3>{course.name}</h3>

                <p>{stage.message}</p>

                <div className="gardenProgressTrack">
                  <div
                    className="gardenProgressFill"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="gardenProgressText">
                  <strong>{progress}% Complete</strong>

                  <span>
                    {course.slides?.length || 0} slides
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}