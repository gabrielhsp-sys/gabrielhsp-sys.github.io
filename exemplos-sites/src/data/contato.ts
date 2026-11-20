// Contato do Gabriel: a única fonte do número de WhatsApp e da mensagem dos demos.
// Todo botão de contato de todos os demos usa estas constantes (via src/lib/whatsapp.ts).

/** Número com DDI (55) e DDD (35), só dígitos, no formato que o wa.me exige. */
export const WHATSAPP_GABRIEL = '5535998840168';

/**
 * Texto pré-preenchido de todo botão de contato.
 * `rotulo` é o rótulo do nicho ("Alimentação") ou, num lead, o nome do negócio.
 */
export function mensagemDemo(rotulo: string): string {
  return `[Demo ${rotulo}] Oi Gabriel, vi o demo e quero um site assim`;
}

/** Portfólio do Gabriel (GitHub Pages). Único lugar com este endereço. */
export const PORTFOLIO_GABRIEL = 'https://gabrielhsp-sys.github.io/';

/** Faixa fixa que aparece em todas as páginas de demo (texto definido no pedido do projeto). */
export const FAIXA_DEMO = {
  texto: 'Site de demonstração — feito por Gabriel',
  /** Abaixo de 25rem o texto longo não cabe ao lado do link do portfólio (medido em 320 px). */
  textoCurto: 'Site demo — feito por Gabriel',
  rotuloLink: 'Quero um assim',
  rotuloPortfolio: 'Portfólio',
};

/** Autor dos demos, usado na home. */
export const AUTOR = {
  nome: 'Gabriel',
  cidade: 'Areado - MG',
};
