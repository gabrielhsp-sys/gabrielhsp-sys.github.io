// Teste das mensagens de prévia (pedido, agenda, orçamento). Oráculo: contas feitas à mão.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatarPreco, mensagemPedido, totalPedido, mensagemAgenda, mensagemOrcamento } from './mensagens.ts';

test('formatarPreco', () => {
  assert.equal(formatarPreco(2490), 'R$ 24,90');
  assert.equal(formatarPreco(500), 'R$ 5,00');
  assert.equal(formatarPreco(123456), 'R$ 1.234,56');
  assert.equal(formatarPreco(0), 'R$ 0,00');
});

test('pedido com entrega soma itens + taxa', () => {
  const o = {
    negocio: 'Brasa & Pão',
    linhas: [
      { nome: 'X-Brasa', qtd: 2, preco: 2490 },
      { nome: 'Batata frita', qtd: 1, preco: 1800 },
      { nome: 'Suco', qtd: 0, preco: 900 },
    ],
    modo: 'entrega' as const,
    taxaEntrega: 500,
    pagamento: 'Pix',
  };
  // 2 × 24,90 + 18,00 + 5,00 = 72,80
  assert.equal(totalPedido(o), 7280);
  assert.equal(
    mensagemPedido(o),
    [
      'Olá, Brasa & Pão! Quero fazer um pedido:',
      '',
      '2x X-Brasa (R$ 49,80)',
      '1x Batata frita (R$ 18,00)',
      '',
      'Entrega: R$ 5,00',
      'Total: R$ 72,80',
      'Pagamento: Pix',
    ].join('\n'),
  );
});

test('retirada não cobra taxa; pedido vazio não gera mensagem', () => {
  const linhas = [{ nome: 'Mel', qtd: 3, preco: 2800 }];
  assert.equal(totalPedido({ linhas, modo: 'retirada', taxaEntrega: 600 }), 8400);
  assert.equal(totalPedido({ linhas: [], modo: 'entrega', taxaEntrega: 600 }), 0);
  assert.equal(mensagemPedido({ negocio: 'X', linhas: [], modo: 'entrega', taxaEntrega: 600 }), '');
});

test('agenda', () => {
  assert.equal(
    mensagemAgenda({ negocio: 'Navalha Fina', servico: 'Degradê', profissional: 'Téo', dia: 'Sábado', periodo: 'Manhã' }),
    'Olá, Navalha Fina! Quero marcar Degradê com Téo, Sábado de manhã. Tem horário?',
  );
  assert.equal(
    mensagemAgenda({ negocio: 'Studio Íris', servico: 'Manicure', profissional: 'Tanto faz' }),
    'Olá, Studio Íris! Quero marcar Manicure. Tem horário?',
  );
  assert.equal(mensagemAgenda({ negocio: 'X' }), '');
});

test('orçamento', () => {
  assert.equal(
    mensagemOrcamento({ negocio: 'Prado', servico: 'Freio', carro: 'Gol', ano: '2014', problema: ' chiando ', quando: 'Esta semana' }),
    'Olá, Prado! Quero um orçamento.\n\nServiço: Freio\nCarro: Gol 2014\nO que está acontecendo: chiando\nQuando: Esta semana',
  );
});
