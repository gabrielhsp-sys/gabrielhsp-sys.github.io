// Demo de FITNESS: Arena Fit Studio (negócio fictício).
// Cada fato aparece uma vez só neste arquivo. Preços em centavos.
import type { DadosFitness } from '../tipos.ts';

const dados: DadosFitness = {
  rotulo: 'Fitness',

  negocio: {
    nome: 'Arena Fit',
    resumo: 'Arena Fit Studio',
    descricao: 'Funcional, musculação, spinning e alongamento no Centro de Areado. Veja a grade de aulas e agende uma aula experimental grátis.',
  },

  endereco: { bairro: 'Centro', cidade: 'Areado', uf: 'MG', referencia: 'Galpão azul, na descida da praça' },
  mapa: { lat: -21.3589, lon: -46.145 },

  horario: [
    { dias: 'Segunda a sexta', horas: '5h30 às 22h' },
    { dias: 'Sábado', horas: '8h às 13h' },
  ],

  redes: [
    { rede: 'Instagram', usuario: '@arenafit.demo' },
    { rede: 'TikTok', usuario: '@arenafit.demo' },
  ],

  depoimentos: [
    { texto: 'A turma das 6h30 me tirou do sofá. O professor corrige cada movimento.', autor: 'Vanessa C.', contexto: 'aluna do funcional' },
    { texto: 'Treino antes do serviço e ainda dá tempo de tomar café em casa.', autor: 'Diego F.', contexto: 'plano trimestral' },
  ],

  botaoPrincipal: 'Agendar aula experimental',

  hero: {
    titulo: 'Vem treinar na Arena',
    texto: 'Turmas pequenas, professor do lado e a primeira aula por nossa conta.',
    foto: 'fitness/hero',
  },

  planos: {
    titulo: 'Planos',
    lista: [
      { nome: 'Mensal', preco: 13900, periodo: 'por mês', inclui: ['Musculação livre', 'Todas as aulas da grade'] },
      { nome: 'Trimestral', preco: 11900, periodo: 'por mês, em 3 meses', inclui: ['Musculação livre', 'Todas as aulas da grade', 'Avaliação física'], destaque: true },
      { nome: 'Anual', preco: 9900, periodo: 'por mês, em 12 meses', inclui: ['Musculação livre', 'Todas as aulas da grade', 'Avaliação física a cada 3 meses', 'Uma camiseta da Arena'] },
    ],
  },

  grade: {
    titulo: 'Grade de aulas',
    dias: [
      { dia: 'Seg', aulas: [
        { hora: '06:30', modalidade: 'Funcional', professor: 'Iara', lotando: true },
        { hora: '12:10', modalidade: 'Alongamento', professor: 'Renan' },
        { hora: '18:30', modalidade: 'Spinning', professor: 'Bia' },
        { hora: '19:30', modalidade: 'Funcional', professor: 'Iara' },
      ] },
      { dia: 'Ter', aulas: [
        { hora: '06:30', modalidade: 'Spinning', professor: 'Bia' },
        { hora: '18:30', modalidade: 'Abdominal', professor: 'Renan' },
        { hora: '19:30', modalidade: 'Funcional', professor: 'Iara', lotando: true },
      ] },
      { dia: 'Qua', aulas: [
        { hora: '06:30', modalidade: 'Funcional', professor: 'Iara' },
        { hora: '12:10', modalidade: 'Alongamento', professor: 'Renan' },
        { hora: '18:30', modalidade: 'Spinning', professor: 'Bia', lotando: true },
      ] },
      { dia: 'Qui', aulas: [
        { hora: '06:30', modalidade: 'Spinning', professor: 'Bia' },
        { hora: '18:30', modalidade: 'Abdominal', professor: 'Renan' },
        { hora: '19:30', modalidade: 'Funcional', professor: 'Iara' },
      ] },
      { dia: 'Sex', aulas: [
        { hora: '06:30', modalidade: 'Funcional', professor: 'Iara' },
        { hora: '18:00', modalidade: 'Spinning', professor: 'Bia' },
      ] },
      { dia: 'Sáb', aulas: [
        { hora: '08:30', modalidade: 'Funcional em dupla', professor: 'Iara' },
        { hora: '10:00', modalidade: 'Alongamento', professor: 'Renan' },
      ] },
    ],
  },

  estrutura: {
    titulo: 'Estrutura',
    itens: [
      { foto: 'fitness/musculacao', legenda: 'Sala de musculação' },
      { foto: 'fitness/funcional', legenda: 'Área de funcional' },
      { foto: 'fitness/kettlebell', legenda: 'Kettlebells de 4 a 32 kg' },
      { foto: 'fitness/cardio', legenda: 'Esteiras e bikes' },
      { foto: 'fitness/barra', legenda: 'Plataforma de levantamento' },
    ],
  },

  experimental: {
    titulo: 'Aula experimental grátis',
    texto: 'Escolha uma aula da grade, venha com roupa confortável e uma garrafa de água.',
    passos: ['Escolha a aula na grade', 'Mande a mensagem', 'Chegue 10 minutos antes'],
  },
};

export default dados;
