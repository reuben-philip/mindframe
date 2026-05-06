export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { client } from "@/lib/turso";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const convId = Number(id);

  const conv = await client.execute({
    sql: `SELECT id FROM chat_conversations WHERE id = ? AND user_id = ?`,
    args: [convId, userId],
  });
  if (!conv.rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const result = await client.execute({
    sql: `SELECT role, content FROM chat_messages WHERE conversation_id = ? ORDER BY created_at ASC`,
    args: [convId],
  });

  return NextResponse.json({
    messages: result.rows.map((r) => ({ role: r.role, content: r.content })),
  });
}

export async function POST(req: NextRequest, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const convId = Number(id);

  const conv = await client.execute({
    sql: `SELECT id FROM chat_conversations WHERE id = ? AND user_id = ?`,
    args: [convId, userId],
  });
  if (!conv.rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { messages } = await req.json() as { messages: { role: string; content: string }[] };

  await client.batch(
    messages.map((m) => ({
      sql: `INSERT INTO chat_messages (conversation_id, user_id, role, content) VALUES (?, ?, ?, ?)`,
      args: [convId, userId, m.role, m.content],
    })),
    "write"
  );

  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const convId = Number(id);

  await client.batch([
    { sql: `DELETE FROM chat_messages WHERE conversation_id = ? AND user_id = ?`, args: [convId, userId] },
    { sql: `DELETE FROM chat_conversations WHERE id = ? AND user_id = ?`, args: [convId, userId] },
  ], "write");

  return NextResponse.json({ success: true });
}
