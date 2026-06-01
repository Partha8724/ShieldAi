export function createClient() {
  return {
    auth: {
      async getUser() {
        try {
          const res = await fetch("/api/auth/me", { cache: "no-store" });
          const data = await res.json();
          if (data && data.user) {
            return { data: { user: data.user }, error: null };
          }
          return { data: { user: null }, error: null };
        } catch (err) {
          return { data: { user: null }, error: { message: "Failed to connect to authentication backend" } };
        }
      },
      async signInWithPassword({ email, password }: { email: string; password?: string }) {
        try {
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          const data = await res.json();
          if (res.ok && !data.error) {
            if (data.mfaRequired) {
              return { data: { user: null, mfaRequired: true, userId: data.userId }, error: null };
            }
            return { data: { user: data.user }, error: null };
          }
          return { data: { user: null }, error: { message: data.error || "Authentication failed" } };
        } catch (err) {
          return { data: { user: null }, error: { message: "Network connection error" } };
        }
      },
      async signUp({ email, password, options }: { email: string; password?: string; options?: any }) {
        try {
          const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, options }),
          });
          const data = await res.json();
          if (res.ok && !data.error) {
            return { data: { user: data.user }, error: null };
          }
          return { data: { user: null }, error: { message: data.error || "Registration failed" } };
        } catch (err) {
          return { data: { user: null }, error: { message: "Network connection error" } };
        }
      },
      async signOut() {
        try {
          await fetch("/api/auth/logout", { method: "POST" });
          return { error: null };
        } catch (err) {
          return { error: { message: "Failed to sign out" } };
        }
      },
      async resetPasswordForEmail(email: string) {
        try {
          const res = await fetch("/api/auth/reset-password-request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
          const data = await res.json();
          if (res.ok && !data.error) {
            return { data: true, error: null };
          }
          return { data: null, error: { message: data.error || "Request failed" } };
        } catch (err) {
          return { data: null, error: { message: "Network error" } };
        }
      }
    }
  } as any;
}
