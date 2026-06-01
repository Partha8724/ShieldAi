import { NextResponse } from "next/server";
import { handleUserAuth } from "@/lib/auth-oauth-helper";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.redirect(`${siteUrl}/login?error=Missing+authorization+code`);
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(`${siteUrl}/login?error=Google+OAuth+not+configured`);
    }

    const redirectUri = `${siteUrl}/api/auth/callback/google`;

    // Exchange authorization code for token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text();
      console.error("Google token exchange error:", errorText);
      return NextResponse.redirect(`${siteUrl}/login?error=Failed+to+exchange+token`);
    }

    const tokens = await tokenRes.json();
    const accessToken = tokens.access_token;

    // Fetch user profile info
    const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!profileRes.ok) {
      return NextResponse.redirect(`${siteUrl}/login?error=Failed+to+fetch+Google+profile`);
    }

    const profile = await profileRes.json();
    const email = profile.email;
    const name = profile.name || profile.given_name || "Google User";

    if (!email) {
      return NextResponse.redirect(`${siteUrl}/login?error=Google+profile+does+not+provide+email`);
    }

    return await handleUserAuth(email, name, "google", req);
  } catch (err) {
    console.error("Google OAuth callback exception:", err);
    return NextResponse.redirect(`${siteUrl}/login?error=Google+authentication+exception`);
  }
}
