// Índice dos 7 nichos: a home, as rotas e os testes leem daqui.
// Ordem = ordem dos cartões na home.
import type { DadosPorNicho, NichoId } from '../tipos.ts';
import alimentacao from './alimentacao.ts';
import beleza from './beleza.ts';
import cabeleireiro from './cabeleireiro.ts';
import saude from './saude.ts';
import fitness from './fitness.ts';
import loja from './loja.ts';
import servicos from './servicos.ts';

export const NICHOS: { [K in NichoId]: DadosPorNicho[K] } = {
  alimentacao,
  beleza,
  cabeleireiro,
  saude,
  fitness,
  loja,
  servicos,
};

export const ORDEM: NichoId[] = ['alimentacao', 'beleza', 'cabeleireiro', 'saude', 'fitness', 'loja', 'servicos'];
