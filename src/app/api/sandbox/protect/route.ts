import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { getCleanSiteUrl } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get("sb-session-token")?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await prisma.session.findUnique({
      where: { sessionToken },
    });

    if (!session || session.expires < new Date()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileName, fileSize, mimeType, hash, watermarkValue } = await req.json();

    if (!fileName || !fileSize || !mimeType || !hash) {
      return NextResponse.json({ error: "Missing required file attributes" }, { status: 400 });
    }

    const siteUrl = getCleanSiteUrl(req);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Check if upload already exists to prevent duplicate hashes
      const existing = await tx.upload.findUnique({
        where: { hash },
      });

      if (existing) {
        return { upload: existing, alreadyRegistered: true };
      }

      // 2. Create Watermark
      const watermark = await tx.watermark.create({
        data: {
          userId: session.userId,
          type: "TEXT",
          value: watermarkValue || "SHIELDAI",
        },
      });

      // 3. Create Upload linked to Watermark
      const upload = await tx.upload.create({
        data: {
          userId: session.userId,
          fileName,
          fileSize,
          mimeType,
          hash,
          watermarkId: watermark.id,
          status: "PROCESSED",
          certificateUrl: `${siteUrl}/api/sandbox/verify?hash=${hash}`,
        },
      });

      // 4. Create Notification
      await tx.notification.create({
        data: {
          userId: session.userId,
          title: "New Asset Registered",
          message: `Asset "${fileName}" has been successfully protected with a dynamic watermark.`,
          type: "SYSTEM",
        },
      });

      // 5. Add Audit Log
      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: "PROTECT_ASSET",
          resource: "UPLOAD",
          details: `Registered asset: ${fileName}, hash: ${hash}, size: ${fileSize} bytes`,
        },
      });

      return { upload, watermark };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    console.error("Sandbox protect route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
