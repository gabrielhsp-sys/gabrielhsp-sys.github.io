// Contato do Gabriel nos demos. O número vem de lib/contato.ts, na raiz do repositório: a única
// fonte do WhatsApp Business no site inteiro (decisão 2 de 2026-11-19).
import { WHATSAPP } from '../../../lib/contato.ts';

/** Número com DDI (55) e DDD (35), só dígitos, no formato que o wa.me exige. */
export const WHATSAPP_GABRIEL = WHATSAPP;

/**
 * Texto pré-preenchido de todo botão de contato.
 * `rotulo` é o rótulo do nicho ("Alimentação") ou, num lead, o nome do negócio.
 */
export function mensagemDemo(rotulo: string): string {
  return `[Demo ${rotulo}] Oi Gabriel, vi o demo e quero um site assim`;
}

/**
 * Formulário de orçamento do site, com o serviço e a origem já marcados (PLANO.md, passo 6).
 * Caminho do próprio site: os demos e o formulário estão no mesmo domínio.
 */
export const orcamentoDemo = (origem: string) => `/orcamento/?precisa=site&origem=demo-${origem}`;

/** Faixa fixa que aparece em todas as páginas de demo. Negócio fictício, dito com todas as letras. */
export const FAIXA_DEMO = {
  texto: 'Site de demonstração, negócio fictício — feito por GABRIEL.SYS',
  /** Abaixo de 25rem o texto longo não cabe ao lado do link do orçamento (medido em 320 px). */
  textoCurto: 'Demonstração — GABRIEL.SYS',
  rotuloLink: 'Quero um assim',
  rotuloOrcamento: 'Pedir orçamento',
};

/** Autor dos demos, usado na home. */
export const AUTOR = {
  nome: 'Gabriel',
  cidade: 'Areado - MG',
};
