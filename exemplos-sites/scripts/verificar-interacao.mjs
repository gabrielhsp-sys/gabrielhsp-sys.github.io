// Prova que os fluxos interativos funcionam no navegador (não só no teste unitário):
// - /alimentacao: 2× X-Brasa + 1× Batata frita → total R$ 72,80 com entrega (oráculo à mão:
//   2 × 24,90 + 18,00 + 5,00) e a prévia com os itens; retirada tira a taxa (R$ 67,80);
// - /loja: filtro "Queijos" deixa 1 produto visível; adicionar soma no carrinho;
// - /beleza: "Escolher" na tabela + chips da agenda montam a mensagem de agendamento;
// - /servicos: formulário de orçamento monta a mensagem;
// - em todas, o botão de WhatsApp segue apontando para o número do Gabriel.
// Usa o Chromium já presente na máquina (scripts/cdp.mjs). Sem navegador: código 2.
import { existsSync } from 'node:fs';
import { DIST, abrirNavegador, pausa } from './cdp.mjs';
import { WHATSAPP_GABRIEL } from '../src/data/contato.ts';

if (!existsSync(DIST)) { console.log('Rode npm run build antes.'); process.exit(2); }
const nav = await abrirNavegador();
if (!nav) { console.log('LACUNA DE VALIDAÇÃO: nenhum Chromium encontrado.'); process.exit(2); }
const { cdp, base } = nav;
await cdp.enviar('Page.enable');
await cdp.enviar('Emulation.setDeviceMetricsOverride', { width: 360, height: 740, deviceScaleFactor: 1, mobile: true });

const falhas = [];
async function abrir(rota) {
  const carregou = cdp.esperar('Page.loadEventFired');
  await cdp.enviar('Page.navigate', { url: base + rota });
  await carregou;
  await pausa(300);
}
async function js(expr) {
  const { result, exceptionDetails } = await cdp.enviar('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text);
  return result.value;
}
function confere(nome, obtido, esperado) {
  const ok = JSON.stringify(obtido) === JSON.stringify(esperado);
  console.log(`${ok ? 'ok  ' : 'FALHA'} ${nome}${ok ? '' : `\n      esperado: ${JSON.stringify(esperado)}\n      obtido:   ${JSON.stringify(obtido)}`}`);
  if (!ok) falhas.push(nome);
}
const clicar = (sel) => `document.querySelector(${JSON.stringify(sel)}).click()`;
const texto = (sel) => `document.querySelector(${JSON.stringify(sel)})?.textContent.trim()`;
const waOk = `[...document.querySelectorAll('a[data-wa]')].every((a) => new URL(a.href).pathname === '/${WHATSAPP_GABRIEL}')`;

// Alimentação
await abrir('/alimentacao');
confere('alimentacao: barra do pedido escondida sem itens', await js(`document.querySelector('[data-abrir]').hidden`), true);
await js(clicar('#cat-lanches [data-add][data-id="x-brasa"]'));
await js(clicar('#cat-lanches [data-add][data-id="x-brasa"]'));
await js(clicar('[data-add][data-id="batata"]'));
confere('alimentacao: quantidade no item', await js(texto('[data-qtd-de="x-brasa"]')), '2');
confere('alimentacao: total com entrega', await js(texto('.carrinho__total')), 'R$ 72,80');
await js(clicar('[data-abrir]'));
confere('alimentacao: painel abre como modal', await js(`document.querySelector('.carrinho__painel').open`), true);
confere('alimentacao: prévia da mensagem', await js(texto('#carrinho-previa [data-previa-texto]')),
  'Olá, Brasa & Pão! Quero fazer um pedido:\n\n2x X-Brasa (R$ 49,80)\n1x Batata frita (R$ 18,00)\n\nEntrega: R$ 5,00\nTotal: R$ 72,80\nPagamento: Pix'.replace(/\n/g, '\n'));
await js(`document.querySelector('input[name="modo"][value="retirada"]').click()`);
confere('alimentacao: retirada tira a taxa', await js(texto('.carrinho__soma [data-total]')), 'R$ 67,80');
confere('alimentacao: links wa.me no número do Gabriel', await js(waOk), true);

// Loja
await abrir('/loja');
await js(clicar('[data-filtro="Queijos"]'));
confere('loja: filtro Queijos', await js(`[...document.querySelectorAll('[data-categoria]')].filter((e) => !e.hidden).length`), 1);
await js(clicar('[data-add][data-id="mel"]'));
await js(clicar('[data-add][data-id="mel"]'));
confere('loja: total com entrega (2 × 28,00 + 6,00)', await js(texto('.carrinho__total')), 'R$ 62,00');
confere('loja: links wa.me no número do Gabriel', await js(waOk), true);

// Beleza
await abrir('/beleza');
await js(clicar('[data-escolher-servico="Manicure"]'));
await js(clicar('[data-campo="profissional"][data-valor="Bruna"]'));
await js(clicar('[data-campo="dia"][data-valor="Sexta"]'));
await js(clicar('[data-campo="periodo"][data-valor="Tarde"]'));
confere('beleza: mensagem de agendamento', await js(texto('#agenda-previa [data-previa-texto]')), 'Olá, Studio Íris! Quero marcar Manicure com Bruna, Sexta de tarde. Tem horário?');

// Serviços
await abrir('/servicos');
await js(clicar('[data-orcar="Freio"]'));
await js(`(() => { const f = document.querySelector('[data-orcamento] form'); f.carro.value = 'Gol'; f.ano.value = '2014'; f.carro.dispatchEvent(new Event('input', { bubbles: true })); })()`);
await js(clicar('[data-quando="Esta semana"]'));
confere('servicos: mensagem de orçamento', await js(texto('#orcamento-previa [data-previa-texto]')),
  'Olá, Prado Serviços Automotivos! Quero um orçamento.\n\nServiço: Freio\nCarro: Gol 2014\nQuando: Esta semana');
confere('servicos: links wa.me no número do Gabriel', await js(waOk), true);

nav.fechar();
console.log(falhas.length ? `FALHOU: ${falhas.length}` : 'PASS: carrinho, filtro, agenda e orçamento funcionam no navegador');
process.exit(falhas.length ? 1 : 0);
