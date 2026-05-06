export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { client } from "@/lib/turso";

async function ensureTable() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      due_date TEXT,
      priority TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureTable();

  const result = await client.execute({
    sql: `SELECT id, name, description, due_date, priority FROM tasks WHERE user_id = ? ORDER BY created_at DESC`,
    args: [userId],
  });

  const tasks = result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    dueDate: row.due_date ?? "",
    priority: row.priority ?? "",
  }));

  return NextResponse.json({ tasks });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureTable();

  const { name, description, dueDate, priority } = await req.json();

  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const result = await client.execute({
    sql: `INSERT INTO tasks (user_id, name, description, due_date, priority) VALUES (?, ?, ?, ?, ?)`,
    args: [userId, name, description ?? null, dueDate ?? null, priority ?? null],
  });

  return NextResponse.json({ id: Number(result.lastInsertRowid) });
}
