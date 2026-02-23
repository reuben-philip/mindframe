"use client"

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { User } from "@clerk/nextjs/server";

export default function Dashboard() {

  const { user, isLoaded } = useUser();

  const name = user?.firstName;

  return (
    <div className="home-page">

      <div className = "nav-bar">
        <nav>
          <Link className = "nav-link" href="dashboard.tsx">Dashboard</Link>
          <Link className = "nav-link" href="email.tsx">Email</Link>
          <Link className = "nav-link" href="priority.tsx">Priority</Link>
          <Link className = "nav-link" href="calender.tsx">Calender</Link>
        </nav>
      </div>

      <header>
        <h1 className="login-title">Welcome {name} </h1>
      </header>

      <div className = "user-button">
        <UserButton />
      </div>

      <div className="input-container"> 
        <input className="search-bar" type = "text" placeholder="What would you like to complete today"></input>
      </div>
    </div>
  );
}
