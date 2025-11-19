// examples/usage.js
// Complete examples of how to use the transaction functions

const { 
  consumeItem, 
  wasteItem, 
  purchaseItem, 
  getExpiringItems, 
  getUserConsumptionStats 
} = require('../lib/transactions');

/**
 * Example 1: Purchase, Consume, and Waste Workflow
 */
async function exampleBasicWorkflow() {
  console.log('\n========================================');
  console.log('Example 1: Basic Workflow');
  console.log('========================================\n');

  const userId = 1; // Test user from seed

  try {
    // Step 1: User purchases milk
    console.log('📌 Step 1: Purchasing milk...');
    const purchase = await purchaseItem(userId, {
      customName: 'Organic Whole Milk',
      quantity: 2,
      unit: 'liter',
      foodItemId: 1, // Links to seed FoodItem: Milk
      expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });
    console.log('✅', purchase.message);
    const inventoryId = purchase.inventory.id;

    // Step 2: Consume some of the milk
    console.log('\n📌 Step 2: Consuming milk...');
    const consume = await consumeItem(inventoryId, userId, 0.5);
    console.log('✅', consume.message);
    console.log(`   Remaining: ${consume.inventory.quantity} ${consume.inventory.unit}`);

    // Step 3: More consumption
    console.log('\n📌 Step 3: Consuming more milk...');
    const consume2 = await consumeItem(inventoryId, userId, 0.3);
    console.log('✅', consume2.message);
    console.log(`   Remaining: ${consume2.inventory.quantity} ${consume2.inventory.unit}`);

    // Step 4: Waste the rest (expired)
    console.log('\n📌 Step 4: Wasting expired milk...');
    const waste = await wasteItem(inventoryId, userId, 1.2, 'Expired - past expiration date');
    console.log('✅', waste.message);
    console.log(`   Remaining: ${waste.inventory.quantity} ${waste.inventory.unit}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

/**
 * Example 2: Error Handling - Insufficient Quantity
 */
async function exampleErrorHandling() {
  console.log('\n========================================');
  console.log('Example 2: Error Handling');
  console.log('========================================\n');

  const userId = 1;

  try {
    // Purchase rice
    console.log('📌 Purchasing rice (1 kg)...');
    const purchase = await purchaseItem(userId, {
      customName: 'Basmati Rice',
      quantity: 1,
      unit: 'kg',
      foodItemId: 2
    });
    console.log('✅', purchase.message);
    const inventoryId = purchase.inventory.id;

    // Try to consume more than available
    console.log('\n📌 Attempting to consume 1.5 kg (more than available)...');
    const consume = await consumeItem(inventoryId, userId, 1.5);

  } catch (error) {
    console.error('✅ Caught expected error:', error.message);
  }
}

/**
 * Example 3: Multiple Items and Expiration Tracking
 */
async function exampleExpirationTracking() {
  console.log('\n========================================');
  console.log('Example 3: Expiration Tracking');
  console.log('========================================\n');

  const userId = 1;

  try {
    // Purchase items with different expiration dates
    const items = [
      {
        customName: 'Fresh Spinach',
        quantity: 0.5,
        unit: 'kg',
        foodItemId: 4,
        expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days - soon!
      },
      {
        customName: 'Whole Wheat Bread',
        quantity: 1,
        unit: 'loaf',
        foodItemId: 6,
        expirationDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) // 10 days
      },
      {
        customName: 'Chicken Breast',
        quantity: 0.8,
        unit: 'kg',
        foodItemId: 7,
        expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) // 1 day - very soon!
      }
    ];

    console.log('📌 Purchasing multiple items...');
    for (const item of items) {
      const result = await purchaseItem(userId, item);
      console.log(`✅ ${result.message}`);
    }

    // Check what's expiring in next 3 days
    console.log('\n📌 Checking items expiring in next 3 days...');
    const expiringIn3Days = await getExpiringItems(userId, 3);
    
    if (expiringIn3Days.length === 0) {
      console.log('✅ No items expiring in next 3 days');
    } else {
      console.log(`✅ Found ${expiringIn3Days.length} item(s) expiring soon:`);
      expiringIn3Days.forEach((item, index) => {
        console.log(
          `   ${index + 1}. ${item.customName} (${item.quantity} ${item.unit}) - Expires: ${item.expirationDate.toDateString()}`
        );
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

/**
 * Example 4: Consumption Statistics
 */
async function exampleConsumptionStats() {
  console.log('\n========================================');
  console.log('Example 4: Consumption Statistics');
  console.log('========================================\n');

  const userId = 1;

  try {
    // Create some activity
    console.log('📌 Creating sample consumption data...');
    
    // Purchase eggs
    const eggsResult = await purchaseItem(userId, {
      customName: 'Brown Eggs',
      quantity: 1,
      unit: 'dozen',
      foodItemId: 3
    });
    const eggsId = eggsResult.inventory.id;
    
    // Consume some eggs
    await consumeItem(eggsId, userId, 0.5);
    
    // Purchase apples
    const applesResult = await purchaseItem(userId, {
      customName: 'Red Apples',
      quantity: 2,
      unit: 'kg',
      foodItemId: 5
    });
    const applesId = applesResult.inventory.id;
    
    // Waste some apples
    await wasteItem(applesId, userId, 0.5, 'Bruised apples');

    // Get stats for current month
    console.log('\n📌 Calculating consumption stats for current month...');
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const today = new Date();
    
    const stats = await getUserConsumptionStats(userId, startOfMonth, today);
    
    console.log('✅ Monthly Statistics:');
    console.log(`   Total Actions: ${stats.total}`);
    console.log(`   Purchased: ${stats.purchased} items`);
    console.log(`   Consumed: ${stats.consumed} items (${stats.totalQuantityConsumed} units)`);
    console.log(`   Wasted: ${stats.wasted} items (${stats.totalQuantityWasted} units)`);
    console.log(`   Donated: ${stats.donated} items`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

/**
 * Example 5: User Authorization Check
 */
async function exampleAuthorizationCheck() {
  console.log('\n========================================');
  console.log('Example 5: Authorization Check');
  console.log('========================================\n');

  const userId1 = 1; // First user (from seed)
  const userId2 = 999; // Different user (doesn't exist)

  try {
    // User 1 purchases something
    console.log('📌 User 1 purchasing tomatoes...');
    const purchase = await purchaseItem(userId1, {
      customName: 'Fresh Tomatoes',
      quantity: 1.5,
      unit: 'kg',
      foodItemId: 8
    });
    console.log('✅', purchase.message);
    const inventoryId = purchase.inventory.id;

    // Try to access with different user
    console.log('\n📌 User 2 attempting to consume User 1\'s tomatoes...');
    const consume = await consumeItem(inventoryId, userId2, 0.5);

  } catch (error) {
    console.error('✅ Authorization denied (expected):', error.message);
  }
}

/**
 * Main: Run all examples
 */
async function runAllExamples() {
  console.log('\n');
  console.log('🚀 TRANSACTION EXAMPLES - INNOVATEX Food Management System');
  console.log('═══════════════════════════════════════════════════════════\n');

  try {
    // Example 1: Basic workflow
    await exampleBasicWorkflow();

    // Example 2: Error handling
    await exampleErrorHandling();

    // Example 3: Expiration tracking
    await exampleExpirationTracking();

    // Example 4: Statistics
    await exampleConsumptionStats();

    // Example 5: Authorization
    await exampleAuthorizationCheck();

    console.log('\n');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✨ All examples completed successfully!');
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Unexpected error:', error);
  }
}

// Run examples
if (require.main === module) {
  runAllExamples().catch(console.error);
}

module.exports = {
  exampleBasicWorkflow,
  exampleErrorHandling,
  exampleExpirationTracking,
  exampleConsumptionStats,
  exampleAuthorizationCheck
};
