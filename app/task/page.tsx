"use client"
import React from 'react';
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import "../globals.css";

export default function Task() {
    return (
        <div>
            <div className = "nav-bar">
                <nav>
                <Link className = "nav-link" href="/dashboard">Dashboard</Link>
                <Link className = "nav-link" href="/email">Email</Link>
                <Link className = "nav-link" href="/priority">Priority</Link>
                <Link className = "nav-link" href="/calender">Calendar</Link>
                <Link className="nav-link" href="/task">Task</Link>
                </nav>
            </div>

            <div className="user-button">
                <UserButton />
            </div>

        </div>
    );
}