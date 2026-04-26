export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { client } from "@/lib/turso";
import { google } from "googleapis";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await client.execute({
    sql: `SELECT refresh_token, created_at FROM gmail_tokens WHERE user_id = ? LIMIT 1`,
    args: [userId],
  });

  if (!result.rows.length) {
    return NextResponse.json({ tokenExists: false });
  }

  const refreshToken = result.rows[0].refresh_token as string;

  // Check what scopes this token actually has
  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URL
  );
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  try {
    const { token } = await oauth2Client.getAccessToken();
    const tokenInfo = await oauth2Client.getTokenInfo(token!);
    return NextResponse.json({
      tokenExists: true,
      createdAt: result.rows[0].created_at,
      tokenPrefix: refreshToken.slice(0, 10) + "...",
      scopes: tokenInfo.scopes,
    });
  } catch (e: any) {
    return NextResponse.json({
      tokenExists: true,
      createdAt: result.rows[0].created_at,
      tokenPrefix: refreshToken.slice(0, 10) + "...",
      scopeCheckError: e.message,
    });
  }
}
