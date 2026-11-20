// Demo de CABELEIREIRO: Barbearia Navalha Fina (negócio fictício).
// Cada fato aparece uma vez só neste arquivo. Preços em centavos; duração em minutos.
import type { DadosCabeleireiro } from '../tipos.ts';

const dados: DadosCabeleireiro = {
  rotulo: 'Cabeleireiro',

  negocio: {
    nome: 'Navalha Fina',
    resumo: 'Barbearia Navalha Fina',
    descricao: 'Corte, barba e plano mensal no Centro de Areado. Escolha o corte, o barbeiro e o dia e marque pelo WhatsApp.',
  },

  endereco: { bairro: 'Centro', cidade: 'Areado', uf: 'MG', referencia: 'Ao lado da padaria da esquina' },
  mapa: { lat: -21.3589, lon: -46.145 },

  horario: [
    { dias: 'Terça a sexta', horas: '9h às 20h' },
    { dias: 'Sábado', horas: '8h às 17h' },
  ],

  redes: [
    { rede: 'Instagram', usuario: '@navalhafina.demo' },
    { rede: 'TikTok', usuario: '@navalhafina.demo' },
  ],

  depoimentos: [
    { texto: 'Degradê na régua toda vez. Marco pelo celular e não fico esperando na cadeira.', autor: 'Matheus L.', contexto: 'plano mensal' },
    { texto: 'O Téo acertou minha barba de primeira. Virei cliente.', autor: 'Rogério S.', contexto: 'cliente desde 2023' },
  ],

  botaoPrincipal: 'Marcar corte',

  hero: {
    titulo: 'Navalha Fina',
    texto: 'Corte na régua, barba feita com toalha quente e hora marcada pelo celular.',
    foto: 'cabeleireiro/hero',
  },

  cortes: {
    titulo: 'Cortes',
    lista: [
      { nome: 'Degradê', preco: 3500, duracaoMin: 40, foto: 'cabeleireiro/degrade' },
      { nome: 'Social na tesoura', preco: 3000, duracaoMin: 35, foto: 'cabeleireiro/tesoura' },
      { nome: 'Barba completa', preco: 2500, duracaoMin: 30, foto: 'cabeleireiro/barba' },
      { nome: 'Corte e barba', preco: 5500, duracaoMin: 60, foto: 'cabeleireiro/maquina' },
    ],
  },

  planos: {
    titulo: 'Planos mensais',
    texto: 'Pague uma vez por mês e venha quando precisar, sem fila no sábado.',
    lista: [
      { nome: 'Corte', preco: 8900, periodo: 'por mês', inclui: ['Até 4 cortes', 'Agendamento prioritário'] },
      { nome: 'Corte e barba', preco: 14900, periodo: 'por mês', inclui: ['Até 4 cortes', 'Até 4 barbas', 'Agendamento prioritário', 'Sobrancelha na navalha'], destaque: true },
      { nome: 'Barba', preco: 7900, periodo: 'por mês', inclui: ['Até 4 barbas', 'Toalha quente'] },
    ],
  },

  barbeiros: {
    titulo: 'Barbeiros',
    lista: [
      { nome: 'Téo Andrade', funcao: 'Barbeiro', detalhe: 'Barba e navalha' },
      { nome: 'Caio Ribeiro', funcao: 'Barbeiro', detalhe: 'Degradê e desenho' },
      { nome: 'Edu Martins', funcao: 'Barbeiro', detalhe: 'Corte social e infantil' },
    ],
  },

  agenda: {
    titulo: 'Marque seu horário',
    texto: 'Quatro escolhas e a mensagem sai pronta para confirmar com o barbeiro.',
    profissionais: ['Téo', 'Caio', 'Edu', 'Tanto faz'],
    dias: ['Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    periodos: ['Manhã', 'Tarde', 'Noite'],
  },
};

export default dados;
