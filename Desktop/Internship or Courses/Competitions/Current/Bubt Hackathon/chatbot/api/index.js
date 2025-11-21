const users = {};

module.exports = (req, res) => {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token,X-Requested-With,Accept,Accept-Version,Content-Length,Content-MD5,Content-Type,Date,X-Api-Version");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    const { pathname, query } = new URL(req.url, `http://${req.headers.host}`);

    // Root
    if (pathname === "/" || pathname === "") {
      return res.status(200).json({ status: "✅ NourishAI is running!" });
    }

    // Health
    if (pathname === "/health") {
      return res.status(200).json({ ok: true });
    }

    // Chat
    if (pathname === "/api/chat" && req.method === "POST") {
      let body = "";
      req.on("data", chunk => body += chunk);
      req.on("end", () => {
        try {
          const { userId, message } = JSON.parse(body);
          if (!userId || !message) {
            return res.status(400).json({ error: "Missing userId or message" });
          }
          if (!users[userId]) users[userId] = { id: userId, messages: [] };
          users[userId].messages.push({ user: message, timestamp: new Date() });
          res.status(200).json({ success: true, message: "Hello from NourishAI!", userId });
        } catch (e) {
          res.status(500).json({ error: e.message });
        }
      });
      return;
    }

    // User
    if (pathname.match(/^\/api\/user\/[^/]+$/) && req.method === "GET") {
      const userId = pathname.split("/")[3];
      if (!users[userId]) users[userId] = { id: userId };
      return res.status(200).json(users[userId]);
    }

    // Inventory GET
    if (pathname.match(/^\/api\/user\/[^/]+\/inventory$/) && req.method === "GET") {
      return res.status(200).json({ inventory: [] });
    }

    // Inventory POST
    if (pathname.match(/^\/api\/user\/[^/]+\/inventory$/) && req.method === "POST") {
      return res.status(200).json({ success: true });
    }

    // Analytics
    if (pathname.match(/^\/api\/user\/[^/]+\/analytics$/) && req.method === "GET") {
      return res.status(200).json({ sdgScore: 50 });
    }

    // 404
    res.status(404).json({ error: "Not found" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
