"use client"
import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { UserButton } from "@clerk/nextjs";

const FullCalendar = dynamic(() => import("@fullcalendar/react"), { ssr: false });
import dayGridPlugin from '@fullcalendar/daygrid'

export default function Calendar() {
    const [events, setEvents] = useState<{ title: string; start: string; end?: string }[]>([]);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchEvents = () => {
        fetch("/api/gmail/calendar")
            .then((res) => {
                if (!res.ok) throw new Error(`API error: ${res.status}`);
                return res.json();
            })
            .then((data) => {
                if (data.events) {
                    const formatted = data.events.map((event: any) => ({
                        title: event.summary || "(No title)",
                        start: event.start?.dateTime || event.start?.date,
                        end: event.end?.dateTime || event.end?.date,
                    }));
                    setEvents(formatted);
                    setLastUpdated(new Date());
                }
            })
            .catch((err) => console.error("Failed to load calendar events:", err));
    };

    useEffect(() => {
        fetchEvents();
        const interval = setInterval(fetchEvents, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <div className="nav-bar">
                <nav>
                    <Link className="nav-link" href="/dashboard">Dashboard</Link>
                    <Link className="nav-link" href="/email">Email</Link>
                    <Link className="nav-link" href="/priority">Priority</Link>
                    <Link className="nav-link" href="/calender">Calendar</Link>
                    <Link className="nav-link" href="/task">Task</Link>
                    <Link className="nav-link" href="/notes">Notes</Link>
                </nav>
            </div>
            <div className="user-button">
                <UserButton />
            </div>
            <div className="calendar">
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                    {lastUpdated && <span style={{ fontSize: "12px", color: "#888" }}>Updated {lastUpdated.toLocaleTimeString()}</span>}
                    <button onClick={fetchEvents} style={{ fontSize: "12px", padding: "4px 10px", cursor: "pointer" }}>Refresh</button>
                </div>
                <FullCalendar
                    plugins={[dayGridPlugin]}
                    initialView="dayGridMonth"
                    height="700px"
                    events={events}
                />
            </div>
        </div>
    );
}