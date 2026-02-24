"use client"
import React from 'react';
import Link from "next/link";
import FullCalendar from "@FullCalendar/react";
import dayGridPlugin from '@fullcalendar/daygrid'
export default function Calendar() {
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
            <div className = "calendar">
                <FullCalendar 
                    plugins = {[dayGridPlugin]}
                    initialView = "dayGridMonth"
                    height="700px"
                />
            </div>
        </div>
    );
}