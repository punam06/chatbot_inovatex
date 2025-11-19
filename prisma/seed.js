// prisma/seed.js
// Seeding script to populate the database with initial data

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...\n');

  // ========================================================================
  // 1. SEED FOOD ITEMS (Global Reference Data)
  // ========================================================================
  console.log('📦 Seeding FoodItems...');
  
  const foodItems = await prisma.foodItem.createMany({
    data: [
      {
        name: 'Milk',
        category: 'Dairy',
        defaultExpirationDays: 7,
        averageCost: 3.50,
        unit: 'liter',
      },
      {
        name: 'Rice',
        category: 'Grains',
        defaultExpirationDays: 365,
        averageCost: 1.20,
        unit: 'kg',
      },
      {
        name: 'Eggs',
        category: 'Proteins',
        defaultExpirationDays: 21,
        averageCost: 4.00,
        unit: 'dozen',
      },
      {
        name: 'Spinach',
        category: 'Vegetables',
        defaultExpirationDays: 5,
        averageCost: 2.50,
        unit: 'kg',
      },
      {
        name: 'Apples',
        category: 'Fruits',
        defaultExpirationDays: 14,
        averageCost: 3.00,
        unit: 'kg',
      },
      {
        name: 'Bread',
        category: 'Grains',
        defaultExpirationDays: 5,
        averageCost: 2.00,
        unit: 'loaf',
      },
      {
        name: 'Chicken Breast',
        category: 'Proteins',
        defaultExpirationDays: 3,
        averageCost: 8.50,
        unit: 'kg',
      },
      {
        name: 'Tomato',
        category: 'Vegetables',
        defaultExpirationDays: 7,
        averageCost: 2.00,
        unit: 'kg',
      },
    ],
    skipDuplicates: true,
  });

  console.log(`✅ Seeded ${foodItems.count} food items\n`);

  // ========================================================================
  // 2. SEED RESOURCES (Sustainability Tips & Articles)
  // ========================================================================
  console.log('📚 Seeding Resources...');
  
  const resources = await prisma.resource.createMany({
    data: [
      {
        title: 'Proper Milk Storage: Keep It Fresh Longer',
        content:
          'Store milk in the coldest part of your refrigerator (usually the back), never in the door. Keep the temperature at 40°F or below. Milk typically lasts 7-10 days after opening, but unopened milk can last up to 2 weeks.',
        categoryTag: 'Dairy',
        resourceType: 'TIP',
      },
      {
        title: 'Rice Storage Guide for Maximum Shelf Life',
        content:
          'Store rice in an airtight container in a cool, dry place. Properly stored white rice can last indefinitely, while brown rice lasts about 6 months due to its oil content. Keep away from moisture and pests.',
        categoryTag: 'Grains',
        resourceType: 'TIP',
      },
      {
        title: 'Reduce Vegetable Waste: Composting & Preservation',
        content:
          'Extend the life of leafy greens by storing them in paper towels within plastic bags. Composting vegetable scraps like spinach stems and carrot peels reduces waste and creates nutrient-rich soil for your garden.',
        categoryTag: 'Vegetables',
        resourceType: 'ARTICLE',
      },
      {
        title: 'Smart Fruit Storage: Keep Apples Fresh for Weeks',
        content:
          'Store apples in the crisper drawer of your refrigerator, separate from other produce. Apples release ethylene gas which can spoil nearby fruits. Properly stored apples can last up to 4 weeks.',
        categoryTag: 'Fruits',
        resourceType: 'TIP',
      },
      {
        title: 'Food Safety: Proper Handling of Proteins',
        content:
          'Always keep proteins like chicken and eggs at proper refrigeration temperatures (below 40°F). Use chicken within 3-4 days of purchase. Cook eggs thoroughly and store separately from raw foods to prevent cross-contamination.',
        categoryTag: 'Proteins',
        resourceType: 'VIDEO',
      },
      {
        title: 'Creative Ways to Use Stale Bread',
        content:
          'Transform stale bread into croutons, breadcrumbs, or bread pudding. Freezing bread extends its life by several months. Use thawed bread for French toast or toast for bruschetta toppings.',
        categoryTag: 'Grains',
        resourceType: 'ARTICLE',
      },
    ],
    skipDuplicates: true,
  });

  console.log(`✅ Seeded ${resources.count} resources\n`);

  // ========================================================================
  // 3. SEED TEST USER
  // ========================================================================
  console.log('👤 Seeding Test User...');
  
  // Note: In production, passwords should be hashed using bcrypt
  // This is for demonstration only
  const hashedPassword = '$2b$10$example_hash_of_password123'; // Placeholder hash
  
  const testUser = await prisma.user.upsert({
    where: { email: 'vegetarian.user@example.com' },
    update: {},
    create: {
      email: 'vegetarian.user@example.com',
      passwordHash: hashedPassword,
      fullName: 'Alice Vegetarian',
      householdSize: 2,
      dietaryPreferences: ['Vegetarian', 'Gluten-Free'], // JSON array
      location: 'New York, USA',
    },
  });

  console.log(`✅ Seeded test user: ${testUser.email}\n`);

  // ========================================================================
  // 4. SEED SAMPLE INVENTORY FOR TEST USER
  // ========================================================================
  console.log('📋 Seeding Sample Inventory...');
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const inventoryItems = await prisma.inventory.createMany({
    data: [
      {
        userId: testUser.id,
        foodItemId: 1, // Milk
        customName: 'Organic Whole Milk',
        quantity: 1.5,
        unit: 'liter',
        purchaseDate: new Date(),
        expirationDate: nextWeek,
        sourceImageUrl: null,
        aiMetadata: {
          brand: 'Organic Valley',
          temperature_checked: true,
          quality_score: 9.5,
        },
      },
      {
        userId: testUser.id,
        foodItemId: 2, // Rice
        customName: 'Basmati Rice',
        quantity: 2.0,
        unit: 'kg',
        purchaseDate: new Date('2025-10-01'),
        expirationDate: new Date('2026-10-01'),
        sourceImageUrl: null,
        aiMetadata: {
          brand: 'Tilda',
          storage_condition: 'sealed_container',
        },
      },
      {
        userId: testUser.id,
        foodItemId: 4, // Spinach
        customName: 'Fresh Spinach Bundle',
        quantity: 0.5,
        unit: 'kg',
        purchaseDate: new Date(),
        expirationDate: nextWeek,
        sourceImageUrl: null,
        aiMetadata: {
          ripeness_level: 'fresh',
          detected_freshness: 'excellent',
        },
      },
      {
        userId: testUser.id,
        customName: 'Homemade Vegetable Soup',
        quantity: 2.0,
        unit: 'containers',
        purchaseDate: new Date('2025-11-18'),
        expirationDate: new Date('2025-11-22'),
        foodItemId: null, // Custom item, not in FoodItem table
        sourceImageUrl: null,
        aiMetadata: {
          type: 'prepared_meal',
          ingredients: ['spinach', 'carrots', 'onions'],
          storage: 'refrigerated',
        },
      },
    ],
  });

  console.log(`✅ Seeded ${inventoryItems.count} inventory items\n`);

  // ========================================================================
  // 5. SEED SAMPLE CONSUMPTION LOGS FOR TEST USER
  // ========================================================================
  console.log('📊 Seeding Sample Consumption Logs...');
  
  const consumptionLogs = await prisma.consumptionLog.createMany({
    data: [
      {
        userId: testUser.id,
        foodName: 'Milk',
        actionType: 'PURCHASED',
        quantity: 1.5,
        reasonForWaste: null,
        logDate: new Date('2025-11-15'),
      },
      {
        userId: testUser.id,
        foodName: 'Rice',
        actionType: 'PURCHASED',
        quantity: 2.0,
        reasonForWaste: null,
        logDate: new Date('2025-10-01'),
      },
      {
        userId: testUser.id,
        foodName: 'Milk',
        actionType: 'CONSUMED',
        quantity: 0.5,
        reasonForWaste: null,
        logDate: new Date('2025-11-17'),
      },
      {
        userId: testUser.id,
        foodName: 'Spinach',
        actionType: 'PURCHASED',
        quantity: 0.5,
        reasonForWaste: null,
        logDate: new Date('2025-11-18'),
      },
      {
        userId: testUser.id,
        foodName: 'Lettuce',
        actionType: 'WASTED',
        quantity: 0.3,
        reasonForWaste: 'Wilted due to improper storage',
        logDate: new Date('2025-11-16'),
      },
    ],
  });

  console.log(`✅ Seeded ${consumptionLogs.count} consumption logs\n`);

  console.log('✨ Database seeding completed successfully!');
  console.log(`
🎯 Summary:
   • Food Items: ${foodItems.count}
   • Resources: ${resources.count}
   • Test User: ${testUser.email}
   • Inventory Items: ${inventoryItems.count}
   • Consumption Logs: ${consumptionLogs.count}
  `);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
