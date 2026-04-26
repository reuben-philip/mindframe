export const runtime = "nodejs";

import { google } from "googleapis";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { client } from "@/lib/turso";

export async function GET(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const returnedState = searchParams.get("state");

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get("gmail_oauth_state")?.value;

  if (!returnedState || !savedState || returnedState !== savedState) {
    return NextResponse.json({ error: "Invalid OAuth state" }, { status: 400 });
  }

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

  try {
    const { tokens } = await oauth2Client.getToken(code);
    const refreshToken = tokens.refresh_token;

    if (!refreshToken) {
      // Google only returns a refresh_token on the first consent grant.
      // If the old token exists, keep it (scopes may be fine).
      // Otherwise force the user to re-connect via /api/gmail/connect.
      const existing = await client.execute({
        sql: `SELECT refresh_token FROM gmail_tokens WHERE user_id = ? LIMIT 1`,
        args: [userId],
      });
      if (existing.rows.length > 0) {
        const response = NextResponse.redirect(new URL("/email", req.url));
        response.cookies.set("gmail_oauth_state", "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
        return response;
      }
      return NextResponse.json(
        { error: "No refresh token received. Please disconnect and reconnect via /api/gmail/connect." },
        { status: 400 }
      );
    }

    const existing = await client.execute({
      sql: `SELECT 1 FROM gmail_tokens WHERE user_id = ? LIMIT 1`,
      args: [userId],
    });

    if (existing.rows.length > 0) {
      await client.execute({
        sql: `UPDATE gmail_tokens SET refresh_token = ?, created_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
        args: [refreshToken, userId],
      });
    } else {
      await client.execute({
        sql: `INSERT INTO gmail_tokens (user_id, refresh_token, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
        args: [userId, refreshToken],
      });
    }

    const response = NextResponse.redirect(new URL("/email", req.url));

    response.cookies.set("gmail_oauth_state", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error: any) {
    const googleError = error?.response?.data?.error;
    console.error("Gmail token exchange failed:", googleError, error?.response?.data);

    // Check if an earlier invocation already saved the token successfully.
    const existing = await client.execute({
      sql: `SELECT 1 FROM gmail_tokens WHERE user_id = ? LIMIT 1`,
      args: [userId],
    });
    if (existing.rows.length > 0) {
      return NextResponse.redirect(new URL("/email", req.url));
    }

    const reason = encodeURIComponent(googleError || error?.message || "unknown");
    const detail = encodeURIComponent(error?.response?.data?.error_description || "");
    return NextResponse.redirect(new URL(`/email?error=connect_failed&reason=${reason}&detail=${detail}`, req.url));
  }
}