document.addEventListener('DOMContentLoaded', function() {
    // --- Hint Modal Logic ---
    const hintIcon = document.getElementById('hint-icon');
    const hintModal = document.getElementById('hint-modal');
    const hintModalClose = document.getElementById('hint-close');

    if (hintIcon && hintModal && hintModalClose) {
        let hintTimeout = null;
        const openHintModal = () => {
            hintModal.classList.add('active');
            hintModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            hintModalClose.style.display = 'none'; // Hide close button
            hintModal.focus();
            // Prevent manual close
            const blockClose = e => e.stopPropagation();
            hintModalClose.addEventListener('click', blockClose);
            hintModalClose.addEventListener('keydown', blockClose);
            hintModal.addEventListener('click', blockClose);
            document.addEventListener('keydown', blockClose, true);
            // Auto close after 3.4s
            hintTimeout = setTimeout(() => {
                closeHintModal();
                // Cleanup
                hintModalClose.removeEventListener('click', blockClose);
                hintModalClose.removeEventListener('keydown', blockClose);
                hintModal.removeEventListener('click', blockClose);
                document.removeEventListener('keydown', blockClose, true);
            }, 3400);
        };
        const closeHintModal = () => {
            hintModal.classList.remove('active');
            hintModal.style.display = 'none';
            document.body.style.overflow = '';
            hintModalClose.style.display = '';
            hintIcon.focus();
            if (hintTimeout) clearTimeout(hintTimeout);
        };
        hintIcon.addEventListener('click', openHintModal);
        hintIcon.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openHintModal();
            }
        });
    }


    // --- Secret Unlock for Fun & Interactive Section (Konami Code + Easter Eggs + Puzzle) ---
    const unlockProgress = document.getElementById('unlock-progress');
    const unlockToast = document.getElementById('unlock-toast');
    const logo = document.querySelector('.logo');

    // --- Global HARI sequence redirect to Find the Light ---
    const HARI_SECRET = 'hari';
    let hariBuffer = '';
    document.addEventListener('keydown', function(e) {
        // Ignore if typing in input or textarea
        const tag = document.activeElement && document.activeElement.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement.isContentEditable) return;
        if (e.key.length === 1) {
            hariBuffer += e.key.toLowerCase();
            if (hariBuffer.length > HARI_SECRET.length) hariBuffer = hariBuffer.slice(-HARI_SECRET.length);
            if (hariBuffer === HARI_SECRET) {
                window.location.href = 'find-the-light.html';
            }
        }
    });

    const konamiCode = [
        'ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight'
    ];
    let konamiIndex = 0;
    let logoClicks = 0;
    let unlockActive = false;

    const unlockSounds = {
        correct: new Audio('/sounds/correct.mp3'),
        wrong: new Audio('/sounds/wrong.mp3'),
        unlock: new Audio('/sounds/unlock.mp3')
    };

    function renderProgress(idx, error) {
        if (!unlockProgress) return;
        unlockProgress.innerHTML = '';
        for (let i = 0; i < konamiCode.length; i++) {
            const dot = document.createElement('div');
            dot.className = 'unlock-dot' + (i < idx ? ' active' : '') + (error && i === idx ? ' wrong' : '');
            unlockProgress.appendChild(dot);
        }
        unlockProgress.style.display = 'flex';
    }
    
    function showToast(msg) {
        if (!unlockToast) return;
        unlockToast.textContent = msg;
        unlockToast.classList.add('show');
        setTimeout(() => unlockToast.classList.remove('show'), 3200);
    }

    function curtainReveal(callback) {
        const curtain = document.createElement('div');
        curtain.style.position = 'fixed';
        curtain.style.left = 0;
        curtain.style.top = 0;
        curtain.style.width = '100vw';
        curtain.style.height = '100vh';
        curtain.style.background = 'linear-gradient(90deg, #111 50%, #222 100%)';
        curtain.style.zIndex = 9998;
        curtain.style.transition = 'opacity 1.5s';
        curtain.style.opacity = 1;
        document.body.appendChild(curtain);
        setTimeout(() => { curtain.style.opacity = 0; }, 900);
        setTimeout(() => {
            curtain.remove();
            if (callback) callback();
        }, 1800);
    }

    const unlockFunSection = () => {
        if (unlockActive) return;
        unlockActive = true;

        showToast('Secret Unlocked!');
        confetti();
        try {
            unlockSounds.unlock.play().catch(e => console.warn("Sound play failed", e));
        } catch (e) {
            console.warn("Could not play unlock sound:", e);
        }
        localStorage.setItem('funUnlocked', 'true');
        curtainReveal(() => {
            window.location.href = 'fun.html';
        });
    };

    if (logo) {
        renderProgress(0);
        document.addEventListener('keydown', function(e) {
            if (unlockActive) return;
            if (e.key === konamiCode[konamiIndex]) {
                konamiIndex++;
                unlockSounds.correct.play().catch(e => console.warn("Sound play failed", e));
                renderProgress(konamiIndex);
                if (konamiIndex === konamiCode.length) {
                    unlockFunSection();
                    konamiIndex = 0;
                    renderProgress(0);
                }
            } else {
                if (konamiIndex > 0) {
                    unlockSounds.wrong.play().catch(e => console.warn("Sound play failed", e));
                    renderProgress(konamiIndex, true);
                    if (unlockProgress) {
                        unlockProgress.classList.add('shake');
                        setTimeout(() => unlockProgress.classList.remove('shake'), 500);
                    }
                }
                konamiIndex = 0;
                renderProgress(0);
            }
        });

        logo.addEventListener('click', function() {
            if (unlockActive) return;
            logoClicks++;
            if (logoClicks >= 5) {
                unlockFunSection();
                logoClicks = 0;
            } else {
                showToast(`Logo clicked ${logoClicks}/5 times!`);
            }
            setTimeout(() => { logoClicks = 0; }, 3500);
        });
    } // <<< THIS BRACE WAS MISSING
    
    // --- Initialize Animate on Scroll ---
    AOS.init({
        duration: 1000,
        once: true,
        offset: 100,
    });

    // --- Sticky Navbar & Active Link Highlighting ---
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('nav ul li a');
    const sections = Array.from(navLinks).map(link => {
        const a = document.querySelector(link.getAttribute('href'))
        if (a) {
            return a
        }
    }).filter(a => a);

    const handleScroll = () => {
        // Sticky Navbar
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active Link Highlighting
        let currentSectionIndex = sections.length - 1;
        while (currentSectionIndex >= 0 && window.scrollY + 100 < sections[currentSectionIndex].offsetTop) {
            currentSectionIndex--;
        }
        navLinks.forEach((link, index) => {
            link.classList.toggle('active', index === currentSectionIndex);
        });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    // --- Smooth Scroll for Anchor Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // --- Typewriter Effect ---
    function typeWriter(element, text, i = 0, callback) {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            setTimeout(() => typeWriter(element, text, i + 1, callback), 70);
        } else if (callback) {
            setTimeout(callback, 500); // Delay before starting next animation
        }
    }
    const heroTitle = document.getElementById('hero-title');
    const heroSubtitle = document.getElementById('hero-subtitle');
    
    // Only run typewriter effect if hero elements exist (on main page)
    if (heroTitle && heroSubtitle) {
        const titleText = "Shreehari Ballakkuraya";
        const subtitleText = "Building intelligent solutions with data and code.";
        heroTitle.textContent = '';
        heroSubtitle.textContent = '';
        typeWriter(heroTitle, titleText, 0, () => {
            typeWriter(heroSubtitle, subtitleText, 0);
        });
    }


    // --- Dark/Light Theme Toggle ---
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const isLightTheme = () => localStorage.getItem('theme') === 'light';

    const applyTheme = () => {
        body.classList.toggle('light-theme', isLightTheme());
        themeToggle.innerHTML = isLightTheme() ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    };

    themeToggle.addEventListener('click', () => {
        localStorage.setItem('theme', isLightTheme() ? 'dark' : 'light');
        applyTheme();
    });
    applyTheme(); // Set theme on load


    // --- Stat Counter Animation ---
    const statsContainer = document.querySelector('.stats-container');
    const statsObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            const stats = document.querySelectorAll('.stat-number');
            stats.forEach(stat => {
                const target = +stat.dataset.target;
                let current = 0;
                const updateCounter = () => {
                    const increment = Math.ceil(target / 100);
                    current += increment;
                    if (current < target) {
                        stat.innerText = current;
                        requestAnimationFrame(updateCounter);
                    } else {
                        stat.innerText = target;
                    }
                };
                updateCounter();
            });
            statsObserver.unobserve(statsContainer); // Animate only once
        }
    }, { threshold: 0.5 });

    if (statsContainer) {
        statsObserver.observe(statsContainer);
    }


    // --- Modal Logic ---
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.setAttribute('role', 'button');
        card.tabIndex = 0;
        const openModal = () => {
            const modalId = card.dataset.modalTarget;
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent background scrolling
            }
        };
        card.addEventListener('click', openModal);
        card.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openModal();
            }
        });
    });

    const closeModal = (modal) => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    document.querySelectorAll('.modal').forEach(modal => {
        modal.querySelector('.close-button').addEventListener('click', () => closeModal(modal));
        modal.addEventListener('click', (event) => {
            if (event.target === modal) { // Click on overlay
                closeModal(modal);
            }
        });
    });

    // Close modal with Escape key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(closeModal);
        }
    });

    // --- Contact Form (Formspree) ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const status = document.getElementById('form-status');
            const data = new FormData(contactForm);

            status.textContent = 'Sending...';
            status.className = '';

            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: data,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    status.textContent = 'Thanks for your message!';
                    status.className = 'success';
                    contactForm.reset();
                } else {
                    const resData = await response.json();
                    status.textContent = resData.errors ? resData.errors.map(err => err.message).join(', ') : 'Oops! There was a problem.';
                    status.className = 'error';
                }
            } catch (error) {
                status.textContent = 'Network error. Please try again.';
                status.className = 'error';
            }
        });
    }
    // --- Particles.js Config ---
    if (typeof particlesJS !== 'undefined') {
        particlesJS("particles-js", { "particles": { "number": { "value": 60, "density": { "enable": true, "value_area": 800 } }, "color": { "value": "#ffffff" }, "shape": { "type": "circle" }, "opacity": { "value": 0.5, "random": true }, "size": { "value": 3, "random": true }, "line_linked": { "enable": true, "distance": 150, "color": "#ffffff", "opacity": 0.4, "width": 1 }, "move": { "enable": true, "speed": 2, "direction": "none", "out_mode": "out" } }, "interactivity": { "detect_on": "canvas", "events": { "onhover": { "enable": true, "mode": "grab" }, "onclick": { "enable": true, "mode": "push" } }, "modes": { "grab": { "distance": 140, "line_linked": { "opacity": 1 } }, "push": { "particles_nb": 4 } } }, "retina_detect": true });
    }
    
    function confetti() {
        for (let i = 0; i < 80; i++) {
            const c = document.createElement('div');
            c.style.position = 'fixed';
            c.style.left = (Math.random() * 100) + 'vw';
            c.style.top = '-2em';
            c.style.width = c.style.height = (Math.random() * 8 + 4) + 'px';
            c.style.background = `hsl(${Math.random()*360},90%,60%)`;
            c.style.borderRadius = '50%';
            c.style.zIndex = 9999;
            c.style.opacity = 0.7;
            c.style.transition = 'top 2.5s cubic-bezier(.4,2,.6,1)';
            document.body.appendChild(c);
            setTimeout(() => { c.style.top = '110vh'; }, 10);
            setTimeout(() => { c.remove(); }, 2600);
        }
    }
    window.confetti = confetti;
});