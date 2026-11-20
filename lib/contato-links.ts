import { WHATSAPP } from "./contato";
import { linkWhatsApp } from "./whatsapp";

// Links prontos de contato. Fica fora de um modulo "use client" para paginas de
// servidor tambem poderem usar o valor (e nao uma referencia de cliente).
export const mensagemContato = "Olá, Gabriel! Vim pelo site e quero conversar sobre um projeto.";
export const whatsappContato = linkWhatsApp(WHATSAPP, mensagemContato);

/** WhatsApp com a mensagem de quem veio de uma página de serviço ou exemplo. */
export const whatsappSobre = (assunto: string) =>
  linkWhatsApp(WHATSAPP, `Olá, Gabriel! Vim pelo site e quero saber mais sobre ${assunto}.`);
