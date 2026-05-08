export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { client } from "@/lib/turso";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { title, content } = await req.json();

  await client.execute({
    sql: `UPDATE notes SET title = ?, content = ? WHERE id = ? AND user_id = ?`,
    args: [title, content ?? null, Number(id), userId],
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  await client.execute({
    sql: `DELETE FROM notes WHERE id = ? AND user_id = ?`,
    args: [Number(id), userId],
  });

  return NextResponse.json({ success: true });
}
