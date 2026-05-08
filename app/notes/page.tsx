"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "">("");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch("/api/notes")
      .then((r) => r.json())
      .then((data) => {
        const fetched: Note[] = data.notes ?? [];
        setNotes(fetched);
        if (fetched.length > 0) openNote(fetched[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  function openNote(note: Note) {
    setSelectedId(note.id);
    setContent(note.content);
    setSaveStatus("");
    if (saveTimer.current) clearTimeout(saveTimer.current);
  }

  async function createNote() {
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Untitled", content: "" }),
    });
    const { id } = await res.json();
    const newNote: Note = { id, title: "Untitled", content: "", createdAt: new Date().toISOString() };
    setNotes((prev) => [newNote, ...prev]);
    openNote(newNote);
    setTimeout(() => contentRef.current?.focus(), 50);
  }

  async function deleteNote(id: number) {
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    setNotes((prev) => {
      const remaining = prev.filter((n) => n.id !== id);
      if (selectedId === id) {
        if (remaining.length > 0) openNote(remaining[0]);
        else { setSelectedId(null); setContent(""); }
      }
      return remaining;
    });
  }

  const scheduleSave = useCallback((id: number, newContent: string) => {
    setSaveStatus("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const firstLine = newContent.split("\n")[0].trim() || "Untitled";
      await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: firstLine, content: newContent }),
      });
      setNotes((prev) =>
        prev.map((n) => n.id === id ? { ...n, title: firstLine, content: newContent } : n)
      );
      setSaveStatus("saved");
    }, 600);
  }, []);

  function handleContentChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    setContent(val);
    if (selectedId) scheduleSave(selectedId, val);
  }

  const selected = notes.find((n) => n.id === selectedId);

  return (
    <div className="notes-layout">
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

      <div className="notes-container">
        <aside className="notes-sidebar">
          <div className="notes-sidebar-header">
            <span className="notes-sidebar-title">Notes</span>
            <button className="notes-new-btn" onClick={createNote} title="New note">+</button>
          </div>

          <div className="notes-list">
            {loading ? (
              <p className="notes-empty">Loading...</p>
            ) : notes.length === 0 ? (
              <p className="notes-empty">No notes yet</p>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  className={`notes-list-item${selectedId === note.id ? " notes-list-item--active" : ""}`}
                  onClick={() => openNote(note)}
                >
                  <div className="notes-list-item-title">
                    {note.title || "Untitled"}
                  </div>
                  <button
                    className="notes-list-delete-btn"
                    onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                    title="Delete"
                  >✕</button>
                </div>
              ))
            )}
          </div>
        </aside>

        <main className="notes-editor">
          {selected ? (
            <>
              <div className="notes-editor-topbar">
                <span className="notes-save-status">
                  {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved" : ""}
                </span>
              </div>
              <textarea
                ref={contentRef}
                className="notes-editor-body"
                value={content}
                onChange={handleContentChange}
              />
            </>
          ) : (
            <div className="notes-editor-empty">
              <p>Select a note or create a new one</p>
              <button className="notes-create-btn" onClick={createNote}>+ New Note</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
