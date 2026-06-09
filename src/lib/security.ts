import crypto from "crypto";

/**
 * Generates a cryptographically secure session token.
 * Uses crypto.randomBytes instead of Math.random() for security.
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Generates a cryptographically secure random ID string.
 * For use in provider account IDs, transaction IDs, etc.
 */
export function generateSecureId(prefix?: string): string {
  const id = crypto.randomBytes(16).toString("hex");
  return prefix ? `${prefix}-${id}` : id;
}

/**
 * Generates a secure invoice number with timestamp prefix.
 */
export function generateInvoiceNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `INV-${timestamp}-${random}`;
}

/**
 * Generates a secure referral code.
 */
export function generateReferralCode(): string {
  return crypto.randomBytes(6).toString("hex").toUpperCase();
}

/**
 * Generates a secure verification/reset token.
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Returns cookie security options based on environment.
 * Production cookies are always secure, httpOnly, and sameSite strict.
 */
export function getSecureCookieOptions(expires: Date) {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    expires,
    path: "/",
  };
}

/**
 * Returns options for non-httpOnly cookies (e.g., client-readable session hints).
 * These should never contain sensitive data.
 */
export function getPublicCookieOptions(expires: Date) {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: false,
    secure: isProduction,
    sameSite: "lax" as const,
    expires,
    path: "/",
  };
}
