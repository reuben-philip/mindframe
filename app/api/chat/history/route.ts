export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { client } from "@/lib/turso";

async function ensureTables() {
  await client.batch([
    {
      sql: `CREATE TABLE IF NOT EXISTS chat_conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL DEFAULT 'New Chat',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
      args: [],
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id INTEGER NOT NULL,
        user_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
      args: [],
    },
  ], "write");
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureTables();

  const result = await client.execute({
    sql: `SELECT id, title, created_at FROM chat_conversations WHERE user_id = ? ORDER BY created_at DESC`,
    args: [userId],
  });

  return NextResponse.json({
    conversations: result.rows.map((r) => ({ id: r.id, title: r.title })),
  });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureTables();

  const { title } = await req.json();

  const result = await client.execute({
    sql: `INSERT INTO chat_conversations (user_id, title) VALUES (?, ?)`,
    args: [userId, title ?? "New Chat"],
  });

  return NextResponse.json({ id: Number(result.lastInsertRowid) });
}
