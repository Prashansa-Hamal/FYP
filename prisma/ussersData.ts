import { UserRole } from "@/generated/enums";
import db from "@/lib/db";
import { hash } from "bcryptjs";
import { subDays } from "date-fns";

export async function createUsers() {
  console.log("Creating users...");

  const hashedPassword = await hash("password123", 10);

  // Create admin users
  const admin1 = await db.user.create({
    data: {
      name: "John Manager",
      email: "john@restaurant.com",
      phone: "+1234567890",
      password: hashedPassword,
      role: UserRole.MANAGER,
      loyalityPoints: 500,
      addresses: {
        create: [
          {
            name: "Home",
            phone: "+1234567890",
            street: "123 Main St",
            city: "New York",
            state: "NY",
            postalCode: "10001",
            country: "USA",
            isDefault: true,
          },
        ],
      },
    },
  });

  const admin2 = await db.user.create({
    data: {
      name: "Sarah Admin",
      email: "sarah@restaurant.com",
      phone: "+1234567891",
      password: hashedPassword,
      role: UserRole.MANAGER,
      loyalityPoints: 750,
    },
  });

  // Create chef users
  const chef1 = await db.user.create({
    data: {
      name: "Michael Gordon",
      email: "michael@restaurant.com",
      phone: "+1234567892",
      password: hashedPassword,
      role: UserRole.CHEF,
      loyalityPoints: 0,
    },
  });

  const chef2 = await db.user.create({
    data: {
      name: "Emma Thompson",
      email: "emma@restaurant.com",
      phone: "+1234567893",
      password: hashedPassword,
      role: UserRole.CHEF,
      loyalityPoints: 0,
    },
  });

  // Create bartender users
  const bartender1 = await db.user.create({
    data: {
      name: "David Martinez",
      email: "david@restaurant.com",
      phone: "+1234567894",
      password: hashedPassword,
      role: UserRole.BARTENDER,
      loyalityPoints: 0,
    },
  });

  // Create waiter users
  const waiter1 = await db.user.create({
    data: {
      name: "Lisa Chen",
      email: "lisa@restaurant.com",
      phone: "+1234567895",
      password: hashedPassword,
      role: UserRole.WAITER,
      loyalityPoints: 0,
    },
  });

  const waiter2 = await db.user.create({
    data: {
      name: "James Wilson",
      email: "james@restaurant.com",
      phone: "+1234567896",
      password: hashedPassword,
      role: UserRole.WAITER,
      loyalityPoints: 0,
    },
  });

  // Create regular customers (50 customers)
  const customers = [];
  const firstNames = [
    "Alice",
    "Bob",
    "Charlie",
    "Diana",
    "Eve",
    "Frank",
    "Grace",
    "Henry",
    "Ivy",
    "Jack",
    "Karen",
    "Leo",
    "Mona",
    "Nick",
    "Olga",
    "Paul",
    "Quinn",
    "Rose",
    "Sam",
    "Tina",
    "Umar",
    "Vera",
    "Will",
    "Xena",
    "Yuri",
    "Zara",
    "Adam",
    "Bella",
    "Chris",
    "Dora",
    "Eric",
    "Fiona",
    "George",
    "Hannah",
    "Ian",
    "Julia",
    "Kevin",
    "Laura",
    "Mike",
    "Nina",
    "Oscar",
    "Patricia",
    "Quentin",
    "Rachel",
    "Steve",
    "Tracy",
    "Ulysses",
    "Victoria",
    "Walter",
    "Xavier",
  ];

  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez",
    "Hernandez",
    "Lopez",
    "Gonzalez",
    "Wilson",
    "Anderson",
    "Thomas",
    "Taylor",
    "Moore",
    "Jackson",
    "Martin",
    "Lee",
    "Perez",
    "Thompson",
    "White",
    "Harris",
    "Sanchez",
    "Clark",
    "Ramirez",
    "Lewis",
    "Robinson",
  ];

  for (let i = 0; i < 50; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[Math.floor(i / 2) % lastNames.length];
    const daysAgo = Math.floor(Math.random() * 365); // Random signup date in last year

    const customer = await db.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`,
        phone: `+1${Math.floor(1000000000 + Math.random() * 900000000)}`,
        password: i < 10 ? hashedPassword : null, // Some users have password, some don't (social login)
        role: UserRole.USER,
        loyalityPoints: Math.floor(Math.random() * 1000),
        createdAt: subDays(new Date(), daysAgo),
        addresses:
          Math.random() > 0.3
            ? {
                // 70% have addresses
                create: [
                  {
                    name: "Home",
                    phone: `+1${Math.floor(1000000000 + Math.random() * 900000000)}`,
                    street: `${Math.floor(100 + Math.random() * 900)} ${["Main", "Oak", "Pine", "Maple", "Cedar"][Math.floor(Math.random() * 5)]} St`,
                    city: [
                      "New York",
                      "Los Angeles",
                      "Chicago",
                      "Houston",
                      "Phoenix",
                    ][Math.floor(Math.random() * 5)],
                    state: ["NY", "CA", "IL", "TX", "AZ"][
                      Math.floor(Math.random() * 5)
                    ],
                    postalCode: `${Math.floor(10000 + Math.random() * 90000)}`,
                    country: "USA",
                    isDefault: true,
                  },
                ],
              }
            : undefined,
      },
    });
    customers.push(customer);
  }

  console.log(`Created ${customers.length + 8} users`);
  return {
    admin1,
    admin2,
    chef1,
    chef2,
    bartender1,
    waiter1,
    waiter2,
    customers,
  };
}
