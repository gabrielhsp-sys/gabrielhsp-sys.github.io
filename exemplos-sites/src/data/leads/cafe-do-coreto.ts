// LEAD DE EXEMPLO (negócio fictício): Café do Coreto, sobre o nicho-base "alimentacao".
// Mesmo formato de src/data/nichos/alimentacao.ts, mais `nichoBase`. Para um lead de verdade,
// copie este arquivo (passo a passo no README.md, seção "Demo de um lead").
//
// `rotulo` num lead é o nome do negócio: a mensagem chega como "[Demo Café do Coreto] Oi Gabriel…",
// e o Gabriel sabe qual lead clicou.
//
// Fotos: este exemplo reaproveita fotos já baixadas (loja/cafe, loja/pao). Fotos do próprio lead entram em
// scripts/fotos.json com "arquivoLocal" e "credito" (ver README) e passam a ser chamadas por
// chave, por exemplo 'leads/cafe-do-coreto/hero'. A foto do hero precisa de cartão de
// compartilhamento: chave terminada em /hero ou "og": true em scripts/fotos.json.
import type { Lead } from '../tipos.ts';

const lead: Lead = {
  nichoBase: 'alimentacao',
  rotulo: 'Café do Coreto',

  negocio: {
    nome: 'Café do Coreto',
    resumo: 'Café do Coreto',
    descricao: 'Pão de queijo, café coado e lanche na chapa ao lado do coreto. Monte o pedido e mande pelo WhatsApp.',
  },

  endereco: { bairro: 'Centro', cidade: 'Areado', uf: 'MG', referencia: 'Ao lado do coreto da praça' },
  mapa: { lat: -21.3589, lon: -46.145 },

  horario: [
    { dias: 'Segunda a sábado', horas: '6h30 às 19h' },
    { dias: 'Domingo', horas: '7h às 12h' },
  ],

  redes: [{ rede: 'Instagram', usuario: '@cafedocoreto.demo' }],

  depoimentos: [
    { texto: 'Peço o café da manhã pelo celular e passo para buscar a caminho do serviço.', autor: 'Ana Clara V.', contexto: 'freguesa de todo dia' },
  ],

  botaoPrincipal: 'Pedir pelo WhatsApp',

  hero: {
    titulo: 'Café do Coreto',
    texto: 'Café coado na hora, pão de queijo saindo do forno e lanche na chapa. Peça aqui e retire no balcão.',
    foto: 'loja/cafe',
  },

  cardapio: [
    {
      id: 'cafe',
      nome: 'Café',
      itens: [
        { id: 'coado', nome: 'Café coado', descricao: 'Xícara de 200 ml.', preco: 500 },
        { id: 'pingado', nome: 'Pingado', descricao: 'Café com leite na medida.', preco: 600 },
        { id: 'pao-queijo', nome: 'Pão de queijo', descricao: 'Porção com 6 unidades.', preco: 1200, foto: 'loja/pao' },
      ],
    },
    {
      id: 'lanches',
      nome: 'Lanches',
      itens: [
        { id: 'misto', nome: 'Misto na chapa', descricao: 'Pão francês, presunto e queijo.', preco: 1000 },
        { id: 'x-coreto', nome: 'X-Coreto', descricao: 'Hambúrguer de 120 g, queijo e salada.', preco: 2200, foto: 'alimentacao/classico' },
      ],
    },
  ],

  pedido: {
    titulo: 'Monte seu pedido',
    texto: 'Toque no + para adicionar. A conta fecha sozinha.',
    pagamento: ['Pix', 'Dinheiro', 'Cartão'],
    dicaObs: 'Café sem açúcar…',
  },

  delivery: {
    titulo: 'Retirada ou entrega',
    texto: 'Entregamos no Centro. Para retirar, é só chegar no balcão.',
    taxa: 400,
    tempo: '30 a 45 minutos',
    bairros: ['Centro'],
    retirada: 'No balcão, pronto em cerca de 10 minutos',
  },
};

export default lead;
