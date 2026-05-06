import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="home-page">
      <div className="home-bg-grid" />
      <div className="login-content">
        <div className="login-header">
          <Link href="/" className="login-back-link">← Back</Link>
          <h1 className="login-title">Mindframe</h1>
          <p className="login-subtitle">Sign in to continue</p>
        </div>

        <div className="login-form-container">
          <SignIn />
        </div>
      </div>
    </div>
  );
}
