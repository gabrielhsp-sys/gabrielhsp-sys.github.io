// Gerador dos links wa.me dos demos.
// Reaproveita linkWhatsApp da mirante (~/Dev/projects/tools/mirante, item "whatsapp", licença
// própria de uso por cliente) por import relativo, sem copiar o arquivo.
import { linkWhatsApp } from '../../../../tools/mirante/mirante/lib/whatsapp.ts';
import { WHATSAPP_GABRIEL, mensagemDemo } from '../data/contato.ts';

/** Link do WhatsApp do Gabriel com o texto do demo (`rotulo` = nicho ou nome do lead). */
export function linkDemo(rotulo: string): string {
  return linkWhatsApp(WHATSAPP_GABRIEL, mensagemDemo(rotulo));
}
