// Demo de SERVIÇOS: Prado Serviços Automotivos (negócio fictício).
// Cada fato aparece uma vez só neste arquivo. Preços em centavos ("a partir de").
// `icone` é o nome de um arquivo em src/icons/ (Phosphor, MIT).
import type { DadosServicos } from '../tipos.ts';

const dados: DadosServicos = {
  rotulo: 'Serviços',

  negocio: {
    nome: 'Prado Serviços Automotivos',
    resumo: 'Prado Serviços Automotivos',
    descricao: 'Revisão, freio, suspensão, troca de óleo e pneus no Centro de Areado. Peça orçamento pelo WhatsApp antes de mexer no carro.',
  },

  endereco: { bairro: 'Centro', cidade: 'Areado', uf: 'MG', referencia: 'Portão amarelo, na saída para Alfenas' },
  mapa: { lat: -21.3589, lon: -46.145 },

  horario: [
    { dias: 'Segunda a sexta', horas: '7h30 às 18h' },
    { dias: 'Sábado', horas: '7h30 às 12h' },
  ],

  redes: [
    { rede: 'Instagram', usuario: '@pradoauto.demo' },
    { rede: 'Facebook', usuario: 'Prado Serviços Automotivos (demo)' },
  ],

  depoimentos: [
    { texto: 'Mandaram foto da pastilha gasta antes de trocar. Paguei o que estava no orçamento.', autor: 'Wellington D.', contexto: 'troca de freio' },
    { texto: 'Levo o carro da família faz anos. Sempre explicam o que precisa e o que pode esperar.', autor: 'Márcia T.', contexto: 'revisão anual' },
  ],

  botaoPrincipal: 'Pedir orçamento',

  hero: {
    titulo: 'Orçamento antes de mexer',
    texto: 'Diga o que o carro tem e receba o valor pelo WhatsApp. Só começamos com o seu ok.',
    foto: 'servicos/hero',
  },

  servicos: {
    titulo: 'O que fazemos',
    lista: [
      { nome: 'Revisão completa', descricao: 'Óleo, filtros, fluidos e 40 itens conferidos.', aPartirDe: 28000, icone: 'wrench' },
      { nome: 'Freio', descricao: 'Pastilha, disco e fluido, com teste na rua.', aPartirDe: 18000, icone: 'disc' },
      { nome: 'Suspensão', descricao: 'Amortecedor, bandeja e barulhos na lombada.', aPartirDe: 22000, icone: 'car-profile' },
      { nome: 'Troca de óleo', descricao: 'Óleo e filtro na hora, sem agendar.', aPartirDe: 15000, icone: 'drop' },
      { nome: 'Pneus e alinhamento', descricao: 'Montagem, balanceamento e alinhamento.', aPartirDe: 9000, icone: 'tire' },
      { nome: 'Elétrica', descricao: 'Bateria, alternador, luzes e partida.', aPartirDe: 12000, icone: 'lightning' },
    ],
  },

  orcamento: {
    titulo: 'Peça seu orçamento',
    texto: 'Responda o que souber. A mensagem se monta enquanto você preenche.',
    quando: ['O quanto antes', 'Esta semana', 'Só quero saber o valor'],
  },

  area: {
    titulo: 'Onde atendemos',
    texto: 'Oficina no Centro de Areado. Buscamos o carro sem custo nas cidades vizinhas.',
    cidades: ['Areado', 'Alterosa', 'Serrania', 'Alfenas', 'Machado'],
  },

  garantias: {
    titulo: 'Como trabalhamos',
    lista: ['Foto da peça antes de trocar', 'Valor fechado antes de começar', 'Peça velha devolvida no porta-malas', 'Garantia de 90 dias no serviço'],
  },
};

export default dados;
