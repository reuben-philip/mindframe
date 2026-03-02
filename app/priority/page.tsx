"use client"
import React from 'react';
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import "../globals.css";

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
            <div className="user-button">
                <UserButton />
            </div>

            <div className="priority-email-page-grid">

                <div className="priority-email-card">
                    <div className="priority-email-header"><h2>Priority Emails</h2></div>
                    <div className="priotiy-email-card-body">
                        <p>Email 1</p>
                        <p>Email 2</p>
                        <p>Email 3</p>
                    </div>
                </div>

                <div className="priority-email-right-column">
                    <div className="view-card"></div>
                    <input className="search-bar" type = "text" placeholder="who would you like to email today"></input>
                </div>
            </div>

        </div>
    );
}