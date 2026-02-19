import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="home-page">
      <div className="login-title-container">
        <h1 className="login-title">Welcome to Mindframe!</h1>
      </div>

      <div className="login-form-container">
        <SignIn />
      </div>
      
    </div>
  );
}