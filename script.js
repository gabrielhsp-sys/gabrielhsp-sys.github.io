document.addEventListener('DOMContentLoaded', () => {

    // 1. INICIALIZAÇÃO DO PARTICLES.JS
    particlesJS.load('particles-js', 'particles.json', () => {
        console.log('particles.js config loaded');
    });

    // 2. ANIMAÇÃO DE SCROLL NAS SEÇÕES
    const sections = document.querySelectorAll('section');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => {
        observer.observe(section);
    });

    // 3. INDICADOR DE NAVEGAÇÃO ATIVA E SCROLL SUAVE
    const navLinks = document.querySelectorAll('nav a');
    
    // Função para destacar o link ativo
    function highlightNav() {
        let current = 'home'; // Padrão é 'home'
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= sectionTop - 150) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });
    }

    // Executa a função no scroll e no carregamento da página
    window.addEventListener('scroll', highlightNav);
    highlightNav();

    // Adiciona o evento de clique para o scroll suave
    navLinks.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // Verifica se o href é uma âncora na página
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // 4. FUNCIONALIDADE DO MODAL DE PROJETOS
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('click', () => {
            const modalId = card.getAttribute('data-modal-target');
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden'; // Impede o scroll do fundo
            }
        });
    });

    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        const closeButton = modal.querySelector('.close-button');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto'; // Libera o scroll
            });
        }
        // Fecha o modal se clicar fora do conteúdo
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto'; // Libera o scroll
            }
        });
    });
});
