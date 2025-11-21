const fs = require("fs");
const path = require("path");

// Gemini AI Setup
let genAI = null;
try {
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  const apiKey = process.env.GEMINI_API_KEY || "AIzaSyDaB12Xx2tqyV2g0VcKZlwx1_EvZM52y8g";
  genAI = new GoogleGenerativeAI(apiKey);
} catch (e) {
  console.log("Gemini not available");
}

// In-memory storage
const users = {};
let htmlCache = null;

// Helper: Generate AI response
async function getAIResponse(message) {
  try {
    if (!genAI) return "Hello from NourishAI! How can I help you reduce food waste?";
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(
      `You are NourishAI, a friendly food waste reduction chatbot focused on sustainability and meal planning. User: "${message}". Respond helpfully in 1-2 sentences.`
    );
    return result.response.text();
  } catch (e) {
    return "Thanks for your message! I'm here to help reduce food waste. What specific help do you need?";
  }
}

// Main handler
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const pathname = (req.url || "").split("?")[0];

  try {
    // Serve HTML
    if (pathname === "/" || pathname === "" || pathname === "/index.html") {
      if (!htmlCache) {
        const htmlPath = path.join(process.cwd(), "public", "index.html");
        htmlCache = fs.readFileSync(htmlPath, "utf-8");
      }
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(200).send(htmlCache);
    }

    // Serve CSS
    if (pathname.endsWith(".css")) {
      const cssPath = path.join(process.cwd(), "public", pathname);
      const css = fs.readFileSync(cssPath, "utf-8");
      res.setHeader("Content-Type", "text/css");
      return res.status(200).send(css);
    }

    // Serve JS
    if (pathname.endsWith(".js")) {
      const jsPath = path.join(process.cwd(), "public", pathname);
      const js = fs.readFileSync(jsPath, "utf-8");
      res.setHeader("Content-Type", "application/javascript");
      return res.status(200).send(js);
    }

    // API: Health
    if (pathname === "/health") {
      return res.status(200).json({ ok: true });
    }

    // API: Chat - WITH AI
    if (pathname === "/api/chat" && req.method === "POST") {
      let body = "";
      req.on("data", chunk => body += chunk);
      req.on("end", async () => {
        try {
          const data = JSON.parse(body);
          const { userId, message } = data;
          
          if (!userId || !message) {
            return res.status(400).json({ error: "Missing userId or message" });
          }

          // Create user if needed
          if (!users[userId]) {
            users[userId] = {
              id: userId,
              conversations: [],
              preferences: {}
            };
          }

          // Get AI response
          const aiResponse = await getAIResponse(message);

          // Store conversation
          users[userId].conversations.push({
            user: message,
            bot: aiResponse,
            timestamp: new Date()
          });

          res.status(200).json({
            success: true,
            message: aiResponse,
            userId
          });
        } catch (e) {
          res.status(500).json({ error: e.message });
        }
      });
      return;
    }

    // API: User GET
    if (pathname.match(/^\/api\/user\/[^/]+$/) && req.method === "GET") {
      const userId = pathname.split("/api/user/")[1];
      if (!users[userId]) {
        users[userId] = {
          id: userId,
          conversations: [],
          preferences: { language: "English", budget: "moderate" }
        };
      }
      return res.status(200).json(users[userId]);
    }

    // API: User POST (update preferences)
    if (pathname.match(/^\/api\/user\/[^/]+$/) && req.method === "POST") {
      const userId = pathname.split("/api/user/")[1];
      let body = "";
      req.on("data", chunk => body += chunk);
      req.on("end", () => {
        const data = JSON.parse(body);
        if (!users[userId]) users[userId] = { id: userId };
        users[userId].preferences = { ...users[userId].preferences, ...data };
        res.status(200).json(users[userId]);
      });
      return;
    }

    // API: Inventory GET
    if (pathname.includes("/inventory") && req.method === "GET") {
      return res.status(200).json({ inventory: [], success: true });
    }

    // API: Inventory POST
    if (pathname.includes("/inventory") && req.method === "POST") {
      return res.status(200).json({ success: true, message: "Item added" });
    }

    // API: Analytics
    if (pathname.includes("/analytics")) {
      return res.status(200).json({
        sdgScore: 50,
        wasteReduced: 0,
        messagesCount: 0,
        success: true
      });
    }

    // Default
    res.status(404).json({ error: "Endpoint not found" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
};
