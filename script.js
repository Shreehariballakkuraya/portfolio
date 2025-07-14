document.addEventListener('DOMContentLoaded', function() {

    // --- Smooth Scroll for Anchor Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href').slice(1);
            const target = document.getElementById(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                target.tabIndex = -1; // for focus highlight
                target.focus({ preventScroll: true });
            }
        });
    });

    // --- Active Navbar Link Highlight ---
    const navLinks = document.querySelectorAll('nav ul li a');
    const sections = Array.from(navLinks).map(link => document.querySelector(link.getAttribute('href')));
    function setActiveLink() {
        let index = sections.length - 1;
        for (let i = 0; i < sections.length; i++) {
            if (window.scrollY + 100 < sections[i].offsetTop) {
                index = i - 1;
                break;
            }
        }
        navLinks.forEach((link, i) => {
            if (i === index) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    window.addEventListener('scroll', setActiveLink);
    setActiveLink();

    // --- Keyboard Accessibility for Project Cards ---
    document.querySelectorAll('.project-card').forEach(card => {
        card.tabIndex = 0;
        card.setAttribute('role', 'button');
        card.setAttribute('aria-pressed', 'false');
        card.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                card.click();
            }
        });
    });

    // --- Modal Accessibility (close on Esc, focus trap) ---
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                modal.classList.remove('active');
            }
        });
    });


    // --- Dark/Light Theme Toggle ---
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    // Load theme from localStorage
    if (localStorage.getItem('theme') === 'light') {
        body.classList.add('light-theme');
        themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('light-theme');
        const isLight = body.classList.contains('light-theme');
        themeToggle.innerHTML = isLight ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });

    // --- Contact Form (Formspree) ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const status = document.getElementById('form-status');
            status.textContent = '';
            status.className = '';
            const data = new FormData(contactForm);
            // Simple validation
            if (!data.get('name') || !data.get('email') || !data.get('message')) {
                status.textContent = 'Please fill in all fields.';
                status.className = 'error';
                return;
            }
            status.textContent = 'Sending...';
            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: data,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                if (response.ok) {
                    status.textContent = 'Thanks for your message!';
                    status.className = 'success';
                    contactForm.reset();
                } else {
                    const resData = await response.json();
                    status.textContent = resData.errors ? resData.errors.map(e => e.message).join(', ') : 'Oops! Something went wrong.';
                    status.className = 'error';
                }
            } catch (error) {
                status.textContent = 'Network error. Please try again.';
                status.className = 'error';
            }
        });
    }


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
