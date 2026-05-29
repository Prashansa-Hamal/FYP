import "dotenv/config";
import db from "@/lib/db";
import { createUsers } from "./ussersData";
import { createTables } from "./tablesData";
import { createInventory } from "./inventoryData";
import { createMenuItems } from "./menuItemData";

async function main() {
  console.log("🌱 Starting simple seed (without orders)...");

  // Clear existing data (optional - be careful in production!)
  await clearDatabase();

  // Create data in sequence (skip orders for faster seeding)
  await createUsers();
  await createTables();
  await createInventory();
  await createMenuItems();

  console.log("✅ Simple seed completed successfully!");
  console.log("Note: Orders, reservations, and notifications were skipped for faster setup.");
  console.log("You can create test orders through the UI.");
}

async function clearDatabase() {
  console.log("Clearing existing data...");

  const tablenames = await db.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  for (const { tablename } of tablenames) {
    if (tablename !== "_prisma_migrations") {
      try {
        await db.$executeRawUnsafe(
          `TRUNCATE TABLE "public"."${tablename}" CASCADE;`,
        );
      } catch (error) {
        console.log(`Error truncating ${tablename}:`, error);
      }
    }
  }
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
