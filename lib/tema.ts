// Tema claro/escuro das paginas de cliente (pedido de 2026-11-20). Fica fora do
// componente "use client" porque o layout (Server Component) precisa do texto
// do script, e export de modulo cliente chega ao servidor como referencia.

export const TEMA_CHAVE = "gsys:tema";
export type Tema = "light" | "dark";

// Script do <head>: le a escolha (try/catch: storage bloqueado abre no claro),
// marca o <html> e, quando o <body> existir, poe a cor da barra do navegador
// pelo fundo que o CSS calculou (no recrutador, o escuro). Claro por padrao,
// independente do prefers-color-scheme do sistema. O <meta name="theme-color">
// e criado aqui, fora do React: o Next nao declara um (app/layout.tsx), entao a
// hidratacao nao duplica nem desfaz a cor.
export const TEMA_SCRIPT = `(function(){var d=document.documentElement,t="light";try{var s=localStorage.getItem("${TEMA_CHAVE}");if(s==="dark"||s==="light")t=s}catch(e){}d.setAttribute("data-theme",t);document.addEventListener("DOMContentLoaded",${corDaBarraFonte()})})()`;

function corDaBarraFonte() {
  return `function(){var m=document.querySelector('meta[name="theme-color"]');if(!m){m=document.createElement("meta");m.name="theme-color";document.head.appendChild(m)}m.content=getComputedStyle(document.body).backgroundColor}`;
}

/** A mesma acao do script, para o botao chamar depois de trocar o tema. */
export function atualizarCorDaBarra() {
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.appendChild(meta);
  }
  meta.content = getComputedStyle(document.body).backgroundColor;
}
