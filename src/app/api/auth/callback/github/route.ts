import { NextResponse } from "next/server";
import { handleUserAuth } from "@/lib/auth-oauth-helper";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const siteUrl = new URL(req.url).origin;
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.redirect(`${siteUrl}/login?error=Missing+authorization+code`);
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(`${siteUrl}/login?error=GitHub+OAuth+not+configured`);
    }

    // Exchange authorization code for token
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        code,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text();
      console.error("GitHub token exchange error:", errorText);
      return NextResponse.redirect(`${siteUrl}/login?error=Failed+to+exchange+token`);
    }

    const tokens = await tokenRes.json();
    const accessToken = tokens.access_token;

    if (!accessToken) {
      return NextResponse.redirect(`${siteUrl}/login?error=Invalid+GitHub+access+token`);
    }

    // Fetch user profile info
    const profileRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `token ${accessToken}`,
        "User-Agent": "ShieldAI",
      },
    });

    if (!profileRes.ok) {
      return NextResponse.redirect(`${siteUrl}/login?error=Failed+to+fetch+GitHub+profile`);
    }

    const profile = await profileRes.json();
    let email = profile.email;
    const name = profile.name || profile.login || "GitHub User";

    // If email is private or null, fetch user email list
    if (!email) {
      const emailsRes = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `token ${accessToken}`,
          "User-Agent": "ShieldAI",
        },
      });

      if (emailsRes.ok) {
        const emails = await emailsRes.json();
        // Find primary verified email, or first email
        const primaryEmail = emails.find((e: any) => e.primary && e.verified) || emails[0];
        if (primaryEmail) {
          email = primaryEmail.email;
        }
      }
    }

    if (!email) {
      return NextResponse.redirect(`${siteUrl}/login?error=GitHub+profile+does+not+provide+email`);
    }

    return await handleUserAuth(email, name, "github", req);
  } catch (err) {
    console.error("GitHub OAuth callback exception:", err);
    return NextResponse.redirect(`${siteUrl}/login?error=GitHub+authentication+exception`);
  }
}
