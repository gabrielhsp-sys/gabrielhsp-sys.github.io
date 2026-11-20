// Demo de BELEZA: Studio Íris Estética (negócio fictício).
// Cada fato aparece uma vez só neste arquivo. Preços em centavos; duração em minutos.
import type { DadosBeleza } from '../tipos.ts';

const dados: DadosBeleza = {
  rotulo: 'Beleza',

  negocio: {
    nome: 'Studio Íris',
    resumo: 'Studio Íris Estética',
    descricao: 'Limpeza de pele, unhas, sobrancelha e massagem no Centro de Areado. Veja serviços, duração e valores e agende pelo WhatsApp.',
  },

  endereco: { bairro: 'Centro', cidade: 'Areado', uf: 'MG', referencia: 'Sobreloja, em frente à praça' },
  mapa: { lat: -21.3589, lon: -46.145 },

  horario: [
    { dias: 'Terça a sexta', horas: '9h às 19h' },
    { dias: 'Sábado', horas: '8h às 14h' },
  ],

  redes: [{ rede: 'Instagram', usuario: '@studioiris.demo' }],

  depoimentos: [
    { texto: 'A Helena explica cada passo da limpeza de pele. Saio de lá sem pressa nenhuma.', autor: 'Carla M.', contexto: 'cliente de limpeza de pele' },
    { texto: 'Marquei a manicure pelo celular em um minuto e o horário estava confirmado.', autor: 'Juliana P.', contexto: 'vem a cada 15 dias' },
  ],

  botaoPrincipal: 'Agendar horário',

  hero: {
    titulo: 'Um tempo só seu, no Centro de Areado',
    texto: 'Pele, unhas e sobrancelha com hora marcada. Escolha o serviço e agende pelo WhatsApp.',
    foto: 'beleza/hero',
  },

  servicos: [
    {
      categoria: 'Pele',
      itens: [
        { nome: 'Limpeza de pele', duracaoMin: 90, preco: 14000, descricao: 'Higienização, extração e máscara calmante.' },
        { nome: 'Hidratação facial', duracaoMin: 50, preco: 9000 },
        { nome: 'Peeling de diamante', duracaoMin: 40, preco: 11000 },
      ],
    },
    {
      categoria: 'Unhas',
      itens: [
        { nome: 'Manicure', duracaoMin: 40, preco: 3500 },
        { nome: 'Pedicure', duracaoMin: 50, preco: 4000 },
        { nome: 'Pé e mão', duracaoMin: 80, preco: 7000 },
      ],
    },
    {
      categoria: 'Sobrancelha e corpo',
      itens: [
        { nome: 'Design de sobrancelha', duracaoMin: 30, preco: 4500 },
        { nome: 'Massagem relaxante', duracaoMin: 60, preco: 12000 },
      ],
    },
  ],

  galeria: {
    titulo: 'O studio',
    fotos: ['beleza/produto', 'beleza/unhas', 'beleza/maos', 'beleza/massagem'],
  },

  profissionais: {
    titulo: 'Quem cuida de você',
    lista: [
      { nome: 'Helena Prado', funcao: 'Esteticista', detalhe: 'Limpeza de pele e peeling' },
      { nome: 'Bruna Lemos', funcao: 'Manicure e pedicure', detalhe: 'Unhas naturais e esmaltação' },
      { nome: 'Rita Fonseca', funcao: 'Designer de sobrancelha', detalhe: 'Design e massagem' },
    ],
  },

  agenda: {
    titulo: 'Agende em quatro toques',
    texto: 'Escolha o serviço, com quem, o dia e o período. A mensagem sai pronta.',
    profissionais: ['Helena', 'Bruna', 'Rita', 'Tanto faz'],
    dias: ['Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    periodos: ['Manhã', 'Tarde', 'Fim de tarde'],
  },
};

export default dados;
