import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hash = searchParams.get("hash");

    if (!hash) {
      return NextResponse.json({ error: "Missing hash parameter" }, { status: 400 });
    }

    const upload = await prisma.upload.findUnique({
      where: { hash },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        watermark: true,
      },
    });

    if (!upload) {
      return NextResponse.json({ success: true, registered: false });
    }

    return NextResponse.json({
      success: true,
      registered: true,
      upload,
      watermark: upload.watermark,
    });
  } catch (err: any) {
    console.error("Sandbox verify route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
