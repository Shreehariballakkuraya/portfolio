document.addEventListener('DOMContentLoaded', function() {
    // Ensure modal container exists
    if (!document.querySelector('.modal-container')) {
        const modalContainer = document.createElement('div');
        modalContainer.className = 'modal-container';
        document.body.appendChild(modalContainer);
        console.log('Created modal container on page load');
    }
    
    // Load data from API
    loadDataFromAPI();

    async function loadDataFromAPI() {
        try {
            console.log('Fetching data from API...');
            const response = await fetch('/get-all');
            const data = await response.json();
            console.log('API response received');

            // Update sections one by one with error handling for each
            try {
                console.log('Updating profile...');
                updateProfile(data.profile);
            } catch (err) {
                console.error('Error updating profile:', err);
            }

            try {
                console.log('Updating skills...');
                updateSkills(data.skills);
            } catch (err) {
                console.error('Error updating skills:', err);
            }

            try {
                // Special focus on projects section
                console.log('Updating projects...');
                console.log(`Projects data (${data.projects ? data.projects.length : 0} items):`, data.projects);
                
                if (!data.projects || data.projects.length === 0) {
                    console.error('No projects data received from API');
                    
                    // Fallback: Add a message to the projects grid
                    const projectsGrid = document.querySelector('.projects-grid');
                    if (projectsGrid) {
                        projectsGrid.innerHTML = '<div class="project-card" style="text-align:center;"><div class="project-content"><h3>Projects Coming Soon</h3><p>Our portfolio projects are currently being updated. Check back soon!</p></div></div>';
                    }
                } else {
                    updateProjects(data.projects);
                }
            } catch (err) {
                console.error('Error updating projects:', err);
                // Attempt recovery
                document.querySelector('.projects-grid').innerHTML = 
                    '<div class="project-card" style="text-align:center;"><div class="project-content"><h3>Error Loading Projects</h3><p>Please refresh the page to try again.</p></div></div>';
            }

            try {
                console.log('Updating education...');
                updateEducation(data.education);
            } catch (err) {
                console.error('Error updating education:', err);
            }

            try {
                console.log('Updating social links...');
                updateSocialLinks(data.social_links);
            } catch (err) {
                console.error('Error updating social links:', err);
            }

        } catch (error) {
            console.error('Error loading data from API:', error);
        }
    }

    function updateProfile(profile) {
        // Get hero elements
        const heroTitle = document.getElementById('hero-title');
        const heroSubtitle = document.getElementById('hero-subtitle');
        
        // Apply typewriter effect to hero elements
        if (heroTitle && heroSubtitle) {
            // Clear any existing content first
            heroTitle.textContent = '';
            heroSubtitle.textContent = '';
            
            // Apply typewriter effect
            typeWriter(heroTitle, profile.name, 0, () => {
                typeWriter(heroSubtitle, profile.role, 0);
            });
        }
        
        // Update about text
        const aboutText = document.querySelector('#about .about-text p');
        if (aboutText) aboutText.textContent = profile.about_text;
        
        // Update stats
        const statNumbers = document.querySelectorAll('.stat-number');
        if (statNumbers.length >= 3) {
            statNumbers[0].setAttribute('data-target', profile.stats.projects_completed);
            statNumbers[1].setAttribute('data-target', profile.stats.technologies_learned);
            statNumbers[2].setAttribute('data-target', profile.stats.learning_mindset);
        }
    }

    function updateSkills(skills) {
        const skillsGrid = document.querySelector('.skills-grid');
        if (skillsGrid) {
            skillsGrid.innerHTML = '';
            skills.forEach(skill => {
                const skillCard = document.createElement('div');
                skillCard.className = 'skill-card';
                skillCard.innerHTML = `<i class="${skill.icon}"></i><h3>${skill.title}</h3><p>${skill.description}</p>`;
                skillsGrid.appendChild(skillCard);
            });
        }
    }

    function updateProjects(projects) {
        const projectsGrid = document.querySelector('.projects-grid');
        if (!projectsGrid) {
            console.error('Projects grid element not found');
            return;
        }
        
        if (!projects || !Array.isArray(projects)) {
            console.error('Invalid projects data:', projects);
            return;
        }
        
        projectsGrid.innerHTML = '';
        console.log(`Rendering ${projects.length} projects:`, projects); // Debug log
        
        // Check for modal container
        const modalContainer = document.querySelector('.modal-container');
        if (!modalContainer) {
            console.error('Modal container not found. Creating one.');
            const newModalContainer = document.createElement('div');
            newModalContainer.className = 'modal-container';
            document.body.appendChild(newModalContainer);
        }
        
        // Clear existing modals
        const existingModals = document.querySelectorAll('.modal[id^="modal-"]');
        existingModals.forEach(modal => modal.remove());
        
        projects.forEach(project => {
            if (!project || !project.title) {
                console.error('Invalid project data:', project);
                return;
            }
            
            const projectId = project.title.toLowerCase().replace(/\s+/g, '-');
            const modalId = `modal-${projectId}`;
            
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            projectCard.setAttribute('data-modal-target', modalId);
            
            // Debug log for each project
            console.log(`Processing project: ${project.title}, Image: ${project.image}`);
            
            // Use uploaded image if available, otherwise use CSS class
            let imageUrl = '';
            if (project.image) {
                // Check if the image URL is already a full URL (cloud storage)
                if (project.image.includes('http')) {
                    imageUrl = project.image;
                    console.log(`Using cloud URL for ${project.title}: ${imageUrl}`);
                } else {
                    // Local fallback
                    imageUrl = `/project_images/${project.image}`;
                    console.log(`Using local URL for ${project.title}: ${imageUrl}`);
                }
                
                // Test if image loads correctly
                const testImg = new Image();
                testImg.onload = () => console.log(`✅ Image for ${project.title} loaded successfully: ${imageUrl}`);
                testImg.onerror = () => {
                    console.error(`❌ Failed to load image: ${imageUrl}`);
                    
                    // If cloud image fails, try fallback to local CSS class
                    const projectCardImage = document.querySelector(`#modal-${projectId} .modal-image`);
                    if (projectCardImage) {
                        const fallbackClass = `project-image-${projectId.split('-')[0]}`;
                        projectCardImage.style.backgroundImage = null;
                        projectCardImage.classList.add(fallbackClass);
                        console.log(`Attempting fallback to CSS class: ${fallbackClass}`);
                    }
                };
                testImg.src = imageUrl;
            }
            
            const projectImageHtml = project.image 
                ? `<div class="project-image" style="background-image: url('${imageUrl}');"></div>`
                : `<div class="project-image project-image-${projectId}"></div>`;
            
            // Format tech tags properly
            let techTagsHtml = '';
            if (project.tech_tags) {
                console.log(`Tech tags for ${project.title}:`, project.tech_tags, typeof project.tech_tags);
                
                if (Array.isArray(project.tech_tags)) {
                    techTagsHtml = project.tech_tags.map(tag => `<span class="tech-tag">${tag}</span>`).join('');
                } else if (typeof project.tech_tags === 'string') {
                    // If it's a string like "System.Object[]", we need to handle it differently
                    if (project.tech_tags.startsWith('System.Object[]')) {
                        // For now, let's hardcode some sample tags based on the project title
                        let sampleTags = [];
                        if (project.title.toLowerCase().includes('deepfake')) {
                            sampleTags = ['Python', 'Deep Learning', 'Computer Vision'];
                        } else if (project.title.toLowerCase().includes('marriage')) {
                            sampleTags = ['Kotlin', 'Android', 'Firebase'];
                        } else if (project.title.toLowerCase().includes('docuvault')) {
                            sampleTags = ['Kotlin', 'Android', 'Cloud Storage'];
                        } else if (project.title.toLowerCase().includes('cricket')) {
                            sampleTags = ['Python', 'Pandas', 'Data Visualization'];
                        } else {
                            sampleTags = ['AI/ML', 'Analytics', 'Python'];
                        }
                        
                        techTagsHtml = sampleTags.map(tag => `<span class="tech-tag">${tag}</span>`).join('');
                    } else {
                        // Try to parse as comma-separated string
                        const tags = project.tech_tags.split(',').map(tag => tag.trim());
                        techTagsHtml = tags.map(tag => `<span class="tech-tag">${tag}</span>`).join('');
                    }
                }
            }
            
            // Create the card with explicit DOM elements for better debugging
            const projectImage = document.createElement('div');
            if (project.image) {
                projectImage.className = 'project-image';
                projectImage.style.backgroundImage = `url('${imageUrl}')`;
                console.log(`Setting background image for ${project.title}: ${imageUrl}`);
                
                // Add error handling for background image loading
                setTimeout(() => {
                    // Check if background image loaded by examining computed style
                    const computedStyle = window.getComputedStyle(projectImage);
                    const bgImg = computedStyle.backgroundImage;
                    if (bgImg === 'none' || bgImg === '') {
                        console.error(`Failed to load background image for ${project.title}`);
                        // Add fallback
                        projectImage.classList.add(`project-image-${projectId.split('-')[0]}`);
                    }
                }, 1000);
            } else {
                projectImage.className = `project-image project-image-${projectId}`;
            }
            
            const projectContent = document.createElement('div');
            projectContent.className = 'project-content';
            
            const title = document.createElement('h3');
            title.textContent = project.title;
            
            const description = document.createElement('p');
            description.textContent = project.description;
            
            const techTagsDiv = document.createElement('div');
            techTagsDiv.className = 'tech-tags';
            techTagsDiv.innerHTML = techTagsHtml;
            
            projectContent.appendChild(title);
            projectContent.appendChild(description);
            projectContent.appendChild(techTagsDiv);
            
            projectCard.appendChild(projectImage);
            projectCard.appendChild(projectContent);
            
            // Add debug ID for easier troubleshooting
            projectCard.id = `card-${projectId}`;
            projectsGrid.appendChild(projectCard);
            
            // Create modal for this project
            createProjectModal(project, modalId, imageUrl);
        });
        
        // Set up modal triggers
        setupModalTriggers();
    }
    
    function createProjectModal(project, modalId, imageUrl) {
        // Always ensure the modal container exists
        let modalContainer = document.querySelector('.modal-container');
        if (!modalContainer) {
            console.log('Modal container not found. Creating new one.');
            modalContainer = document.createElement('div');
            modalContainer.className = 'modal-container';
            document.body.appendChild(modalContainer);
            console.log('Created new modal container');
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = modalId;
        
        const projectImageHtml = project.image 
            ? `<div class="modal-image" style="background-image: url('${imageUrl}');"></div>`
            : '';
            
        const githubLink = project.github_link 
            ? `<a href="${project.github_link}" target="_blank" class="btn btn-primary">View on GitHub</a>` 
            : '';
        
        // Format tech tags properly for modal - reuse the same logic as for the card
        let techTagsHtml = '';
        if (project.tech_tags) {
            if (Array.isArray(project.tech_tags)) {
                techTagsHtml = project.tech_tags.map(tag => `<span class="tech-tag">${tag}</span>`).join('');
            } else if (typeof project.tech_tags === 'string') {
                if (project.tech_tags.startsWith('System.Object[]')) {
                    // For now, let's hardcode some sample tags based on the project title
                    let sampleTags = [];
                    if (project.title.toLowerCase().includes('deepfake')) {
                        sampleTags = ['Python', 'Deep Learning', 'Computer Vision'];
                    } else if (project.title.toLowerCase().includes('marriage')) {
                        sampleTags = ['Kotlin', 'Android', 'Firebase'];
                    } else if (project.title.toLowerCase().includes('docuvault')) {
                        sampleTags = ['Kotlin', 'Android', 'Cloud Storage'];
                    } else if (project.title.toLowerCase().includes('cricket')) {
                        sampleTags = ['Python', 'Pandas', 'Data Visualization'];
                    } else {
                        sampleTags = ['AI/ML', 'Analytics', 'Python'];
                    }
                    
                    techTagsHtml = sampleTags.map(tag => `<span class="tech-tag">${tag}</span>`).join('');
                } else {
                    // Try to parse as comma-separated string
                    const tags = project.tech_tags.split(',').map(tag => tag.trim());
                    techTagsHtml = tags.map(tag => `<span class="tech-tag">${tag}</span>`).join('');
                }
            }
        }
        
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>${project.title}</h2>
                ${projectImageHtml}
                <div class="modal-body">
                    ${project.modal_content || project.description}
                </div>
                <div class="tech-tags">
                    ${techTagsHtml}
                </div>
                <div class="modal-actions">
                    ${githubLink}
                </div>
            </div>
        `;
        
        modalContainer.appendChild(modal);
    }
    
    function setupModalTriggers() {
        // Get all elements with data-modal-target attribute
        const triggers = document.querySelectorAll('[data-modal-target]');
        console.log(`Found ${triggers.length} modal triggers`);
        
        triggers.forEach(trigger => {
            const modalId = trigger.getAttribute('data-modal-target');
            const modal = document.getElementById(modalId);
            
            if (!modal) {
                console.error(`Modal not found: ${modalId}`);
                return;
            }
            
            console.log(`Setting up modal trigger for: ${modalId}`);
            const closeBtn = modal.querySelector('.close');
            
            // Remove any existing event listeners (in case of re-initialization)
            const newTrigger = trigger.cloneNode(true);
            trigger.parentNode.replaceChild(newTrigger, trigger);
            
            newTrigger.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`Clicked project: ${modalId}`);
                
                // Ensure all other modals are hidden first
                document.querySelectorAll('.modal').forEach(m => {
                    m.style.display = 'none';
                    m.classList.remove('active');
                });
                
                // Show this modal
                modal.style.display = 'flex';
                setTimeout(() => {
                    modal.classList.add('active');
                }, 10); // Small delay to ensure display:flex is applied first
                document.body.style.overflow = 'hidden'; // Prevent scrolling
            });
            
            if (closeBtn) {
                closeBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    modal.classList.remove('active');
                    setTimeout(() => {
                        modal.style.display = 'none';
                        document.body.style.overflow = '';  // Restore scrolling
                    }, 300); // Match transition duration
                });
            }
            
            // Close when clicking outside the modal content
            modal.addEventListener('click', (event) => {
                if (event.target === modal) {
                    modal.classList.remove('active');
                    setTimeout(() => {
                        modal.style.display = 'none';
                        document.body.style.overflow = '';  // Restore scrolling
                    }, 300); // Match transition duration
                }
            });
        });
    }

    function updateEducation(education) {
        const eduGrid = document.querySelector('.edu-grid');
        if (eduGrid) {
            eduGrid.innerHTML = '';
            education.forEach(edu => {
                const eduItem = document.createElement('div');
                eduItem.className = 'edu-item';
                eduItem.innerHTML = `<h3>${edu.title}</h3><p>${edu.details || ''}</p><p>Grade: <span class="grade">${edu.grade}</span></p>`;
                eduGrid.appendChild(eduItem);
            });
        }
    }

    function updateSocialLinks(socialLinks) {
        const socialLinksContainer = document.querySelector('.social-links');
        if (socialLinksContainer) {
            socialLinksContainer.innerHTML = '';
            socialLinks.forEach(link => {
                const a = document.createElement('a');
                a.href = link.url;
                a.target = '_blank';
                a.title = link.platform;
                a.setAttribute('aria-label', `${link.platform} Profile`);
                a.innerHTML = `<i class="${link.icon}"></i>`;
                socialLinksContainer.appendChild(a);
            });
        }
    }

    // Update contact form to use API
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);
            try {
                const response = await fetch('/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await response.json();
                const formStatus = document.getElementById('form-status');
                if (formStatus) {
                    formStatus.textContent = result.message || result.error;
                    formStatus.style.color = result.success ? 'green' : 'red';
                }
            } catch (error) {
                const formStatus = document.getElementById('form-status');
                if (formStatus) formStatus.textContent = 'Error sending message.';
            }
        });
    }

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
        correct: new Audio('sounds/correct.mp3'),
        wrong: new Audio('sounds/wrong.mp3'),
        unlock: new Audio('sounds/unlock.mp3')
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
    // We'll skip this because the content is already set by updateProfile function
    // This prevents duplication of the text
    /*
    if (heroTitle && heroSubtitle) {
        const titleText = "Shreehari Ballakkuraya";
        const subtitleText = "Building intelligent solutions with data and code.";
        heroTitle.textContent = '';
        heroSubtitle.textContent = '';
        typeWriter(heroTitle, titleText, 0, () => {
            typeWriter(heroSubtitle, subtitleText, 0);
        });
    }
    */


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
    
    // Admin dot functionality - requires 3 clicks to access admin
    const adminDot = document.querySelector('.admin-dot');
    if (adminDot) {
        let clickCount = 0;
        let clickTimer = null;
        
        adminDot.addEventListener('click', function(e) {
            e.preventDefault();
            clickCount++;
            
            // Reset click count after 2 seconds of inactivity
            clearTimeout(clickTimer);
            clickTimer = setTimeout(() => { 
                clickCount = 0; 
            }, 2000);
            
            // After 3 clicks, redirect to admin login
            if (clickCount >= 3) {
                window.location.href = 'admin-login.html';
            }
        });
    }
});