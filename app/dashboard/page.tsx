"use client"

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { useState, useRef, useEffect } from "react";

type Message = { role: "user" | "assistant"; content: string };

export default function Dashboard() {
  const { user } = useUser();
  const name = user?.firstName ?? user?.username ?? "user";

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
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
    setMessages([...updated, { role: "assistant", content: reply }]);
    setLoading(false);
    inputRef.current?.focus();
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
