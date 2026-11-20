// Demo de SAÚDE: Clínica Vida Integrada (negócio fictício).
// Regras deste nicho (publicidade em saúde): sem "antes e depois", sem promessa de resultado,
// sem depoimento de paciente, sem rosto em close. Registros profissionais e convênios são
// fictícios e aparecem marcados como tal.
import type { DadosSaude } from '../tipos.ts';

const dados: DadosSaude = {
  rotulo: 'Saúde',

  negocio: {
    nome: 'Clínica Vida Integrada',
    resumo: 'Clínica Vida Integrada',
    descricao: 'Clínica geral, fisioterapia, psicologia, nutrição e odontologia no Centro de Areado. Veja convênios, equipe e como chegar.',
  },

  endereco: { bairro: 'Centro', cidade: 'Areado', uf: 'MG', referencia: 'Prédio com rampa de acesso, em frente ao ponto de ônibus' },
  mapa: { lat: -21.3589, lon: -46.145 },

  horario: [
    { dias: 'Segunda a sexta', horas: '7h às 19h' },
    { dias: 'Sábado', horas: '7h às 12h' },
  ],

  redes: [{ rede: 'Instagram', usuario: '@vidaintegrada.demo' }],

  // Saúde não mostra depoimento de paciente.
  depoimentos: [],

  botaoPrincipal: 'Marcar consulta',

  hero: {
    titulo: 'Consultas e terapias no Centro de Areado',
    texto: 'Várias especialidades no mesmo endereço, com horário marcado e atendimento por convênio ou particular.',
    foto: 'saude/hero',
  },

  especialidades: {
    titulo: 'Especialidades',
    lista: [
      { nome: 'Clínica geral', descricao: 'Consulta, check-up e encaminhamento.' },
      { nome: 'Fisioterapia', descricao: 'Ortopédica e pós-operatória, com sessões de 50 minutos.' },
      { nome: 'Psicologia', descricao: 'Atendimento individual para adultos e adolescentes.' },
      { nome: 'Nutrição', descricao: 'Avaliação e plano alimentar com retorno.' },
      { nome: 'Odontologia', descricao: 'Limpeza, restauração e avaliação.' },
    ],
  },

  equipe: {
    titulo: 'Equipe',
    aviso: 'Nomes e registros fictícios, apenas para demonstração.',
    lista: [
      { nome: 'Dra. Marina Teixeira', especialidade: 'Clínica geral', registro: 'CRM-MG 99001' },
      { nome: 'Dr. Felipe Andrade', especialidade: 'Fisioterapia', registro: 'CREFITO-4 99001-F' },
      { nome: 'Lívia Duarte', especialidade: 'Psicologia', registro: 'CRP 04/99001' },
      { nome: 'Paula Rezende', especialidade: 'Nutrição', registro: 'CRN-9 99001' },
      { nome: 'Dr. Henrique Lobo', especialidade: 'Odontologia', registro: 'CRO-MG 99001' },
    ],
  },

  convenios: {
    titulo: 'Convênios',
    lista: ['Saúde Sul Mineira', 'Plano Vale Verde', 'Cooperativa Integrar', 'Mais Vida Família', 'Particular'],
    aviso: 'Nomes de convênio fictícios. Confirme a cobertura do seu plano ao marcar.',
  },

  comoChegar: {
    titulo: 'Como chegar',
    texto: 'No Centro, a uma quadra da praça. Prédio térreo com rampa.',
    pontos: ['Estacionamento na rua da frente', 'Acesso para cadeira de rodas', 'Sala de espera climatizada'],
  },

  ambiente: {
    titulo: 'O espaço',
    fotos: ['saude/consultorio', 'saude/sala', 'saude/estetoscopio'],
  },
};

export default dados;
