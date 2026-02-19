import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default function Dashboard() {
  return (
    <div className="home-page">
      <header>
        <h1 className="login-title">Welcome</h1>
        <UserButton />
      </header>

      <div className="input-container"> 
        <input type = "text" placeholder="What would you like to complete today"></input>
      </div>
    </div>
  );
}
