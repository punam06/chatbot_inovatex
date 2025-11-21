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
      console.error("❌ Gemini not initialized");
      return generateFallbackResponse(message, preferences);
    }
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const systemPrompt = `You are NourishAI, a friendly and helpful food waste reduction chatbot specializing in reducing food waste.

User Context:
- Budget: ${preferences.budget || 'moderate'}
- Family Size: ${preferences.familySize || 1}
- Dietary Preferences: ${preferences.dietaryPreferences ? preferences.dietaryPreferences.join(', ') : 'none'}
- Allergies: ${preferences.allergies ? preferences.allergies.join(', ') : 'none'}

Your expertise:
- Meal planning and recipes based on their budget and preferences
- Food storage tips to extend shelf life
- Reducing food waste strategies
- Sustainable living tips
- Budget-friendly cooking techniques
- Managing dietary preferences and allergies

Respond helpfully and conversationally in 2-3 sentences. Be specific and actionable. Consider their preferences.`;

    const prompt = `${systemPrompt}\n\nUser question: ${message}`;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    if (!text || text.trim().length === 0) {
      return generateFallbackResponse(message, preferences);
    }
    
    return text;
  } catch (e) {
    console.error("❌ AI Error:", e.message);
    return generateFallbackResponse(message, preferences);
  }
}

// Generate contextual fallback responses
function generateFallbackResponse(message, preferences = {}) {
  const msg = message.toLowerCase();
  
  if (msg.includes('recipe') || msg.includes('meal') || msg.includes('cook')) {
    return `I'd be happy to help with recipes! For a family of ${preferences.familySize || 1} with a ${preferences.budget || 'moderate'} budget, I recommend planning meals that maximize ingredient use. What type of cuisine or ingredients are you interested in?`;
  }
  
  if (msg.includes('waste') || msg.includes('save') || msg.includes('reduce')) {
    return `Great question about reducing food waste! The best strategies include: proper food storage, meal planning, composting, and using leftovers creatively. What specific area would you like tips on?`;
  }
  
  if (msg.includes('allerg') || msg.includes('diet')) {
    return `I understand dietary needs are important! With your preferences (${preferences.dietaryPreferences?.join(', ') || 'standard'}), I can suggest meals and alternatives. What would you like to cook?`;
  }
  
  if (msg.includes('budget') || msg.includes('cheap') || msg.includes('afford')) {
    return `Budget-friendly cooking is my specialty! Focus on seasonal produce, bulk items, and versatile ingredients. What meals are you planning for your family of ${preferences.familySize || 1}?`;
  }
  
  return `I'm NourishAI, your food waste reduction assistant! I can help with meal planning, recipes, storage tips, and sustainable living. What would you like to know?`;
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
