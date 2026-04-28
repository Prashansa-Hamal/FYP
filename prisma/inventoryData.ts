import db from "@/lib/db";
import { subDays } from "date-fns";

export async function createInventory() {
  console.log("Creating inventory...");

  const inventoryItems = [
    // Vegetables
    {
      name: "Tomatoes",
      category: "Vegetables",
      unit: "kg",
      minThreshold: 10,
      quantity: 25,
    },
    {
      name: "Onions",
      category: "Vegetables",
      unit: "kg",
      minThreshold: 15,
      quantity: 30,
    },
    {
      name: "Potatoes",
      category: "Vegetables",
      unit: "kg",
      minThreshold: 20,
      quantity: 45,
    },
    {
      name: "Lettuce",
      category: "Vegetables",
      unit: "kg",
      minThreshold: 5,
      quantity: 8,
    },
    {
      name: "Bell Peppers",
      category: "Vegetables",
      unit: "kg",
      minThreshold: 5,
      quantity: 12,
    },
    {
      name: "Garlic",
      category: "Vegetables",
      unit: "kg",
      minThreshold: 3,
      quantity: 4,
    },
    {
      name: "Spinach",
      category: "Vegetables",
      unit: "kg",
      minThreshold: 4,
      quantity: 3,
    }, // Low stock

    // Meats
    {
      name: "Chicken Breast",
      category: "Meat",
      unit: "kg",
      minThreshold: 15,
      quantity: 22,
    },
    {
      name: "Beef Tenderloin",
      category: "Meat",
      unit: "kg",
      minThreshold: 10,
      quantity: 18,
    },
    {
      name: "Salmon Fillet",
      category: "Seafood",
      unit: "kg",
      minThreshold: 8,
      quantity: 12,
    },
    {
      name: "Shrimp",
      category: "Seafood",
      unit: "kg",
      minThreshold: 5,
      quantity: 7,
    },
    {
      name: "Pork Chops",
      category: "Meat",
      unit: "kg",
      minThreshold: 8,
      quantity: 6,
    }, // Low stock
    {
      name: "Lamb Rack",
      category: "Meat",
      unit: "kg",
      minThreshold: 5,
      quantity: 2,
    }, // Critical

    // Dairy
    {
      name: "Milk",
      category: "Dairy",
      unit: "liters",
      minThreshold: 20,
      quantity: 35,
    },
    {
      name: "Cream",
      category: "Dairy",
      unit: "liters",
      minThreshold: 10,
      quantity: 15,
    },
    {
      name: "Butter",
      category: "Dairy",
      unit: "kg",
      minThreshold: 8,
      quantity: 12,
    },
    {
      name: "Cheese",
      category: "Dairy",
      unit: "kg",
      minThreshold: 10,
      quantity: 14,
    },
    {
      name: "Eggs",
      category: "Dairy",
      unit: "dozen",
      minThreshold: 30,
      quantity: 45,
    },
    {
      name: "Yogurt",
      category: "Dairy",
      unit: "kg",
      minThreshold: 5,
      quantity: 2,
    }, // Critical

    // Beverages
    {
      name: "Coffee Beans",
      category: "Beverages",
      unit: "kg",
      minThreshold: 5,
      quantity: 8,
    },
    {
      name: "Tea Leaves",
      category: "Beverages",
      unit: "kg",
      minThreshold: 3,
      quantity: 4,
    },
    {
      name: "Orange Juice",
      category: "Beverages",
      unit: "liters",
      minThreshold: 10,
      quantity: 12,
    },
    {
      name: "Soda Syrup",
      category: "Beverages",
      unit: "liters",
      minThreshold: 15,
      quantity: 18,
    },

    // Alcohol
    {
      name: "Vodka",
      category: "Alcohol",
      unit: "bottles",
      minThreshold: 10,
      quantity: 25,
    },
    {
      name: "Whiskey",
      category: "Alcohol",
      unit: "bottles",
      minThreshold: 8,
      quantity: 15,
    },
    {
      name: "Gin",
      category: "Alcohol",
      unit: "bottles",
      minThreshold: 6,
      quantity: 10,
    },
    {
      name: "Rum",
      category: "Alcohol",
      unit: "bottles",
      minThreshold: 6,
      quantity: 12,
    },
    {
      name: "Tequila",
      category: "Alcohol",
      unit: "bottles",
      minThreshold: 5,
      quantity: 3,
    }, // Low stock
    {
      name: "Red Wine",
      category: "Alcohol",
      unit: "bottles",
      minThreshold: 15,
      quantity: 28,
    },
    {
      name: "White Wine",
      category: "Alcohol",
      unit: "bottles",
      minThreshold: 15,
      quantity: 22,
    },
    {
      name: "Beer",
      category: "Alcohol",
      unit: "cases",
      minThreshold: 20,
      quantity: 35,
    },

    // Dry Goods
    {
      name: "Flour",
      category: "Dry Goods",
      unit: "kg",
      minThreshold: 25,
      quantity: 40,
    },
    {
      name: "Sugar",
      category: "Dry Goods",
      unit: "kg",
      minThreshold: 20,
      quantity: 35,
    },
    {
      name: "Rice",
      category: "Dry Goods",
      unit: "kg",
      minThreshold: 20,
      quantity: 30,
    },
    {
      name: "Pasta",
      category: "Dry Goods",
      unit: "kg",
      minThreshold: 15,
      quantity: 18,
    },
    {
      name: "Olive Oil",
      category: "Dry Goods",
      unit: "liters",
      minThreshold: 10,
      quantity: 14,
    },
    {
      name: "Spices",
      category: "Dry Goods",
      unit: "kg",
      minThreshold: 5,
      quantity: 7,
    },

    // Cleaning Supplies
    {
      name: "Dish Soap",
      category: "Cleaning",
      unit: "bottles",
      minThreshold: 5,
      quantity: 8,
    },
    {
      name: "Sanitizer",
      category: "Cleaning",
      unit: "bottles",
      minThreshold: 5,
      quantity: 6,
    },
    {
      name: "Paper Towels",
      category: "Cleaning",
      unit: "rolls",
      minThreshold: 20,
      quantity: 25,
    },
  ];

  for (const item of inventoryItems) {
    await db.inventory.create({
      data: {
        itemName: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        minThreshold: item.minThreshold,
        lastRestocked: subDays(new Date(), Math.floor(Math.random() * 7)),
      },
    });
  }

  console.log(`Created ${inventoryItems.length} inventory items`);
}
