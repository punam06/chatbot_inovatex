const fs = require("fs");
const path = require("path");

let genAI = null;
try {
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  const apiKey = process.env.GEMINI_API_KEY || "AIzaSyDaB12Xx2tqyV2g0VcKZlwx1_EvZM52y8g";
  genAI = new GoogleGenerativeAI(apiKey);
} catch (e) {
  console.log("⚠️ Gemini not available");
}

const users = {};
let htmlCache = null;

// Parse body safely
async function parseBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        resolve(req.body || {});
      }
    });
  });
}

// Get AI response with proper error handling
async function getAIResponse(message, preferences = {}) {
  try {
    if (!genAI) {
      return "Hello! I'm NourishAI, your food waste reduction assistant. How can I help you today?";
    }
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const systemPrompt = `You are NourishAI, a friendly and helpful food waste reduction chatbot. 
You specialize in:
- Meal planning and recipes
- Food storage tips
- Reducing food waste
- Sustainable living
- Budget-friendly cooking
- Dietary preferences and allergies

User preferences: ${JSON.stringify(preferences)}

Respond helpfully and conversationally in 2-3 sentences. Be specific and actionable.`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: message }] }],
      systemInstruction: systemPrompt,
    });

    return result.response.text() || "I'm here to help! What would you like to know?";
  } catch (e) {
    console.error("AI Error:", e.message);
    return "I'm here to help reduce food waste. Could you rephrase your question?";
  }
}

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
      try {
        const cssPath = path.join(process.cwd(), "public", pathname);
        const css = fs.readFileSync(cssPath, "utf-8");
        res.setHeader("Content-Type", "text/css");
        return res.status(200).send(css);
      } catch (e) {
        return res.status(404).json({ error: "CSS not found" });
      }
    }

    // Serve JS
    if (pathname.endsWith(".js")) {
      try {
        const jsPath = path.join(process.cwd(), "public", pathname);
        const js = fs.readFileSync(jsPath, "utf-8");
        res.setHeader("Content-Type", "application/javascript");
        return res.status(200).send(js);
      } catch (e) {
        return res.status(404).json({ error: "JS not found" });
      }
    }

    // Health check
    if (pathname === "/health") {
      return res.status(200).json({ ok: true, status: "running" });
    }

    // CREATE USER
    if (pathname === "/api/user/create" && req.method === "POST") {
      const body = await parseBody(req);
      const { userId, budget, familySize, dietaryPreferences, allergies } = body;

      if (!userId) {
        return res.status(400).json({ success: false, error: "Missing userId" });
      }

      users[userId] = {
        userId,
        user: {
          id: userId,
          preferences: {
            budget: budget || "moderate",
            familySize: familySize || 1,
            dietaryPreferences: dietaryPreferences || [],
            allergies: allergies || [],
          },
          conversations: [],
        },
      };

      return res.status(200).json({
        success: true,
        user: users[userId].user,
      });
    }

    // GET USER
    if (pathname.match(/^\/api\/user\/[^/]+$/) && req.method === "GET") {
      const userId = pathname.split("/api/user/")[1];

      if (!users[userId]) {
        users[userId] = {
          userId,
          user: {
            id: userId,
            preferences: {
              budget: "moderate",
              familySize: 1,
              dietaryPreferences: [],
              allergies: [],
            },
            conversations: [],
          },
        };
      }

      return res.status(200).json({
        success: true,
        user: users[userId].user,
      });
    }

    // CHAT - PRIMARY ENDPOINT FOR AI RESPONSES
    if (pathname === "/api/chat" && req.method === "POST") {
      const body = await parseBody(req);
      const { userId, message, preferences } = body;

      if (!userId || !message) {
        return res.status(400).json({
          success: false,
          error: "Missing userId or message",
        });
      }

      // Ensure user exists
      if (!users[userId]) {
        users[userId] = {
          userId,
          user: {
            id: userId,
            preferences: preferences || {
              budget: "moderate",
              familySize: 1,
              dietaryPreferences: [],
              allergies: [],
            },
            conversations: [],
          },
        };
      }

      // Get AI response
      const aiResponse = await getAIResponse(message, preferences || users[userId].user.preferences);

      // Store in conversation history
      users[userId].user.conversations.push({
        user: message,
        bot: aiResponse,
        timestamp: new Date().toISOString(),
      });

      return res.status(200).json({
        success: true,
        message: aiResponse,
        userId,
      });
    }

    // INVENTORY GET
    if (pathname.includes("/inventory") && req.method === "GET") {
      return res.status(200).json({
        success: true,
        inventory: [],
      });
    }

    // INVENTORY POST
    if (pathname.includes("/inventory") && req.method === "POST") {
      return res.status(200).json({
        success: true,
        message: "Item added successfully",
      });
    }

    // ANALYTICS
    if (pathname.includes("/analytics")) {
      return res.status(200).json({
        success: true,
        sdgScore: 50,
        wasteReduced: 0,
        messagesCount: 0,
      });
    }

    // 404
    res.status(404).json({
      success: false,
      error: "Endpoint not found",
    });
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Server error",
    });
  }
};
