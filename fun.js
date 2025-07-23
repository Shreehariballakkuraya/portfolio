console.log('[FUN] Script loaded');

// === DEBUGGING UTILITIES ===
const DEBUG = {
    enabled: !window.RELEASE_BUILD,
    log: function(message, data = null) {
        if (this.enabled) {
            console.log(`[FUN-DEBUG] ${message}`, data || '');
        }
    },
    error: function(message, error = null) {
        console.error(`[FUN-ERROR] ${message}`, error || '');
        if (this.enabled && this.showErrors) {
            this.showErrorToast(message);
        }
    },
    warn: function(message, data = null) {
        if (this.enabled) {
            console.warn(`[FUN-WARN] ${message}`, data || '');
        }
    },
    showErrors: true,
    showErrorToast: function(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4757;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-family: monospace;
            font-size: 14px;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        toast.textContent = `ERROR: ${message}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);
    },
    performance: {
        timers: {},
        start: function(name) {
            DEBUG.performance.timers[name] = performance.now();
            DEBUG.log(`Performance timer started: ${name}`);
        },
        end: function(name) {
            if (DEBUG.performance.timers[name]) {
                const duration = performance.now() - DEBUG.performance.timers[name];
                DEBUG.log(`Performance timer ${name}: ${duration.toFixed(2)}ms`);
                delete DEBUG.performance.timers[name];
                return duration;
            }
        }
    }
};

// Global error handler for debugging
if (DEBUG.enabled) {
    window.addEventListener('error', function(e) {
        DEBUG.error(`Global error: ${e.message}`, {
            filename: e.filename,
            line: e.lineno,
            column: e.colno,
            error: e.error
        });
    });
    
    window.addEventListener('unhandledrejection', function(e) {
        DEBUG.error('Unhandled promise rejection:', e.reason);
    });
}

// Safe element selector with debugging
function safeSelect(selector, context = document) {
    try {
        const element = context.querySelector(selector);
        if (!element) {
            DEBUG.warn(`Element not found: ${selector}`);
        }
        return element;
    } catch (error) {
        DEBUG.error(`Error selecting element: ${selector}`, error);
        return null;
    }
}

// Safe event listener with debugging
function safeAddEventListener(element, event, handler, options = {}) {
    if (!element) {
        DEBUG.warn(`Cannot add event listener: element is null/undefined`);
        return;
    }
    try {
        element.addEventListener(event, function(e) {
            try {
                handler(e);
            } catch (error) {
                DEBUG.error(`Error in event handler for ${event}:`, error);
            }
        }, options);
        DEBUG.log(`Event listener added: ${event}`);
    } catch (error) {
        DEBUG.error(`Failed to add event listener for ${event}:`, error);
    }
}

DEBUG.log('Debugging utilities initialized');

document.addEventListener('DOMContentLoaded', function() {
    DEBUG.log('DOM Content Loaded');
    DEBUG.performance.start('funPageInit');

    // === DEBUG: Level Skip UI (REMOVE BEFORE DEPLOYMENT) ===
    if (!window.RELEASE_BUILD) {
        const dbgDiv = document.createElement('div');
        dbgDiv.style.cssText = 'position:fixed;top:1em;right:1em;z-index:9999;background:#222;padding:1em 1.5em;border-radius:8px;box-shadow:0 2px 8px #0003;color:#fff;font-family:monospace;opacity:0.95';
        dbgDiv.innerHTML = '<b>DEBUG: Skip to Level</b> <input id="dbg-lvl-skip" type="number" min="1" max="14" style="width:3em;"> <button id="dbg-skip-btn">Go</button>';
        document.body.appendChild(dbgDiv);
        dbgDiv.querySelector('#dbg-skip-btn').onclick = function() {
            const lvl = parseInt(dbgDiv.querySelector('#dbg-lvl-skip').value, 10);
            if (lvl >= 1 && lvl <= 14 && typeof window.showLevel === 'function') {
                window.showLevel(lvl);
                if (typeof addFunCountdown === 'function') addFunCountdown(60);
            }
        };
    }
    // === END DEBUG ===


    // --- UNLOCK CHECK ---
    if (localStorage.getItem('funUnlocked') !== 'true') {
        window.location.href = 'index.html';
        return;
    } else {
        localStorage.removeItem('funUnlocked');
    }

    // Multi-question quiz logic
    const quizQuestions = [
        {
            question: 'What is 2 + 2 * 2?',
            options: ['4', '8', '6', '12'],
            correct: 2
        },
        {
            question: 'Which language runs in a web browser?',
            options: ['Python', 'Java', 'C', 'JavaScript'],
            correct: 3
        },
        {
            question: 'What does HTML stand for?',
            options: ['Hyper Trainer Marking Language', 'Hyper Text Markup Language', 'Hyper Text Marketing Language', 'Hyper Text Markup Leveler'],
            correct: 1
        },
        {
            question: 'Which company developed the Android OS?',
            options: ['Apple', 'Google', 'Microsoft', 'IBM'],
            correct: 1
        }
    ];

    function showPuzzle(onQuizComplete) {
        const quizContainer = document.getElementById('quiz-container');
        if (!quizContainer) return;
        quizContainer.innerHTML = '';
        quizContainer.dataset.active = 'true';
        let currentQuestion = 0;
        let score = 0;

        renderQuestion();

        function renderQuestion() {
            quizContainer.innerHTML = '';
            quizContainer.dataset.answered = 'false';
            if (currentQuestion >= quizQuestions.length) {
                // Show completion
                const complete = document.createElement('div');
                complete.className = 'quiz-result';
                complete.innerHTML = `Quiz Complete!<br>Your Score: ${score} / ${quizQuestions.length}`;
                quizContainer.appendChild(complete);
                // Reset for next visit
                setTimeout(() => {
                    quizContainer.dataset.active = 'false';
                    if (typeof onQuizComplete === 'function') onQuizComplete();
                }, 2000);
                return;
            }
            const q = quizQuestions[currentQuestion];
            const qElem = document.createElement('div');
            qElem.className = 'quiz-question';
            qElem.textContent = q.question;
            quizContainer.appendChild(qElem);
            const optionsContainer = document.createElement('div');
            optionsContainer.className = 'quiz-options';
            q.options.forEach((opt, idx) => {
                const btn = document.createElement('button');
                btn.className = 'quiz-option';
                btn.textContent = opt;
                btn.tabIndex = 0;
                btn.setAttribute('aria-label', `Option ${idx + 1}: ${opt}`);
                btn.addEventListener('click', () => handleQuizAnswer(idx));
                btn.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleQuizAnswer(idx);
                    }
                });
                optionsContainer.appendChild(btn);
            });
            quizContainer.appendChild(optionsContainer);
            setTimeout(() => {
                const firstBtn = quizContainer.querySelector('.quiz-option');
                if (firstBtn) firstBtn.focus();
            }, 50);
        }

        function handleQuizAnswer(selectedIdx) {
            if (quizContainer.dataset.answered === 'true') return;
            quizContainer.dataset.answered = 'true';
            const q = quizQuestions[currentQuestion];
            const buttons = quizContainer.querySelectorAll('.quiz-option');
            buttons.forEach((b, i) => {
                b.disabled = true;
                if (i === q.correct) {
                    b.style.background = 'var(--form-status-success)';
                    b.style.color = 'var(--button-text)';
                }
                if (i === selectedIdx && i !== q.correct) {
                    b.style.background = 'var(--form-status-error)';
                    b.style.color = '#fff';
                }
            });
            const result = document.createElement('div');
            result.className = 'quiz-result';
            if (selectedIdx === q.correct) {
                result.textContent = 'Correct! 🎉';
                score++;
            } else {
                result.textContent = 'Wrong answer.';
            }
            quizContainer.appendChild(result);
            setTimeout(() => {
                currentQuestion++;
                renderQuestion();
            }, 1200);
        }
    }

    // --- Fun & Interactive Countdown Timer ---
    let funCountdown = 60; // Set initial time to 60 seconds
    let funCountdownInterval = null;
    
    function startFunCountdown() {
        if (funCountdownInterval) {
            DEBUG.warn('Countdown timer already running, ignoring start request');
            return;
        }
        
        DEBUG.log(`Starting countdown timer with ${funCountdown} seconds`);
        updateFunCountdownDisplay();
        
        funCountdownInterval = setInterval(() => {
            funCountdown--;
            updateFunCountdownDisplay();
            
            // Log countdown milestones
            if (funCountdown % 30 === 0 || funCountdown <= 10) {
                DEBUG.log(`Countdown: ${funCountdown} seconds remaining`);
            }
            
            if (funCountdown <= 0) {
                DEBUG.log('Countdown timer reached zero');
                clearInterval(funCountdownInterval);
                funCountdownInterval = null;
                handleFunTimeUp();
            }
        }, 1000);
    }
    
    function addFunCountdown(seconds) {
        const oldTime = funCountdown;
        funCountdown += seconds;
        DEBUG.log(`Added ${seconds} seconds to countdown (${oldTime} -> ${funCountdown})`);
        updateFunCountdownDisplay();
    }
    
    function updateFunCountdownDisplay() {
        const timerEl = safeSelect('#fun-timer');
        if (timerEl) {
            const mm = String(Math.floor(funCountdown / 60)).padStart(2, '0');
            const ss = String(funCountdown % 60).padStart(2, '0');
            timerEl.textContent = `Time Left: ${mm}:${ss}`;
        } else {
            DEBUG.warn('Timer display element not found');
        }
    }
    function handleFunTimeUp() {
        // Hide all levels and show message
        for (let i = 1; i <= 14; i++) {
            const el = document.getElementById('fun-level'+i);
            if (el) el.style.display = 'none';
        }
        const timerEl = document.getElementById('fun-timer');
        if (timerEl) timerEl.textContent = "Time's up!";
    }

    // --- Fun & Interactive Level Progression ---
    (function funLevels() {
        // Start countdown timer at first level
        let timerStarted = false;
        function ensureTimer() {
            if (!timerStarted) {
                timerStarted = true;
                startFunCountdown();
            }
        }
        ensureTimer();
        // Level containers
        const totalLevels = 14;

        // LEVEL 11: Code Debugging
        function initCodeDebugging() {
            const root = document.getElementById('fun-level11');
            if (!root) return;
            root.innerHTML = '';
            // Instructions
            const instr = document.createElement('div');
            instr.textContent = 'Find and fix the bug in the code below, then submit your fix!';
            instr.style.marginBottom = '1em';
            instr.style.background = '#232946';
            instr.style.color = '#00f5d4';
            instr.style.padding = '0.7em 1em';
            instr.style.borderRadius = '7px';
            instr.style.fontWeight = 'bold';
            root.appendChild(instr);
            // --- Code Debugging Question Pool ---
            const codeDebugQuestions = [
                {
                    description: 'The following function is supposed to return the sum of <b>a</b> and <b>b</b>, but it contains a bug. Fix the bug and submit!',
                    buggyCode: `function add(a, b) {\n    return a - b; // Bug: should be +\n}`,
                    expectedFixed: /return\s+a\s*\+\s*b\s*;/,
                    answer: 'return a + b;'
                },
                {
                    description: 'This function should return the product of <b>x</b> and <b>y</b>. Fix the bug!',
                    buggyCode: `function multiply(x, y) {\n    return x + y; // Bug: should be *\n}`,
                    expectedFixed: /return\s+x\s*\*\s*y\s*;/,
                    answer: 'return x * y;'
                },
                {
                    description: 'The function should return true if <b>n</b> is even. Fix the bug!',
                    buggyCode: `function isEven(n) {\n    return n % 2 === 1; // Bug: should be 0\n}`,
                    expectedFixed: /return\s+n\s*%\s*2\s*===\s*0\s*;/,
                    answer: 'return n % 2 === 0;'
                },
                {
                    description: 'This function is supposed to return the first character of <b>str</b>. Fix the bug!',
                    buggyCode: `function firstChar(str) {\n    return str[str.length-1]; // Bug: should be 0\n}`,
                    expectedFixed: /return\s+str\[0\];/,
                    answer: 'return str[0];'
                },
                {
                    description: 'The function should return the array length. Fix the bug!',
                    buggyCode: `function getLength(arr) {\n    return arr.size; // Bug: should be length\n}`,
                    expectedFixed: /return\s+arr\.length\s*;/,
                    answer: 'return arr.length;'
                }
            ];
            // Pick one at random
            const q = codeDebugQuestions[Math.floor(Math.random() * codeDebugQuestions.length)];
            const buggyCode = q.buggyCode;
            const expectedFixed = q.expectedFixed;
            const container = document.createElement('div');
            container.style.maxWidth = '600px';
            container.style.margin = '2em auto';
            container.style.padding = '1.5em';
            container.style.background = '#181f2a';
            container.style.borderRadius = '10px';
            container.style.boxShadow = '0 0 18px #00f5d4, 0 0 3px #000';

            const h3 = document.createElement('h3');
            h3.textContent = 'Debug the Code!';
            h3.style.marginBottom = '0.7em';
            h3.style.color = '#00f5d4';
            container.appendChild(h3);

            const desc = document.createElement('div');
            desc.innerHTML = q.description;
            desc.style.marginBottom = '1em';
            container.appendChild(desc);

            const codeBlock = document.createElement('pre');
            codeBlock.textContent = buggyCode;
            codeBlock.style.background = '#232946';
            codeBlock.style.color = '#fff';
            codeBlock.style.padding = '1em';
            codeBlock.style.borderRadius = '7px';
            codeBlock.style.marginBottom = '1em';
            codeBlock.style.fontSize = '1em';
            codeBlock.style.fontFamily = 'monospace';
            container.appendChild(codeBlock);

            const textarea = document.createElement('textarea');
            textarea.value = buggyCode;
            textarea.style.width = '100%';
            textarea.style.minHeight = '90px';
            textarea.style.fontFamily = 'monospace';
            textarea.style.fontSize = '1em';
            textarea.style.borderRadius = '7px';
            textarea.style.border = '1.5px solid #00f5d4';
            textarea.style.marginBottom = '1em';
            container.appendChild(textarea);

            const btn = document.createElement('button');
            btn.textContent = 'Submit Fix';
            btn.className = 'fun-btn';
            btn.style.marginRight = '1em';
            container.appendChild(btn);

            const status = document.createElement('div');
            status.style.marginTop = '1em';
            status.style.fontWeight = 'bold';
            container.appendChild(status);

            btn.onclick = function() {
                const userCode = textarea.value;
                if (expectedFixed.test(userCode)) {
                    status.textContent = 'Correct! Bug fixed. 🎉';
                    status.style.color = '#00f5d4';
                    // Show the correct answer
                    const answerDiv = document.createElement('div');
                    answerDiv.style.marginTop = '1em';
                    answerDiv.style.background = '#232946';
                    answerDiv.style.color = '#00f5d4';
                    answerDiv.style.padding = '0.7em 1em';
                    answerDiv.style.borderRadius = '7px';
                    answerDiv.style.fontFamily = 'monospace';
                    answerDiv.style.fontSize = '1.05em';
                    answerDiv.innerHTML = `<b>The correct fix:</b><br><pre style="background:#181f2a;color:#fff;padding:0.5em 1em;border-radius:5px;margin-top:0.5em;">${q.answer}</pre>`;
                    status.after(answerDiv);

                    // Subtle secret command hint as a popup
                    const modalBg = document.createElement('div');
                    modalBg.style.position = 'fixed';
                    modalBg.style.top = '0';
                    modalBg.style.left = '0';
                    modalBg.style.width = '100vw';
                    modalBg.style.height = '100vh';
                    modalBg.style.background = 'rgba(0,0,0,0.55)';
                    modalBg.style.display = 'flex';
                    modalBg.style.alignItems = 'center';
                    modalBg.style.justifyContent = 'center';
                    modalBg.style.zIndex = '9999';

                    const modal = document.createElement('div');
                    modal.style.background = '#232946';
                    modal.style.color = '#ffdf6e';
                    modal.style.padding = '2em 2.5em';
                    modal.style.borderRadius = '16px';
                    modal.style.fontFamily = 'monospace';
                    modal.style.fontSize = '1.15em';
                    modal.style.boxShadow = '0 0 24px #00f5d4bb';
                    modal.style.textAlign = 'center';
                    modal.innerHTML = '<b>Pro tip:</b><br>Sometimes, the simplest key—like <span style="color:#00f5d4;font-weight:bold;">hari</span>—can unlock hidden doors. <span style="font-size:1.4em;">😉</span>';
                    modalBg.appendChild(modal);
                    document.body.appendChild(modalBg);

                    addFunCountdown(60);
                    setTimeout(() => {
                        modalBg.remove();
                        showLevel(12);
                    }, 5200);
                } else {
                    status.textContent = 'Still buggy! Try again.';
                    status.style.color = '#ff5e5e';
                }
            };
            textarea.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) btn.click(); });
            root.appendChild(container);
            setTimeout(() => textarea.focus(), 200);
        }
        function showLevel(n) {
            DEBUG.performance.start(`showLevel${n}`);
            // Update progress bar and label
            const totalLevels = 14;
            const progressLabel = document.getElementById('fun-level-label');
            const progressBar = document.getElementById('fun-progress-bar');
            if (progressLabel && progressBar && n >= 1 && n <= totalLevels) {
                progressLabel.textContent = `Level ${n} of ${totalLevels}`;
                const pct = Math.max(6, Math.round((n/totalLevels)*100));
                progressBar.style.width = pct + '%';
            }

            
            if (typeof n !== 'number' || isNaN(n) || n < 1) {
                DEBUG.error(`showLevel called with invalid value: ${n} (type: ${typeof n})`);
                return;
            }
            
            if (n > totalLevels) {
                DEBUG.warn(`showLevel called with level ${n} which exceeds totalLevels (${totalLevels})`);
            }
            
            DEBUG.log(`Showing level ${n}`);
            
            let visibleCount = 0;
            let hiddenCount = 0;
            
            for (let i = 1; i <= totalLevels; i++) {
                const el = safeSelect(`#fun-level${i}`);
                if (el) {
                    const shouldShow = (i === n);
                    el.style.display = shouldShow ? 'block' : 'none';
                    if (shouldShow) {
                        visibleCount++;
                        DEBUG.log(`Level ${i} container made visible`);
                    } else {
                        hiddenCount++;
                    }
                } else {
                    DEBUG.warn(`Level container not found: fun-level${i}`);
                }
            }
            
            DEBUG.log(`Level visibility updated: ${visibleCount} visible, ${hiddenCount} hidden`);
            
            // Initialize games with error handling
            const gameInitializers = {
                4: { name: 'Memory Game', init: initMemoryGame },
                5: { name: 'Simon Says', init: initSimonSays },
                6: { name: 'Typing Challenge', init: initTypingChallenge },
                7: { name: 'Logic Puzzle', init: initLogicPuzzle },
                8: { name: 'Pixel Art', init: initPixelArt },
                9: { name: 'Trivia Wheel', init: initTriviaWheel },
                10: { name: 'Platformer', init: initPlatformer },
                11: { name: 'Code Debugging', init: initCodeDebugging },
                14: { name: 'Celebration', init: initCelebration }
            };

            
            if (gameInitializers[n]) {
                const game = gameInitializers[n];
                DEBUG.log(`Initializing ${game.name} for level ${n}`);
                try {
                    DEBUG.performance.start(`init${game.name.replace(/\s+/g, '')}`);
                    game.init();
                    DEBUG.performance.end(`init${game.name.replace(/\s+/g, '')}`);
                    DEBUG.log(`${game.name} initialized successfully`);
                } catch (error) {
                    DEBUG.error(`Failed to initialize ${game.name}:`, error);
                }
            }
            
            DEBUG.performance.end(`showLevel${n}`);
        }
        window.showLevel = showLevel;
        // LEVEL 1: Confetti clicks
        let confettiClicks = 0;
        const CONFETTI_THRESHOLD = 5;
        
        function updateConfettiCounter() {
            DEBUG.performance.start('updateConfettiCounter');
            
            const btn = safeSelect('#confetti-btn');
            let counter = safeSelect('#confetti-counter');
            
            if (!btn) {
                DEBUG.warn('Confetti button not found, cannot update counter');
                return;
            }
            
            // Remove duplicate counters
            if (counter && counter.parentNode !== btn.parentNode) {
                DEBUG.log('Removing duplicate confetti counter');
                counter.remove();
                counter = null;
            }
            
            if (!counter) {
                DEBUG.log('Creating new confetti counter');
                counter = document.createElement('div');
                counter.id = 'confetti-counter';
                counter.style.marginTop = '0.7em';
                counter.style.fontSize = '1.1em';
                counter.style.color = '#00f5d4';
                counter.style.fontFamily = 'monospace';
                btn.parentNode.appendChild(counter);
            }
            
            if (confettiClicks < CONFETTI_THRESHOLD) {
                const remaining = CONFETTI_THRESHOLD - confettiClicks;
                counter.textContent = `Clicks left to unlock: ${remaining}`;
                counter.style.display = '';
                DEBUG.log(`Confetti counter updated: ${remaining} clicks remaining`);
            } else {
                counter.style.display = 'none';
                DEBUG.log('Confetti counter hidden (threshold reached)');
            }
            
            DEBUG.performance.end('updateConfettiCounter');
        }
        
        updateConfettiCounter();
        
        const confettiBtn = safeSelect('#confetti-btn');
        if (confettiBtn) {
            DEBUG.log('Adding click event listener to confetti button');
            safeAddEventListener(confettiBtn, 'click', (e) => {
                DEBUG.performance.start('confettiClick');
                
                confettiClicks++;
                DEBUG.log(`Confetti button clicked ${confettiClicks}/${CONFETTI_THRESHOLD} times`);
                
                try {
                    confetti(e);
                    DEBUG.log('Confetti animation triggered successfully');
                } catch (error) {
                    DEBUG.error('Failed to trigger confetti animation:', error);
                }
                
                updateConfettiCounter();
                
                if (confettiClicks === CONFETTI_THRESHOLD) {
                    DEBUG.log('Confetti threshold reached, progressing to Level 2');
                    setTimeout(() => {
                        const counter = safeSelect('#confetti-counter');
                        if (counter) {
                            counter.style.display = 'none';
                            DEBUG.log('Confetti counter hidden for level transition');
                        }
                        showLevel(2);
                        addFunCountdown(60);
                        ensureTimer();
                    }, 250);
                }
                
                DEBUG.performance.end('confettiClick');
            });
        } else {
            DEBUG.error('Confetti button not found, cannot add event listener');
        }
        // Remove counter if Level 1 is hidden
        const observer = new MutationObserver(() => {
            let lvl1 = document.getElementById('fun-level1');
            let counter = document.getElementById('confetti-counter');
            if (lvl1 && lvl1.style.display === 'none' && counter) counter.remove();
        });
        observer.observe(document.body, { attributes: true, childList: true, subtree: true });
        // LEVEL 2: Drag to target
        const draggableArea = document.getElementById('draggable-area');
        if (draggableArea) {
    let dropTarget = document.createElement('div');
    dropTarget.textContent = 'Drop Here!';
    dropTarget.className = 'drop-target';
    dropTarget.style.cssText = 'margin:1em auto;padding:2em;background:#222;color:#00f5d4;border:2px dashed #00f5d4;text-align:center;border-radius:6px;max-width:200px;';
    draggableArea.appendChild(dropTarget);
    let completed = false;
    // --- Desktop drag events ---
    draggableArea.addEventListener('dragstart', e => {
        if (e.target.classList.contains('draggable-card')) {
            console.log('[FUN] Drag started on draggable card');
            e.dataTransfer.setData('text/plain', 'dragged');
        }
    });
    dropTarget.addEventListener('dragover', e => {
        e.preventDefault();
    });
    dropTarget.addEventListener('drop', e => {
        e.preventDefault();
        if (!completed) {
            console.log('[FUN] Card dropped on drop target, progressing to Level 3');
            dropTarget.textContent = 'Success!';
            dropTarget.style.background = '#00f5d4';
            dropTarget.style.color = '#222';
            completed = true;
            setTimeout(() => {
                showLevel(3);
                addFunCountdown(60);
            }, 700);
        }
    });

    // --- Touch/mobile tap-to-complete fallback ---
    let selectedCard = null;
    // Helper to detect touch device
    function isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
    if (isTouchDevice()) {
        // Add tap handler to cards
        const cards = draggableArea.querySelectorAll('.draggable-card');
        cards.forEach(card => {
            card.addEventListener('touchstart', function(e) {
                e.preventDefault();
                // Remove highlight from all cards
                cards.forEach(c => c.style.outline = '');
                // Highlight selected card
                this.style.outline = '3px solid #00f5d4';
                selectedCard = this;
            });
        });
        // Tap on drop target to complete
        dropTarget.addEventListener('touchstart', function(e) {
            e.preventDefault();
            if (selectedCard && !completed) {
                dropTarget.textContent = 'Success!';
                dropTarget.style.background = '#00f5d4';
                dropTarget.style.color = '#222';
                completed = true;
                // Remove highlight
                selectedCard.style.outline = '';
                setTimeout(() => {
                    showLevel(3);
                    addFunCountdown(60);
                }, 700);
            }
        });
    }
}
// LEVEL 3: Quiz
function onQuizComplete() {
    console.log('[FUN] Quiz complete, progressing to Level 4');
    showLevel(4);
    addFunCountdown(60);
}
const quizContainer = document.getElementById('quiz-container');
if (quizContainer) {
    showPuzzle(onQuizComplete);
}

// LEVEL 12: Emoji Guessing
(function initEmojiGuessing() {
    const root = document.querySelector('#fun-level12');
    if (!root) return;
    root.innerHTML = '';
    const quiz = [
        { emoji: '🌧️☔', options: ['Rainy Day', 'Picnic', 'Thunderstorm', 'Swim'], answer: 0 },
        { emoji: '🦄🌈', options: ['Unicorn Party', 'Dreams', 'Fairy Tale', 'Rainbow Unicorn'], answer: 3 },
        { emoji: '🍕🍔🍟', options: ['Healthy Food', 'Fast Food', 'Dessert', 'Picnic'], answer: 1 },
        { emoji: '🎓📚', options: ['Graduation', 'Reading', 'School', 'Exam'], answer: 0 }
    ];
    let idx = Math.floor(Math.random() * quiz.length);
    const q = quiz[idx];
    const h3 = document.createElement('h3');
    h3.textContent = 'Guess the Emoji!';
    h3.style.marginBottom = '0.7em';
    const emojiDiv = document.createElement('div');
    emojiDiv.textContent = q.emoji;
    emojiDiv.style.fontSize = '2.5em';
    emojiDiv.style.marginBottom = '0.6em';
    const optionsDiv = document.createElement('div');
    optionsDiv.style.display = 'flex';
    optionsDiv.style.flexDirection = 'column';
    optionsDiv.style.gap = '0.5em';
    let status = document.createElement('div');
    status.style.marginTop = '0.7em';
    status.style.fontWeight = 'bold';
    q.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.textContent = opt;
        btn.className = 'fun-btn';
        btn.onclick = function() {
            if (i === q.answer) {
                status.textContent = '🎉 Correct!';
                setTimeout(() => {
                    showLevel(13);
                    addFunCountdown(60);
                }, 900);
            } else {
                status.textContent = '❌ Try again!';
            }
        };
        optionsDiv.appendChild(btn);
    });
    // Instructions
    const instr = document.createElement('div');
    instr.textContent = 'Guess the object shown by the emojis!';
    instr.style.marginBottom = '1em';
    instr.style.background = '#232946';
    instr.style.color = '#00f5d4';
    instr.style.padding = '0.7em 1em';
    instr.style.borderRadius = '7px';
    instr.style.fontWeight = 'bold';
    root.appendChild(instr);
    root.append(h3, emojiDiv, optionsDiv, status);
})();

// LEVEL 13: Secret Command
(function initSecretCommand() {
    const root = document.getElementById('secret-command-root');
    if (!root) return;
    root.innerHTML = '';
    const h3 = document.createElement('h3');
    h3.textContent = 'Enter the Secret Command';
    h3.style.marginBottom = '0.9em';
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Type the secret phrase...';
    input.style.fontSize = '1.1em';
    input.style.padding = '0.4em 0.8em';
    input.style.borderRadius = '7px';
    input.style.border = '1.5px solid #00f5d4';
    input.style.marginRight = '0.5em';
    const btn = document.createElement('button');
    btn.textContent = 'Submit';
    btn.className = 'fun-btn';
    const status = document.createElement('div');
    status.style.marginTop = '0.7em';
    status.style.fontWeight = 'bold';
    const SECRET = 'hari'; // You can change this secret phrase!
    btn.onclick = function() {
        if (input.value.trim().toLowerCase() === SECRET) {
            status.textContent = '🎉 Unlocked!';
            setTimeout(() => {
                showLevel(14);
                addFunCountdown(60);
            }, 900);
        } else {
            status.textContent = '❌ Incorrect!';
        }
    };
    input.addEventListener('keydown', e => { if (e.key === 'Enter') btn.click(); });
    // Instructions
    const instr = document.createElement('div');
    instr.textContent = 'Type the secret command and submit!';
    instr.style.marginBottom = '1em';
    instr.style.background = '#232946';
    instr.style.color = '#00f5d4';
    instr.style.padding = '0.7em 1em';
    instr.style.borderRadius = '7px';
    instr.style.fontWeight = 'bold';
    root.appendChild(instr);
    root.append(h3, input, btn, status);
})();

// LEVEL 14: Celebration & Surprise
function initCelebration() {
    const root = document.getElementById('fun-level14');
    if (!root) return;
    root.innerHTML = '';
    // Celebration message
    const msg = document.createElement('div');
    msg.innerHTML = `<h2 style="color:#00f5d4;font-size:2.2em;margin-bottom:0.4em;">Congratulations! 🎉</h2><div style="font-size:1.3em;color:#fff;">You completed all levels!<br>Thank you for playing.<br><span style='color:#ffdf6e;font-size:1.1em;'>Here's a surprise for you!</span></div>`;
    msg.style.textAlign = 'center';
    msg.style.margin = '2em auto 1.2em auto';
    msg.style.padding = '2em 2em 1.5em 2em';
    msg.style.background = 'linear-gradient(135deg,#232946 60%,#00f5d4 100%)';
    msg.style.borderRadius = '16px';
    msg.style.boxShadow = '0 0 32px #00f5d4bb';
    root.appendChild(msg);

    // Confetti burst (if confetti function exists)
    setTimeout(() => {
        if (typeof confetti === 'function') {
            for (let i = 0; i < 4; i++) {
                setTimeout(() => confetti({
                    angle: 60 + i*30,
                    spread: 70,
                    particleCount: 60,
                    origin: { y: 0.4 }
                }), i * 350);
            }
        }
    }, 400);

    // Fun visual: animated emoji rain
    const emojiList = ['🎉','🥳','✨','🎈','🎊','🚀','🦄'];
    for (let i = 0; i < 24; i++) {
        const emoji = document.createElement('div');
        emoji.textContent = emojiList[Math.floor(Math.random()*emojiList.length)];
        emoji.style.position = 'fixed';
        emoji.style.left = Math.random()*100 + 'vw';
        emoji.style.top = '-3em';
        emoji.style.fontSize = (1.5 + Math.random()*1.5) + 'em';
        emoji.style.opacity = 0.7 + Math.random()*0.3;
        emoji.style.pointerEvents = 'none';
        emoji.style.zIndex = 9999;
        emoji.style.transition = 'transform 2.7s cubic-bezier(.22,.61,.36,1), opacity 2.7s';
        document.body.appendChild(emoji);
        setTimeout(() => {
            emoji.style.transform = `translateY(${80 + Math.random()*10}vh)`;
            emoji.style.opacity = 0.1;
        }, 60);
        setTimeout(() => emoji.remove(), 3000 + Math.random()*600);
    }

    // Surprise: Show a fun button with a random compliment or fortune
    const surpriseBtn = document.createElement('button');
    surpriseBtn.textContent = '🎁 Reveal your surprise!';
    surpriseBtn.className = 'fun-btn';
    surpriseBtn.style.display = 'block';
    surpriseBtn.style.margin = '2.5em auto 0 auto';
    surpriseBtn.style.fontSize = '1.2em';
    root.appendChild(surpriseBtn);
    const surprises = [
        "You're a coding superstar! 🌟",
        "May your bugs be tiny and your features grand! 🐞✨",
        "You just leveled up in awesomeness! 🚀",
        "Keep shining bright, developer! 💡",
        "Secret: Try typing 'hari' anywhere on the homepage 😉"
    ];
    surpriseBtn.onclick = function() {
        const reveal = document.createElement('div');
        reveal.textContent = surprises[Math.floor(Math.random()*surprises.length)];
        reveal.style.margin = '2em auto 0 auto';
        reveal.style.background = '#ffdf6e';
        reveal.style.color = '#232946';
        reveal.style.padding = '1.3em 2em';
        reveal.style.borderRadius = '12px';
        reveal.style.fontSize = '1.25em';
        reveal.style.fontWeight = 'bold';
        reveal.style.textAlign = 'center';
        root.appendChild(reveal);
        surpriseBtn.disabled = true;
        surpriseBtn.style.opacity = 0.5;
    };
}

// NEW LEVELS: Each has a .complete-level-btn
document.querySelectorAll('.complete-level-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const next = parseInt(this.dataset.next, 10);
        console.log('[FUN] Complete-level button clicked, progressing to Level', next);
        if (next) {
            showLevel(next);
            addFunCountdown(60);
        }
    });
});

// Show only level 1 at start
showLevel(1);

// LEVEL 4: Memory Game
function initMemoryGame() {
            const memoryGameRoot = document.getElementById('memory-game-root');
            if (!memoryGameRoot) return;
            memoryGameRoot.innerHTML = '';
            // Container for instruction + grid
            const container = document.createElement('div');
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.alignItems = 'center';
            // Instructions
            const instr = document.createElement('div');
            instr.textContent = 'Flip cards to find all matching pairs.';
            instr.style.marginBottom = '1em';
            instr.style.background = '#232946';
            instr.style.color = '#00f5d4';
            instr.style.padding = '0.7em 1em';
            instr.style.borderRadius = '7px';
            instr.style.fontWeight = 'bold';
            container.appendChild(instr);
            // Grid for cards
            const grid = document.createElement('div');
            grid.style.display = 'grid';
            grid.style.gridTemplateColumns = 'repeat(4, 60px)';
            grid.style.gridGap = '12px';
            container.appendChild(grid);
            memoryGameRoot.appendChild(container);
            const emojis = ['🍎','🍌','🍇','🍒','🍉','🍋'];
            const cardsArr = [...emojis, ...emojis];
            shuffle(cardsArr);
            let flipped = [];
            let matched = [];
            let lock = false;
            // Create a 4x3 grid
            cardsArr.forEach((emoji, idx) => {
                const card = document.createElement('button');
                card.className = 'memory-card';
                card.setAttribute('aria-label', 'Memory card');
                card.dataset.idx = idx;
                card.style.width = '60px';
                card.style.height = '60px';
                card.style.fontSize = '2rem';
                card.style.position = 'relative';
                card.style.border = '2px solid #00f5d4';
                card.style.borderRadius = '8px';
                card.style.background = '#181f2a';
                card.style.cursor = 'pointer';
                card.innerHTML = '<span class="card-back" style="display:block;position:absolute;width:100%;height:100%;top:0;left:0;line-height:60px;text-align:center;font-size:2rem;">?</span><span class="card-front" style="display:none;position:absolute;width:100%;height:100%;top:0;left:0;line-height:60px;text-align:center;font-size:2rem;">'+emoji+'</span>';
                card.addEventListener('click', function() {
                    if (lock || matched.includes(idx) || flipped.includes(idx) || flipped.length >= 2) return;
                    this.querySelector('.card-back').style.display = 'none';
                    this.querySelector('.card-front').style.display = 'block';
                    flipped.push(idx);
                    if (flipped.length === 2) {
                        lock = true;
                        setTimeout(() => {
                            const [i1,i2] = flipped;
                            const c1 = grid.querySelector('[data-idx="'+i1+'"]');
                            const c2 = grid.querySelector('[data-idx="'+i2+'"]');
                            if (cardsArr[i1] === cardsArr[i2]) {
                                matched.push(i1, i2);
                                if (matched.length === cardsArr.length) {
                                    setTimeout(() => {
                                        const nextBtn = document.querySelector('#fun-level5 .complete-level-btn');
                                        if (nextBtn) nextBtn.click();
                                        else showLevel(5);
                                    }, 900);
                                }
                            } else {
                                setTimeout(() => {
                                    c1.querySelector('.card-back').style.display = 'block';
                                    c1.querySelector('.card-front').style.display = 'none';
                                    c2.querySelector('.card-back').style.display = 'block';
                                    c2.querySelector('.card-front').style.display = 'none';
                                }, 700);
                            }
                            flipped = [];
                            lock = false;
                        }, 700);
                    }
                });
                // Add card to grid
                grid.appendChild(card);
            });
        }


        // LEVEL 9: Trivia Wheel
        function initTriviaWheel() {
            const root = document.getElementById('trivia-wheel-root');
            if (!root) return;
            root.innerHTML = '';
            // Instructions
            const instr = document.createElement('div');
            instr.textContent = 'Spin the wheel and answer the trivia question!';
            instr.style.marginBottom = '1em';
            instr.style.background = '#232946';
            instr.style.color = '#00f5d4';
            instr.style.padding = '0.7em 1em';
            instr.style.borderRadius = '7px';
            instr.style.fontWeight = 'bold';
            root.appendChild(instr);
            const questions = [
                {q:'What is the capital of France?', a:'Paris'},
                {q:'Who wrote "Hamlet"?', a:'Shakespeare'},
                {q:'What is 9 x 7?', a:'63'},
                {q:'What planet is known as the Red Planet?', a:'Mars'},
                {q:'What is the chemical symbol for water?', a:'H2O'},
                {q:'Who painted the Mona Lisa?', a:'Da Vinci'},
                {q:'What is the largest mammal?', a:'Blue whale'},
                {q:'What is the square root of 64?', a:'8'}
            ];
            // Wheel UI
            const wheelBtn = document.createElement('button');
            wheelBtn.textContent = 'SPIN THE WHEEL!';
            wheelBtn.style.fontSize = '1.2em';
            wheelBtn.style.padding = '1em 2em';
            wheelBtn.style.background = '#00f5d4';
            wheelBtn.style.color = '#181f2a';
            wheelBtn.style.border = '3px solid #fff';
            wheelBtn.style.borderRadius = '14px';
            wheelBtn.style.margin = '1.5em auto 1em auto';
            wheelBtn.style.display = 'block';
            wheelBtn.style.fontWeight = 'bold';
            root.appendChild(wheelBtn);
            const qDiv = document.createElement('div');
            qDiv.style.margin = '1.2em auto';
            qDiv.style.fontSize = '1.1em';
            qDiv.style.fontWeight = 'bold';
            qDiv.style.textAlign = 'center';
            root.appendChild(qDiv);
            const input = document.createElement('input');
            input.type = 'text';
            input.style.fontSize = '1.1em';
            input.style.padding = '0.6em';
            input.style.margin = '0.7em auto';
            input.style.display = 'block';
            input.style.width = '80%';
            input.style.border = '2px solid #00f5d4';
            input.style.borderRadius = '7px';
            input.style.textAlign = 'center';
            input.style.fontFamily = 'monospace';
            input.style.visibility = 'hidden';
            root.appendChild(input);
            const submit = document.createElement('button');
            submit.textContent = 'Submit';
            submit.style.display = 'none';
            submit.style.margin = '0.5em auto';
            submit.style.padding = '0.7em 1.5em';
            submit.style.fontWeight = 'bold';
            submit.style.background = '#00f5d4';
            submit.style.color = '#181f2a';
            submit.style.border = '2px solid #fff';
            submit.style.borderRadius = '7px';
            root.appendChild(submit);
            const status = document.createElement('div');
            status.style.margin = '1em auto 0 auto';
            status.style.textAlign = 'center';
            status.style.fontWeight = 'bold';
            root.appendChild(status);
            let picked = null;
            wheelBtn.onclick = function() {
                picked = questions[Math.floor(Math.random()*questions.length)];
                qDiv.textContent = picked.q;
                input.value = '';
                input.style.visibility = 'visible';
                submit.style.display = 'inline-block';
                input.focus();
                status.textContent = '';
            };
            submit.onclick = function() {
                if (!picked) return;
                if (input.value.trim().toLowerCase() === picked.a.toLowerCase()) {
                    status.textContent = 'Correct! 🎉';
                    status.style.color = '#00f5d4';
                    addFunCountdown(60);
                    setTimeout(()=>{ showLevel(10); }, 1200);
                } else {
                    status.textContent = 'Try again!';
                    status.style.color = '#ff6f61';
                }
            };
        }

        // LEVEL 10: Platformer Mini-Game
        function initPlatformer() {
            const root = document.getElementById('platformer-root');
            if (!root) return;
            root.innerHTML = '';
            // Instructions
            const instr = document.createElement('div');
            instr.textContent = 'Press Space or ↑ to jump. Avoid obstacles and survive 12 seconds!';
            instr.style.marginBottom = '1em';
            instr.style.background = '#232946';
            instr.style.color = '#00f5d4';
            instr.style.padding = '0.7em 1em';
            instr.style.borderRadius = '7px';
            instr.style.fontWeight = 'bold';
            root.appendChild(instr);
            // Simple runner: press space/arrow-up to jump over obstacles
            const container = document.createElement('div');
            container.style.position = 'relative';
            container.style.width = '600px';
            container.style.height = '180px';
            container.style.margin = '2em auto';
            container.style.background = '#222';
            container.style.border = '2px solid #00f5d4';
            container.style.borderRadius = '12px';
            root.appendChild(container);
            // Player
            const player = document.createElement('div');
            player.style.position = 'absolute';
            player.style.left = '60px';
            player.style.bottom = '28px';
            player.style.width = '40px';
            player.style.height = '40px';
            player.style.background = '#00f5d4';
            player.style.borderRadius = '50%';
            player.style.boxShadow = '0 0 8px #00f5d4';
            container.appendChild(player);
            // Obstacle
            const obs = document.createElement('div');
            obs.style.position = 'absolute';
            obs.style.left = '540px'; // start at far right
            obs.style.bottom = '28px';
            obs.style.width = '38px';
            obs.style.height = '54px';
            obs.style.background = '#ff6f61';
            obs.style.borderRadius = '8px';
            obs.style.boxShadow = '0 0 8px #ff6f61';
            container.appendChild(obs);
            // Ground
            const ground = document.createElement('div');
            ground.style.position = 'absolute';
            ground.style.left = '0';
            ground.style.bottom = '0';
            ground.style.width = '100%';
            ground.style.height = '28px';
            ground.style.background = '#444';
            ground.style.borderRadius = '0 0 14px 14px';
            container.appendChild(ground);
            // Jump logic
            let jumping = false;
            let y = 0;
            let vy = 0;
            let gravity = -2.3;
            let jumpPower = 32;
            function jump() {
                if (!jumping) {
                    vy = jumpPower;
                    jumping = true;
                }
            }
            document.addEventListener('keydown', function(e) {
                if (e.code === 'Space' || e.code === 'ArrowUp') jump();
            });
            container.addEventListener('click', jump);
            // Obstacle movement
            let obsX = 540;
            let speed = 5.2;
            let running = true;
            function frame() {
                if (!running) return;
                // Player physics
                vy += gravity;
                y += vy;
                if (y < 0) { y = 0; vy = 0; jumping = false; }
                player.style.bottom = (18 + y) + 'px';
                // Obstacle movement (leftwards)
                obsX -= speed;
                if (obsX < -28) { obsX = 340 + Math.random()*40; speed += 0.2; }
                obs.style.left = obsX + 'px';
                // Collision
                // Player at left: left=40px, width=32; obstacle: obsX, width=28
                if (obsX < 40+32 && obsX+28 > 40 && y < 18+36 && y+32 > 18) {
                    running = false;
                    player.style.background = '#ff5e5e';
                    showFail();
                    return;
                }
                requestAnimationFrame(frame);
            }
            function showFail() {
                const msg = document.createElement('div');
                msg.textContent = 'Oops! Try again.';
                msg.style.position = 'absolute';
                msg.style.left = '50%';
                msg.style.top = '35%';
                msg.style.transform = 'translate(-50%,-50%)';
                msg.style.color = '#ff6f61';
                msg.style.fontWeight = 'bold';
                msg.style.fontSize = '1.2em';
                msg.style.background = '#fff';
                msg.style.padding = '0.7em 2em';
                msg.style.borderRadius = '8px';
                container.appendChild(msg);
                setTimeout(()=>{ initPlatformer(); }, 1200);
            }
            function showWin() {
                running = false;
                addFunCountdown(60);
                const msg = document.createElement('div');
                msg.textContent = 'You Win! 🎉';
                msg.style.position = 'absolute';
                msg.style.left = '50%';
                msg.style.top = '35%';
                msg.style.transform = 'translate(-50%,-50%)';
                msg.style.color = '#00f5d4';
                msg.style.fontWeight = 'bold';
                msg.style.fontSize = '1.2em';
                msg.style.background = '#fff';
                msg.style.padding = '0.7em 2em';
                msg.style.borderRadius = '8px';
                container.appendChild(msg);
                setTimeout(()=>{ showLevel(11); }, 1300);
            }
            // Win condition: survive 12 seconds
            setTimeout(()=>{ if (running) showWin(); }, 12000);
            frame();
        }

        // LEVEL 8: Pixel Art Coloring
        function initPixelArt() {
            const root = document.getElementById('pixel-art-root');
            if (!root) return;
            root.innerHTML = '';
            // Instructions
            const instr = document.createElement('div');
            instr.textContent = 'Color the grid to match the heart pattern!';
            instr.style.marginBottom = '1em';
            instr.style.background = '#232946';
            instr.style.color = '#00f5d4';
            instr.style.padding = '0.7em 1em';
            instr.style.borderRadius = '7px';
            instr.style.fontWeight = 'bold';
            root.appendChild(instr);
            // Define a simple pattern (6x6 heart)
            const pattern = [
                [0,1,1,1,1,0],
                [1,2,2,2,2,1],
                [2,2,2,2,2,2],
                [2,2,2,2,2,2],
                [0,2,2,2,2,0],
                [0,0,2,2,0,0]
            ];
            const colors = ['#181f2a','#ff6f61','#ffd166']; // 0=bg, 1=red, 2=yellow
            const colorNames = ['Background','Red','Yellow'];
            const size = 6;
            let userGrid = Array(size).fill().map(()=>Array(size).fill(0));
            // Palette
            const palette = document.createElement('div');
            palette.style.margin = '0.7em auto 1em auto';
            palette.style.display = 'flex';
            palette.style.justifyContent = 'center';
            let selected = 1;
            colors.forEach((col,i) => {
                const btn = document.createElement('button');
                btn.style.width = '32px';
                btn.style.height = '32px';
                btn.style.margin = '0 8px';
                btn.style.borderRadius = '7px';
                btn.style.border = i === selected ? '3px solid #00f5d4' : '2px solid #fff';
                btn.style.background = col;
                btn.title = colorNames[i];
                btn.setAttribute('aria-label', colorNames[i]);
                btn.addEventListener('click',()=>{
                    selected = i;
                    Array.from(palette.children).forEach((b,idx)=>b.style.border = idx===selected?'3px solid #00f5d4':'2px solid #fff');
                });
                palette.appendChild(btn);
            });
            root.appendChild(palette);
            // Reference pattern
            const ref = document.createElement('div');
            ref.style.display = 'inline-block';
            ref.style.margin = '0 auto 1em auto';
            ref.style.padding = '8px';
            ref.style.border = '2px dashed #00f5d4';
            ref.style.background = '#222';
            ref.innerHTML = '<b>Reference:</b><br>' + pattern.map(row=>row.map(idx=>`<span style="display:inline-block;width:18px;height:18px;background:${colors[idx]};margin:1px;border-radius:3px;"></span>`).join('')).join('<br>');
            root.appendChild(ref);
            // User grid
            const board = document.createElement('div');
            board.style.display = 'grid';
            board.style.gridTemplateColumns = `repeat(${size}, 28px)`;
            board.style.gridGap = '4px';
            board.style.margin = '0 auto 1.1em auto';
            for (let r = 0; r < size; r++) {
                for (let c = 0; c < size; c++) {
                    const cell = document.createElement('button');
                    cell.style.width = '28px';
                    cell.style.height = '28px';
                    cell.style.borderRadius = '5px';
                    cell.style.border = '2px solid #fff';
                    cell.style.background = colors[userGrid[r][c]];
                    cell.setAttribute('aria-label', `Cell ${r+1},${c+1}`);
                    cell.tabIndex = 0;
                    cell.addEventListener('click',()=>{
                        userGrid[r][c] = selected;
                        cell.style.background = colors[selected];
                        checkWin();
                    });
                    board.appendChild(cell);
                }
            }
            root.appendChild(board);
            function checkWin() {
                for (let r = 0; r < size; r++) {
                    for (let c = 0; c < size; c++) {
                        if (userGrid[r][c] !== pattern[r][c]) return;
                    }
                }
                showWin();
            }
            function showWin() {
                const msg = document.createElement('div');
                msg.textContent = 'Pixel Art Complete! 🎉';
                msg.style.margin = '1em auto';
                msg.style.fontWeight = 'bold';
                msg.style.color = '#00f5d4';
                msg.style.fontSize = '1.2em';
                root.appendChild(msg);
                addFunCountdown(60);
                setTimeout(() => {
                    showLevel(9);
                }, 1400);
            }
        }

        // LEVEL 7: Logic Puzzle (Easy 2x2)
        function initLogicPuzzle() {
            const root = document.getElementById('logic-puzzle-root');
            if (!root) return;
            root.innerHTML = '';
            // Instructions
            const instr = document.createElement('div');
            instr.textContent = 'Turn off all the lights by clicking the buttons. (Only 1 move needed!)';
            instr.style.marginBottom = '1em';
            instr.style.background = '#232946';
            instr.style.color = '#00f5d4';
            instr.style.padding = '0.7em 1em';
            instr.style.borderRadius = '7px';
            instr.style.fontWeight = 'bold';
            root.appendChild(instr);
            const size = 2;
            // Only one cell is 'off', the rest are 'on' (solvable in 1 move)
            let grid = [1, 1, 1, 0];
            function render() {
                root.innerHTML = '';
                const board = document.createElement('div');
                board.style.display = 'grid';
                board.style.gridTemplateColumns = `repeat(${size}, 50px)`;
                board.style.gridGap = '10px';
                board.style.margin = '1.5em auto';
                board.style.justifyContent = 'center';
                for (let i = 0; i < size * size; i++) {
                    const btn = document.createElement('button');
                    btn.style.width = '50px';
                    btn.style.height = '50px';
                    btn.style.borderRadius = '8px';
                    btn.style.border = '2px solid #00f5d4';
                    btn.style.background = grid[i] ? '#00f5d4' : '#181f2a';
                    btn.style.boxShadow = grid[i] ? '0 0 18px #00f5d4' : '';
                    btn.setAttribute('aria-label', `Cell ${i+1}`);
                    btn.tabIndex = 0;
                    btn.addEventListener('click', () => {
                        toggle(i);
                        render();
                        if (grid.every(v => v === 0)) {
                            board.style.pointerEvents = 'none';
                            showWin();
                        }
                    });
                    board.appendChild(btn);
                }
                root.appendChild(board);
            }
            function toggle(idx) {
                const neighbors = [idx, idx-size, idx+size];
                if (idx % size !== 0) neighbors.push(idx-1);
                if ((idx+1) % size !== 0) neighbors.push(idx+1);
                for (const n of neighbors) {
                    if (n >= 0 && n < size*size) grid[n] = grid[n] ? 0 : 1;
                }
            }
            function showWin() {
                const msg = document.createElement('div');
                msg.textContent = 'Puzzle Solved! 🎉';
                msg.style.margin = '1em auto';
                msg.style.fontWeight = 'bold';
                msg.style.color = '#00f5d4';
                msg.style.fontSize = '1.2em';
                root.appendChild(msg);
                addFunCountdown(60);
                setTimeout(() => {
                    showLevel(8);
                }, 1300);
            }
            render();
        }

        // LEVEL 6: Typing Challenge
        function initTypingChallenge() {
            const typingRoot = document.getElementById('typing-challenge-root');
            if (!typingRoot) return;
            typingRoot.innerHTML = '';
            // Instructions
            const instr = document.createElement('div');
            instr.textContent = 'Type the sentence below as fast and accurately as you can!';
            instr.style.marginBottom = '1em';
            instr.style.background = '#232946';
            instr.style.color = '#00f5d4';
            instr.style.padding = '0.7em 1em';
            instr.style.borderRadius = '7px';
            instr.style.fontWeight = 'bold';
            typingRoot.appendChild(instr);
            const sentences = [
                'The quick brown fox jumps over the lazy dog.',
                'JavaScript makes web pages interactive.',
                'Typing fast is a useful skill.',
                'Practice makes perfect!',
                'Cascade is your coding copilot.'
            ];
            const sentence = sentences[Math.floor(Math.random() * sentences.length)];
            const container = document.createElement('div');
            container.style.margin = '1.2em auto';
            container.style.maxWidth = '500px';
            container.style.padding = '1.2em';
            container.style.background = '#181f2a';
            container.style.borderRadius = '10px';
            container.style.boxShadow = '0 0 18px #00f5d4, 0 0 3px #000';
            container.style.textAlign = 'center';
            const prompt = document.createElement('div');
            prompt.style.fontSize = '1.1em';
            prompt.style.letterSpacing = '0.03em';
            prompt.style.marginBottom = '1em';
            prompt.style.fontFamily = 'monospace';
            prompt.style.whiteSpace = 'pre-wrap';
            prompt.innerHTML = sentence.split('').map((ch,i) => `<span data-idx="${i}" style="display:inline-block;padding:1px 2px;">${ch === ' ' ? '&nbsp;' : ch}</span>`).join('');
            container.appendChild(prompt);
            const input = document.createElement('input');
            input.style.width = '100%';
            input.style.fontSize = '1.1em';
            input.style.padding = '0.7em';
            input.style.border = '2px solid #00f5d4';
            input.style.borderRadius = '8px';
            input.style.marginBottom = '1em';
            input.style.fontFamily = 'monospace';
            container.appendChild(input);
            const status = document.createElement('div');
            status.style.marginTop = '0.8em';
            status.style.fontWeight = 'bold';
            container.appendChild(status);
            typingRoot.appendChild(container);
            let startTime = null;
            input.addEventListener('input', function() {
                if (startTime === null) startTime = Date.now();
                // Highlight
                for (let i = 0; i < sentence.length; i++) {
                    const span = prompt.querySelector(`[data-idx="${i}"]`);
                    if (!span) continue;
                    if (this.value[i] == null) {
                        span.style.background = '';
                        span.style.color = '';
                    } else if (this.value[i] === sentence[i]) {
                        span.style.background = '#00f5d4';
                        span.style.color = '#181f2a';
                    } else {
                        span.style.background = '#ff5e5e';
                        span.style.color = '#fff';
                    }
                }
                // On complete
                if (this.value === sentence) {
                    const elapsed = (Date.now() - startTime) / 1000;
                    const words = sentence.trim().split(/\s+/).length;
                    const wpm = Math.round(words / (elapsed / 60));
                    let correctChars = 0;
                    for (let i = 0; i < sentence.length; i++) {
                        if (this.value[i] === sentence[i]) correctChars++;
                    }
                    const accuracy = Math.round((correctChars / sentence.length) * 100);
                    status.innerHTML = `Completed in <b>${elapsed.toFixed(2)}</b> seconds!<br>WPM: <b>${wpm}</b>   Accuracy: <b>${accuracy}%</b> 🎉`;
                    input.disabled = true;
                    addFunCountdown(60);
                    setTimeout(() => {
                        showLevel(7);
                    }, 1600);
                }
            });
            setTimeout(() => input.focus(), 200);
        }

        // LEVEL 5: Simon Says
        function initSimonSays() {
            console.log('[FUN] initSimonSays called');
            const simonRoot = document.getElementById('simon-says-root');
            if (!simonRoot) {
                console.warn('[FUN] simon-says-root not found!');
                return;
            }
            simonRoot.innerHTML = '';
            // Instructions
            const instr = document.createElement('div');
            instr.textContent = 'Watch and repeat the color sequence. Complete 5 rounds to win!';
            instr.style.marginBottom = '1em';
            instr.style.background = '#232946';
            instr.style.color = '#00f5d4';
            instr.style.padding = '0.7em 1em';
            instr.style.borderRadius = '7px';
            instr.style.fontWeight = 'bold';
            simonRoot.appendChild(instr);
            const colors = ['red', 'green', 'blue', 'yellow'];
            const colorHex = {
                red: '#ff4d4d',
                green: '#4dff4d',
                blue: '#4db8ff',
                yellow: '#ffe066'
            };
            let sequence = [];
            let userStep = 0;
            let round = 0;
            let canClick = false;
            const buttons = {};
            const status = document.createElement('div');
            status.style.textAlign = 'center';
            status.style.fontWeight = 'bold';
            status.style.marginBottom = '1em';
            status.textContent = 'Watch the sequence!';
            simonRoot.appendChild(status);
            const board = document.createElement('div');
            board.style.display = 'grid';
            board.style.gridTemplateColumns = 'repeat(2, 70px)';
            board.style.gridGap = '12px';
            board.style.justifyContent = 'center';
            board.style.margin = '0 auto 1em auto';
            colors.forEach(color => {
                const btn = document.createElement('button');
                btn.style.width = '70px';
                btn.style.height = '70px';
                btn.style.border = '3px solid #fff';
                btn.style.borderRadius = '15px';
                btn.style.background = colorHex[color];
                btn.style.opacity = '0.7';
                btn.style.transition = 'opacity 0.2s';
                btn.setAttribute('aria-label', color + ' button');
                btn.addEventListener('click', () => {
                    if (!canClick) return;
                    flash(btn, false);
                    if (colors.indexOf(color) === sequence[userStep]) {
                        userStep++;
                        if (userStep === sequence.length) {
                            round++;
                            if (round === 5) {
                                status.textContent = 'You win! 🎉';
                                addFunCountdown(60);
                                setTimeout(() => {
                                    const nextBtn = document.querySelector('#fun-level6 .complete-level-btn');
                                    if (nextBtn) nextBtn.click();
                                    else showLevel(6);
                                }, 900);
                                return;
                            }
                            setTimeout(() => {
                                status.textContent = 'Good! Next round...';
                                nextRound();
                            }, 700);
                        }
                    } else {
                        canClick = false;
                        status.textContent = 'Wrong! Try again.';
                        setTimeout(() => {
                            round = 0;
                            sequence = [];
                            nextRound();
                        }, 1200);
                    }
                });
                board.appendChild(btn);
                buttons[color] = btn;
            });
            simonRoot.appendChild(board);
            function flash(btn, isPlayback) {
                if (isPlayback) {
                    btn.style.boxShadow = '0 0 32px 8px #fff, 0 0 16px 6px #fff';
                    btn.style.opacity = '1';
                    btn.style.filter = 'brightness(2.5)';
                    setTimeout(() => {
                        btn.style.opacity = '0.7';
                        btn.style.boxShadow = '';
                        btn.style.filter = '';
                    }, 650);
                } else {
                    btn.style.opacity = '1';
                    btn.style.boxShadow = '0 0 16px 4px #fff';
                    btn.style.filter = 'brightness(1.8)';
                    setTimeout(() => {
                        btn.style.opacity = '0.7';
                        btn.style.boxShadow = '';
                        btn.style.filter = '';
                    }, 220);
                }
            }
            function playSequence() {
                canClick = false;
                let i = 0;
                status.textContent = 'Watch the sequence!';
                function step() {
                    if (i >= sequence.length) {
                        canClick = true;
                        status.textContent = 'Your turn!';
                        userStep = 0;
                        return;
                    }
                    const btn = buttons[colors[sequence[i]]];
                    flash(btn, true);
                    setTimeout(() => {
                        i++;
                        step();
                    }, 800);
                }
                setTimeout(step, 700);
            }
            function nextRound() {
                userStep = 0;
                sequence.push(Math.floor(Math.random() * 4));
                playSequence();
            }
            nextRound();
        }

        // Fisher-Yates shuffle
        function shuffle(arr) {
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
        }
    })(); // Close funLevels function

    // Complete initialization performance timing
    DEBUG.performance.end('funPageInit');
    DEBUG.log('Fun page initialization completed');

})(); // Close main DOMContentLoaded function

// === DEBUG CONSOLE UI ===
if (DEBUG.enabled) {
    // Create debug console
    const debugConsole = document.createElement('div');
    debugConsole.id = 'debug-console';
    debugConsole.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        width: 400px;
        max-height: 300px;
        background: rgba(0, 0, 0, 0.9);
        color: #00f5d4;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        border: 2px solid #00f5d4;
        border-radius: 8px;
        z-index: 9998;
        display: none;
        overflow: hidden;
    `;
    
    const debugHeader = document.createElement('div');
    debugHeader.style.cssText = `
        background: #00f5d4;
        color: black;
        padding: 8px 12px;
        font-weight: bold;
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;
    debugHeader.innerHTML = `
        <span>🐛 Debug Console</span>
        <button id="debug-clear" style="background: transparent; border: none; color: black; cursor: pointer; font-size: 14px;">Clear</button>
    `;
    
    const debugContent = document.createElement('div');
    debugContent.id = 'debug-content';
    debugContent.style.cssText = `
        padding: 12px;
        max-height: 240px;
        overflow-y: auto;
        line-height: 1.4;
    `;
    
    debugConsole.appendChild(debugHeader);
    debugConsole.appendChild(debugContent);
    document.body.appendChild(debugConsole);
    
    // Debug toggle button
    const debugToggle = document.createElement('button');
    debugToggle.innerHTML = '🐛';
    debugToggle.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        background: #00f5d4;
        border: none;
        border-radius: 50%;
        font-size: 20px;
        cursor: pointer;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0, 245, 212, 0.3);
        transition: all 0.3s ease;
    `;
    
    debugToggle.addEventListener('click', () => {
        const isVisible = debugConsole.style.display !== 'none';
        debugConsole.style.display = isVisible ? 'none' : 'block';
        debugToggle.style.background = isVisible ? '#00f5d4' : '#ff4757';
    });
    
    document.body.appendChild(debugToggle);
    
    // Clear button functionality
    document.getElementById('debug-clear').addEventListener('click', () => {
        debugContent.innerHTML = '';
    });
    
    // Override DEBUG.log to also show in console
    const originalLog = DEBUG.log;
    DEBUG.log = function(message, data = null) {
        originalLog.call(this, message, data);
        if (debugContent) {
            const logEntry = document.createElement('div');
            logEntry.style.color = '#00f5d4';
            logEntry.innerHTML = `<span style="color: #888;">[${new Date().toLocaleTimeString()}]</span> ${message}`;
            debugContent.appendChild(logEntry);
            debugContent.scrollTop = debugContent.scrollHeight;
        }
    };
    
    const originalError = DEBUG.error;
    DEBUG.error = function(message, error = null) {
        originalError.call(this, message, error);
        if (debugContent) {
            const logEntry = document.createElement('div');
            logEntry.style.color = '#ff4757';
            logEntry.innerHTML = `<span style="color: #888;">[${new Date().toLocaleTimeString()}]</span> ❌ ${message}`;
            debugContent.appendChild(logEntry);
            debugContent.scrollTop = debugContent.scrollHeight;
        }
    };
    
    const originalWarn = DEBUG.warn;
    DEBUG.warn = function(message, data = null) {
        originalWarn.call(this, message, data);
        if (debugContent) {
            const logEntry = document.createElement('div');
            logEntry.style.color = '#ffa502';
            logEntry.innerHTML = `<span style="color: #888;">[${new Date().toLocaleTimeString()}]</span> ⚠️ ${message}`;
            debugContent.appendChild(logEntry);
            debugContent.scrollTop = debugContent.scrollHeight;
        }
    };
    
    DEBUG.log('Debug console initialized');
}

// Enhanced confetti function with debugging
function confetti() {
    DEBUG.performance.start('confettiAnimation');
    DEBUG.log('Confetti animation started');
    
    try {
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
        
        DEBUG.performance.end('confettiAnimation');
        DEBUG.log('Confetti animation completed successfully');
    } catch (error) {
        DEBUG.error('Error in confetti animation:', error);
    }
}
window.confetti = confetti;

// Expose debugging utilities globally for development
if (DEBUG.enabled) {
    window.DEBUG = DEBUG;
    window.safeSelect = safeSelect;
    window.safeAddEventListener = safeAddEventListener;
    DEBUG.log('Debug utilities exposed to window object');
}
