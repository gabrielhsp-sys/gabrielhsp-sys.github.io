import { RecruiterChrome } from "@/components/system-chrome";
import { getLatestUpdate } from "@/lib/content";
import { formatDate } from "@/lib/format";

export default function RecrutadorLayout({ children }: { children: React.ReactNode }) {
  // O estado da barra superior e um fato do conteudo, nao um relogio.
  const updated = getLatestUpdate();
  return (
    <RecruiterChrome updated={{ iso: updated.toISOString().slice(0, 10), label: formatDate(updated) }}>
      {children}
    </RecruiterChrome>
  );
}
