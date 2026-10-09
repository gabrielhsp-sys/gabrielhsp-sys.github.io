import { defineConfig, devices } from "@playwright/test";

// Ponta a ponta no export de producao (out/), nunca no next dev: rode
// `npm run build` antes de `npm run e2e`. Chromium e Firefox; o WebKit do
// Playwright nao roda no Fedora (pede bibliotecas do Ubuntu) e foi conferido a
// parte, no WebKitGTK do sistema (docs/design/revisao-2026-10/RELATORIO.md).
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:4173" },
  webServer: {
    command: "node scripts/serve-out.mjs out 4173",
    url: "http://127.0.0.1:4173/",
    reuseExistingServer: true,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "firefox", use: { ...devices["Desktop Firefox"], viewport: { width: 1440, height: 900 } } },
  ],
});
