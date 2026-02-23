import React from 'react';
import Link from "next/link";
export default function Priority() {
    return (
        <div>
            <div className = "nav-bar">
                <nav>
                <Link className = "nav-link" href="/dashboard">Dashboard</Link>
                <Link className = "nav-link" href="/email">Email</Link>
                <Link className = "nav-link" href="/priority">Priority</Link>
                <Link className = "nav-link" href="/calender">Calendar</Link>
                </nav>
            </div>
            <h1>Priority Component</h1>
        </div>
    );
}