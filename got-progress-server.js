const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const htmlPath = path.join(root, "got-progress-dashboard.html");
const dataPath = path.join(root, "got-progress-data.json");
const port = Number(process.env.PORT || 8787);

function readDefaultRows() {
  const html = fs.readFileSync(htmlPath, "utf8");
  const match = html.match(/const seedRows = (\[[\s\S]*?\n    \]);/);
  if (!match) return [];
  return Function(`"use strict"; return ${match[1]};`)();
}

function readRows() {
  if (!fs.existsSync(dataPath)) {
    const defaults = readDefaultRows();
    fs.writeFileSync(dataPath, JSON.stringify(defaults, null, 2), "utf8");
    return defaults;
  }
  return JSON.parse(fs.readFileSync(dataPath, "utf8"));
}

function writeRows(rows) {
  if (!Array.isArray(rows)) {
    throw new Error("Rows must be an array");
  }
  const tempPath = dataPath + ".tmp";
  fs.writeFileSync(tempPath, JSON.stringify(rows, null, 2), "utf8");
  fs.renameSync(tempPath, dataPath);
}

function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,PUT,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(body);
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 5_000_000) {
        req.destroy();
        reject(new Error("Request body too large"));
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === "OPTIONS") {
      send(res, 204, "");
      return;
    }

    if (url.pathname === "/" || url.pathname === "/got-progress-dashboard.html") {
      send(res, 200, fs.readFileSync(htmlPath), "text/html; charset=utf-8");
      return;
    }

    if (url.pathname === "/api/rows" && req.method === "GET") {
      send(res, 200, JSON.stringify(readRows()));
      return;
    }

    if (url.pathname === "/api/rows" && req.method === "PUT") {
      const rows = JSON.parse(await readRequestBody(req));
      writeRows(rows);
      send(res, 200, JSON.stringify({ ok: true }));
      return;
    }

    send(res, 404, JSON.stringify({ error: "Not found" }));
  } catch (error) {
    send(res, 500, JSON.stringify({ error: error.message }));
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`GOT progress page: http://localhost:${port}/`);
  console.log(`Shared data file: ${dataPath}`);
});
