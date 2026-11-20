// Demo de LOJA: Empório da Praça (negócio fictício).
// Cada fato aparece uma vez só neste arquivo. Preços em centavos.
// A chave Pix é fictícia (domínio .exemplo, reservado e que não existe).
import type { DadosLoja } from '../tipos.ts';

const dados: DadosLoja = {
  rotulo: 'Loja',

  negocio: {
    nome: 'Empório da Praça',
    resumo: 'Empório da Praça',
    descricao: 'Queijo, doce, café, mel e pão da roça no Centro de Areado. Escolha no catálogo, pague por Pix e retire ou receba em casa.',
  },

  endereco: { bairro: 'Centro', cidade: 'Areado', uf: 'MG', referencia: 'Na praça, ao lado da banca' },
  mapa: { lat: -21.3589, lon: -46.145 },

  horario: [
    { dias: 'Segunda a sexta', horas: '8h às 18h30' },
    { dias: 'Sábado', horas: '8h às 13h' },
  ],

  redes: [
    { rede: 'Instagram', usuario: '@emporiodapraca.demo' },
    { rede: 'Facebook', usuario: 'Empório da Praça (demo)' },
  ],

  depoimentos: [
    { texto: 'O queijo meia-cura é o mesmo que eu comprava na roça do meu avô.', autor: 'Sebastião F.', contexto: 'compra todo sábado' },
    { texto: 'Faço o pedido no almoço e passo para buscar na volta do serviço.', autor: 'Renata G.', contexto: 'retira na loja' },
  ],

  botaoPrincipal: 'Finalizar pedido',

  hero: {
    titulo: 'Da roça para a praça',
    texto: 'Queijo, doce, café e mel de produtor da região. Monte a sacola, pague no Pix e retire ou receba.',
    foto: 'loja/hero',
  },

  catalogo: {
    titulo: 'Catálogo',
    categorias: ['Queijos', 'Doces', 'Café', 'Mel', 'Padaria'],
    produtos: [
      { id: 'queijo-meia-cura', nome: 'Queijo meia-cura', categoria: 'Queijos', preco: 4500, unidade: 'peça de 1 kg', foto: 'loja/queijo', oferta: true },
      { id: 'doce-leite', nome: 'Doce de leite', categoria: 'Doces', preco: 1890, unidade: 'pote de 600 g', foto: 'loja/doce' },
      { id: 'goiabada', nome: 'Goiabada cascão', categoria: 'Doces', preco: 1450, unidade: 'pote de 500 g', foto: 'loja/compotas' },
      { id: 'cafe', nome: 'Café torrado em grão', categoria: 'Café', preco: 3600, unidade: 'pacote de 500 g', foto: 'loja/cafe', oferta: true },
      { id: 'mel', nome: 'Mel silvestre', categoria: 'Mel', preco: 2800, unidade: 'pote de 500 g', foto: 'loja/mel' },
      { id: 'pao-caseiro', nome: 'Pão caseiro', categoria: 'Padaria', preco: 1200, unidade: 'unidade de 700 g', foto: 'loja/pao' },
    ],
  },

  pix: {
    titulo: 'Pague por Pix',
    chave: 'pedidos@emporiodapraca.exemplo',
    recebedor: 'Empório da Praça',
    aviso: 'Chave fictícia de demonstração. Não faça transferência.',
  },

  entrega: {
    titulo: 'Retirada ou entrega',
    taxa: 600,
    bairros: ['Centro', 'Bairros até 4 km do Centro'],
    retirada: 'Na loja, no mesmo dia',
    prazo: 'Entrega no mesmo dia para pedidos até 15h',
    pagamento: ['Pix', 'Dinheiro na retirada', 'Cartão na retirada'],
    dicaObs: 'Queijo mais curado, se tiver…',
  },
};

export default dados;
