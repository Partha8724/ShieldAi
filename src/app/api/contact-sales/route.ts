import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, email, company, useCase } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const emailTrim = email.trim().toLowerCase();

    // 1. Create Sales Lead record
    const lead = await prisma.salesLead.create({
      data: {
        name,
        email: emailTrim,
        company: company || null,
        useCase: useCase || null,
        status: "PENDING",
      },
    });

    // 2. Alert all platform Admins
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
    });

    if (admins.length > 0) {
      const adminNotifications = admins.map((admin) => ({
        userId: admin.id,
        title: "New Sales Lead Received",
        message: `Lead from ${name} (${company || "Individual"}) was captured. Primary Use Case: ${useCase || "N/A"}.`,
        type: "SYSTEM",
      }));

      await prisma.notification.createMany({
        data: adminNotifications,
      });
    }

    return NextResponse.json({ success: true, lead });
  } catch (err: any) {
    console.error("Contact Sales API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
