document.addEventListener('DOMContentLoaded', function() {

    // --- Particles.js Config ---
    particlesJS("particles-js", {"particles":{"number":{"value":60,"density":{"enable":true,"value_area":800}},"color":{"value":"#ffffff"},"shape":{"type":"circle"},"opacity":{"value":0.5,"random":true,"anim":{"enable":false}},"size":{"value":3,"random":true,"anim":{"enable":false}},"line_linked":{"enable":true,"distance":150,"color":"#ffffff","opacity":0.4,"width":1},"move":{"enable":true,"speed":2,"direction":"none","random":false,"straight":false,"out_mode":"out","bounce":false}},"interactivity":{"detect_on":"canvas","events":{"onhover":{"enable":true,"mode":"grab"},"onclick":{"enable":true,"mode":"push"},"resize":true},"modes":{"grab":{"distance":140,"line_linked":{"opacity":1}},"push":{"particles_nb":4}}},"retina_detect":true});

    // --- Sticky Navbar ---
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- Typewriter Effect ---
    function typeWriter(element, text, i, callback) {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            setTimeout(() => typeWriter(element, text, i + 1, callback), 70);
        } else if (callback) {
            callback();
        }
    }
    const heroTitle = document.getElementById('hero-title');
    const heroSubtitle = document.getElementById('hero-subtitle');
    const originalTitle = "Shreehari Ballakkuraya";
    const subtitleText = "Building intelligent solutions with data and code.";
    heroTitle.textContent = '';
    heroSubtitle.textContent = '';
    typeWriter(heroTitle, originalTitle, 0, () => {
        typeWriter(heroSubtitle, subtitleText, 0);
    });

    // --- Scroll Reveal Animation ---
    const reveals = document.querySelectorAll(".reveal");
    function revealElements() {
        for (let i = 0; i < reveals.length; i++) {
            const windowHeight = window.innerHeight;
            const elementTop = reveals[i].getBoundingClientRect().top;
            const elementVisible = 100;
            if (elementTop < windowHeight - elementVisible) {
                reveals[i].classList.add("active");
            }
        }
    }
    window.addEventListener("scroll", revealElements);
    revealElements();

    // --- Stat Counter Animation ---
    const statsSection = document.querySelector('.stats-container');
    let statsAnimated = false;
    function animateStats() {
        const sectionTop = statsSection.getBoundingClientRect().top;
        if (sectionTop < window.innerHeight && !statsAnimated) {
            const stats = document.querySelectorAll('.stat-number');
            stats.forEach(stat => {
                const target = +stat.dataset.target;
                let current = 0;

                const updateCounter = () => {
                    const increment = Math.ceil(target / 100);
                    if (current < target) {
                        current += increment;
                        if (current > target) current = target;
                        stat.innerText = current;
                        requestAnimationFrame(updateCounter);
                    } else {
                        stat.innerText = target;
                    }
                };
                updateCounter();
            });
            statsAnimated = true;
        }
    }
    window.addEventListener('scroll', animateStats);

    // --- Modal Logic ---
    const projectCards = document.querySelectorAll('.project-card');
    const closeButtons = document.querySelectorAll('.close-button');

    projectCards.forEach(card => {
        card.addEventListener('click', () => {
            const modal = document.getElementById(card.dataset.modalTarget);
            if(modal) modal.style.display = 'flex';
        });
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            button.closest('.modal').style.display = 'none';
        });
    });

    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
});
