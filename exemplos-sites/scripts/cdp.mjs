// Utilidades de navegador para os verificadores: acha um Chromium já presente na máquina,
// serve dist/ num servidor local e fala Chrome DevTools Protocol pelo WebSocket nativo do Node 22.
// Nenhum pacote, nada instalado.
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { homedir } from 'node:os';

export const DIST = join(new URL('..', import.meta.url).pathname, 'dist');

export async function acharChrome() {
  if (process.env.CHROME && existsSync(process.env.CHROME)) return process.env.CHROME;
  const cache = join(homedir(), '.cache/ms-playwright');
  if (!existsSync(cache)) return null;
  for (const dir of (await readdir(cache)).sort().reverse()) {
    for (const rel of ['chrome-linux/headless_shell', 'chrome-headless-shell-linux64/chrome-headless-shell', 'chrome-linux/chrome', 'chrome-linux64/chrome']) {
      const p = join(cache, dir, rel);
      if (existsSync(p)) return p;
    }
  }
  return null;
}


const TIPOS = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.avif': 'image/avif', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.woff': 'font/woff', '.svg': 'image/svg+xml' };

export function servir() {
  return new Promise((ok) => {
    const srv = createServer(async (req, res) => {
      // Build único (2026-11-19): o HTML pede /exemplos/sites/... (base do Astro) e o lead mora em
      // /para/<slug>/; aqui os dois voltam ao caminho de dist/, para as rotas antigas continuarem.
      let caminho = decodeURIComponent(new URL(req.url, 'http://x').pathname)
        .replace(/^\/exemplos\/sites(?=\/|$)/, '')
        .replace(/^\/para\//, '/l/') || '/';
      let arquivo = join(DIST, caminho);
      try {
        if ((await stat(arquivo)).isDirectory()) arquivo = join(arquivo, 'index.html');
        const corpo = await readFile(arquivo);
        res.writeHead(200, { 'content-type': TIPOS[extname(arquivo)] ?? 'application/octet-stream' });
        res.end(corpo);
      } catch {
        res.writeHead(404); res.end('404');
      }
    });
    srv.listen(0, '127.0.0.1', () => ok(srv));
  });
}

export class Cdp {
  constructor(url) { this.ws = new WebSocket(url); this.id = 0; this.pend = new Map(); this.ouvintes = []; }
  abrir() {
    return new Promise((ok, erro) => {
      this.ws.onopen = ok; this.ws.onerror = erro;
      this.ws.onmessage = (m) => {
        const msg = JSON.parse(m.data);
        if (msg.id && this.pend.has(msg.id)) { const { ok: r, erro: e } = this.pend.get(msg.id); this.pend.delete(msg.id); msg.error ? e(new Error(msg.error.message)) : r(msg.result); }
        else this.ouvintes.forEach((f) => f(msg));
      };
    });
  }
  enviar(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((ok, erro) => {
      const t = setTimeout(() => { this.pend.delete(id); erro(new Error(`timeout ${method}`)); }, 30000);
      this.pend.set(id, { ok: (v) => { clearTimeout(t); ok(v); }, erro: (e) => { clearTimeout(t); erro(e); } });
    });
  }
  esperar(metodo, ms = 20000) { return new Promise((ok, erro) => { const t = setTimeout(() => erro(new Error(`timeout ${metodo}`)), ms); const f = (m) => { if (m.method === metodo) { clearTimeout(t); this.ouvintes = this.ouvintes.filter((x) => x !== f); ok(m.params); } }; this.ouvintes.push(f); }); }
}

export const pausa = (ms) => new Promise((r) => setTimeout(r, ms));

/** Abre o navegador e devolve { cdp, base, fechar }. Sem navegador: null. */
export async function abrirNavegador() {
  const chrome = await acharChrome();
  if (!chrome) return null;
  const srv = await servir();
  const base = `http://127.0.0.1:${srv.address().port}`;
  const porta = 9300 + Math.floor(Math.random() * 500);
  const proc = spawn(chrome, ['--headless', `--remote-debugging-port=${porta}`, '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--hide-scrollbars', `--user-data-dir=/tmp/demos-nichos-chrome-${porta}`, 'about:blank'], { stdio: 'ignore' });
  let alvo;
  for (let i = 0; i < 50 && !alvo; i++) {
    await pausa(200);
    try { alvo = (await (await fetch(`http://127.0.0.1:${porta}/json/list`)).json()).find((t) => t.type === 'page'); } catch {}
  }
  if (!alvo) { proc.kill(); srv.close(); return null; }
  const cdp = new Cdp(alvo.webSocketDebuggerUrl);
  await cdp.abrir();
  return { cdp, base, fechar: () => { cdp.ws.close(); proc.kill(); srv.close(); } };
}
