import Link from "next/link";

export default function Myapp() {
  return (
    <div className="home-page">

      <div className="home-bg-grid" />

      <div className="home-content">
        <div className="home-title-container">
          <h1 className="home-title">Mindframe</h1>
        </div>

        <p className="home-tagline">Organize your day with a single prompt.</p>

        <div className="home-button-container">
          <Link href="/login_page">
            <button className="home-button">
              <span className="home-button-text">JOIN</span>
              <span className="home-button-icon">→</span>
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
}
