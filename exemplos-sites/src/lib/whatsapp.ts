// Gerador dos links wa.me dos demos: o mesmo do site GABRIEL.SYS (lib/whatsapp.ts na raiz do
// repositório). Antes vinha da mirante, por caminho fora do projeto; a cópia não traz a mirante.
import { linkWhatsApp } from '../../../lib/whatsapp.ts';
import { WHATSAPP_GABRIEL, mensagemDemo } from '../data/contato.ts';

/** Link do WhatsApp do Gabriel com o texto do demo (`rotulo` = nicho ou nome do lead). */
export function linkDemo(rotulo: string): string {
  return linkWhatsApp(WHATSAPP_GABRIEL, mensagemDemo(rotulo));
}
