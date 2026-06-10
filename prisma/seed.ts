import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Seeds the database with emission factors and sample rules.
 * Emission factors sourced from UK DEFRA 2024 and EPA data.
 * This seed is idempotent — safe to run multiple times.
 */
async function main() {
  console.log("🌱 Seeding database...");

  // ── Emission Factors ───────────────────────────────────────────
  const emissionFactors = [
    // Transport
    {
      id: "a0000001-0000-0000-0000-000000000001",
      category: "transport",
      subCategory: "car_petrol",
      name: "Petrol Car (average)",
      factorKgCo2e: 0.17,
      unit: "km",
      source: "UK DEFRA 2024",
      region: "global",
    },
    {
      id: "a0000001-0000-0000-0000-000000000002",
      category: "transport",
      subCategory: "car_diesel",
      name: "Diesel Car (average)",
      factorKgCo2e: 0.168,
      unit: "km",
      source: "UK DEFRA 2024",
      region: "global",
    },
    {
      id: "a0000001-0000-0000-0000-000000000003",
      category: "transport",
      subCategory: "car_electric",
      name: "Electric Car",
      factorKgCo2e: 0.05,
      unit: "km",
      source: "UK DEFRA 2024",
      region: "global",
    },
    {
      id: "a0000001-0000-0000-0000-000000000004",
      category: "transport",
      subCategory: "bus",
      name: "Bus (local)",
      factorKgCo2e: 0.089,
      unit: "km",
      source: "UK DEFRA 2024",
      region: "global",
    },
    {
      id: "a0000001-0000-0000-0000-000000000005",
      category: "transport",
      subCategory: "train",
      name: "Train (national rail)",
      factorKgCo2e: 0.035,
      unit: "km",
      source: "UK DEFRA 2024",
      region: "global",
    },
    {
      id: "a0000001-0000-0000-0000-000000000006",
      category: "transport",
      subCategory: "flight_short",
      name: "Flight (short haul <3h)",
      factorKgCo2e: 0.255,
      unit: "km",
      source: "UK DEFRA 2024",
      region: "global",
    },
    {
      id: "a0000001-0000-0000-0000-000000000007",
      category: "transport",
      subCategory: "flight_long",
      name: "Flight (long haul >3h)",
      factorKgCo2e: 0.195,
      unit: "km",
      source: "UK DEFRA 2024",
      region: "global",
    },
    {
      id: "a0000001-0000-0000-0000-000000000008",
      category: "transport",
      subCategory: "bicycle",
      name: "Bicycle",
      factorKgCo2e: 0.0,
      unit: "km",
      source: "Zero emission",
      region: "global",
    },
    {
      id: "a0000001-0000-0000-0000-000000000009",
      category: "transport",
      subCategory: "walking",
      name: "Walking",
      factorKgCo2e: 0.0,
      unit: "km",
      source: "Zero emission",
      region: "global",
    },
    // Energy
    {
      id: "b0000001-0000-0000-0000-000000000001",
      category: "energy",
      subCategory: "electricity",
      name: "Electricity (grid average)",
      factorKgCo2e: 0.233,
      unit: "kWh",
      source: "UK DEFRA 2024",
      region: "global",
    },
    {
      id: "b0000001-0000-0000-0000-000000000002",
      category: "energy",
      subCategory: "natural_gas",
      name: "Natural Gas",
      factorKgCo2e: 0.184,
      unit: "kWh",
      source: "UK DEFRA 2024",
      region: "global",
    },
    {
      id: "b0000001-0000-0000-0000-000000000003",
      category: "energy",
      subCategory: "solar",
      name: "Solar Energy",
      factorKgCo2e: 0.0,
      unit: "kWh",
      source: "Renewable",
      region: "global",
    },
    // Food
    {
      id: "c0000001-0000-0000-0000-000000000001",
      category: "food",
      subCategory: "beef",
      name: "Beef",
      factorKgCo2e: 27.0,
      unit: "kg",
      source: "Our World in Data 2024",
      region: "global",
    },
    {
      id: "c0000001-0000-0000-0000-000000000002",
      category: "food",
      subCategory: "poultry",
      name: "Poultry",
      factorKgCo2e: 6.9,
      unit: "kg",
      source: "Our World in Data 2024",
      region: "global",
    },
    {
      id: "c0000001-0000-0000-0000-000000000003",
      category: "food",
      subCategory: "fish",
      name: "Fish",
      factorKgCo2e: 5.4,
      unit: "kg",
      source: "Our World in Data 2024",
      region: "global",
    },
    {
      id: "c0000001-0000-0000-0000-000000000004",
      category: "food",
      subCategory: "dairy",
      name: "Dairy Products",
      factorKgCo2e: 3.2,
      unit: "kg",
      source: "Our World in Data 2024",
      region: "global",
    },
    {
      id: "c0000001-0000-0000-0000-000000000005",
      category: "food",
      subCategory: "vegetables",
      name: "Vegetables",
      factorKgCo2e: 0.4,
      unit: "kg",
      source: "Our World in Data 2024",
      region: "global",
    },
    {
      id: "c0000001-0000-0000-0000-000000000006",
      category: "food",
      subCategory: "fruits",
      name: "Fruits",
      factorKgCo2e: 0.5,
      unit: "kg",
      source: "Our World in Data 2024",
      region: "global",
    },
    {
      id: "c0000001-0000-0000-0000-000000000007",
      category: "food",
      subCategory: "grains",
      name: "Grains & Cereals",
      factorKgCo2e: 1.4,
      unit: "kg",
      source: "Our World in Data 2024",
      region: "global",
    },
    // Shopping
    {
      id: "d0000001-0000-0000-0000-000000000001",
      category: "shopping",
      subCategory: "clothing",
      name: "Clothing (new)",
      factorKgCo2e: 22.0,
      unit: "item",
      source: "WRAP UK 2024",
      region: "global",
    },
    {
      id: "d0000001-0000-0000-0000-000000000002",
      category: "shopping",
      subCategory: "electronics",
      name: "Electronics",
      factorKgCo2e: 50.0,
      unit: "item",
      source: "EPA estimate",
      region: "global",
    },
    {
      id: "d0000001-0000-0000-0000-000000000003",
      category: "shopping",
      subCategory: "furniture",
      name: "Furniture",
      factorKgCo2e: 100.0,
      unit: "item",
      source: "EPA estimate",
      region: "global",
    },
    {
      id: "d0000001-0000-0000-0000-000000000004",
      category: "shopping",
      subCategory: "secondhand",
      name: "Second-hand items",
      factorKgCo2e: 2.0,
      unit: "item",
      source: "Estimated (low-impact reuse)",
      region: "global",
    },
  ];

  for (const ef of emissionFactors) {
    await prisma.emissionFactor.upsert({
      where: { id: ef.id },
      update: ef,
      create: ef,
    });
  }
  console.log(`  ✅ ${emissionFactors.length} emission factors seeded`);

  // ── Rules ──────────────────────────────────────────────────────
  const rules = [
    {
      id: "r0000001-0000-0000-0000-000000000001",
      name: "High car usage — suggest public transport",
      category: "transport",
      conditions: [
        { field: "category", operator: "equals", value: "transport" },
        { field: "subCategory", operator: "in", value: ["car_petrol", "car_diesel"] },
        { field: "weeklyTotal", operator: "greaterThan", value: 100 },
      ],
      actions: [
        {
          type: "recommend",
          params: {
            title: "Consider public transport for some trips",
            description:
              "You drove over 100 km this week. Switching 2 trips to bus or train could save significant CO₂.",
            potentialSavingKg: 8.5,
            priority: "high",
          },
        },
      ],
      priority: 10,
      active: true,
    },
    {
      id: "r0000001-0000-0000-0000-000000000002",
      name: "High beef consumption — suggest alternatives",
      category: "food",
      conditions: [
        { field: "category", operator: "equals", value: "food" },
        { field: "subCategory", operator: "equals", value: "beef" },
        { field: "weeklyTotal", operator: "greaterThan", value: 1 },
      ],
      actions: [
        {
          type: "recommend",
          params: {
            title: "Try poultry or plant-based alternatives",
            description:
              "Beef produces 27 kg CO₂e per kg — 4× more than poultry. Replacing one beef meal with chicken or plant-based saves ~5 kg CO₂e.",
            potentialSavingKg: 5.0,
            priority: "high",
          },
        },
      ],
      priority: 10,
      active: true,
    },
    {
      id: "r0000001-0000-0000-0000-000000000003",
      name: "High electricity usage — suggest efficiency",
      category: "energy",
      conditions: [
        { field: "category", operator: "equals", value: "energy" },
        { field: "subCategory", operator: "equals", value: "electricity" },
        { field: "weeklyTotal", operator: "greaterThan", value: 50 },
      ],
      actions: [
        {
          type: "recommend",
          params: {
            title: "Reduce standby power consumption",
            description:
              "Your electricity usage is above average. Turning off standby devices and using LED bulbs can reduce consumption by 10-15%.",
            potentialSavingKg: 3.0,
            priority: "medium",
          },
        },
      ],
      priority: 5,
      active: true,
    },
    {
      id: "r0000001-0000-0000-0000-000000000004",
      name: "Frequent new clothing — suggest secondhand",
      category: "shopping",
      conditions: [
        { field: "category", operator: "equals", value: "shopping" },
        { field: "subCategory", operator: "equals", value: "clothing" },
        { field: "monthlyCount", operator: "greaterThan", value: 3 },
      ],
      actions: [
        {
          type: "recommend",
          params: {
            title: "Explore second-hand or sustainable fashion",
            description:
              "Each new clothing item averages 22 kg CO₂e. Buying second-hand reduces this by up to 90%.",
            potentialSavingKg: 20.0,
            priority: "medium",
          },
        },
      ],
      priority: 5,
      active: true,
    },
    {
      id: "r0000001-0000-0000-0000-000000000005",
      name: "Flight taken — offset suggestion",
      category: "transport",
      conditions: [
        { field: "category", operator: "equals", value: "transport" },
        { field: "subCategory", operator: "in", value: ["flight_short", "flight_long"] },
        { field: "monthlyCount", operator: "greaterThan", value: 0 },
      ],
      actions: [
        {
          type: "recommend",
          params: {
            title: "Consider train alternatives for short trips",
            description:
              "A short-haul flight emits ~7× more CO₂ per km than a train. For trips under 500 km, trains are often comparable in total travel time.",
            potentialSavingKg: 50.0,
            priority: "high",
          },
        },
      ],
      priority: 15,
      active: true,
    },
  ];

  for (const rule of rules) {
    await prisma.rule.upsert({
      where: { id: rule.id },
      update: { ...rule, conditions: JSON.stringify(rule.conditions), actions: JSON.stringify(rule.actions) },
      create: { ...rule, conditions: JSON.stringify(rule.conditions), actions: JSON.stringify(rule.actions) },
    });
  }
  console.log(`  ✅ ${rules.length} rules seeded`);

  // ── Demo User (dev only) ───────────────────────────────────────
  if (process.env.NODE_ENV !== "production") {
    const passwordHash = await hash("Demo1234!", 12);
    await prisma.user.upsert({
      where: { email: "demo@carbonlens.app" },
      update: {},
      create: {
        id: "u0000001-0000-0000-0000-000000000001",
        email: "demo@carbonlens.app",
        passwordHash,
        name: "Demo User",
        region: "global",
        timezone: "UTC",
      },
    });
    console.log("  ✅ Demo user created (demo@carbonlens.app / Demo1234!)");
  }

  console.log("🌱 Seeding complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
