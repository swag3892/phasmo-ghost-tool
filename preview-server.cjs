"use strict";
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const portArgument = process.argv.indexOf("--port");
const port = portArgument < 0 ? 4173 : Number(process.argv[portArgument + 1]);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error("Invalid preview port");
const mime = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png" };

const server = http.createServer((request, response) => {
  if (!["GET", "HEAD"].includes(request.method)) {
    response.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }
  let requested;
  try { requested = decodeURIComponent(new URL(request.url, "http://localhost").pathname); }
  catch { response.writeHead(400).end(); return; }
  const segments = requested.split("/");
  if (segments.some((part) => part.startsWith(".")) || requested.includes("\\") || requested.includes("\0")) {
    response.writeHead(403).end();
    return;
  }
  const target = path.resolve(root, `.${requested === "/" ? "/index.html" : requested}`);
  if (!target.startsWith(`${root}${path.sep}`) || !mime[path.extname(target)]) {
    response.writeHead(404).end();
    return;
  }
  fs.stat(target, (error, stats) => {
    if (error || !stats.isFile()) { response.writeHead(404).end(); return; }
    response.writeHead(200, { "Content-Type": mime[path.extname(target)], "Content-Length": stats.size, "Cache-Control": "no-store" });
    if (request.method === "HEAD") response.end();
    else fs.createReadStream(target).on("error", () => response.destroy()).pipe(response);
  });
});
server.listen(port, "127.0.0.1", () => console.log(`Design previews: http://127.0.0.1:${port}/designs.html`));
server.on("error", (error) => { console.error(error.message); process.exitCode = 1; });
