export const runtime = "nodejs";

import { google } from "googleapis";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(req: Request) {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const redirectUri = process.env.GMAIL_REDIRECT_URL;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json(
      { error: "Missing Gmail OAuth environment variables" },
      { status: 500 }
    );
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );

  const scopes = [
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/calendar.events",
  ];

  const state = crypto.randomBytes(32).toString("hex");

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    include_granted_scopes: true,
    prompt: "consent",
    state,
  });

  const response = NextResponse.redirect(url);

  response.cookies.set("gmail_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });

  return response;
}