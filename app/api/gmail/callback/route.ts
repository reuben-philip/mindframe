export const runtime = "nodejs";

import { google } from "googleapis";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { client } from "@/lib/turso";

export async function GET(req:Request){

    const { userId } = await auth();

    if(!userId){
        return NextResponse.json({error:"Not logged into clerk"},
            {status:400}
        );
    }

    const {searchParams} = new URL(req.url);
    const code = searchParams.get('code');

    if(!code){
        return NextResponse.json({error: 'Authorization code not found'},
        {status:400});
    }

    const oauth2Client = new google.auth.OAuth2(
        process.env.GMAIL_CLIENT_ID,
        process.env.GMAIL_CLIENT_SECRET,
        process.env.GMAIL_REDIRECT_URL
    )

    try{
        const {tokens} = await oauth2Client.getToken(code);

        const refreshToken = tokens.refresh_token;

        if(!refreshToken){
            return NextResponse.json({error: 'Refresh token not found in the response'}, {status: 400});
        }  
        
        await client.execute({
            sql: 'INSERT INTO gmail_tokens (user_id, refresh_token) VALUES (?, ?)',
            args: [userId, refreshToken],
        });

        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    catch(err){
        console.error("Error exchanging code for tokens",err);
        return NextResponse.json({error: 'Failed to exchange authorization code for tokens'}, {status: 500});


    }

}