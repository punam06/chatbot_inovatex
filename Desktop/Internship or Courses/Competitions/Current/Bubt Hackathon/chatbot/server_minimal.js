/**
 * NourishAI Chatbot - Minimal Working Version for Vercel
 */

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

// Safely load env
try {
  require("dotenv").config();
} catch (e) {
  // ignore
}

// Safe Gemini import
let genAI = null;
try {
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyDaB12Xx2tqyV2g0VcKZlwx1_EvZM52y8g");
} catch (e) {
  console.log("Gemini API not available");
}

// In-memory user storage
const userDatabase = {};

// Express setup
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.static("public"));

// ============================================================================
// BASIC ENDPOINTS
// ============================================================================

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    name: "🌿 NourishAI Chatbot API",
    version: "1.0.0",
    status: "✅ Running",
    endpoints: {
      chat: "POST /api/chat",
      health: "GET /health",
      user: "GET /api/user/:userId",
      inventory: "GET /api/user/:userId/inventory",
      analytics: "GET /api/user/:userId/analytics",
    },
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "✅ OK" });
});

// ============================================================================
// USER ENDPOINTS
// ============================================================================

// Get or create user
app.get("/api/user/:userId", (req, res) => {
  const { userId } = req.params;
  
  if (!userDatabase[userId]) {
    userDatabase[userId] = {
      userId,
      createdAt: new Date(),
      preferences: {
        language: "English",
        budget: "moderate",
        dietaryPreferences: [],
        familySize: 1,
        allergies: [],
        location: "Bangladesh",
      },
      inventory: [],
      conversationHistory: [],
      statistics: {
        totalWasteReduced: 0,
        mealsPlanedCount: 0,
        messagesCount: 0,
        sdgScore: 50,
      },
    };
  }
  
  res.json(userDatabase[userId]);
});

// Get inventory
app.get("/api/user/:userId/inventory", (req, res) => {
  const { userId } = req.params;
  const user = userDatabase[userId] || { inventory: [] };
  res.json({ inventory: user.inventory || [] });
});

// Add inventory item
app.post("/api/user/:userId/inventory", (req, res) => {
  const { userId } = req.params;
  const { name, quantity, unit, expiryDate } = req.body;
  
  if (!userDatabase[userId]) {
    return res.status(404).json({ error: "User not found" });
  }
  
  const item = {
    id: `item_${Date.now()}`,
    name,
    quantity,
    unit,
    expiryDate,
    addedDate: new Date(),
  };
  
  userDatabase[userId].inventory.push(item);
  res.json({ success: true, item });
});

// Get analytics
app.get("/api/user/:userId/analytics", (req, res) => {
  const { userId } = req.params;
  const user = userDatabase[userId] || {};
  
  res.json({
    userId,
    sdgScore: user.statistics?.sdgScore || 50,
    wasteReduced: user.statistics?.totalWasteReduced || 0,
    messagesCount: user.statistics?.messagesCount || 0,
    inventoryCount: user.inventory?.length || 0,
  });
});

// ============================================================================
// CHAT ENDPOINT
// ============================================================================

app.post("/api/chat", async (req, res) => {
  try {
    const { userId, message } = req.body;
    
    if (!userId || !message) {
      return res.status(400).json({ error: "Missing userId or message" });
    }
    
    // Get or create user
    if (!userDatabase[userId]) {
      userDatabase[userId] = {
        userId,
        createdAt: new Date(),
        preferences: {},
        inventory: [],
        conversationHistory: [],
        statistics: { sdgScore: 50, totalWasteReduced: 0, messagesCount: 0, mealsPlanedCount: 0 },
      };
    }
    
    const user = userDatabase[userId];
    user.statistics.messagesCount += 1;
    
    // Simple response
    let botResponse = "Hello! I'm NourishAI, your food waste reduction assistant. How can I help you reduce food waste today?";
    
    // Try to use Gemini if available
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(
          `You are NourishAI, a friendly food waste reduction chatbot. User message: "${message}". Respond helpfully in 1-2 sentences.`
        );
        botResponse = result.response.text();
      } catch (e) {
        console.log("Gemini API error, using fallback response");
        botResponse = `Thanks for your message: "${message}". I'm here to help reduce food waste!`;
      }
    }
    
    // Store conversation
    user.conversationHistory.push({
      id: `msg_${Date.now()}`,
      timestamp: new Date(),
      userMessage: message,
      botResponse,
    });
    
    // Keep only last 50 messages
    if (user.conversationHistory.length > 50) {
      user.conversationHistory = user.conversationHistory.slice(-50);
    }
    
    res.json({
      success: true,
      message: botResponse,
      userId,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({
      error: "Chat failed",
      message: "Server error. Please try again.",
    });
  }
});

// ============================================================================
// ERROR HANDLER
// ============================================================================

app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Server error",
    message: "An unexpected error occurred",
  });
});

// ============================================================================
// START SERVER
// ============================================================================

const server = app.listen(PORT, () => {
  console.log(`\n🚀 NourishAI Chatbot running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`\n✅ Server is ready for requests`);
});

module.exports = app;
