import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get("sb-session-token")?.value;

    if (!sessionToken) {
      return new Response("Unauthorized", { status: 401 });
    }

    const session = await prisma.session.findUnique({
      where: { sessionToken },
    });

    if (!session || session.expires < new Date()) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userId = session.userId;
    let lastCheckedTime = new Date();

    const responseHeaders = new Headers({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    });

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        // Enqueue initial handshake connection confirmation
        controller.enqueue(encoder.encode(": ok\n\n"));

        const interval = setInterval(async () => {
          try {
            const notifications = await prisma.notification.findMany({
              where: {
                userId,
                createdAt: {
                  gt: lastCheckedTime,
                },
              },
              orderBy: { createdAt: "asc" },
            });

            if (notifications.length > 0) {
              lastCheckedTime = notifications[notifications.length - 1].createdAt;
              for (const notif of notifications) {
                const sseMessage = `data: ${JSON.stringify({
                  id: notif.id,
                  title: notif.title,
                  message: notif.message,
                  type: notif.type,
                  createdAt: notif.createdAt.toISOString(),
                })}\n\n`;
                controller.enqueue(encoder.encode(sseMessage));
              }
            } else {
              // Heartbeat check to prevent timeout closures
              controller.enqueue(encoder.encode(": ping\n\n"));
            }
          } catch (err) {
            console.error("SSE stream loop retrieval error:", err);
          }
        }, 3000);

        req.signal.addEventListener("abort", () => {
          clearInterval(interval);
          controller.close();
        });
      },
    });

    return new Response(stream, { headers: responseHeaders });
  } catch (err) {
    console.error("SSE start error", err);
    return new Response("Internal server error", { status: 500 });
  }
}
