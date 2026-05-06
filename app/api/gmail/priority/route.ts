export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { google } from "googleapis";
import { client } from "@/lib/turso";

function getHeader(headers: any[], name: string) {
  return headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value || "";
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await client.execute({
    sql: `SELECT refresh_token FROM gmail_tokens WHERE user_id = ? LIMIT 1`,
    args: [userId],
  });

  const refreshToken = result.rows[0]?.refresh_token as string | undefined;
  if (!refreshToken) return NextResponse.json({ error: "No Gmail account connected" }, { status: 400 });

  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URL
  );
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  try {
    const listRes = await gmail.users.messages.list({
      userId: "me",
      labelIds: ["IMPORTANT", "INBOX"],
      maxResults: 20,
    });

    const messages = listRes.data.messages || [];

    const emails = await Promise.all(
      messages.map(async (msg) => {
        const email = await gmail.users.messages.get({
          userId: "me",
          id: msg.id!,
          format: "metadata",
          metadataHeaders: ["From", "Subject", "Date"],
        });
        const headers = email.data.payload?.headers || [];
        return {
          id: email.data.id,
          snippet: email.data.snippet || "",
          from: getHeader(headers, "From"),
          subject: getHeader(headers, "Subject"),
          date: getHeader(headers, "Date"),
        };
      })
    );

    return NextResponse.json({ emails });
  } catch (error: any) {
    console.error("Failed to fetch priority emails:", error);
    return NextResponse.json({ error: "Failed to fetch priority emails" }, { status: 500 });
  }
}
