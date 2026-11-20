// Teste do gerador de link wa.me (alegação A3 de docs/PLANO.md).
// Oráculo: strings escritas à mão a partir do pedido do projeto, não derivadas do código.
// Rodar: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { linkDemo } from './whatsapp.ts';
import { WHATSAPP_GABRIEL, PORTFOLIO_GABRIEL, FAIXA_DEMO } from '../data/contato.ts';
import { NICHOS, ORDEM } from '../data/nichos/index.ts';

const NUMERO = '5535998840168'; // do pedido: wa.me/5535998840168
const TEXTO = (nicho: string) => `[Demo ${nicho}] Oi Gabriel, vi o demo e quero um site assim`;

// Botão principal de cada nicho, copiado da tabela do pedido.
const BOTOES: Record<string, string> = {
  alimentacao: 'Pedir pelo WhatsApp',
  beleza: 'Agendar horário',
  cabeleireiro: 'Marcar corte',
  saude: 'Marcar consulta',
  fitness: 'Agendar aula experimental',
  loja: 'Finalizar pedido',
  servicos: 'Pedir orçamento',
};

test('a constante tem o número do pedido', () => {
  assert.equal(WHATSAPP_GABRIEL, NUMERO);
});

test('link de Alimentação bate byte a byte com o oráculo codificado à mão', () => {
  assert.equal(
    linkDemo('Alimentação'),
    'https://wa.me/5535998840168?text=%5BDemo%20Alimenta%C3%A7%C3%A3o%5D%20Oi%20Gabriel%2C%20vi%20o%20demo%20e%20quero%20um%20site%20assim',
  );
});

test('são exatamente 7 nichos', () => {
  assert.equal(ORDEM.length, 7);
  assert.deepEqual(Object.keys(NICHOS).sort(), Object.keys(BOTOES).sort());
});

for (const id of Object.keys(BOTOES)) {
  test(`${id}: botão principal e link com número e texto do nicho`, () => {
    const dados = NICHOS[id as keyof typeof NICHOS];
    assert.equal(dados.botaoPrincipal, BOTOES[id]);
    const url = new URL(linkDemo(dados.rotulo));
    assert.equal(url.origin, 'https://wa.me');
    assert.equal(url.pathname, `/${NUMERO}`);
    assert.equal(url.searchParams.get('text'), TEXTO(dados.rotulo));
    assert.ok(dados.rotulo.length > 0);
  });
}

test('rótulos dos nichos são distintos (o Gabriel sabe de qual demo veio a mensagem)', () => {
  const rotulos = ORDEM.map((id) => NICHOS[id].rotulo);
  assert.equal(new Set(rotulos).size, 7);
});

// Faixa de demo: link do portfólio ao lado do WhatsApp (docs/PLANO-RENOMEAR.md, R3).
// Oráculo: o endereço confirmado pelo Gabriel em 2026-11-14, escrito à mão.
test('a constante do portfólio tem o endereço confirmado', () => {
  assert.equal(PORTFOLIO_GABRIEL, 'https://gabrielhsp-sys.github.io/');
  const url = new URL(PORTFOLIO_GABRIEL);
  assert.equal(url.protocol, 'https:');
  assert.equal(url.host, 'gabrielhsp-sys.github.io');
});

test('textos da faixa: aviso longo, aviso curto e rótulos dos dois links', () => {
  assert.equal(FAIXA_DEMO.texto, 'Site de demonstração — feito por Gabriel');
  assert.match(FAIXA_DEMO.textoCurto, /feito por Gabriel$/);
  assert.ok(FAIXA_DEMO.textoCurto.length < FAIXA_DEMO.texto.length);
  assert.equal(FAIXA_DEMO.rotuloLink, 'Quero um assim');
  assert.equal(FAIXA_DEMO.rotuloPortfolio, 'Portfólio');
});
