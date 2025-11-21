const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

// Essential middleware
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Try to serve static files if public folder exists
try {
  app.use(express.static("public"));
} catch (e) {
  console.log("Public folder not available");
}

// Simple in-memory storage
const users = {};

// ===== ENDPOINTS =====

// Root - MUST WORK
app.get("/", (req, res) => {
  try {
    res.json({ 
      status: "✅ NourishAI Chatbot is RUNNING",
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Health check
app.get("/health", (req, res) => {
  try {
    res.json({ status: "ok" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Chat API
app.post("/api/chat", (req, res) => {
  try {
    const { userId, message } = req.body;
    
    if (!userId || !message) {
      return res.status(400).json({ error: "Missing userId or message" });
    }
    
    if (!users[userId]) {
      users[userId] = { id: userId, messages: [] };
    }
    
    users[userId].messages.push({ 
      user: message, 
      timestamp: new Date() 
    });
    
    res.json({
      success: true,
      message: "Hello! I'm NourishAI. How can I help you reduce food waste?",
      userId
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// User API
app.get("/api/user/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    if (!users[userId]) {
      users[userId] = { id: userId };
    }
    res.json(users[userId]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Inventory API
app.get("/api/user/:userId/inventory", (req, res) => {
  try {
    res.json({ inventory: [] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/user/:userId/inventory", (req, res) => {
  try {
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Analytics API
app.get("/api/user/:userId/analytics", (req, res) => {
  try {
    res.json({ sdgScore: 50 });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Server error", message: err.message });
});

// START SERVER
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 NourishAI Chatbot running on port ${PORT}`);
  });
}

module.exports = app;
