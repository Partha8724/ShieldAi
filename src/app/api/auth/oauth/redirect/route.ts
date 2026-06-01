import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const provider = searchParams.get("provider") || "google";

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    if (provider === "google") {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      if (clientId && clientSecret) {
        const redirectUri = `${siteUrl}/api/auth/callback/google`;
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
          redirectUri
        )}&response_type=code&scope=openid%20email%20profile&access_type=offline&prompt=consent`;
        return NextResponse.redirect(googleAuthUrl);
      }
    }

    if (provider === "github") {
      const clientId = process.env.GITHUB_CLIENT_ID;
      const clientSecret = process.env.GITHUB_CLIENT_SECRET;
      if (clientId && clientSecret) {
        const redirectUri = `${siteUrl}/api/auth/callback/github`;
        const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
          redirectUri
        )}&scope=user:email`;
        return NextResponse.redirect(githubAuthUrl);
      }
    }

    // Fallback to offline local sandbox simulator
    return NextResponse.redirect(`${siteUrl}/oauth/consent?provider=${provider}`);
  } catch (err) {
    console.error("OAuth redirect error:", err);
    return NextResponse.json({ error: "Failed to process OAuth redirection" }, { status: 500 });
  }
}
