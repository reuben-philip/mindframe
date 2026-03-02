"use client"
import React from 'react';
import Link from "next/link";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from '@fullcalendar/daygrid'
import { UserButton } from "@clerk/nextjs";

export default function Calendar() {
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
            <div className="calendar">
                <FullCalendar
                    plugins={[dayGridPlugin]}
                    initialView="dayGridMonth"
                    height="700px"
                />
            </div>
        </div>
    );
}