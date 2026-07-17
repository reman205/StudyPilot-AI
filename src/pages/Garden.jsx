export default function Garden() {
  return (
    <section className="stack">

      <div className="heading">
        <span className="eyebrow">Learning Garden</span>

        <h1>🌳 Your Learning Garden</h1>

        <p>
          Every completed course grows your garden.
        </p>
      </div>

      <div className="garden">

        <div className="gardenCard">
          <div className="tree">🌱</div>

          <h3>Software Engineering</h3>

          <p>12% Complete</p>
        </div>

        <div className="gardenCard">
          <div className="tree">🌿</div>

          <h3>Artificial Intelligence</h3>

          <p>43% Complete</p>
        </div>

        <div className="gardenCard">
          <div className="tree">🌳</div>

          <h3>Machine Learning</h3>

          <p>100% Complete</p>
        </div>

      </div>

    </section>
  );
}