export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { google } from "googleapis";
import { client } from "@/lib/turso";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId){
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await client.execute({
    sql: `SELECT refresh_token FROM gmail_tokens WHERE user_id = ? LIMIT 1`,
    args: [userId],
  });
  
  if (!result.rows.length){
    return NextResponse.json({ error: "Not connected" }, { status: 401 });
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URL
  );
  oauth2Client.setCredentials({ refresh_token: result.rows[0].refresh_token as string });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  const msg = await gmail.users.messages.get({ userId: "me", id, format: "full" });

  const decode = (data: string) => Buffer.from(data, "base64").toString("utf-8");

  function extractBody(part: any): { text: string; html: string } {
    let text = "";
    let html = "";
    if (part.mimeType === "text/plain" && part.body?.data) text = decode(part.body.data);
    if (part.mimeType === "text/html" && part.body?.data) html = decode(part.body.data);
    if (part.parts) {
      for (const child of part.parts) {
        const result = extractBody(child);
        if (!text && result.text) text = result.text;
        if (!html && result.html) html = result.html;
      }
    }
    return { text, html };
  }

  const payload = msg.data.payload;
  const { text, html } = extractBody(payload ?? {});

  let body = text;
  if (!body && html) {
    body = html.replace(/<style[\s\S]*?<\/style>/gi, "")
               .replace(/<[^>]+>/g, "")
               .replace(/&nbsp;/g, " ")
               .replace(/&amp;/g, "&")
               .replace(/&lt;/g, "<")
               .replace(/&gt;/g, ">")
               .replace(/\n{3,}/g, "\n\n")
               .trim();
  }

  return NextResponse.json({ body: body || "No readable content found." });
}
