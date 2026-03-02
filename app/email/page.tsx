"use client"
import React from 'react';
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import "../globals.css";

export default function Email() {
    return (
        <div>
            <div className="nav-bar">
                <nav>
                    <Link className="nav-link" href="/dashboard">Dashboard</Link>
                    <Link className="nav-link" href="/email">Email</Link>
                    <Link className="nav-link" href="/priority">Priority</Link>
                    <Link className="nav-link" href="/calender">Calendar</Link>
                </nav>
            </div>

            <div className="user-button">
                <UserButton />
            </div>

            <div className="email-page-grid">

                <div className="email-card">
                    <div className="email-header"><h2>Emails</h2></div>
                    <div className="email-card-body">
                        <p>Email 1</p>
                        <p>Email 2</p>
                        <p>Email 3</p>
                    </div>
                </div>

                <div className="email-right-column">
                    <div className="unread-card">
                        <div className="unread-header"><h2>Unread Emails</h2></div>
                        <div className="unread-card-body"><p>30 unread Emails</p></div>
                    </div>

                    <div className="email-graph-card">
                        <div className="email-graph-header"><p>Email Graph</p></div>
                    </div>
                </div>

            </div>
        </div>
    );
}