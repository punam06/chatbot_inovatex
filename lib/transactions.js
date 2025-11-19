// lib/transactions.js
// Transaction utilities for atomic database operations

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Atomically consume an item from inventory
 * 
 * This function uses a Prisma transaction to ensure:
 * 1. Inventory quantity is decremented
 * 2. ConsumptionLog entry is created
 * 3. Both operations succeed or fail together (atomicity)
 * 
 * @param {number} inventoryId - The ID of the inventory item to consume
 * @param {number} userId - The user ID (for validation)
 * @param {number} quantityToConsume - Amount to consume
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Transaction result with updated inventory and log entry
 * @throws {Error} - If inventory doesn't exist, doesn't belong to user, or insufficient quantity
 */
async function consumeItem(inventoryId, userId, quantityToConsume, options = {}) {
  const { reasonForWaste = null } = options;

  // Validate inputs
  if (!inventoryId || !userId || !quantityToConsume) {
    throw new Error('Missing required parameters: inventoryId, userId, quantityToConsume');
  }

  if (quantityToConsume <= 0) {
    throw new Error('quantityToConsume must be greater than 0');
  }

  return await prisma.$transaction(
    async (tx) => {
      // Step 1: Fetch current inventory item with user validation
      const inventory = await tx.inventory.findUnique({
        where: { id: inventoryId },
        include: { foodItem: true },
      });

      if (!inventory) {
        throw new Error(`Inventory item with ID ${inventoryId} not found`);
      }

      if (inventory.userId !== userId) {
        throw new Error('Unauthorized: This inventory item does not belong to the user');
      }

      // Step 2: Validate sufficient quantity
      const currentQuantity = parseFloat(inventory.quantity);
      const amountToConsume = parseFloat(quantityToConsume);

      if (amountToConsume > currentQuantity) {
        throw new Error(
          `Insufficient quantity. Current: ${currentQuantity} ${inventory.unit}, Requested: ${amountToConsume} ${inventory.unit}`
        );
      }

      // Step 3: Update inventory - decrement quantity
      const updatedInventory = await tx.inventory.update({
        where: { id: inventoryId },
        data: {
          quantity: currentQuantity - amountToConsume,
        },
        include: { foodItem: true },
      });

      // Step 4: Create consumption log entry
      const consumptionLog = await tx.consumptionLog.create({
        data: {
          userId: userId,
          foodName: inventory.foodItem?.name || inventory.customName, // Use FoodItem name if linked, otherwise custom name
          actionType: 'CONSUMED',
          quantity: amountToConsume,
          reasonForWaste: null, // This is CONSUMED, not WASTED
          logDate: new Date(),
        },
      });

      // Step 5: Return transaction result
      return {
        success: true,
        inventory: updatedInventory,
        log: consumptionLog,
        message: `Successfully consumed ${amountToConsume} ${inventory.unit} of ${inventory.customName}`,
      };
    },
    {
      // Transaction options
      timeout: 5000, // 5 second timeout
      isolationLevel: 'Serializable', // Strongest isolation for critical operations
    }
  );
}

/**
 * Atomically waste an item from inventory
 * Similar to consumeItem but records the action as WASTED with optional reason
 * 
 * @param {number} inventoryId - The ID of the inventory item
 * @param {number} userId - The user ID (for validation)
 * @param {number} quantityToWaste - Amount to waste
 * @param {string} reason - Reason for waste (e.g., "Expired", "Spoiled", "Damaged")
 * @returns {Promise<Object>} - Transaction result
 */
async function wasteItem(inventoryId, userId, quantityToWaste, reason = 'Not specified') {
  if (!inventoryId || !userId || !quantityToWaste) {
    throw new Error('Missing required parameters: inventoryId, userId, quantityToWaste');
  }

  if (quantityToWaste <= 0) {
    throw new Error('quantityToWaste must be greater than 0');
  }

  return await prisma.$transaction(
    async (tx) => {
      // Fetch and validate inventory
      const inventory = await tx.inventory.findUnique({
        where: { id: inventoryId },
        include: { foodItem: true },
      });

      if (!inventory) {
        throw new Error(`Inventory item with ID ${inventoryId} not found`);
      }

      if (inventory.userId !== userId) {
        throw new Error('Unauthorized: This inventory item does not belong to the user');
      }

      const currentQuantity = parseFloat(inventory.quantity);
      const amountToWaste = parseFloat(quantityToWaste);

      if (amountToWaste > currentQuantity) {
        throw new Error(
          `Insufficient quantity. Current: ${currentQuantity} ${inventory.unit}, Requested: ${amountToWaste} ${inventory.unit}`
        );
      }

      // Update inventory
      const updatedInventory = await tx.inventory.update({
        where: { id: inventoryId },
        data: {
          quantity: currentQuantity - amountToWaste,
        },
        include: { foodItem: true },
      });

      // Create consumption log with WASTED action
      const consumptionLog = await tx.consumptionLog.create({
        data: {
          userId: userId,
          foodName: inventory.foodItem?.name || inventory.customName,
          actionType: 'WASTED',
          quantity: amountToWaste,
          reasonForWaste: reason,
          logDate: new Date(),
        },
      });

      return {
        success: true,
        inventory: updatedInventory,
        log: consumptionLog,
        message: `Recorded waste of ${amountToWaste} ${inventory.unit} of ${inventory.customName}`,
      };
    },
    {
      timeout: 5000,
      isolationLevel: 'Serializable',
    }
  );
}

/**
 * Atomically purchase a new item and add to inventory
 * Creates inventory entry and consumption log for PURCHASED action
 * 
 * @param {number} userId - The user ID
 * @param {Object} itemData - Item data (customName, quantity, unit, foodItemId?, expirationDate?)
 * @returns {Promise<Object>} - Created inventory and log entries
 */
async function purchaseItem(userId, itemData) {
  const { customName, quantity, unit, foodItemId = null, expirationDate = null } = itemData;

  if (!userId || !customName || !quantity || !unit) {
    throw new Error('Missing required fields: userId, customName, quantity, unit');
  }

  return await prisma.$transaction(
    async (tx) => {
      // Create inventory entry
      const newInventory = await tx.inventory.create({
        data: {
          userId,
          customName,
          quantity: parseFloat(quantity),
          unit,
          purchaseDate: new Date(),
          expirationDate: expirationDate ? new Date(expirationDate) : null,
          foodItemId: foodItemId || null,
          aiMetadata: {},
        },
        include: { foodItem: true },
      });

      // Create consumption log for purchase
      const consumptionLog = await tx.consumptionLog.create({
        data: {
          userId,
          foodName: customName,
          actionType: 'PURCHASED',
          quantity: parseFloat(quantity),
          logDate: new Date(),
        },
      });

      return {
        success: true,
        inventory: newInventory,
        log: consumptionLog,
        message: `Successfully added ${quantity} ${unit} of ${customName} to inventory`,
      };
    },
    {
      timeout: 5000,
      isolationLevel: 'Serializable',
    }
  );
}

/**
 * Get inventory items expiring soon (within next N days)
 * 
 * @param {number} userId - The user ID
 * @param {number} daysUntilExpiry - Number of days to look ahead (default: 3)
 * @returns {Promise<Array>} - Array of expiring inventory items
 */
async function getExpiringItems(userId, daysUntilExpiry = 3) {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysUntilExpiry);

  return await prisma.inventory.findMany({
    where: {
      userId,
      expirationDate: {
        gte: today,
        lte: futureDate,
      },
      quantity: {
        gt: 0,
      },
    },
    include: { foodItem: true },
    orderBy: { expirationDate: 'asc' },
  });
}

/**
 * Get user's consumption stats for a time period
 * 
 * @param {number} userId - The user ID
 * @param {Date} startDate - Start of period
 * @param {Date} endDate - End of period
 * @returns {Promise<Object>} - Stats including totals by action type
 */
async function getUserConsumptionStats(userId, startDate, endDate) {
  const logs = await prisma.consumptionLog.findMany({
    where: {
      userId,
      logDate: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const stats = {
    total: logs.length,
    consumed: 0,
    wasted: 0,
    purchased: 0,
    donated: 0,
    totalQuantityConsumed: 0,
    totalQuantityWasted: 0,
  };

  logs.forEach((log) => {
    const quantity = parseFloat(log.quantity);
    switch (log.actionType) {
      case 'CONSUMED':
        stats.consumed++;
        stats.totalQuantityConsumed += quantity;
        break;
      case 'WASTED':
        stats.wasted++;
        stats.totalQuantityWasted += quantity;
        break;
      case 'PURCHASED':
        stats.purchased++;
        break;
      case 'DONATED':
        stats.donated++;
        break;
    }
  });

  return stats;
}

module.exports = {
  consumeItem,
  wasteItem,
  purchaseItem,
  getExpiringItems,
  getUserConsumptionStats,
};
