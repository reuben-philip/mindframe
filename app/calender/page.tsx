"use client"
import Link from "next/link";
import dynamic from "next/dynamic";
import { UserButton } from "@clerk/nextjs";

const FullCalendar = dynamic(() => import("@fullcalendar/react"), { ssr: false });
import dayGridPlugin from '@fullcalendar/daygrid'

export default function Calendar() {
    return (
        <div>
            <div className="nav-bar">
                <nav>
                    <Link className="nav-link" href="/dashboard">Dashboard</Link>
                    <Link className="nav-link" href="/email">Email</Link>
                    <Link className="nav-link" href="/priority">Priority</Link>
                    <Link className="nav-link" href="/calender">Calendar</Link>
                    <Link className="nav-link" href="/task">Task</Link>
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