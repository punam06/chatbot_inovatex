# Data Structure Examples (JSON)

Complete JSON examples for API requests/responses. Use these as templates for frontend and API development.

---

## 👤 User Data Structures

### User Registration Request

```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123",
  "full_name": "John Doe",
  "household_size": 2,
  "dietary_preferences": ["Vegetarian", "Gluten-Free"],
  "location": "New York, NY"
}
```

### User Response (from GET /api/users/:id)

```json
{
  "id": 1,
  "email": "vegetarian.user@example.com",
  "full_name": "Test User",
  "household_size": 4,
  "dietary_preferences": ["Vegetarian", "Gluten-Free"],
  "location": "Dhaka, Bangladesh",
  "created_at": "2025-11-19T10:00:00Z",
  "updated_at": "2025-11-19T10:00:00Z"
}
```

**Notes**:
- `password_hash` is NEVER returned to frontend
- Timestamps are in ISO 8601 format
- dietary_preferences is a JSON array of strings

---

## 🍎 Food Items

### Food Item Response (from GET /api/food-items)

```json
{
  "id": 1,
  "name": "Milk",
  "category": "Dairy",
  "default_expiration_days": 7,
  "average_cost": 3.50,
  "unit": "liter",
  "created_at": "2025-11-19T10:00:00Z",
  "updated_at": "2025-11-19T10:00:00Z"
}
```

### All Pre-loaded Food Items

```json
[
  {
    "id": 1,
    "name": "Milk",
    "category": "Dairy",
    "default_expiration_days": 7,
    "average_cost": 3.50,
    "unit": "liter"
  },
  {
    "id": 2,
    "name": "Rice",
    "category": "Grains",
    "default_expiration_days": 365,
    "average_cost": 2.00,
    "unit": "kg"
  },
  {
    "id": 3,
    "name": "Eggs",
    "category": "Protein",
    "default_expiration_days": 21,
    "average_cost": 4.50,
    "unit": "dozen"
  },
  {
    "id": 4,
    "name": "Spinach",
    "category": "Vegetables",
    "default_expiration_days": 5,
    "average_cost": 1.50,
    "unit": "bunch"
  },
  {
    "id": 5,
    "name": "Apples",
    "category": "Fruits",
    "default_expiration_days": 14,
    "average_cost": 0.80,
    "unit": "piece"
  },
  {
    "id": 6,
    "name": "Bread",
    "category": "Grains",
    "default_expiration_days": 3,
    "average_cost": 2.50,
    "unit": "loaf"
  },
  {
    "id": 7,
    "name": "Chicken Breast",
    "category": "Protein",
    "default_expiration_days": 2,
    "average_cost": 8.00,
    "unit": "kg"
  },
  {
    "id": 8,
    "name": "Tomato",
    "category": "Vegetables",
    "default_expiration_days": 7,
    "average_cost": 1.20,
    "unit": "piece"
  }
]
```

---

## 📦 Inventory Management

### Add Item to Inventory Request (POST /api/inventory)

```json
{
  "food_item_id": 1,
  "custom_name": "Organic Whole Milk",
  "quantity": 2.5,
  "unit": "liter",
  "purchase_date": "2025-11-19",
  "expiration_date": "2025-11-26"
}
```

### Inventory Item Response (from GET /api/inventory/:id)

```json
{
  "id": 1,
  "user_id": 1,
  "food_item_id": 1,
  "custom_name": "Full Cream Milk",
  "quantity": 2.00,
  "unit": "liter",
  "purchase_date": "2025-11-17",
  "expiration_date": "2025-11-24",
  "source_image_url": null,
  "ai_metadata": null,
  "created_at": "2025-11-19T10:00:00Z",
  "updated_at": "2025-11-19T10:00:00Z",
  "food_item": {
    "id": 1,
    "name": "Milk",
    "category": "Dairy",
    "default_expiration_days": 7,
    "average_cost": 3.50,
    "unit": "liter"
  }
}
```

### User's Inventory List Response (from GET /api/inventory)

```json
{
  "user_id": 1,
  "total_items": 4,
  "items": [
    {
      "id": 1,
      "custom_name": "Full Cream Milk",
      "quantity": 2.00,
      "unit": "liter",
      "expiration_date": "2025-11-24",
      "days_until_expiry": 5,
      "food_item": {
        "id": 1,
        "name": "Milk",
        "category": "Dairy"
      }
    },
    {
      "id": 2,
      "custom_name": "Fresh Spinach Bunch",
      "quantity": 1.00,
      "unit": "bunch",
      "expiration_date": "2025-11-23",
      "days_until_expiry": 4,
      "food_item": {
        "id": 4,
        "name": "Spinach",
        "category": "Vegetables"
      }
    },
    {
      "id": 3,
      "custom_name": "Whole Wheat Bread",
      "quantity": 1.00,
      "unit": "loaf",
      "expiration_date": "2025-11-21",
      "days_until_expiry": 2,
      "food_item": {
        "id": 6,
        "name": "Bread",
        "category": "Grains"
      }
    },
    {
      "id": 4,
      "custom_name": "Red Apples",
      "quantity": 5.00,
      "unit": "piece",
      "expiration_date": "2025-11-28",
      "days_until_expiry": 9,
      "food_item": {
        "id": 5,
        "name": "Apples",
        "category": "Fruits"
      }
    }
  ]
}
```

### Update Inventory Item Request (PUT /api/inventory/:id)

```json
{
  "quantity": 1.5,
  "custom_name": "Organic Milk - Opened",
  "expiration_date": "2025-11-22"
}
```

### Inventory with AI Metadata (Example)

```json
{
  "id": 1,
  "custom_name": "Organic Whole Milk",
  "quantity": 2.00,
  "unit": "liter",
  "expiration_date": "2025-11-26",
  "source_image_url": "https://cdn.example.com/uploads/receipt_abc123.jpg",
  "ai_metadata": {
    "detected_from_image": true,
    "brand": "Organic Valley",
    "product_type": "Whole Milk",
    "container_size": "1 liter",
    "price": 3.50,
    "barcode": "070038612819",
    "detected_allergens": [],
    "storage_requirement": "refrigerate",
    "freshness_score": 0.95,
    "packaging_condition": "sealed",
    "confidence": 0.98
  }
}
```

---

## 📝 Consumption Logs

### Log Consumption Action Request (POST /api/consumption/log)

```json
{
  "inventory_id": 1,
  "action_type": "CONSUMED",
  "quantity": 0.5,
  "reason_for_waste": null
}
```

### Log Waste Request (POST /api/consumption/log)

```json
{
  "inventory_id": 4,
  "action_type": "WASTED",
  "quantity": 1.0,
  "reason_for_waste": "Got bruised, not edible"
}
```

### Log Purchase Request (POST /api/consumption/log)

```json
{
  "food_item_id": 1,
  "food_name": "Milk",
  "action_type": "PURCHASED",
  "quantity": 2.0
}
```

### Consumption Log Entry Response

```json
{
  "id": 1,
  "user_id": 1,
  "food_name": "Spinach",
  "action_type": "PURCHASED",
  "quantity": 1.00,
  "reason_for_waste": null,
  "log_date": "2025-11-18T10:00:00Z"
}
```

### User Consumption History Response (GET /api/consumption/history)

```json
{
  "user_id": 1,
  "total_logs": 5,
  "logs": [
    {
      "id": 5,
      "food_name": "Bread",
      "action_type": "PURCHASED",
      "quantity": 1.00,
      "log_date": "2025-11-19T08:00:00Z"
    },
    {
      "id": 4,
      "food_name": "Apples",
      "action_type": "WASTED",
      "quantity": 1.00,
      "reason_for_waste": "Got bruised, not edible",
      "log_date": "2025-11-16T15:00:00Z"
    },
    {
      "id": 3,
      "food_name": "Spinach",
      "action_type": "CONSUMED",
      "quantity": 0.50,
      "log_date": "2025-11-18T11:00:00Z"
    },
    {
      "id": 2,
      "food_name": "Milk",
      "action_type": "PURCHASED",
      "quantity": 2.00,
      "log_date": "2025-11-17T09:30:00Z"
    },
    {
      "id": 1,
      "food_name": "Spinach",
      "action_type": "PURCHASED",
      "quantity": 1.00,
      "log_date": "2025-11-18T10:00:00Z"
    }
  ]
}
```

---

## 📊 Statistics & Aggregations

### User Consumption Statistics Response (GET /api/consumption/stats)

```json
{
  "user_id": 1,
  "email": "vegetarian.user@example.com",
  "full_name": "Test User",
  "statistics": {
    "total_purchased": 3,
    "total_consumed": 1,
    "total_wasted": 1,
    "total_donated": 0,
    "total_waste_quantity": 1.00,
    "last_action_date": "2025-11-19T08:00:00Z"
  },
  "waste_by_category": {
    "Fruits": {
      "count": 1,
      "quantity": 1.00,
      "examples": ["Apples"]
    }
  },
  "sustainability_score": 0.75
}
```

### Expiring Items Alert Response (GET /api/alerts/expiring)

```json
{
  "user_id": 1,
  "expiring_soon": [
    {
      "id": 3,
      "custom_name": "Whole Wheat Bread",
      "food_item": {
        "name": "Bread",
        "category": "Grains"
      },
      "quantity": 1.00,
      "unit": "loaf",
      "expiration_date": "2025-11-21",
      "days_until_expiry": 2,
      "urgency": "HIGH"
    },
    {
      "id": 2,
      "custom_name": "Fresh Spinach Bunch",
      "food_item": {
        "name": "Spinach",
        "category": "Vegetables"
      },
      "quantity": 1.00,
      "unit": "bunch",
      "expiration_date": "2025-11-23",
      "days_until_expiry": 4,
      "urgency": "MEDIUM"
    },
    {
      "id": 1,
      "custom_name": "Full Cream Milk",
      "food_item": {
        "name": "Milk",
        "category": "Dairy"
      },
      "quantity": 2.00,
      "unit": "liter",
      "expiration_date": "2025-11-24",
      "days_until_expiry": 5,
      "urgency": "MEDIUM"
    }
  ],
  "alert_count": 3
}
```

---

## 📚 Educational Resources

### Resource Request (GET /api/resources/:id)

```json
{
  "id": 1,
  "title": "How to Store Vegetables Properly",
  "content": "Keep leafy greens in a plastic bag in the refrigerator to maintain moisture. Store root vegetables in a cool, dark place. Tomatoes should NOT be refrigerated.",
  "category_tag": "Storage Tips",
  "resource_type": "TIP",
  "created_at": "2025-11-19T10:00:00Z",
  "updated_at": "2025-11-19T10:00:00Z"
}
```

### Resources List Response (GET /api/resources?type=ARTICLE)

```json
{
  "total_resources": 4,
  "resources": [
    {
      "id": 2,
      "title": "Understanding Expiration Dates",
      "category_tag": "Food Safety",
      "resource_type": "ARTICLE",
      "excerpt": "Learn the difference between 'best by,' 'sell by,' and 'use by' dates..."
    },
    {
      "id": 4,
      "title": "Meal Planning to Reduce Waste",
      "category_tag": "Meal Planning",
      "resource_type": "ARTICLE",
      "excerpt": "Plan your meals based on what you already have..."
    },
    {
      "id": 6,
      "title": "Composting at Home",
      "category_tag": "Sustainability",
      "resource_type": "ARTICLE",
      "excerpt": "Turn your food scraps into nutrient-rich compost..."
    }
  ]
}
```

### All Pre-loaded Resources

```json
[
  {
    "id": 1,
    "title": "How to Store Vegetables Properly",
    "category_tag": "Storage Tips",
    "resource_type": "TIP"
  },
  {
    "id": 2,
    "title": "Understanding Expiration Dates",
    "category_tag": "Food Safety",
    "resource_type": "ARTICLE"
  },
  {
    "id": 3,
    "title": "Creative Ways to Use Leftover Vegetables",
    "category_tag": "Recipe Ideas",
    "resource_type": "VIDEO"
  },
  {
    "id": 4,
    "title": "Meal Planning to Reduce Waste",
    "category_tag": "Meal Planning",
    "resource_type": "ARTICLE"
  },
  {
    "id": 5,
    "title": "Freezing Guide for Common Foods",
    "category_tag": "Food Preservation",
    "resource_type": "TIP"
  },
  {
    "id": 6,
    "title": "Composting at Home",
    "category_tag": "Sustainability",
    "resource_type": "ARTICLE"
  }
]
```

---

## 🚨 Error Response Examples

### Resource Not Found

```json
{
  "error": "NOT_FOUND",
  "message": "Inventory item with id 999 not found",
  "status": 404
}
```

### Validation Error

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Quantity must be greater than 0",
  "field": "quantity",
  "value": -1,
  "status": 400
}
```

### Unauthorized

```json
{
  "error": "UNAUTHORIZED",
  "message": "You don't have permission to access this inventory item",
  "status": 403
}
```

### Invalid Enum

```json
{
  "error": "INVALID_ENUM",
  "message": "Invalid action_type. Must be one of: PURCHASED, CONSUMED, WASTED, DONATED",
  "field": "action_type",
  "allowed_values": ["PURCHASED", "CONSUMED", "WASTED", "DONATED"],
  "received": "INVALID",
  "status": 400
}
```

---

## 📱 Dashboard Response Example

### Complete Dashboard Data (GET /api/dashboard)

```json
{
  "user": {
    "id": 1,
    "email": "vegetarian.user@example.com",
    "full_name": "Test User",
    "household_size": 4,
    "dietary_preferences": ["Vegetarian", "Gluten-Free"],
    "location": "Dhaka, Bangladesh"
  },
  "statistics": {
    "total_items": 4,
    "total_purchased": 3,
    "total_consumed": 1,
    "total_wasted": 1,
    "total_donated": 0,
    "waste_percentage": 25,
    "sustainability_score": 75
  },
  "inventory_summary": {
    "fresh_items": 3,
    "expiring_soon": 1,
    "expired": 0,
    "total_quantity": 9.0
  },
  "expiring_alerts": [
    {
      "id": 3,
      "custom_name": "Whole Wheat Bread",
      "expiration_date": "2025-11-21",
      "days_until_expiry": 2,
      "urgency": "HIGH"
    }
  ],
  "recent_actions": [
    {
      "id": 5,
      "food_name": "Bread",
      "action_type": "PURCHASED",
      "quantity": 1.00,
      "log_date": "2025-11-19T08:00:00Z"
    },
    {
      "id": 3,
      "food_name": "Spinach",
      "action_type": "CONSUMED",
      "quantity": 0.50,
      "log_date": "2025-11-18T11:00:00Z"
    }
  ],
  "recommended_resources": [
    {
      "id": 1,
      "title": "How to Store Vegetables Properly",
      "reason": "You have 1 vegetable item expiring soon"
    },
    {
      "id": 5,
      "title": "Freezing Guide for Common Foods",
      "reason": "Popular with vegetarian diets"
    }
  ]
}
```

---

## 🔌 Integration Checklist

When building features, ensure your API matches these structures:

- [ ] User requests include optional dietary_preferences as array
- [ ] Food items responses include default_expiration_days
- [ ] Inventory responses include calculated days_until_expiry
- [ ] Consumption logs include optional reason_for_waste
- [ ] Statistics use aggregated views (not recalculated)
- [ ] Dates are in ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ)
- [ ] Error responses include error code and message
- [ ] Enum values match exactly (case-sensitive)
- [ ] Quantities use DECIMAL (2 decimal places)
- [ ] Never return password_hash in any response

---

**Last Updated**: November 2025  
**Status**: Ready for API Development ✅

