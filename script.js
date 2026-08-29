/* ═══════════════════════════════════════════════════════════════
   Portfólio — Gabriel Henrique Silva Pereira
   Comportamento: boot, navegação, modais, terminal e jogo.
   ═══════════════════════════════════════════════════════════════ */

(function () {
'use strict';

var $  = function (s, c) { return (c || document).querySelector(s); };
var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
var semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var EMAIL = 'gabrielhspereira36@gmail.com';

/* memória tolerante a falha (sandbox, modo anônimo, etc.) */
var mem = {
  ler:   function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
  gravar:function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
};

/* ═══════════ SOM ═══════════ */
var som = { ligado: false, ctx: null };
som.iniciar = function () {
  if (!som.ctx) {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (AC) { try { som.ctx = new AC(); } catch (e) { som.ctx = null; } }
  }
  if (som.ctx && som.ctx.state === 'suspended') som.ctx.resume();
};
som.bip = function (freq, dur, tipo, vol) {
  if (!som.ligado || !som.ctx) return;
  try {
    var o = som.ctx.createOscillator(), g = som.ctx.createGain(), t = som.ctx.currentTime;
    o.type = tipo || 'square';
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol || 0.05, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (dur || 0.06));
    o.connect(g); g.connect(som.ctx.destination);
    o.start(t); o.stop(t + (dur || 0.06) + 0.02);
  } catch (e) {}
};
som.tecla = function () { som.bip(1100 + Math.random() * 260, 0.028, 'square', 0.028); };
som.ok    = function () { som.bip(880, 0.07); setTimeout(function () { som.bip(1320, 0.09); }, 70); };
som.erro  = function () { som.bip(180, 0.16, 'sawtooth', 0.05); };

var btSom = $('#bt-som');
function ajustaSom(lig) {
  som.ligado = lig;
  btSom.setAttribute('aria-pressed', lig ? 'true' : 'false');
  btSom.setAttribute('aria-label', lig ? 'Desligar som' : 'Ligar som');
  $('#onda1').style.opacity = lig ? '1' : '.25';
  $('#onda2').style.opacity = lig ? '1' : '.25';
  mem.gravar('som', lig ? '1' : '0');
  if (lig) { som.iniciar(); som.ok(); }
}
ajustaSom(mem.ler('som') === '1');
btSom.addEventListener('click', function () { ajustaSom(!som.ligado); });

/* ═══════════ CRT ═══════════ */
var btCrt = $('#bt-crt');
function ajustaCrt(lig) {
  document.documentElement.setAttribute('data-crt', lig ? 'on' : 'off');
  btCrt.setAttribute('aria-pressed', lig ? 'true' : 'false');
  btCrt.setAttribute('aria-label', lig ? 'Desligar efeito de tela antiga' : 'Ligar efeito de tela antiga');
  mem.gravar('crt', lig ? '1' : '0');
}
ajustaCrt(mem.ler('crt') !== '0');
btCrt.addEventListener('click', function () { ajustaCrt(document.documentElement.getAttribute('data-crt') !== 'on'); som.tecla(); });

/* ═══════════ BOOT ═══════════ */
(function boot() {
  var caixa = $('#boot'), tela = $('#boot-tela'), pular = $('#boot-pular');
  var jaViu = mem.ler('booted') === '1';
  var timers = [];

  function encerra(rapido) {
    timers.forEach(clearTimeout);
    if (rapido) { caixa.remove(); document.body.classList.remove('travado'); return; }
    caixa.classList.add('saindo');
    setTimeout(function () { caixa.remove(); }, 520);
    document.body.classList.remove('travado');
  }

  if (jaViu || semMovimento) { encerra(true); return; }

  document.body.classList.add('travado');

  var linhas = [
    ['GHSP BIOS  v3.2', 'b', 60],
    ['Memória ................ 640K  <s class="ok">OK</s>', '', 300],
    ['Teclado ................ <s class="ok">OK</s>', '', 160],
    ['Café ................... <s class="er">CRÍTICO</s>', '', 190],
    ['&nbsp;', '', 120],
    ['Detectando dispositivos:', '', 200],
    ['  hda ... C · C++ · Java · JavaScript · Prolog', '', 170],
    ['  hdb ... homelab debian (docker · tailscale)', '', 170],
    ['  hdc ... unifal-mg / ciência da computação', '', 170],
    ['&nbsp;', '', 130],
    ['Montando /home/gabriel ... <s class="ok">ok</s>', '', 240],
    ['Iniciando portfolio.sh', '', 260]
  ];

  var i = 0;
  function proxima() {
    if (i >= linhas.length) { timers.push(setTimeout(function () { encerra(false); }, 340)); return; }
    var l = linhas[i++];
    var el = document.createElement('div');
    el.className = 'boot-linha';
    el.innerHTML = l[0].replace(/<s /g, '<span ').replace(/<\/s>/g, '</span>');
    if (l[1] === 'b') el.innerHTML = '<b>' + l[0] + '</b>';
    tela.appendChild(el);
    if (l[0]) som.bip(520 + i * 24, 0.022, 'square', 0.022);
    timers.push(setTimeout(proxima, l[2]));
  }
  proxima();

  pular.addEventListener('click', function () { encerra(false); });
  document.addEventListener('keydown', function esc(e) {
    if (e.key === 'Escape') { encerra(false); document.removeEventListener('keydown', esc); }
  });
  mem.gravar('booted', '1');
})();

/* ═══════════ CABEÇALHO / SCROLL ═══════════ */
var cabecalho = $('#cabecalho'), barra = $('#progresso');
function aoRolar() {
  var y = window.scrollY;
  cabecalho.classList.toggle('grudado', y > 10);
  var h = document.documentElement.scrollHeight - window.innerHeight;
  barra.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
}
window.addEventListener('scroll', aoRolar, { passive: true });
aoRolar();

/* menu mobile */
var hamb = $('#hamb');
function menu(abrir) {
  var v = abrir === undefined ? !document.body.classList.contains('menu-aberto') : abrir;
  document.body.classList.toggle('menu-aberto', v);
  hamb.setAttribute('aria-expanded', v ? 'true' : 'false');
  hamb.setAttribute('aria-label', v ? 'Fechar menu' : 'Abrir menu');
}
hamb.addEventListener('click', function () { menu(); som.tecla(); });
$$('#menu a').forEach(function (a) { a.addEventListener('click', function () { menu(false); }); });

/* item ativo */
var secoes = $$('main section[id]'), links = $$('#menu a');
if ('IntersectionObserver' in window) {
  var obsNav = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      links.forEach(function (l) { l.classList.toggle('aqui', l.getAttribute('href') === '#' + e.target.id); });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  secoes.forEach(function (s) { obsNav.observe(s); });

  var obsSurge = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('ok'); obsSurge.unobserve(e.target); } });
  }, { threshold: 0.1 });
  $$('.surge').forEach(function (el) { obsSurge.observe(el); });
} else {
  $$('.surge').forEach(function (el) { el.classList.add('ok'); });
}

/* ═══════════ MODAIS ═══════════ */
var ultimoFoco = null;
function abreModal(id) {
  var m = document.getElementById(id);
  if (!m) return;
  ultimoFoco = document.activeElement;
  m.classList.add('aberto');
  document.body.classList.add('travado');
  var f = $('.fechar', m); if (f) f.focus();
  som.bip(660, 0.05);
}
function fechaModal(m) {
  m.classList.remove('aberto');
  if (!$('.modal.aberto')) document.body.classList.remove('travado');
  if (ultimoFoco) ultimoFoco.focus();
}
$$('[data-modal]').forEach(function (c) {
  var id = c.getAttribute('data-modal');
  c.addEventListener('click', function () { abreModal(id); });
  c.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abreModal(id); }
  });
});
$$('.modal').forEach(function (m) {
  $('.fechar', m).addEventListener('click', function () { fechaModal(m); });
  m.addEventListener('click', function (e) { if (e.target === m) fechaModal(m); });
});

/* ═══════════ COPIAR E-MAIL ═══════════ */
$('#bt-email').addEventListener('click', function () {
  var alvo = $('#email-btn');
  function feito() {
    alvo.classList.add('mostra');
    som.ok();
    setTimeout(function () { alvo.classList.remove('mostra'); }, 1800);
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(EMAIL).then(feito, function () { window.location.href = 'mailto:' + EMAIL; });
  } else { window.location.href = 'mailto:' + EMAIL; }
});

/* ═══════════════════════════════════════════
   TERMINAL
   ═══════════════════════════════════════════ */
var term    = $('#term');
var saida   = $('#term-saida');
var entrada = $('#term-in');
var chips   = $('#term-chips');
var historico = [], hPos = -1;
var jogoAtivo = false;

function seguro(t) {
  return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function escreve(html, cls) {
  var d = document.createElement('div');
  d.className = 'l' + (cls ? ' ' + cls : '');
  d.innerHTML = html;
  saida.appendChild(d);
  saida.scrollTop = saida.scrollHeight;
  return d;
}
function linhas(arr, cls) { arr.forEach(function (l) { escreve(l, cls); }); }
function vazio() { escreve('&nbsp;'); }

var CHIPS_PADRAO = ['ajuda', 'sobre', 'stack', 'projetos', 'contato', 'cv', 'snake'];
function montaChips(lista) {
  chips.innerHTML = '';
  lista.forEach(function (c) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'chip'; b.textContent = c;
    b.addEventListener('click', function () {
      if (jogoAtivo && '↑↓←→'.indexOf(c) > -1) { jogo.vira(c); return; }
      executa(c); entrada.focus();
    });
    chips.appendChild(b);
  });
}
montaChips(CHIPS_PADRAO);

function abreTerm(foco) {
  term.classList.add('aberto');
  term.setAttribute('aria-hidden', 'false');
  if (foco !== false && window.innerWidth > 640) entrada.focus();
  som.bip(740, 0.05);
  if (!saida.children.length) boasVindas();
}
function fechaTerm() {
  term.classList.remove('aberto');
  term.setAttribute('aria-hidden', 'true');
  if (jogoAtivo) jogo.fim(true);
  som.bip(420, 0.05);
}
function alternaTerm() { term.classList.contains('aberto') ? fechaTerm() : abreTerm(); }

$('#abre-term').addEventListener('click', function () { abreTerm(); });
$('#dica-term').addEventListener('click', function () { abreTerm(); });
$('#term-fechar').addEventListener('click', fechaTerm);

function boasVindas() {
  escreve('<span class="am">gabriel.sys</span> — terminal do portfólio', 'be');
  escreve('Tudo que está no site também está aqui, em texto.', 'esc');
  vazio();
  escreve('Digite <span class="am">ajuda</span> para ver os comandos. <span class="esc">Ou toque num atalho abaixo.</span>');
  vazio();
}

/* ═══ comandos ═══ */
var COMANDOS = {};

COMANDOS.ajuda = { d: 'lista os comandos', f: function () {
  var pares = [
    ['sobre',    'quem eu sou, versão curta'],
    ['stack',    'linguagens e ferramentas'],
    ['trajeto',  'formação e o que vem depois'],
    ['projetos', 'os cinco projetos'],
    ['abrir N',  'abre os detalhes do projeto N'],
    ['cv',       'resumo em uma tela'],
    ['contato',  'e-mail, github, linkedin'],
    ['ir X',     'rola até a seção X'],
    ['tema X',   'ambar · verde · mono'],
    ['som',      'liga ou desliga os bipes'],
    ['limpar',   'limpa a tela'],
    ['sair',     'fecha o terminal']
  ];
  pares.forEach(function (p) {
    escreve('  <span class="am">' + p[0] + '</span>' + '&nbsp;'.repeat(Math.max(1, 11 - p[0].length)) + '<span class="esc">' + p[1] + '</span>');
  });
  vazio();
  escreve('<span class="esc">Tem coisa que não está nessa lista. Tente adivinhar.</span>');
}};

COMANDOS.sobre = { d: 'sobre mim', f: function () {
  linhas([
    'Gabriel Henrique Silva Pereira',
    '<span class="esc">Ciência da Computação · UNIFAL-MG · Minas Gerais, BR</span>',
    '&nbsp;',
    'Comecei mexendo no registro do Windows pra deixar o PC de casa',
    'mais rápido. Quebrei tudo, consertei, e descobri que gosto mais',
    'de abrir a máquina do que de usar ela.',
    '&nbsp;',
    'Hoje transito entre <span class="am">C/C++</span> (memória na mão) e',
    '<span class="am">Java</span> (testes, padrões, CI/CD), com um homelab Linux',
    'no meio pra quebrar as coisas primeiro.'
  ]);
}};

COMANDOS.stack = { d: 'tecnologias', f: function () {
  var g = [
    ['linguagens', 'C · C++ · Java · JavaScript · Prolog · SQL'],
    ['web',        'HTML5 · CSS3 · JS puro · Supabase · PWA · Netlify'],
    ['qualidade',  'JUnit 5 · Mockito · JaCoCo · GRASP · Maven · UML'],
    ['infra',      'Linux/Debian · Docker · Tailscale · Git · GitHub Actions']
  ];
  g.forEach(function (x) {
    escreve('<span class="am">' + x[0] + '</span>');
    escreve('  ' + x[1]);
    vazio();
  });
}};

COMANDOS.trajeto = { d: 'formação', f: function () {
  linhas([
    '<span class="am">agora</span>        Graduando em Ciência da Computação, UNIFAL-MG',
    '<span class="am">em paralelo</span>  Projetos próprios: Java com CI/CD, PWA, homelab',
    '<span class="am">próximo</span>      Primeiro estágio — back-end, sistemas ou infra'
  ]);
}};

var PROJETOS = [
  ['Academic System',      'm-java',    'Java · JavaFX · JUnit 5 · CI/CD'],
  ['Homelab Self-Hosted',  'm-homelab', 'Debian · Docker · Tailscale'],
  ['Reset — App de Treino','m-reset',   'JavaScript · Supabase · PWA'],
  ['Base de dados em C++', 'm-aeds',    'C++ · Estruturas de dados'],
  ['Ordenação em Prolog',  'm-prolog',  'Prolog · Recursão']
];

COMANDOS.projetos = { d: 'lista os projetos', f: function () {
  PROJETOS.forEach(function (p, i) {
    escreve('<span class="am">' + (i + 1) + '.</span> ' + p[0]);
    escreve('   <span class="esc">' + p[2] + '</span>');
  });
  vazio();
  escreve('<span class="esc">Use</span> <span class="am">abrir 1</span> <span class="esc">para ler os detalhes.</span>');
}};

COMANDOS.abrir = { d: 'abre um projeto', f: function (arg) {
  var n = parseInt(arg, 10);
  if (!n || n < 1 || n > PROJETOS.length) {
    escreve('Use <span class="am">abrir 1</span> até <span class="am">abrir ' + PROJETOS.length + '</span>.', 'ro');
    som.erro(); return;
  }
  escreve('Abrindo <span class="am">' + seguro(PROJETOS[n - 1][0]) + '</span>...', 'mi');
  setTimeout(function () { abreModal(PROJETOS[n - 1][1]); }, 220);
}};

COMANDOS.cv = { d: 'resumo', f: function () {
  linhas([
    '<span class="be">GABRIEL HENRIQUE SILVA PEREIRA</span>',
    '<span class="esc">Ciência da Computação · UNIFAL-MG · Minas Gerais, BR</span>',
    '&nbsp;',
    '<span class="am">FORMAÇÃO</span>',
    '  Bacharelado em Ciência da Computação — UNIFAL-MG (em curso)',
    '&nbsp;',
    '<span class="am">TÉCNICO</span>',
    '  Linguagens  C, C++, Java, JavaScript, Prolog, SQL',
    '  Qualidade   JUnit 5, Mockito, JaCoCo, padrões de projeto, UML',
    '  Infra       Linux/Debian, Docker, Tailscale, GitHub Actions',
    '  Web         HTML, CSS, JS puro, Supabase, PWA',
    '&nbsp;',
    '<span class="am">DESTAQUES</span>',
    '  · Sistema Java em camadas com RBAC, 13 classes de teste e 4 pipelines',
    '  · Homelab Debian com serviços em Docker, acesso via Tailscale sob CGNAT',
    '  · PWA de treino com backend Supabase em produção',
    '&nbsp;',
    '<span class="am">CONTATO</span>',
    '  ' + EMAIL,
    '  github.com/gabriel-bcc · linkedin.com/in/gabrielhsp-dev'
  ]);
}};

COMANDOS.contato = { d: 'como falar comigo', f: function () {
  escreve('e-mail    <a href="mailto:' + EMAIL + '">' + EMAIL + '</a>');
  escreve('github    <a href="https://github.com/gabriel-bcc" target="_blank" rel="noopener">github.com/gabriel-bcc</a>');
  escreve('linkedin  <a href="https://www.linkedin.com/in/gabrielhsp-dev/" target="_blank" rel="noopener">linkedin.com/in/gabrielhsp-dev</a>');
  vazio();
  escreve('<span class="esc">Estou procurando estágio. Respondo rápido.</span>');
}};

COMANDOS.ir = { d: 'vai até uma seção', f: function (arg) {
  var mapa = { sobre:'sobre', stack:'stack', trajeto:'trajeto', projetos:'projetos', contato:'contato', topo:'topo', inicio:'topo' };
  var alvo = mapa[(arg || '').toLowerCase()];
  if (!alvo) { escreve('Seções: sobre · stack · trajeto · projetos · contato', 'ro'); som.erro(); return; }
  var el = document.getElementById(alvo);
  if (el) { el.scrollIntoView({ behavior: semMovimento ? 'auto' : 'smooth' }); escreve('→ ' + alvo, 'mi'); }
}};

COMANDOS.tema = { d: 'muda a cor do fósforo', f: function (arg) {
  var t = (arg || '').toLowerCase();
  if (['verde', 'mono'].indexOf(t) > -1) { document.documentElement.setAttribute('data-tema', t); }
  else if (t === 'ambar' || t === 'âmbar' || t === '') { document.documentElement.removeAttribute('data-tema'); }
  else { escreve('Temas: ambar · verde · mono', 'ro'); som.erro(); return; }
  escreve('Fósforo trocado para <span class="am">' + (t || 'ambar') + '</span>.', 'mi');
  som.ok();
}};

COMANDOS.som = { d: 'liga/desliga o som', f: function () {
  ajustaSom(!som.ligado);
  escreve('Som ' + (som.ligado ? '<span class="mi">ligado</span>' : '<span class="esc">desligado</span>') + '.');
}};

COMANDOS.limpar = { d: 'limpa a tela', f: function () { saida.innerHTML = ''; } };
COMANDOS.clear  = COMANDOS.limpar;
COMANDOS.sair   = { d: 'fecha o terminal', f: function () { fechaTerm(); } };
COMANDOS.exit   = COMANDOS.sair;

COMANDOS.whoami = { d: '', f: function () {
  escreve('visitante');
  escreve('<span class="esc">(mas eu sou o gabriel, prazer)</span>');
}};

COMANDOS.neofetch = { d: '', f: function () {
  linhas([
    '<span class="am">gabriel</span>@<span class="am">homelab</span>',
    '<span class="esc">─────────────────────────</span>',
    '<span class="am">curso</span>: Ciência da Computação',
    '<span class="am">host</span>:  UNIFAL-MG',
    '<span class="am">os</span>:    Debian 12',
    '<span class="am">shell</span>: bash, com muito Ctrl+R',
    '<span class="am">langs</span>: C · C++ · Java · JS · Prolog',
    '<span class="am">infra</span>: Docker · Tailscale · 0 portas abertas',
    '<span class="am">local</span>: Minas Gerais, BR'
  ]);
}};

/* ═══ easter eggs ═══ */
COMANDOS.sudo = { oculto: true, f: function (arg) {
  if ((arg || '').indexOf('rm') === 0) {
    escreve('Boa tentativa.', 'ro');
    escreve('<span class="esc">Faço backup no homelab justamente por causa de gente como você.</span>');
    som.erro(); return;
  }
  escreve('gabriel não está no arquivo sudoers.', 'ro');
  escreve('<span class="esc">Este incidente será reportado. (para mim mesmo, no meu servidor)</span>');
  som.erro();
}};

COMANDOS.vim = { oculto: true, f: function () {
  escreve('Vim aberto.', 'mi');
  escreve('<span class="esc">Agora se vira pra sair. Dica: não é Ctrl+C.</span>');
  setTimeout(function () { escreve('<span class="esc">(:q! — de nada)</span>'); }, 2600);
}};

COMANDOS.hack = { oculto: true, f: function () {
  var passos = [
    ['Acessando o mainframe...', 'mi', 350],
    ['Contornando o firewall .............. <span class="mi">ok</span>', '', 420],
    ['Descriptografando o kernel .......... <span class="mi">ok</span>', '', 380],
    ['Roteando por 7 proxies .............. <span class="mi">ok</span>', '', 400],
    ['Localizando alvo .................... <span class="mi">ok</span>', '', 380],
    ['&nbsp;', '', 200],
    ['ACESSO CONCEDIDO', 'am', 300],
    ['&nbsp;', '', 150],
    ['<span class="esc">Você invadiu um site estático hospedado no GitHub Pages.</span>', '', 260],
    ['<span class="esc">Aqui não tem banco de dados. Aqui não tem nada. Parabéns.</span>', '', 0]
  ];
  var i = 0;
  (function passo() {
    if (i >= passos.length) return;
    var p = passos[i++];
    escreve(p[0], p[1]);
    som.bip(300 + i * 60, 0.04);
    setTimeout(passo, p[2]);
  })();
}};

COMANDOS.eggs = { oculto: true, f: function () {
  escreve('Três coisas escondidas neste site:', 'am');
  escreve('  1. um comando que finge que você é hacker');
  escreve('  2. um editor de texto que ninguém sabe fechar');
  escreve('  3. uma sequência de teclas de 1986');
  vazio();
  escreve('<span class="esc">E um jogo. Digite</span> <span class="am">snake</span><span class="esc">.</span>');
}};

/* ═══ SNAKE ═══ */
var jogo = {
  L: 24, A: 12, cobra: [], dir: null, prox: null, fruta: null, pontos: 0, tick: null, el: null,
  comeca: function () {
    if (jogoAtivo) return;
    jogoAtivo = true;
    jogo.cobra = [{ x: 6, y: 6 }, { x: 5, y: 6 }, { x: 4, y: 6 }];
    jogo.dir = { x: 1, y: 0 }; jogo.prox = jogo.dir; jogo.pontos = 0;
    jogo.solta();
    escreve('<span class="esc">Setas ou WASD. Q para desistir.</span>');
    jogo.el = document.createElement('pre');
    jogo.el.className = 'jogo';
    saida.appendChild(jogo.el);
    saida.scrollTop = saida.scrollHeight;
    montaChips(['↑', '←', '↓', '→', 'q']);
    jogo.desenha();
    jogo.tick = setInterval(jogo.passo, 145);
  },
  solta: function () {
    var livre = false, p;
    while (!livre) {
      p = { x: Math.floor(Math.random() * jogo.L), y: Math.floor(Math.random() * jogo.A) };
      livre = !jogo.cobra.some(function (c) { return c.x === p.x && c.y === p.y; });
    }
    jogo.fruta = p;
  },
  vira: function (t) {
    var m = { '↑': { x: 0, y: -1 }, '↓': { x: 0, y: 1 }, '←': { x: -1, y: 0 }, '→': { x: 1, y: 0 } };
    var d = m[t]; if (!d) return;
    if (d.x === -jogo.dir.x && d.y === -jogo.dir.y) return;
    jogo.prox = d;
  },
  passo: function () {
    jogo.dir = jogo.prox;
    var c = jogo.cobra[0], n = { x: c.x + jogo.dir.x, y: c.y + jogo.dir.y };
    if (n.x < 0 || n.y < 0 || n.x >= jogo.L || n.y >= jogo.A ||
        jogo.cobra.some(function (s) { return s.x === n.x && s.y === n.y; })) { jogo.fim(); return; }
    jogo.cobra.unshift(n);
    if (n.x === jogo.fruta.x && n.y === jogo.fruta.y) {
      jogo.pontos += 10; jogo.solta(); som.bip(880, 0.05);
    } else { jogo.cobra.pop(); }
    jogo.desenha();
  },
  desenha: function () {
    var g = [], y, x;
    for (y = 0; y < jogo.A; y++) { g[y] = []; for (x = 0; x < jogo.L; x++) g[y][x] = '<span class="pt">·</span>'; }
    g[jogo.fruta.y][jogo.fruta.x] = '<span class="fr">◆</span>';
    jogo.cobra.forEach(function (s, i) { g[s.y][s.x] = '<span class="co">' + (i === 0 ? '█' : '▓') + '</span>'; });
    jogo.el.innerHTML = '<span class="placar">pontos: ' + jogo.pontos + '</span>' +
      g.map(function (l) { return l.join(''); }).join('\n');
    saida.scrollTop = saida.scrollHeight;
  },
  fim: function (silencioso) {
    clearInterval(jogo.tick); jogoAtivo = false;
    montaChips(CHIPS_PADRAO);
    if (silencioso) return;
    som.erro();
    escreve('&nbsp;');
    escreve('fim de jogo — <span class="am">' + jogo.pontos + ' pontos</span>');
    escreve('<span class="esc">Digite</span> <span class="am">snake</span> <span class="esc">pra tentar de novo.</span>');
  }
};
COMANDOS.snake = { oculto: true, f: jogo.comeca };
COMANDOS.jogo  = COMANDOS.snake;

/* ═══ interpretador ═══ */
function executa(bruto) {
  var txt = (bruto || '').trim();
  escreve('<span class="eco">gabriel@homelab:~$</span> ' + seguro(txt));
  if (!txt) return;
  historico.unshift(txt); hPos = -1;

  var partes = txt.split(/\s+/);
  var nome = partes[0].toLowerCase().replace(/^\.\//, '');
  var arg = partes.slice(1).join(' ');
  var cmd = COMANDOS[nome];

  if (cmd) { som.tecla(); cmd.f(arg); }
  else {
    som.erro();
    escreve('comando não encontrado: <span class="ro">' + seguro(nome) + '</span>');
    var chutes = { ls:'projetos', cat:'sobre', pwd:'ir', help:'ajuda', man:'ajuda', cd:'ir', git:'contato',
                   about:'sobre', projects:'projetos', contact:'contato', email:'contato', curriculo:'cv',
                   currículo:'cv', resume:'cv', quem:'sobre' };
    if (chutes[nome]) escreve('<span class="esc">Você quis dizer</span> <span class="am">' + chutes[nome] + '</span><span class="esc">?</span>');
    else escreve('<span class="esc">Digite</span> <span class="am">ajuda</span><span class="esc">.</span>');
  }
  vazio();
}

$('#term-form').addEventListener('submit', function (e) {
  e.preventDefault();
  var v = entrada.value;
  entrada.value = '';
  executa(v);
});

entrada.addEventListener('keydown', function (e) {
  if (e.key === 'ArrowUp' && !jogoAtivo) {
    e.preventDefault();
    if (hPos < historico.length - 1) { hPos++; entrada.value = historico[hPos]; }
  } else if (e.key === 'ArrowDown' && !jogoAtivo) {
    e.preventDefault();
    if (hPos > 0) { hPos--; entrada.value = historico[hPos]; }
    else { hPos = -1; entrada.value = ''; }
  } else if (e.key === 'Tab') {
    e.preventDefault();
    var p = entrada.value.trim().toLowerCase();
    if (!p) return;
    var achou = Object.keys(COMANDOS).filter(function (k) { return k.indexOf(p) === 0 && !COMANDOS[k].oculto; });
    if (achou.length === 1) entrada.value = achou[0] + ' ';
  } else if (e.key.length === 1) { som.tecla(); }
});

/* ═══ teclado global ═══ */
document.addEventListener('keydown', function (e) {
  var digitando = /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName);

  if (jogoAtivo) {
    var m = { ArrowUp:'↑', ArrowDown:'↓', ArrowLeft:'←', ArrowRight:'→',
              w:'↑', s:'↓', a:'←', d:'→', W:'↑', S:'↓', A:'←', D:'→' };
    if (m[e.key]) { e.preventDefault(); jogo.vira(m[e.key]); return; }
    if (e.key === 'q' || e.key === 'Q') { e.preventDefault(); jogo.fim(); return; }
  }

  var abreConsole = e.key === '~' || e.code === 'Backquote' ||
                    (e.key === 'Dead' && !digitando); /* ~ é tecla morta no ABNT2 */
  if (abreConsole && !e.ctrlKey && !e.metaKey && !e.altKey) {
    if (digitando && document.activeElement !== entrada) return;
    e.preventDefault(); alternaTerm(); return;
  }

  if (e.key === 'Escape') {
    var mAberto = $('.modal.aberto');
    if (mAberto) { fechaModal(mAberto); return; }
    if (term.classList.contains('aberto')) { fechaTerm(); return; }
    if (document.body.classList.contains('menu-aberto')) menu(false);
  }
});

$('#dica-egg').addEventListener('click', function (e) {
  e.preventDefault();
  abreTerm();
  setTimeout(function () { executa('eggs'); }, 260);
});

/* ═══ konami ═══ */
(function () {
  var seq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  var i = 0, ligado = false;
  document.addEventListener('keydown', function (e) {
    if (jogoAtivo) return;
    var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    i = (k === seq[i]) ? i + 1 : (k === seq[0] ? 1 : 0);
    if (i !== seq.length) return;
    i = 0; ligado = !ligado;
    document.documentElement.setAttribute('data-arcade', ligado ? 'on' : 'off');
    if (ligado) {
      faisca(40);
      som.iniciar();
      [523, 659, 784, 1047].forEach(function (f, n) { setTimeout(function () { som.bip(f, 0.1); }, n * 90); });
      abreTerm(false);
      escreve('&nbsp;');
      escreve('▲▲▼▼◀▶◀▶BA — <span class="am">MODO ARCADE LIGADO</span>');
      escreve('<span class="esc">Você tem 30 vidas extras. Não vai precisar de nenhuma.</span>');
      escreve('<span class="esc">Repita a sequência pra desligar.</span>');
      vazio();
    }
  });
  function faisca(n) {
    var cores = ['#FFB43B', '#FF4D7E', '#7EE787', '#D9C9A3'];
    for (var j = 0; j < n; j++) {
      (function (j) {
        var s = document.createElement('i');
        s.className = 'faisca';
        s.style.background = cores[j % cores.length];
        s.style.left = (Math.random() * 100) + 'vw';
        s.style.top = '-10px';
        document.body.appendChild(s);
        var dur = 1200 + Math.random() * 1400;
        var dx = (Math.random() - 0.5) * 260;
        if (s.animate) {
          s.animate([{ transform: 'translate(0,0)' }, { transform: 'translate(' + dx + 'px,' + (window.innerHeight + 40) + 'px)' }],
                    { duration: dur, easing: 'linear' });
        }
        setTimeout(function () { s.remove(); }, dur);
      })(j);
    }
  }
})();

})();
