import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  // So vale no `next dev`. Aberto por 127.0.0.1 (e nao localhost), o Next 16
  // bloqueava os recursos de desenvolvimento, a pagina nao hidratava e todo
  // efeito em JS ficava desligado, entre eles o "Sobre" no Firefox.
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
