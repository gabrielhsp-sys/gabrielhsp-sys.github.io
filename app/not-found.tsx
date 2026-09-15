import Link from "next/link";
import { ArrowLeftIcon as ArrowLeft } from "@phosphor-icons/react/dist/ssr";

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
