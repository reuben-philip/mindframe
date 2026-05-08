export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { client } from "@/lib/turso";

async function ensureTable() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureTable();

  const result = await client.execute({
    sql: `SELECT id, title, content, created_at FROM notes WHERE user_id = ? ORDER BY created_at DESC`,
    args: [userId],
  });

  const notes = result.rows.map((row) => ({
    id: row.id,
    title: row.title,
    content: row.content ?? "",
    createdAt: row.created_at ?? "",
  }));

  return NextResponse.json({ notes });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureTable();

  const { title, content } = await req.json();

  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const result = await client.execute({
    sql: `INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)`,
    args: [userId, title, content ?? null],
  });

  return NextResponse.json({ id: Number(result.lastInsertRowid) });
}
