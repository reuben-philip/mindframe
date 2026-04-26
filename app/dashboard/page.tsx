"use client"

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { useState, useRef, useEffect } from "react";

type Message = { role: "user" | "assistant"; content: string };
type EmailDraft = { to: string; subject: string; body: string };

export default function Dashboard() {
  const { user } = useUser();
  const name = user?.firstName ?? user?.username ?? "user";

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [draft, setDraft] = useState<EmailDraft | null>(null);
  const [sendStatus, setSendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    setChatStarted(true);
    const updated: Message[] = [...messages, { role: "user", content: text }];
    setMessages(updated);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: updated, userName: name }),
    });

    const data = await res.json();
    const reply = data.response ?? data.error ?? "Something went wrong.";
    const draftMatch = reply.match(/<email_draft>([\s\S]*?)<\/email_draft>/);
    if (draftMatch) {
      try { setDraft(JSON.parse(draftMatch[1])); } catch {}
      setMessages([...updated, { role: "assistant", content: "Here's a draft for you — edit it below and hit Send when ready." }]);
    } else {
      setMessages([...updated, { role: "assistant", content: reply }]);
    }
    setLoading(false);
    inputRef.current?.focus();
  }

  async function sendEmail() {
    if (!draft) return;
    setSendStatus("sending");
    const res = await fetch("/api/gmail/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    setSendStatus(res.ok ? "sent" : "error");
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className={`home-page${chatStarted ? " chat-started" : ""}`}>

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

      <header className={`welcome-header${chatStarted ? " welcome-header--hidden" : ""}`}>
        <h1 className="login-title">Welcome {name}</h1>
      </header>

      <div className={`chat-window${chatStarted ? " chat-window--visible" : ""}`}>
        {messages.map((m, i) => (
          <div key={i} className={`chat-message chat-message--${m.role}`}>
            <span className="chat-message__label">{m.role === "user" ? "You" : "Mindframe"}</span>
            <p>{m.content}</p>
          </div>
        ))}
        {loading && (
          <div className="chat-message chat-message--assistant">
            <span className="chat-message__label">Mindframe</span>
            <p>Thinking...</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {draft && (
        <div className="email-draft-card">
          <h3>Email Draft</h3>
          <label>To</label>
          <input value={draft.to} onChange={(e) => setDraft({ ...draft, to: e.target.value })} />
          <label>Subject</label>
          <input value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} />
          <label>Body</label>
          <textarea rows={6} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} />
          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
            <button onClick={sendEmail} disabled={sendStatus === "sending" || sendStatus === "sent"}>
              {sendStatus === "sending" ? "Sending..." : sendStatus === "sent" ? "Sent!" : "Send"}
            </button>
            <button onClick={() => { setDraft(null); setSendStatus("idle"); }}>Dismiss</button>
          </div>
          {sendStatus === "error" && <p style={{ color: "red" }}>Failed to send. Try again.</p>}
        </div>
      )}

      <div className={`search-container${chatStarted ? " search-container--chat" : ""}`}>
        <input
          ref={inputRef}
          className="search-bar"
          type="text"
          placeholder={chatStarted ? "Send a message…" : "What would you like to complete today"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          disabled={loading}
        />
      </div>
    </div>
  );
}
