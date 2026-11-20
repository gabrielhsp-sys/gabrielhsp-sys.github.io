"use client";

import { useState } from "react";

/* Demonstracoes simuladas no navegador (decisao 13 de 2026-11-19): nada sai
   da pagina, nada e gravado, os dados sao de mentira. Cada uma leva o rotulo
   "Demonstracao: exemplo do que posso fazer" na pagina que a usa. */

/* ───────────────────────── robo no Telegram ───────────────────────── */

type Fala = { de: "robo" | "pessoa"; texto: string };

const ROTEIROS: { id: string; botao: string; falas: Fala[] }[] = [
  {
    id: "pedido",
    botao: "Entrar um pedido no site",
    falas: [{ de: "robo", texto: "🔔 Pedido novo #27 — 2 X-Burguer, 1 batata média. Retirada às 19h30. Cliente: Carla." }],
  },
  {
    id: "horario",
    botao: "Cliente pergunta o horário",
    falas: [
      { de: "pessoa", texto: "Vocês abrem hoje?" },
      { de: "robo", texto: "Abrimos de terça a domingo, das 18h às 23h. Hoje estamos abertos! Quer ver o cardápio?" },
    ],
  },
  {
    id: "lembrete",
    botao: "Chegar a hora do lembrete",
    falas: [{ de: "robo", texto: "⏰ Lembrete da equipe: conferir o estoque de pão antes das 17h." }],
  },
];

export function ChatSimulado() {
  const [falas, setFalas] = useState<Fala[]>([{ de: "robo", texto: "Olá! Eu sou o robô da Lanchonete Exemplo. Aviso a equipe e respondo as perguntas de sempre." }]);
  return (
    <div className="d-demo">
      <div className="d-chat" role="log" aria-live="polite" aria-label="Conversa simulada no Telegram">
        {falas.map((f, i) => (
          <p key={i} className="d-bubble" data-de={f.de}>
            <span className="sr-only">{f.de === "robo" ? "Robô: " : "Cliente: "}</span>
            {f.texto}
          </p>
        ))}
      </div>
      <div className="d-actions" aria-label="Simular">
        {ROTEIROS.map((r) => (
          <button key={r.id} type="button" className="c-button c-button-ghost" onClick={() => setFalas((f) => [...f, ...r.falas])}>
            {r.botao}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ───────────── automacao: pedidos do WhatsApp viram planilha ───────────── */

const PEDIDOS = [
  { cliente: "Carla", itens: { "X-Burguer": 2, "Batata média": 1 } },
  { cliente: "João", itens: { "X-Salada": 1, "Refrigerante": 2 } },
  { cliente: "Bia", itens: { "X-Burguer": 1, "Milkshake": 1 } },
  { cliente: "Rafa", itens: { "X-Salada": 2, "Batata média": 2 } },
  { cliente: "Lu", itens: { "X-Burguer": 3 } },
];

const mensagemDoPedido = (p: (typeof PEDIDOS)[number]) =>
  `Oi! Quero ${Object.entries(p.itens).map(([item, qtd]) => `${qtd} ${item}`).join(" e ")}. Retiro aí. — ${p.cliente}`;

export function AutomacaoDemo() {
  const [linhas, setLinhas] = useState(0);
  const [resumo, setResumo] = useState<string | null>(null);
  const feitos = PEDIDOS.slice(0, linhas);
  const proximo = PEDIDOS[linhas];

  const fecharDia = () => {
    const total: Record<string, number> = {};
    for (const p of feitos) for (const [item, qtd] of Object.entries(p.itens)) total[item] = (total[item] ?? 0) + qtd;
    const top = Object.entries(total).sort((a, b) => b[1] - a[1]);
    setResumo(
      `Resumo do dia: ${feitos.length} ${feitos.length === 1 ? "pedido" : "pedidos"}. ` +
        (top.length ? `Mais pedido: ${top[0][0]} (${top[0][1]}). ` : "") +
        top.map(([item, qtd]) => `${item}: ${qtd}`).join(" · "),
    );
  };

  return (
    <div className="d-demo">
      <div className="d-grid">
        <section aria-labelledby="d-whats">
          <h3 id="d-whats">1. Chega no WhatsApp</h3>
          <p className="d-muted">{proximo ? `“${mensagemDoPedido(proximo)}”` : "Sem pedidos novos."}</p>
          <button type="button" className="c-button" onClick={() => { setLinhas((n) => Math.min(n + 1, PEDIDOS.length)); setResumo(null); }} disabled={!proximo}>
            Chegou um pedido
          </button>
        </section>
        <section aria-labelledby="d-planilha">
          <h3 id="d-planilha">2. Vira linha na planilha, sozinho</h3>
          <div className="d-table-wrap">
            <table className="d-table">
              <caption className="sr-only">Planilha de pedidos (dados fictícios)</caption>
              <thead><tr><th scope="col">#</th><th scope="col">Cliente</th><th scope="col">Itens</th></tr></thead>
              <tbody>
                {feitos.length === 0 && <tr><td colSpan={3}>Vazia por enquanto.</td></tr>}
                {feitos.map((p, i) => (
                  <tr key={p.cliente}><td>{i + 1}</td><td>{p.cliente}</td><td>{Object.entries(p.itens).map(([item, qtd]) => `${qtd}× ${item}`).join(", ")}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="sr-only" aria-live="polite">{feitos.length ? `${feitos.length} pedidos na planilha` : ""}</p>
        </section>
        <section aria-labelledby="d-resumo">
          <h3 id="d-resumo">3. No fim do dia, o resumo chega pronto</h3>
          <button type="button" className="c-button c-button-ghost" onClick={fecharDia}>Fechar o dia</button>
          <p className="d-result" aria-live="polite">{resumo ?? ""}</p>
        </section>
      </div>
    </div>
  );
}

/* ─────────── sistema: estoque com acesso diferente por pessoa ─────────── */

type Produto = { nome: string; qtd: number; minimo: number };
const ESTOQUE: Produto[] = [
  { nome: "Pão de hambúrguer", qtd: 40, minimo: 20 },
  { nome: "Queijo (fatias)", qtd: 22, minimo: 30 },
  { nome: "Batata congelada (kg)", qtd: 8, minimo: 5 },
];

export function SistemaDemo() {
  const [papel, setPapel] = useState<"dono" | "equipe">("equipe");
  const [itens, setItens] = useState(ESTOQUE);
  const [aviso, setAviso] = useState("");
  const dono = papel === "dono";

  const mudar = (nome: string, delta: number) => {
    setItens((lista) => lista.map((p) => (p.nome === nome ? { ...p, qtd: Math.max(0, p.qtd + delta) } : p)));
    setAviso(`${nome}: ${delta > 0 ? "entrada" : "saída"} registrada.`);
  };
  const baixos = itens.filter((p) => p.qtd < p.minimo);

  return (
    <div className="d-demo">
      <fieldset className="d-roles">
        <legend>Entrar como</legend>
        {(["equipe", "dono"] as const).map((p) => (
          <label key={p} className="o-option">
            <input type="radio" name="papel" value={p} checked={papel === p} onChange={() => { setPapel(p); setAviso(""); }} />
            <span><strong>{p === "dono" ? "Dono" : "Equipe"}</strong><small>{p === "dono" ? "vê tudo e recebe os alertas" : "só registra entrada e saída"}</small></span>
          </label>
        ))}
      </fieldset>
      <div className="d-table-wrap">
        <table className="d-table">
          <caption className="sr-only">Estoque (dados fictícios)</caption>
          <thead>
            <tr><th scope="col">Produto</th><th scope="col">Quantidade</th>{dono && <th scope="col">Mínimo</th>}<th scope="col">Registrar</th></tr>
          </thead>
          <tbody>
            {itens.map((p) => (
              <tr key={p.nome} data-baixo={dono && p.qtd < p.minimo ? "true" : undefined}>
                <td>{p.nome}</td>
                <td>{p.qtd}</td>
                {dono && <td>{p.minimo}</td>}
                <td className="d-row-actions">
                  <button type="button" onClick={() => mudar(p.nome, -1)} aria-label={`Saída de 1: ${p.nome}`}>−1</button>
                  <button type="button" onClick={() => mudar(p.nome, 5)} aria-label={`Entrada de 5: ${p.nome}`}>+5</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="d-result" aria-live="polite">{aviso}</p>
      {dono ? (
        <div className="d-alert" role="status">
          {baixos.length ? `Atenção: ${baixos.map((p) => p.nome).join(", ")} abaixo do mínimo.` : "Tudo acima do mínimo."}
        </div>
      ) : (
        <p className="d-muted">A equipe não vê o estoque mínimo nem os alertas: isso é do dono. Troque para “Dono” para ver.</p>
      )}
    </div>
  );
}
