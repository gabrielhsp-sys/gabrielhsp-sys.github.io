// Textos da home (vitrine do Gabriel) e a cor de cada nicho no cartão.
// As cores repetem o token --primary/--bg de cada página (docs/SISTEMAS.md); se mudar lá,
// mude aqui.
import type { NichoId } from './tipos.ts';

export const HOME = {
  titulo: 'Sites para o comércio de Areado',
  texto: 'Sete exemplos prontos para abrir no celular. Escolha o do seu ramo: o seu fica igual, com o seu nome, suas fotos e seu WhatsApp.',
  rotuloWhats: 'Vitrine',
  botao: 'Quero um site assim',
  verDemo: 'Abrir o demo',
  descricao: 'Sete sites de demonstração para lanchonete, salão, barbearia, clínica, academia, loja e oficina de Areado - MG.',
  comoFunciona: {
    titulo: 'Como funciona',
    passos: [
      'Você escolhe o modelo do seu ramo',
      'Eu troco nome, fotos, preços e horário pelos seus',
      'O site fica no ar e os pedidos chegam no seu WhatsApp',
    ],
  },
  aviso: 'Os negócios dos exemplos são fictícios.',
};

export const CORES: Record<NichoId, { fundo: string; tinta: string; destaque: string }> = {
  alimentacao: { fundo: '#F7C948', tinta: '#2A140D', destaque: '#A61F17' },
  beleza: { fundo: '#F3F1F5', tinta: '#2A2230', destaque: '#5B3B8C' },
  cabeleireiro: { fundo: '#141516', tinta: '#EEE5D1', destaque: '#C9A15B' },
  saude: { fundo: '#F3F6F4', tinta: '#13302C', destaque: '#0E6B63' },
  fitness: { fundo: '#2638D9', tinta: '#FFFFFF', destaque: '#E8FF59' },
  loja: { fundo: '#EEF1E6', tinta: '#1B2A20', destaque: '#B8321F' },
  servicos: { fundo: '#12434F', tinta: '#ECEFF0', destaque: '#F5C400' },
};
