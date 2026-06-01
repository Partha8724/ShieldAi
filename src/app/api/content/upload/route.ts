import { NextRequest, NextResponse } from "next/server";
import { processProtectedContent } from "@/lib/protection";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get("sb-session-token")?.value;

    let userId = "cuid-mock-user-id"; 

    if (sessionToken) {
      const session = await prisma.session.findUnique({
        where: { sessionToken },
      });
      if (session && session.expires > new Date()) {
        userId = session.userId;
      }
    }

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      const { title, perceptualHash, certificateId, fileSize, mimeType, certificate } = body;

      if (!perceptualHash || !certificateId) {
        return NextResponse.json({ error: "Missing required metadata parameters" }, { status: 400 });
      }

      const fileUrl = `https://storage.shieldai.com/protected/${certificateId}`;

      const record = await prisma.protectedContent.create({
        data: {
          userId,
          title: title || "Protected Asset",
          description: JSON.stringify({
            pHash: perceptualHash,
            certificateId,
            originalSize: fileSize,
            mimeType: mimeType
          }),
          url: fileUrl,
          status: "ACTIVE",
        }
      });

      // Audit Log
      await prisma.auditLog.create({
        data: {
          userId,
          action: "PROTECT_ASSET_LOCAL",
          resource: "PROTECTED_CONTENT",
          details: `Locally processed and registered asset: ${title || "Protected Asset"} (Size: ${fileSize} bytes, Cert: ${certificateId})`
        }
      });

      return NextResponse.json({
        success: true,
        content: record,
        certificate
      });
    } else {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const title = formData.get("title") as string | null;
      
      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const {
        perceptualHash,
        certificate,
        certificateId
      } = await processProtectedContent(buffer, userId, title || file.name);

      const fileUrl = `https://storage.shieldai.com/protected/${certificateId}`;

      const record = await prisma.protectedContent.create({
        data: {
          userId,
          title: title || file.name,
          description: JSON.stringify({
            pHash: perceptualHash,
            certificateId,
            originalSize: file.size,
            mimeType: file.type
          }),
          url: fileUrl,
          status: "ACTIVE",
        }
      });

      return NextResponse.json({
        success: true,
        content: record,
        certificate
      });
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to process content" }, { status: 500 });
  }
}
