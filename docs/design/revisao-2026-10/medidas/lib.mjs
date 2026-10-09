// Base comum dos scripts de medida da revisao 2026-10.
// Playwright e axe vem do movimente-se-site (D-129, em aberto): so executados,
// nada instalado neste repositorio.
import { createRequire } from "node:module";
import fs from "node:fs";

const require = createRequire("/home/gabriel/Dev/projects/personal/movimente-se-site/package.json");
export const { chromium } = require("playwright");
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
