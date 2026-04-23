export const runtime = "nodejs";

import { google } from "googleapis";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { client } from "@/lib/turso";

export async function GET(req: Request){
    const { userId } = await auth();

    if(!userId){
        return NextResponse.json({ error: "Unauthorized"}, { status: 401});
    }

    const result = await client.execute({
        sql: `SELECT refresh_token FROM gmail_tokens WHERE user_id =? LIMIT 1`,
        args: [userId],
    });

    if(!result.rows.length){
        return NextResponse.json({error: "Not connected"}, {status:401});
    }

    const oauth2Client = new google.auth.OAuth2(
        process.env.GMAIL_CLIENT_ID,
        process.env.GMAIL_CLIENT_SECRET,
        process.env.GMAIL_REDIRECT_URL
    );

    oauth2Client.setCredentials({ refresh_token: result.rows[0].refresh_token as string});

    const calendar = google.calendar({version: "v3", auth: oauth2Client});

    const events = await calendar.events.list({
        calendarId: "primary",
        timeMin: new Date().toISOString(),
        maxResults: 50,
        singleEvents: true,
        orderBy: "startTime",
    });

    return NextResponse.json({ events: events.data.items });
}