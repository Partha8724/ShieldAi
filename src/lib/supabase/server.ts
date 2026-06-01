import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export function createClient() {
  const cookieStore = cookies();
  
  return {
    auth: {
      async getUser() {
        const sessionToken = cookieStore.get("sb-session-token")?.value;
        
        if (!sessionToken) {
          return { data: { user: null }, error: null };
        }

        try {
          const session = await prisma.session.findUnique({
            where: { sessionToken },
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                  role: true,
                  mfaEnabled: true,
                  organizationId: true,
                  teamId: true,
                },
              },
            },
          });

          if (!session || session.expires < new Date()) {
            return { data: { user: null }, error: null };
          }

          // Non-blocking update of lastActive
          prisma.session
            .update({
              where: { id: session.id },
              data: { lastActive: new Date() },
            })
            .catch((e) => console.error("Failed to update last active session status", e));

          return { data: { user: session.user }, error: null };
        } catch (dbError) {
          console.error("Database error retrieving session user", dbError);
          return { data: { user: null }, error: dbError as any };
        }
      },
      async signOut() {
        const sessionToken = cookieStore.get("sb-session-token")?.value;
        if (sessionToken) {
          try {
            await prisma.session.delete({
              where: { sessionToken },
            });
          } catch (e) {}
        }
        
        // Clear cookies
        try {
          cookieStore.set("sb-session-token", "", { path: "/", maxAge: -1 });
          cookieStore.set("sb-mock-session", "", { path: "/", maxAge: -1 });
        } catch (e) {}
        
        return { error: null };
      },
    },
  } as any;
}
