// Curva do "Sobre": opacidade da primeira frase com o topo dela a 100%, 95%,
// 90%, 80%, 70%, 60% e 50% da tela, e da imagem com o fim da bancada a 100%,
// 90%, 80%, 65%, 50%, 40% e 30%. Corpo de funcao async, usado por
// firefox-sistema.mjs e webkitgtk.py.
const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
const p = document.querySelector(".bench-about-lines p");
const stage = document.querySelector(".bench-stage"), bench = document.querySelector(".bench");
const line = []; for (const f of [1, .95, .9, .8, .7, .6, .5]) { const top = p.getBoundingClientRect().top + scrollY - parseFloat(getComputedStyle(p).transform.split(",")[5] || 0); scrollTo({ top: top - innerHeight * f, behavior: "instant" }); await frame(); line.push((+getComputedStyle(p).opacity).toFixed(2)); }
const img = []; for (const f of [1, .9, .8, .65, .5, .4, .3]) { const end = bench.getBoundingClientRect().bottom + scrollY; scrollTo({ top: end - innerHeight * f, behavior: "instant" }); await frame(); img.push((+getComputedStyle(stage).opacity).toFixed(2)); }
return { fallback: bench.hasAttribute("data-scroll-fallback"), line, img };
