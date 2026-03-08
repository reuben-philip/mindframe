"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
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

  useEffect(() => {
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

          if (inboxRes.ok) {
            const inboxData = await inboxRes.json();
            setEmails(inboxData.emails || []);
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
                <p>{emails.length} loaded Emails</p>
              </div>
            </div>

            <div className="email-graph-card">
              <div className="email-graph-header">
                <p>Email Graph</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}