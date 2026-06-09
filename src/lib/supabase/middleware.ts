import { NextResponse, type NextRequest } from "next/server";

// In-memory import — we can't use Prisma directly in Edge middleware
// Instead, we validate session via an internal API call on protected routes
const PROTECTED_ROUTES = [
  "/dashboard",
  "/content",
  "/billing",
  "/admin",
  "/analytics",
  "/sandbox",
  "/settings",
  "/monitoring",
];

const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];

const PUBLIC_API_ROUTES = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/oauth",
  "/api/auth/callback",
  "/api/auth/reset-password",
  "/api/waitlist",
  "/api/contact-sales",
  "/api/payments/crypto",       // Webhook endpoint
  "/api/payments/paypal",       // Webhook endpoint
  "/api/payments/razorpay",     // Webhook endpoint
  "/api/billing/webhook",       // Webhook endpoint
];

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });

  // Add security headers to all responses
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }

  const sessionToken = request.cookies.get("sb-session-token")?.value;
  const pathname = request.nextUrl.pathname;

  const isDashboardRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = AUTH_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isProtectedApi =
    pathname.startsWith("/api/") &&
    !PUBLIC_API_ROUTES.some((route) => pathname.startsWith(route));

  // Protect dashboard routes — redirect to login if no session cookie
  if (!sessionToken && isDashboardRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Protect API routes — return 401 if no session cookie
  if (!sessionToken && isProtectedApi) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  // Redirect authenticated users away from auth pages
  if (sessionToken && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}
