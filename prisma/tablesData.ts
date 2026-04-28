import db from "@/lib/db";

export async function createTables() {
  console.log("Creating tables...");

  const tables = [];
  for (let i = 1; i <= 20; i++) {
    const table = await db.table.create({
      data: {
        tableNumber: i,
        capacity: [2, 4, 6, 8][Math.floor(Math.random() * 4)],
        isAvailable: true,
        location: ["Window", "Patio", "Main Hall", "Private Room", "Bar Area"][
          Math.floor(Math.random() * 5)
        ],
      },
    });
    tables.push(table);
  }

  console.log(`Created ${tables.length} tables`);
  return tables;
}
