import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

// O video do estudo de caso e montado so no cliente, entao o HTML exportado nao
// mostra o <video>. As regras da auditoria 2026-10 ficam conferidas no codigo:
// sem som, sem pre-carga, sem src nem poster no markup, pausa de teclado e
// reduced-motion sem player.
test("the case study video stays silent, lazy, pausable and poster-only under reduced motion", () => {
  const code = fs.readFileSync(path.join(process.cwd(), "components/case-video.tsx"), "utf8");
  const tag = code.match(/<video[\s\S]*?\/>/)?.[0] ?? "";
  for (const attr of ["muted", "loop", "playsInline", 'preload="none"']) assert.ok(tag.includes(attr), `<video> sem ${attr}`);
  assert.doesNotMatch(tag, /\s(src|poster|autoPlay)=/);
  assert.match(code, /IntersectionObserver/);
  assert.match(code, /aria-pressed=\{paused\}/);
  assert.match(code, /if \(reduced\) return;/);
  assert.match(code, /loading="lazy"/);
});

// Cada video publicado tem poster e fica no limite de ~5 MB.
test("published case videos have a poster and stay under ~5 MB", () => {
  const dir = path.join(process.cwd(), "public/videos");
  for (const file of fs.readdirSync(dir).filter((name) => name.endsWith(".mp4"))) {
    assert.ok(fs.statSync(path.join(dir, file)).size <= 5.5 * 1024 * 1024, `${file} passa de ~5 MB`);
    assert.ok(fs.existsSync(path.join(dir, file.replace(/\.mp4$/, ".webp"))), `${file} sem poster`);
  }
});
