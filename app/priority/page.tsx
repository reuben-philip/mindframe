"use client"
import { useEffect, useState } from 'react';
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

type Email = {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  date: string;
};

type SelectedEmail = Email & { body: string };

export default function Priority() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [selected, setSelected] = useState<SelectedEmail | null>(null);
  const [loadingBody, setLoadingBody] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const statusRes = await fetch("/api/gmail/status", { cache: "no-store" });
        const statusData = await statusRes.json();
        if (!statusData.connected) { setConnected(false); setLoading(false); return; }
        setConnected(true);
        const res = await fetch("/api/gmail/priority", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setEmails(data.emails || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function openEmail(email: Email) {
    setLoadingBody(true);
    setSelected({ ...email, body: "" });
    const res = await fetch(`/api/gmail/message/${email.id}`);
    const data = await res.json();
    setSelected({ ...email, body: data.body ?? "Could not load body." });
    setLoadingBody(false);
  }

  async function deleteEmail(id: string) {
    await fetch(`/api/gmail/delete/${id}`, { method: "DELETE" });
    setEmails((prev) => prev.filter((e) => e.id !== id));
    if (selected?.id === id) setSelected(null);
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
          <Link className="nav-link" href="/task">Notes</Link>
        </nav>
      </div>

      <div className="user-button">
        <UserButton />
      </div>

      <div className="priority-page-wrapper">
        <div className="priority-email-card">
          <div className="priority-email-header">
            <h2>Priority Emails</h2>
          </div>

          <div className="priority-email-card-body">
            {loading ? (
              <p className="priority-status-text">Loading...</p>
            ) : !connected ? (
              <p className="priority-status-text">Connect Gmail in the Email tab to see priority emails.</p>
            ) : emails.length === 0 ? (
              <p className="priority-status-text">No priority emails found.</p>
            ) : (
              emails.map((email) => (
                <div key={email.id} className="priority-email-row">
                  <div className="priority-email-row-inner" onClick={() => openEmail(email)}>
                    <div className="priority-email-row-top">
                      <span className="priority-email-from">{email.from.replace(/<.*>/, "").trim()}</span>
                      <span className="priority-email-date">
                        {new Date(email.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <p className="priority-email-subject">{email.subject}</p>
                    <p className="priority-email-snippet">{email.snippet}</p>
                  </div>
                  <button
                    className="email-delete-btn"
                    title="Move to Trash"
                    onClick={(e) => { e.stopPropagation(); deleteEmail(email.id); }}
                  >
                    🗑
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {selected && (
        <div className="gmail-modal-overlay" onClick={() => setSelected(null)}>
          <div className="email-modal" onClick={(e) => e.stopPropagation()}>
            <button className="email-modal-close" onClick={() => setSelected(null)}>✕</button>
            <p className="email-modal-from"><strong>From:</strong> {selected.from}</p>
            <h2 className="email-modal-subject">{selected.subject}</h2>
            <hr style={{ borderColor: "rgba(255,255,255,0.07)", margin: "12px 0" }} />
            <button
              className="priority-modal-delete-btn"
              onClick={() => deleteEmail(selected.id)}
            >
              🗑 Delete
            </button>
            <div className="email-modal-body">
              {loadingBody ? "Loading..." : selected.body}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
