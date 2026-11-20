import { BareChrome } from "@/components/bare-chrome";

/* Rotas que so chegam por link direto (/material/): sem menu, sem botao fixo,
   sem atalhos. Um clique perdido nao tira a pessoa do envio. */
export default function NuLayout({ children }: { children: React.ReactNode }) {
  return <BareChrome>{children}</BareChrome>;
}
