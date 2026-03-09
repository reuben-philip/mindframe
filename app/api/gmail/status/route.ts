export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { client } from "@/lib/turso";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { connected: false },
      { status: 401 }
    );
  }

  const result = await client.execute({
    sql: `SELECT 1 FROM gmail_tokens WHERE user_id = ? LIMIT 1`,
    args: [userId],
  });

  return NextResponse.json({
    connected: result.rows.length > 0,
  });
}