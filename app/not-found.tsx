import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon as ArrowLeft } from "@phosphor-icons/react/dist/ssr";

// O Next ja marca esta rota como noindex; aqui so o titulo da aba.
export const metadata: Metadata = {
  title: "Save não encontrado",
};

export default function NotFound() {
  return (
    <main id="conteudo" className="not-found">
      <p>LOAD ERROR · SLOT NOT FOUND</p>
      <h1>Esse save não existe.</h1>
      <span>A rota pode ter mudado ou nunca ter sido publicada.</span>
      <Link href="/"><ArrowLeft size={18} /> voltar ao início</Link>
    </main>
  );
}
