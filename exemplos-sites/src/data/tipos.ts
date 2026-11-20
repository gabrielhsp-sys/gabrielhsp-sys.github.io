// Formato dos arquivos de dados. Cada nicho (src/data/nichos/<nicho>.ts) e cada lead
// (src/data/leads/<slug>.ts) preenche um destes tipos. Os componentes não têm texto de negócio:
// tudo o que aparece na página sai daqui.
//
// Preço sempre em centavos (inteiro), para a soma do carrinho não errar por arredondamento.
// Foto sempre por chave de src/data/imagens.json (ex.: "alimentacao/hero").

export type NichoId = 'alimentacao' | 'beleza' | 'cabeleireiro' | 'saude' | 'fitness' | 'loja' | 'servicos';

export interface Horario {
  dias: string; // "Terça a domingo"
  horas: string; // "18h às 23h30"
}

export interface Rede {
  rede: 'Instagram' | 'Facebook' | 'TikTok';
  usuario: string; // fictício, mostrado como texto (sem link, para não cair em perfil real)
}

export interface Depoimento {
  texto: string;
  autor: string;
  contexto: string; // "cliente desde 2021"
}

/** Campos comuns a todos os nichos. */
export interface Comum {
  /** Rótulo do nicho usado no texto do WhatsApp: "[Demo <rotulo>] ..." */
  rotulo: string;
  negocio: {
    nome: string;
    /** Frase do título da aba e do cartão de compartilhamento. */
    resumo: string;
    /** Descrição de até ~155 caracteres para meta description e og:description. */
    descricao: string;
  };
  endereco: {
    bairro: string;
    cidade: string;
    uf: string;
    /** Ponto de referência fictício. */
    referencia: string;
  };
  /** Coordenadas aproximadas do Centro de Areado, para o mapa. */
  mapa: { lat: number; lon: number };
  horario: Horario[];
  redes: Rede[];
  /** Depoimentos de exemplo (aparecem marcados como "exemplo"). Vazio = seção some. */
  depoimentos: Depoimento[];
  /** Rótulo do botão principal (chamada para ação). */
  botaoPrincipal: string;
  hero: {
    titulo: string;
    texto: string;
    foto: string;
  };
}

// ---------- Alimentação ----------
export interface ItemCardapio {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  foto?: string;
}
export interface DadosAlimentacao extends Comum {
  cardapio: { id: string; nome: string; itens: ItemCardapio[] }[];
  pedido: {
    titulo: string;
    texto: string;
    pagamento: string[];
    /** Exemplo mostrado no campo de observação. */
    dicaObs: string;
  };
  delivery: {
    titulo: string;
    texto: string;
    taxa: number;
    tempo: string;
    bairros: string[];
    retirada: string;
  };
}

// ---------- Beleza ----------
export interface ServicoTabela {
  nome: string;
  duracaoMin: number;
  preco: number;
  descricao?: string;
}
export interface Profissional {
  nome: string;
  funcao: string;
  detalhe: string;
}
export interface DadosBeleza extends Comum {
  servicos: { categoria: string; itens: ServicoTabela[] }[];
  galeria: { titulo: string; fotos: string[] };
  profissionais: { titulo: string; lista: Profissional[] };
  agenda: AgendaConfig;
}

// ---------- Cabeleireiro ----------
export interface Corte {
  nome: string;
  preco: number;
  duracaoMin: number;
  foto: string;
}
export interface Plano {
  nome: string;
  preco: number;
  periodo: string; // "por mês"
  inclui: string[];
  destaque?: boolean;
}
/** Escolha guiada (serviço → profissional → dia → período) que monta a mensagem. */
export interface AgendaConfig {
  titulo: string;
  texto: string;
  /** Se vazio, o passo de serviço usa os serviços/cortes do próprio nicho. */
  profissionais: string[];
  dias: string[];
  periodos: string[];
}
export interface DadosCabeleireiro extends Comum {
  cortes: { titulo: string; lista: Corte[] };
  planos: { titulo: string; texto: string; lista: Plano[] };
  barbeiros: { titulo: string; lista: Profissional[] };
  agenda: AgendaConfig;
}

// ---------- Saúde ----------
export interface DadosSaude extends Comum {
  especialidades: { titulo: string; lista: { nome: string; descricao: string }[] };
  equipe: { titulo: string; aviso: string; lista: { nome: string; especialidade: string; registro: string }[] };
  convenios: { titulo: string; lista: string[]; aviso: string };
  comoChegar: { titulo: string; texto: string; pontos: string[] };
  ambiente: { titulo: string; fotos: string[] };
}

// ---------- Fitness ----------
export interface Aula {
  hora: string;
  modalidade: string;
  professor: string;
  lotando?: boolean;
}
export interface DadosFitness extends Comum {
  planos: { titulo: string; lista: Plano[] };
  grade: { titulo: string; dias: { dia: string; aulas: Aula[] }[] };
  estrutura: { titulo: string; itens: { foto: string; legenda: string }[] };
  experimental: { titulo: string; texto: string; passos: string[] };
}

// ---------- Loja ----------
export interface Produto {
  id: string;
  nome: string;
  categoria: string;
  preco: number;
  unidade: string; // "pote 300 g"
  foto: string;
  oferta?: boolean;
}
export interface DadosLoja extends Comum {
  catalogo: { titulo: string; categorias: string[]; produtos: Produto[] };
  pix: { titulo: string; chave: string; recebedor: string; aviso: string };
  entrega: { titulo: string; taxa: number; bairros: string[]; retirada: string; prazo: string; pagamento: string[]; dicaObs: string };
}

// ---------- Serviços ----------
export interface DadosServicos extends Comum {
  servicos: { titulo: string; lista: { nome: string; descricao: string; aPartirDe: number; icone: string }[] };
  orcamento: { titulo: string; texto: string; quando: string[] };
  area: { titulo: string; texto: string; cidades: string[] };
  garantias: { titulo: string; lista: string[] };
}

export interface DadosPorNicho {
  alimentacao: DadosAlimentacao;
  beleza: DadosBeleza;
  cabeleireiro: DadosCabeleireiro;
  saude: DadosSaude;
  fitness: DadosFitness;
  loja: DadosLoja;
  servicos: DadosServicos;
}

/** Lead: mesmo formato de um nicho, mais o nicho-base que define o layout. */
export type Lead = { [K in NichoId]: { nichoBase: K } & DadosPorNicho[K] }[NichoId];
