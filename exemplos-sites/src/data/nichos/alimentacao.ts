// Demo de ALIMENTAÇÃO: Lanchonete Brasa & Pão (negócio fictício).
// Cada fato aparece uma vez só neste arquivo; a página e o carrinho leem daqui.
// Preços em centavos (2490 = R$ 24,90). Fotos por chave de src/data/imagens.json.
import type { DadosAlimentacao } from '../tipos.ts';

const dados: DadosAlimentacao = {
  // Vai no texto do WhatsApp: "[Demo Alimentação] Oi Gabriel, ..."
  rotulo: 'Alimentação',

  negocio: {
    nome: 'Brasa & Pão',
    resumo: 'Lanchonete Brasa & Pão',
    descricao: 'Lanches na chapa, porções e milkshake no Centro de Areado. Monte seu pedido e mande pelo WhatsApp: entrega ou retirada.',
  },

  // Endereço fictício: só o bairro e a cidade são reais.
  endereco: { bairro: 'Centro', cidade: 'Areado', uf: 'MG', referencia: 'Perto da praça da matriz' },
  mapa: { lat: -21.3589, lon: -46.145 },

  horario: [
    { dias: 'Terça a quinta', horas: '18h às 23h' },
    { dias: 'Sexta e sábado', horas: '18h à 0h' },
    { dias: 'Domingo', horas: '17h às 22h' },
  ],

  redes: [
    { rede: 'Instagram', usuario: '@brasaepao.demo' },
    { rede: 'Facebook', usuario: 'Brasa e Pão Lanches (demo)' },
  ],

  depoimentos: [
    { texto: 'O X-Brasa chega quente mesmo, e o pedido pelo site sai certinho, sem ficar repetindo no áudio.', autor: 'Lurdes A.', contexto: 'pede toda sexta' },
    { texto: 'A batata com cheddar dá para três. Retiro no balcão e em dez minutos está pronta.', autor: 'Tiago R.', contexto: 'cliente desde 2022' },
  ],

  botaoPrincipal: 'Pedir pelo WhatsApp',

  hero: {
    titulo: 'Brasa & Pão',
    texto: 'Lanche na chapa, batata sequinha e milkshake batido na hora. Monte o pedido aqui e mande pelo WhatsApp.',
    foto: 'alimentacao/hero',
  },

  cardapio: [
    {
      id: 'lanches',
      nome: 'Lanches',
      itens: [
        { id: 'x-brasa', nome: 'X-Brasa', descricao: 'Hambúrguer artesanal de 160 g, queijo, alface, tomate e molho da casa no pão de brioche.', preco: 2490, foto: 'alimentacao/hero' },
        { id: 'duplo-brasa', nome: 'Duplo Brasa', descricao: 'Dois hambúrgueres de 120 g, cheddar duplo, cebola na chapa e picles.', preco: 3290, foto: 'alimentacao/duplo' },
        { id: 'x-salada', nome: 'X-Salada', descricao: 'Hambúrguer de 120 g, queijo, alface, tomate e cebola roxa.', preco: 1990, foto: 'alimentacao/classico' },
        { id: 'misto', nome: 'Misto quente', descricao: 'Pão de forma na chapa com presunto e queijo.', preco: 900 },
      ],
    },
    {
      id: 'porcoes',
      nome: 'Porções',
      itens: [
        { id: 'batata', nome: 'Batata frita', descricao: 'Porção de 400 g, sal e orégano.', preco: 1800, foto: 'alimentacao/fritas' },
        { id: 'batata-cheddar', nome: 'Batata com cheddar e bacon', descricao: 'Porção de 500 g para dividir.', preco: 2900 },
        { id: 'mandioca', nome: 'Mandioca frita', descricao: 'Porção de 400 g com maionese verde.', preco: 2200 },
      ],
    },
    {
      id: 'bebidas',
      nome: 'Bebidas',
      itens: [
        { id: 'milkshake', nome: 'Milkshake de morango', descricao: 'Copo de 400 ml com morango de verdade.', preco: 1600, foto: 'alimentacao/milkshake' },
        { id: 'suco', nome: 'Suco de laranja', descricao: 'Natural, 500 ml.', preco: 900 },
        { id: 'refri', nome: 'Refrigerante lata', descricao: '350 ml, vários sabores.', preco: 600 },
      ],
    },
  ],

  pedido: {
    titulo: 'Monte seu pedido',
    texto: 'Toque no + para adicionar. A conta fecha sozinha e a mensagem já sai pronta.',
    pagamento: ['Pix', 'Dinheiro', 'Cartão na entrega'],
    dicaObs: 'Sem cebola, troco para R$ 50…',
  },

  delivery: {
    titulo: 'Entrega ou retirada',
    texto: 'Entregamos no Centro e nos bairros até 3 km. Prefere buscar? Retire no balcão.',
    taxa: 500,
    tempo: '40 a 60 minutos',
    bairros: ['Centro', 'Bairros até 3 km do Centro'],
    retirada: 'No balcão, pronto em cerca de 20 minutos',
  },
};

export default dados;
