import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "127.0.0.1";
const root = path.resolve("public");

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".html": "text/html; charset=utf-8"
};

function send(res, statusCode, body, headers = {}) {
  res.writeHead(statusCode, {
    "Cache-Control": "no-store",
    ...headers
  });
  res.end(body);
}

function fileExists(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function serveStatic(reqPath, res) {
  const safePath = path.normalize(reqPath).replace(/^(\.\.[/\\])+/, "");
  const target = path.join(root, safePath === "/" ? "/index.html" : safePath);
  const finalPath = fileExists(target) ? target : path.join(root, "index.html");
  const ext = path.extname(finalPath).toLowerCase();
  const body = fs.readFileSync(finalPath);

  send(res, 200, body, {
    "Content-Type": mimeTypes[ext] || "application/octet-stream"
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (req.method === "GET" && url.pathname === "/health") {
    send(res, 200, JSON.stringify({ ok: true, service: "AgentRail" }), {
      "Content-Type": "application/json; charset=utf-8"
    });
    return;
  }

  if (req.method === "GET") {
    serveStatic(url.pathname, res);
    return;
  }

  send(res, 405, "Method Not Allowed", {
    "Content-Type": "text/plain; charset=utf-8"
  });
});

server.listen(port, host, () => {
  console.log(`AgentRail is running on http://${host}:${port}`);
});
