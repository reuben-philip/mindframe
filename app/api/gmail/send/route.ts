export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { google } from "googleapis";
import { client } from "@/lib/turso";

export async function POST(req: Request){
    const { userId } = await auth(); 
    
    if(!userId){
        return NextResponse.json({error: "unauthorized"}, {status: 401});
    }

    const {to, subject, body} = await req.json();

    if(!to || !subject || !body){
        return NextResponse.json({erro: "missing fileds"}, {status: 401});
    }

    const result = await client.execute({
        sql: `SELECT refresh_token from gmail_tokens WHERE user_id = ? LIMIT 1`,
        args: [userId],
    });

    if(!result.rows.length){
        return NextResponse.json({error: "no gmail connected"}, {status: 401});
    }

    const oauth2Client = new google.auth.OAuth2(
        process.env.GMAIL_CLIENT_ID,
        process.env.GMAIL_CLIENT_SECRET,
        process.env.GMAIL_REDIRECT_URL
    );
    
    oauth2Client.setCredentials({ refresh_token: result.rows[0].refresh_token as string });

    const gmail = google.gmail({version: "v1", auth:oauth2Client});

    const raw = Buffer.from(
    [`To: ${to}`, `Subject: ${subject}`, `Content-Type: text/plain; charset="UTF-8"`, ``, body].join("\n")
    ).toString("base64url");

    await gmail.users.messages.send({ userId: "me", requestBody: { raw } });

    return NextResponse.json({ success: true });
}