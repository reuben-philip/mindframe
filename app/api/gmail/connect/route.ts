/*import {google} from 'googleapis';
import cryptoLib from 'crypto';
import {NextResponse} from 'next/server';

export async function GET() {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GMAIL_CLIENT_ID,
        process.env.GMAIL_CLIENT_SECRET,
        process.env.GMAIL_REDIRECT_URL
    );

    const scopes = ['https://www.googleapis.com/auth/gmail.readonly',
        "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/gmail.send"
    ];

    const state = cryptoLib.randomBytes(32).toString('hex');


    const authorizationUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        inlude_granted_scopes: true, 
        state
    });

    return NextResponse.redirect(authorizationUrl);
}*/