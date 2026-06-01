import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get("sb-session-token")?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    });

    if (!session || session.expires < new Date() || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized admin access required" }, { status: 403 });
    }

    // Find latest protected content in DB (either User's own or any user's to trigger)
    let content = await prisma.protectedContent.findFirst({
      orderBy: { createdAt: "desc" },
    });

    // If no protected content exists, check Uploads and migrate one or create a dummy asset
    if (!content) {
      const upload = await prisma.upload.findFirst({
        orderBy: { createdAt: "desc" },
      });

      if (upload) {
        // Create matching protected content
        content = await prisma.protectedContent.create({
          data: {
            userId: upload.userId,
            title: upload.fileName,
            description: JSON.stringify({
              pHash: upload.hash,
              originalSize: upload.fileSize,
              mimeType: upload.mimeType,
            }),
            url: upload.certificateUrl,
            status: "ACTIVE",
          },
        });
      } else {
        // Auto-create a dummy protectedContent asset for the administrator so the simulation is 100% workable out of the box!
        content = await prisma.protectedContent.create({
          data: {
            userId: session.userId,
            title: "Internal_Executive_Portrait_Cryptographic_Master.png",
            description: JSON.stringify({
              pHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
              originalSize: 4589021,
              mimeType: "image/png",
              certificateId: "CERT-SIMULATOR-DUMMY-9999",
            }),
            url: "/media/sandbox/fingerprint.png",
            status: "ACTIVE",
          },
        });
      }
    }

    // Generate random infringement domain
    const domains = ["pirate-vault.to", "leaks-unlimited.net", "counterfeit-hub.co", "unauthorized-clones.org"];
    const randDomain = domains[Math.floor(Math.random() * domains.length)];
    const infringementUrl = `https://${randDomain}/leak/file-${Math.random().toString(36).substring(5)}`;

    const severities = ["MEDIUM", "HIGH", "CRITICAL"];
    const severity = severities[Math.floor(Math.random() * severities.length)];

    await prisma.$transaction(async (tx) => {
      // 1. Create Threat record
      await tx.threat.create({
        data: {
          protectedContentId: content!.id,
          sourceUrl: infringementUrl,
          severity,
          status: "DETECTED",
        },
      });

      // 2. Update protectedContent status
      await tx.protectedContent.update({
        where: { id: content!.id },
        data: { status: "COMPROMISED" },
      });

      // 3. Create real-time notification
      await tx.notification.create({
        data: {
          userId: content!.userId,
          title: `Threat Alert: ${severity} Severity`,
          message: `Adversarial infringement of your footprint "${content!.title}" detected on ${randDomain}.`,
          type: "THREAT",
        },
      });

      // 4. Create Audit Log
      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: "TRIGGER_SIMULATED_THREAT",
          resource: "THREAT",
          details: `Simulated threat on content ID: ${content!.id}, URL: ${infringementUrl}`,
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Threat simulation error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
