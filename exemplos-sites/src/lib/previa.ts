// Atualiza o balão de prévia (PreviaWhats.astro) dentro de `raiz`. Texto vazio = mensagem guia.
export function atualizarPrevia(raiz: ParentNode, texto: string): void {
  const alvo = raiz.querySelector<HTMLElement>('[data-previa-texto]');
  if (!alvo) return;
  if (texto) {
    alvo.textContent = texto;
    alvo.removeAttribute('data-estado');
  } else {
    alvo.textContent = alvo.dataset.vazio ?? '';
    alvo.setAttribute('data-estado', 'vazio');
  }
}
