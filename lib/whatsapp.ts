// Gerador único de links do WhatsApp: site, formulário e demos (exemplos-sites
// importa este arquivo). Formato oficial: https://wa.me/<DDI+DDD+número>?text=<texto>
// (faq.whatsapp.com/5913398998672934). Escrito do zero aqui; não é cópia da mirante.

export function linkWhatsApp(numero: string, texto?: string): string {
  const digitos = numero.replace(/\D/g, "");
  if (digitos.length < 12 || digitos.length > 13) {
    throw new RangeError(`número sem DDI e DDD: ${numero}`);
  }
  const base = `https://wa.me/${digitos}`;
  return texto && texto.trim() ? `${base}?text=${encodeURIComponent(texto)}` : base;
}
