// Servidor estatico do out/ com gzip para texto (como o GitHub Pages faz com
// HTML, JS, CSS, JSON e SVG). Binarios (imagem, video, .glb, fonte) vao como
// estao: a conta de peso nao assume compressao que o Pages pode nao fazer.
// Uso: node scripts/serve-out.mjs <pasta> <porta> (o Playwright sobe ele sozinho)
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import zlib from "node:zlib";

const [root, port] = process.argv.slice(2);
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".txt": "text/plain; charset=utf-8", ".svg": "image/svg+xml", ".xml": "application/xml", ".png": "image/png", ".webp": "image/webp", ".avif": "image/avif", ".jpg": "image/jpeg", ".mp4": "video/mp4", ".woff2": "font/woff2", ".ico": "image/x-icon" };
const textual = new Set([".html", ".js", ".css", ".json", ".txt", ".svg", ".xml"]);

http.createServer((req, res) => {
  let file = path.join(root, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
  if (!fs.existsSync(file)) { res.writeHead(404); return res.end("404"); }
  const ext = path.extname(file);
  const headers = { "content-type": types[ext] ?? "application/octet-stream", "cache-control": "no-cache" };
  const data = fs.readFileSync(file);
  const range = req.headers.range?.match(/bytes=(\d*)-(\d*)/);
  if (range && !textual.has(ext)) {
    const start = Number(range[1] || 0);
    const end = range[2] ? Number(range[2]) : data.length - 1;
    res.writeHead(206, { ...headers, "accept-ranges": "bytes", "content-range": `bytes ${start}-${end}/${data.length}`, "content-length": end - start + 1 });
    return res.end(req.method === "HEAD" ? undefined : data.subarray(start, end + 1));
  }
  if (textual.has(ext) && /gzip/.test(req.headers["accept-encoding"] ?? "")) {
    const body = zlib.gzipSync(data, { level: 6 });
    res.writeHead(200, { ...headers, "content-encoding": "gzip", "content-length": body.length });
    return res.end(req.method === "HEAD" ? undefined : body);
  }
  res.writeHead(200, { ...headers, "accept-ranges": "bytes", "content-length": data.length });
  res.end(req.method === "HEAD" ? undefined : data);
}).listen(Number(port), () => console.log(`serve-out ${root} :${port}`));
