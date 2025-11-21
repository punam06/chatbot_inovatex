const fs = require("fs");
const path = require("path");

const users = {};
let htmlCache = null;

module.exports = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const pathname = (req.url || "").split("?")[0];

  // Serve HTML for root and common paths
  if (pathname === "/" || pathname === "" || pathname === "/index.html") {
    try {
      if (!htmlCache) {
        const htmlPath = path.join(process.cwd(), "public", "index.html");
        htmlCache = fs.readFileSync(htmlPath, "utf-8");
      }
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(200).send(htmlCache);
    } catch (e) {
      return res.status(200).json({ status: "running" });
    }
  }

  // Serve CSS files
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

  // Serve JS files
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

  // API: Health
  if (pathname === "/health") {
    return res.status(200).json({ ok: true });
  }

  // API: Chat POST
  if (pathname === "/api/chat" && req.method === "POST") {
    const body = req.body || {};
    const { userId, message } = body;
    if (!userId || !message) return res.status(400).json({ error: "Missing" });
    if (!users[userId]) users[userId] = { id: userId };
    return res.status(200).json({ success: true, message: "Hello from NourishAI!", userId });
  }

  // API: User GET
  if (pathname.includes("/api/user/") && !pathname.includes("/inventory") && !pathname.includes("/analytics") && req.method === "GET") {
    const userId = pathname.split("/api/user/")[1];
    if (!users[userId]) users[userId] = { id: userId };
    return res.status(200).json(users[userId]);
  }

  // API: Inventory
  if (pathname.includes("/inventory")) {
    return res.status(200).json({ inventory: [] });
  }

  // API: Analytics
  if (pathname.includes("/analytics")) {
    return res.status(200).json({ sdgScore: 50 });
  }

  res.status(200).json({ ok: true });
};
