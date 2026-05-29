import "dotenv/config";
import db from "@/lib/db";
import { createMenuItems } from "./menuItemData";
import { createOrders } from "./ordersData";
import { createUsers } from "./ussersData";
import { createTables } from "./tablesData";
import { createInventory } from "./inventoryData";
import { createReservations } from "./reservationsData";
import { createStaffShifts } from "./staffData";
import { createNotifications } from "./notificationsData";

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data (optional - be careful in production!)
  await clearDatabase();

  // Create data in sequence
  await createUsers();
  await createTables();
  await createInventory();
  await createMenuItems();
  // await createCarts();
  await createOrders();
  await createReservations();
  await createStaffShifts();
  await createNotifications();

  console.log("✅ Seed completed successfully!");
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
