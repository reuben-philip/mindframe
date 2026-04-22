"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import "../globals.css";

type EmailType = {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  date: string;
};

export default function Email() {
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [emails, setEmails] = useState<EmailType[]>([]);
  const [unreadToday, setUnreadToday] = useState<number>(0);
  const [connectError, setConnectError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (err) {
      const reason = params.get("reason") || "";
      const detail = params.get("detail") || "";
      setConnectError(`Connection failed — ${reason}${detail ? `: ${detail}` : ""}. Please try again.`);
    }

    async function loadEmailPage() {
      try {
        const statusRes = await fetch("/api/gmail/status", {
          cache: "no-store",
        });

        if (!statusRes.ok) {
          setConnected(false);
          return;
        }

        const statusData = await statusRes.json();
        setConnected(statusData.connected);

        if (statusData.connected) {
          const inboxRes = await fetch("/api/gmail/inbox", {
            cache: "no-store",
          });

          if (inboxRes.status === 401) {
            // Token expired/revoked — prompt reconnect
            setConnected(false);
          } else if (inboxRes.ok) {
            const inboxData = await inboxRes.json();
            setEmails(inboxData.emails || []);
            setUnreadToday(inboxData.unreadToday ?? 0);
          }
        }
      } catch (error) {
        console.error("Failed to load email page:", error);
        setConnected(false);
      } finally {
        setLoading(false);
      }
    }

    loadEmailPage();
  }, []);

  const emailsByDay = Object.entries(
    emails.reduce<Record<string, number>>((acc, email) => {
      const day = new Date(email.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      acc[day] = (acc[day] ?? 0) + 1;
      return acc;
    }, {})
  )
    .map(([day, count]) => ({ day, count }))
    .slice(-7);

  if (loading) {
    return <div>Loading...</div>;
  }

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

      {!connected && (
        <div className="gmail-modal-overlay">
          <div className="gmail-modal">
            <h2>Connect Gmail</h2>
            {connectError && <p style={{ color: "red" }}>{connectError}</p>}
            <p>You need to connect your Gmail account to access this page.</p>
            <button
              className="gmail-connect-button"
              onClick={() => {
                window.location.href = "/api/gmail/connect";
              }}
            >
              Connect Gmail
            </button>
          </div>
        </div>
      )}

      {connected && (
        <div className="email-page-grid">
          <div className="email-card">
            <div className="email-header">
              <h2>Emails</h2>
            </div>

            <div className="email-card-body">
              {emails.length === 0 ? (
                <p>No emails found.</p>
              ) : (
                emails.map((email) => (
                  <div key={email.id} className="email-item">
                    <p><strong>From:</strong> {email.from}</p>
                    <p><strong>Subject:</strong> {email.subject}</p>
                    <p>{email.snippet}</p>
                    <hr />
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="email-right-column">
            <div className="unread-card">
              <div className="unread-header">
                <h2>Unread Emails</h2>
              </div>
              <div className="unread-card-body">
                <p>{unreadToday} Emails</p>
              </div>
            </div>

            <div className="email-graph-card">
              <div className="email-graph-header">
                <p>Emails per Day</p>
              </div>
              <ResponsiveContainer width="75%" height={180}>
                <BarChart data={emailsByDay} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "rgba(8,8,9,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "white" }}
                    cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  />
                  <Bar dataKey="count" fill="rgba(236,86,21,0.8)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}