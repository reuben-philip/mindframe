"use client"

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { useState, useRef } from "react";

type Message = { role: "user" | "assistant"; content: string };

export default function Dashboard() {
  const { user } = useUser();
  const name = user?.firstName ?? user?.username ?? "user";

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const updated: Message[] = [...messages, { role: "user", content: text }];
    setMessages(updated);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: updated }),
    });

    const data = await res.json();
    setMessages([...updated, { role: "assistant", content: data.response }]);
    setLoading(false);
    inputRef.current?.focus();
  }

  return (
    <div className="home-page">

      <div className="nav-bar">
        <nav>
          <Link className="nav-link" href="/dashboard">Dashboard</Link>
          <Link className="nav-link" href="/email">Email</Link>
          <Link className="nav-link" href="/priority">Priority</Link>
          <Link className="nav-link" href="/calender">Calendar</Link>
          <Link className="nav-link" href="/task">Task</Link>
        </nav>
      </div>

      <header>
        <h1 className="login-title">Welcome {name} </h1>
      </header>

      <div className="user-button">
        <UserButton />
      </div>

      <div className="search-container">
        <input
          ref={inputRef}
          className="search-bar"
          type="text"
          placeholder="What would you like to complete today"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          disabled={loading}
        />
      </div>

      {messages.length > 0 && (
        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`chat-message chat-message--${m.role}`}>
              <span className="chat-message__label">{m.role === "user" ? "You" : "Mistral"}</span>
              <p>{m.content}</p>
            </div>
          ))}
          {loading && (
            <div className="chat-message chat-message--assistant">
              <span className="chat-message__label">Mistral</span>
              <p>Thinking...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
