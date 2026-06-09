import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Dynamic Seeder for local environment
async function seedIfNeeded() {
  try {
    const plansCount = await prisma.plan.count();
    if (plansCount === 0) {
      await prisma.plan.createMany({
        data: [
          {
            name: "FREE",
            priceMonthly: 0,
            priceYearly: 0,
            uploadLimit: 5,
            monitoringLimit: 5,
            features: JSON.stringify([
              "Limited uploads (5/mo)",
              "Limited monitoring (5 items)",
              "Basic protection",
            ]),
          },
          {
            name: "CREATOR",
            priceMonthly: 19,
            priceYearly: 190,
            uploadLimit: 50,
            monitoringLimit: 50,
            features: JSON.stringify([
              "Up to 50 assets protected/month",
              "Basic adversarial noise injection",
              "Weekly monitoring scans",
              "Standard email support",
              "Deepfake detection",
            ]),
          },
          {
            name: "PROFESSIONAL",
            priceMonthly: 49,
            priceYearly: 490,
            uploadLimit: 1000000,
            monitoringLimit: 1000000,
            features: JSON.stringify([
              "Unlimited asset protection",
              "Advanced AI inoculation (multi-model)",
              "Real-time continuous monitoring",
              "Automated takedown requests",
              "Priority 24/7 support",
              "Team accounts",
              "Multiple identities",
              "Advanced alerts",
            ]),
          },
          {
            name: "ENTERPRISE",
            priceMonthly: 199,
            priceYearly: 1990,
            uploadLimit: 1000000,
            monitoringLimit: 1000000,
            features: JSON.stringify([
              "Dedicated monitoring agents",
              "Custom adversarial model training",
              "API access",
              "Legal evidence generation",
              "Dedicated success manager",
              "Custom pricing",
              "Dedicated support",
            ]),
          },
        ],
      });
      console.log("Successfully seeded plans!");
    }
  } catch (err) {
    console.error("Seeding failed:", err);
  }
}

// Seed on startup in development only to prevent production cold start latency
if (process.env.NODE_ENV !== "production") {
  seedIfNeeded();
}

