import Link from "next/link";

export default function Myapp() {
  return (
    <div className="home-page">
      <div className="home-title-container">
        <h1 className="home-title">Mindframe</h1>
      </div>

      <div className="home-button-container">
        <Link href="/login_page">
          <button className="home-button">GET STARTED</button>
        </Link>
      </div>
      
    </div>
  );
}
