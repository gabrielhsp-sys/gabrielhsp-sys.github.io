// Montagem das mensagens que o site de verdade mandaria para o WhatsApp do negócio.
// No demo elas aparecem como prévia ("assim chegaria no WhatsApp da loja"); o botão abre a
// conversa com o Gabriel (src/lib/whatsapp.ts). Sem texto de negócio aqui: só a estrutura.

/** 2490 -> "R$ 24,90" (sem espaço não separável, para a mensagem ficar limpa no WhatsApp). */
export function formatarPreco(centavos: number): string {
  const reais = Math.floor(Math.abs(centavos) / 100);
  const resto = String(Math.abs(centavos) % 100).padStart(2, '0');
  const milhar = String(reais).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${centavos < 0 ? '-' : ''}R$ ${milhar},${resto}`;
}

export interface LinhaPedido {
  nome: string;
  qtd: number;
  preco: number; // centavos, unitário
}

export interface OpcoesPedido {
  negocio: string;
  linhas: LinhaPedido[];
  modo: 'entrega' | 'retirada';
  taxaEntrega: number;
  pagamento?: string;
  observacao?: string;
}

export function totalPedido(o: Pick<OpcoesPedido, 'linhas' | 'modo' | 'taxaEntrega'>): number {
  const itens = o.linhas.reduce((soma, l) => soma + l.qtd * l.preco, 0);
  return itens + (o.modo === 'entrega' && itens > 0 ? o.taxaEntrega : 0);
}

export function mensagemPedido(o: OpcoesPedido): string {
  const linhas = o.linhas.filter((l) => l.qtd > 0);
  if (linhas.length === 0) return '';
  const partes = [`Olá, ${o.negocio}! Quero fazer um pedido:`, ''];
  for (const l of linhas) partes.push(`${l.qtd}x ${l.nome} (${formatarPreco(l.qtd * l.preco)})`);
  partes.push('');
  if (o.modo === 'entrega') partes.push(`Entrega: ${formatarPreco(o.taxaEntrega)}`);
  else partes.push('Vou retirar no local');
  partes.push(`Total: ${formatarPreco(totalPedido({ ...o, linhas }))}`);
  if (o.pagamento) partes.push(`Pagamento: ${o.pagamento}`);
  if (o.observacao?.trim()) partes.push(`Observação: ${o.observacao.trim()}`);
  return partes.join('\n');
}

export interface OpcoesAgenda {
  negocio: string;
  servico?: string;
  profissional?: string;
  dia?: string;
  periodo?: string;
}

export function mensagemAgenda(o: OpcoesAgenda): string {
  if (!o.servico) return '';
  const quem = o.profissional && o.profissional !== 'Tanto faz' ? ` com ${o.profissional}` : '';
  const quando = [o.dia, o.periodo ? `de ${o.periodo.toLowerCase()}` : ''].filter(Boolean).join(' ');
  return `Olá, ${o.negocio}! Quero marcar ${o.servico}${quem}${quando ? `, ${quando}` : ''}. Tem horário?`;
}

export interface OpcoesOrcamento {
  negocio: string;
  servico?: string;
  carro?: string;
  ano?: string;
  problema?: string;
  quando?: string;
}

export function mensagemOrcamento(o: OpcoesOrcamento): string {
  if (!o.servico) return '';
  const partes = [`Olá, ${o.negocio}! Quero um orçamento.`, '', `Serviço: ${o.servico}`];
  const veiculo = [o.carro?.trim(), o.ano?.trim()].filter(Boolean).join(' ');
  if (veiculo) partes.push(`Carro: ${veiculo}`);
  if (o.problema?.trim()) partes.push(`O que está acontecendo: ${o.problema.trim()}`);
  if (o.quando) partes.push(`Quando: ${o.quando}`);
  return partes.join('\n');
}
