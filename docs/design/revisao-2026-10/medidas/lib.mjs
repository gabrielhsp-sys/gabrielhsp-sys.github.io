// Base comum dos scripts de medida da revisao 2026-10.
// Playwright e axe sao devDependencies do projeto desde a D-129 (2026-10-09);
// antes vinham do movimente-se-site.
import { createRequire } from "node:module";
import fs from "node:fs";

const require = createRequire(import.meta.url);
export const { chromium, firefox } = require("playwright");
export const axeSource = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

export const routes = [
  ["home", "/"],
  ["sobre", "/about/"],
  ["arquivo", "/archive/"],
  ["area-software", "/area/software/"],
  ["area-web", "/area/web/"],
  ["area-academico", "/area/academico/"],
  ["orcamento", "/orcamento/"],
  ["caso-telegram", "/projects/telegram-offers/"],
  ["caso-site", "/projects/gabriel-sys-site/"],
  ["caso-faculdade", "/projects/faculdade-bcc/"],
  ["caso-fedora", "/projects/fedora-post-install/"],
  ["caso-academic", "/projects/academic-system/"],
  ["caso-banco", "/projects/banco-de-dados-cpp/"],
  ["404", "/404.html"],
];

// As quatro larguras pedidas na revisao.
export const sizes = {
  1440: { width: 1440, height: 900 },
  1920: { width: 1920, height: 1080 },
  1366: { width: 1366, height: 768 },
  390: { width: 390, height: 844 },
};

export const launch = () =>
  chromium.launch({ executablePath: "/usr/bin/chromium-browser", args: ["--enable-gpu", "--use-angle=gl"] });

// Contexto com a animacao de entrada ja vista (ela e uma vez por sessao e
// cobriria toda captura). `boot: true` deixa ela rodar.
export async function context(browser, width, { reduced = false, boot = false, js = true } = {}) {
  const size = sizes[width] ?? { width, height: 900 };
  const mobile = size.width < 821;
  const ctx = await browser.newContext({
    viewport: size,
    deviceScaleFactor: mobile ? 2 : 1,
    isMobile: mobile,
    hasTouch: mobile,
    reducedMotion: reduced ? "reduce" : "no-preference",
    javaScriptEnabled: js,
  });
  if (!boot) await ctx.addInitScript(() => { try { sessionStorage.setItem("gsys:booted", "1"); } catch {} });
  return { ctx, mobile, size };
}

// Console: erro, aviso e excecao (hidratacao aparece como erro do React).
export function listen(page) {
  const messages = [];
  page.on("pageerror", (error) => messages.push({ type: "pageerror", text: error.message }));
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) messages.push({ type: message.type(), text: message.text().slice(0, 300) });
  });
  return messages;
}

// Checagens de layout rodadas dentro da pagina (page.evaluate(checks)).
export const checks = () => {
  const px = (el) => parseFloat(getComputedStyle(el).fontSize);
  const visible = (el) => {
    const s = getComputedStyle(el);
    return s.display !== "none" && s.visibility !== "hidden" && el.getClientRects().length > 0;
  };
  const label = (el) => `${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""}${typeof el.className === "string" && el.className ? "." + el.className.split(" ")[0] : ""} "${(el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 32)}"`;
  const out = { overflowX: document.documentElement.scrollWidth - innerWidth, smallText: [], smallTargets: [], clipped: [], overlaps: [], headings: [], inversions: [] };
  const all = [...document.querySelectorAll("main *, header *, footer *, nav *")];
  for (const el of all) {
    if (!visible(el)) continue;
    const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (ownText && px(el) < 10.99) out.smallText.push(`${label(el)} ${px(el)}px`);
    // Texto cortado por overflow (line-clamp declarado fica de fora).
    const s = getComputedStyle(el);
    if (ownText && /hidden|clip/.test(s.overflow + s.overflowX) && !s.webkitLineClamp?.match(/\d/) && (el.scrollWidth > el.clientWidth + 1)) out.clipped.push(label(el));
    // Elemento que sai pela direita da janela.
    const r = el.getBoundingClientRect();
    if (r.width && r.right > innerWidth + 1 && s.position !== "fixed" && !el.closest("pre, .excerpt, [data-scroll-x]")) out.clipped.push(`${label(el)} sai ${Math.round(r.right - innerWidth)}px`);
  }
  for (const el of document.querySelectorAll("main a, main button, header a, header button, nav a, nav button, footer a, footer button")) {
    if (!visible(el) || el.closest("p, li > span, .prose")) continue;
    const r = el.getBoundingClientRect();
    if (r.height < 44 && r.width < 44) out.smallTargets.push(`${label(el)} ${Math.round(r.width)}x${Math.round(r.height)}`);
    else if (r.height < 24) out.smallTargets.push(`${label(el)} ${Math.round(r.width)}x${Math.round(r.height)}`);
  }
  // Sobreposicao: blocos de texto folha que se cruzam (ignora fixos e aninhados).
  const blocks = [...document.querySelectorAll("main h1, main h2, main h3, main p, main li, main a, main button, main dd, main dt, main small, main strong")]
    .filter((el) => visible(el) && !el.closest("[aria-hidden='true']"))
    .map((el) => ({ el, r: el.getBoundingClientRect() }))
    .filter(({ r }) => r.width > 2 && r.height > 2);
  for (let i = 0; i < blocks.length; i++) {
    for (let j = i + 1; j < blocks.length; j++) {
      const a = blocks[i], b = blocks[j];
      if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
      const x = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
      const y = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
      if (x > 4 && y > 4) out.overlaps.push(`${label(a.el)} x ${label(b.el)} (${Math.round(x)}x${Math.round(y)})`);
    }
  }
  for (const h of document.querySelectorAll("main h1, main h2, main h3")) {
    if (!visible(h)) continue;
    const r = h.getBoundingClientRect();
    out.headings.push({ tag: h.tagName, text: h.textContent.trim().slice(0, 40), px: px(h), lines: Math.round(r.height / (px(h) * parseFloat(getComputedStyle(h).lineHeight) / px(h) || 1)), width: Math.round(r.width) });
  }
  for (const section of document.querySelectorAll("main section, main article")) {
    const h2 = section.querySelector("h2");
    if (!h2 || !visible(h2)) continue;
    for (const h3 of section.querySelectorAll("h3")) if (visible(h3) && px(h3) > px(h2)) out.inversions.push(`${section.id || section.className}: h3 ${px(h3)} > h2 ${px(h2)}`);
  }
  const bar = document.querySelector(".topbar");
  out.topbar = bar ? Math.round(bar.getBoundingClientRect().height) : null;
  out.pageHeight = document.documentElement.scrollHeight;
  // Primeira tela da home: quem, o que faz e o caminho do contato sem rolar.
  const dock = document.querySelector(".mobile-dock");
  const limit = innerHeight - (dock && visible(dock) ? dock.getBoundingClientRect().height + 10 : 0);
  const probe = (sel) => { const el = document.querySelector(sel); if (!el || !visible(el)) return null; const r = el.getBoundingClientRect(); return r.top >= 0 && r.bottom <= limit; };
  out.firstScreen = { name: probe(".hero-kicker span:last-child"), h1: probe("main h1"), contact: probe('main a[href="#contato"]'), projects: probe('main a[href="#projetos"]') };
  for (const k of ["smallText", "smallTargets", "clipped", "overlaps"]) out[k] = [...new Set(out[k])].slice(0, 12);
  return out;
};
