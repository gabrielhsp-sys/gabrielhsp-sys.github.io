// Os cinco serviços, numa linguagem de quem tem um negócio. Fonte do texto:
// docs/design/unificacao-2026-11/PLANO.md, seção 3, com as decisões de
// 2026-11-19 (sem preço, bot só no Telegram, "eu"). O que o plano não trouxe
// é rascunho e está listado em "Textos para o Gabriel revisar" no relatório.

export const servicoSlugs = ["sites", "aplicativos", "bots", "automacoes", "sistemas"] as const;
export type ServicoSlug = (typeof servicoSlugs)[number];

export type Servico = {
  slug: ServicoSlug;
  /** Nome curto, para menu e lista. */
  nome: string;
  /** O serviço no singular, com artigo, para frases ("um site", "uma automação"). */
  um: string;
  /** Uma linha: o que resolve. */
  resumo: string;
  /** H1 da página do serviço. */
  titulo: string;
  /** O que resolve para o negócio, em 1–2 frases. */
  resolve: string;
  /** Situações reais em que ele ajuda. */
  situacoes: string[];
  /** O que a pessoa recebe. */
  recebe: string[];
  /** Rótulo e destino do exemplo. */
  exemplo: { rotulo: string; href: string };
  /** Valor da primeira pergunta do /orcamento/ que este serviço preenche. */
  orcamento: string;
};

export const servicos: Servico[] = [
  {
    slug: "sites",
    um: "um site",
    nome: "Sites",
    resumo: "Para o cliente achar você, ver o que você vende e chamar no WhatsApp.",
    titulo: "Um site para o cliente achar você e chamar no WhatsApp.",
    resolve:
      "O site mostra o que você vende, o horário e o endereço. Com um toque, o cliente abre o WhatsApp com a mensagem pronta para você.",
    situacoes: [
      "Site de uma página só, com tudo o que importa.",
      "Site com algumas páginas: serviços, equipe, contato.",
      "Catálogo: o cliente monta o pedido no site e fecha pelo WhatsApp.",
    ],
    recebe: [
      "O site no ar, funcionando bem no celular.",
      "Um endereço próprio, como seunegocio.com.br, se você quiser.",
      "Botão de WhatsApp em todas as páginas, com a mensagem já escrita.",
    ],
    exemplo: { rotulo: "Ver sites de exemplo", href: "/exemplos/sites/" },
    orcamento: "site",
  },
  {
    slug: "aplicativos",
    um: "um aplicativo",
    nome: "Aplicativos",
    resumo: "Agenda, pedidos, controle de pagamentos: do jeito que o seu negócio funciona.",
    titulo: "Um aplicativo do jeito que o seu negócio funciona.",
    resolve:
      "Agenda de horários, pedidos, cadastro de clientes, controle de quem pagou: você me diz o que precisa e eu faço o aplicativo para isso.",
    situacoes: [
      "Seus clientes marcam horário sem precisar te ligar.",
      "Sua equipe registra pedidos e todo mundo vê na hora.",
      "As contas de um grupo ficam certas, sem planilha e sem discussão.",
    ],
    recebe: [
      "Um aplicativo que abre no celular, com as telas que o seu dia a dia pede.",
      "Antes de começar, eu te explico se ele vai pela loja de aplicativos ou pelo navegador, e o porquê.",
      "Ajuda para colocar em uso com você e com a sua equipe.",
    ],
    exemplo: { rotulo: "Ver o aplicativo de exemplo", href: "/exemplos/aplicativos/" },
    orcamento: "aplicativo",
  },
  {
    slug: "bots",
    um: "um bot no Telegram",
    nome: "Bots no Telegram",
    resumo: "Avisam, respondem e lembram, mesmo quando você não está olhando.",
    titulo: "Um bot no Telegram que trabalha enquanto você cuida do resto.",
    resolve:
      "Ele avisa quando chega um pedido, responde as perguntas de sempre, manda lembrete para a sua equipe ou vigia algo na internet e só te chama quando importa.",
    situacoes: [
      "Avisar a cozinha quando entra um pedido novo.",
      "Responder horário, endereço e preço sem você parar o que está fazendo.",
      "Ficar de olho numa promoção ou num preço e te chamar só quando aparecer.",
    ],
    recebe: [
      "O bot funcionando no Telegram, no seu grupo ou conversando com quem você quiser.",
      "Um jeito simples de ligar, desligar e mudar o que ele faz.",
      "Ele rodando sozinho, sem depender do seu computador ligado.",
    ],
    exemplo: { rotulo: "Ver o bot funcionando", href: "/exemplos/bots/" },
    orcamento: "robo",
  },
  {
    slug: "automacoes",
    um: "uma automação",
    nome: "Automações",
    resumo: "Aquela planilha ou relatório que toma sua tarde passa a se fazer sozinho.",
    titulo: "A tarefa repetitiva que toma o seu tempo passa a se fazer sozinha.",
    resolve:
      "Copiar pedidos para uma planilha, montar o relatório do fim do dia, conferir o estoque, mandar a mesma mensagem toda semana. Se você faz igual toda vez, dá para automatizar.",
    situacoes: [
      "Os pedidos do dia viram uma planilha organizada, sem digitar nada.",
      "O resumo do caixa chega pronto no fim do expediente.",
      "O aviso de estoque baixo sai antes de faltar o produto.",
    ],
    recebe: [
      "A tarefa rodando sozinha, no horário certo.",
      "Um aviso quando algo der errado, em vez de um erro escondido.",
      "Uma explicação curta de como ela funciona e como pausar.",
    ],
    exemplo: { rotulo: "Ver a demonstração", href: "/exemplos/automacoes/" },
    orcamento: "automacao",
  },
  {
    slug: "sistemas",
    um: "um sistema",
    nome: "Sistemas",
    resumo: "Um lugar só para controlar clientes, pedidos, estoque ou agenda.",
    titulo: "Um lugar só para controlar o seu negócio.",
    resolve:
      "Clientes, pedidos, estoque, agenda ou alunos, num sistema feito para o seu jeito de trabalhar, com acesso separado para você e para a sua equipe.",
    situacoes: [
      "Parar de procurar informação em caderno, planilha e conversa ao mesmo tempo.",
      "Cada pessoa da equipe vê e mexe só no que é dela.",
      "Saber na hora o que entrou, o que saiu e o que está faltando.",
    ],
    recebe: [
      "O sistema no ar, acessado pelo navegador do computador ou do celular.",
      "Login para cada pessoa, com o que cada uma pode fazer.",
      "Os seus dados guardados com cópia de segurança.",
    ],
    exemplo: { rotulo: "Ver a demonstração", href: "/exemplos/sistemas/" },
    orcamento: "sistema",
  },
];

export const servicoPorSlug = (slug: string) => servicos.find((s) => s.slug === slug);
