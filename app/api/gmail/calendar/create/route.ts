export const runtime = "nodejs";

import { google } from "googleapis";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { client } from "@/lib/turso";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await client.execute({
    sql: `SELECT refresh_token FROM gmail_tokens WHERE user_id = ? LIMIT 1`,
    args: [userId],
  });

  if (!result.rows.length) {
    return NextResponse.json({ error: "Not connected" }, { status: 401 });
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URL
  );
  oauth2Client.setCredentials({ refresh_token: result.rows[0].refresh_token as string });

  const { title, start, end, description, timeZone } = await req.json();

  if (!title || !start) {
    return NextResponse.json({ error: "title and start are required" }, { status: 400 });
  }

  const tz = timeZone ?? "UTC";
  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(start);

  const event = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: title,
      description: description ?? "",
      start: isDateOnly ? { date: start } : { dateTime: start, timeZone: tz },
      end: isDateOnly
        ? { date: end ?? start }
        : { dateTime: end ?? start, timeZone: tz },
    },
  });

  return NextResponse.json({ event: event.data });
}
