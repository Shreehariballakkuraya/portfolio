document.addEventListener('DOMContentLoaded', function() {

    // --- Secret Unlock for Fun & Interactive Section (Konami Code + Easter Eggs + Puzzle) ---
const funSection = document.getElementById('fun-interactive');
const unlockProgress = document.getElementById('unlock-progress');
const unlockToast = document.getElementById('unlock-toast');
const logo = document.querySelector('.logo');

const konamiCode = [
    'ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'
];
let konamiIndex = 0;
let logoClicks = 0;
let unlockTimer = null;
let unlockCountdown = 60;
let unlockActive = false;
const unlockSounds = {
    correct: new Audio('https://cdn.jsdelivr.net/gh/terkelg/konami-sounds/correct.mp3'),
    wrong: new Audio('https://cdn.jsdelivr.net/gh/terkelg/konami-sounds/wrong.mp3'),
    unlock: new Audio('https://cdn.jsdelivr.net/gh/terkelg/konami-sounds/unlock.mp3')
};

// Progress dots
function renderProgress(idx, error) {
    unlockProgress.innerHTML = '';
    for (let i = 0; i < konamiCode.length; i++) {
        const dot = document.createElement('div');
        dot.className = 'unlock-dot' + (i < idx ? ' active' : '') + (error && i === idx ? ' wrong' : '');
        unlockProgress.appendChild(dot);
    }
    unlockProgress.style.display = 'flex';
}

// Toast
function showToast(msg) {
    unlockToast.textContent = msg;
    unlockToast.classList.add('show');
    setTimeout(() => unlockToast.classList.remove('show'), 3200);
}

// Confetti (simple)
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

// Curtain animation
function curtainReveal() {
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
    setTimeout(() => { curtain.remove(); }, 1800);
}

// Hide section after timer
function startUnlockTimer() {
    unlockCountdown = funCountdown;
    if (unlockTimer) clearInterval(unlockTimer);
    unlockTimer = setInterval(() => {
        unlockCountdown = funCountdown;
        unlockToast.textContent = `Secret Unlocked! Hiding in ${unlockCountdown}s`;
        if (unlockCountdown <= 0) {
            funSection.style.display = 'none';
            unlockToast.classList.remove('show');
            unlockActive = false;
            unlockProgress.style.display = 'none';
            clearInterval(unlockTimer);
        }
    }, 1000);
}

function unlockFunSection() {
    if (unlockActive) return;
    unlockActive = true;
    funSection.style.display = 'block';
    funSection.style.opacity = 0;
    funSection.style.transition = 'opacity 1s';
    setTimeout(() => { funSection.style.opacity = 1; }, 10);
    curtainReveal();
    confetti();
    showToast('Secret Unlocked! Hiding in 60s');
    unlockSounds.unlock.play();
    unlockProgress.style.display = 'none';
    startUnlockTimer();
    failedAttempts = 0; // reset on unlock
}

// DEBUG: Always show quiz for testing
// Uncomment below for debugging only
// document.addEventListener('DOMContentLoaded', function() {
//   showPuzzle();
// });


// Konami code logic
renderProgress(0);
document.addEventListener('keydown', function(e) {
    if (unlockActive) return;
    if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        unlockSounds.correct.currentTime = 0; unlockSounds.correct.play();
        renderProgress(konamiIndex);
        if (konamiIndex === konamiCode.length) {
            unlockFunSection();
            konamiIndex = 0;
            renderProgress(0);
        }
    } else {
        if (konamiIndex > 0) {
            unlockSounds.wrong.currentTime = 0; unlockSounds.wrong.play();
            renderProgress(konamiIndex, true);
            unlockProgress.classList.add('shake');
            setTimeout(() => unlockProgress.classList.remove('shake'), 500);
        }
        konamiIndex = 0;
        renderProgress(0);
        failedAttempts++;
    }
});

// Logo click easter egg
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

// Mini-puzzle fallback: If user types 'unlock' after 3 failed attempts, show a riddle
let failedAttempts = 0;
document.addEventListener('keydown', function(e) {
    if (unlockActive) return;
    if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
        if (e.key.toLowerCase() === 'u' && failedAttempts >= 3) {
            showPuzzle();
        }
    }
});
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




// --- Initialize Animate on Scroll ---
AOS.init({
    duration: 1000,
    once: true,
    offset: 100,
});

// --- Fun & Interactive Countdown Timer ---
let funCountdown = 60;
let funCountdownInterval = null;
function startFunCountdown() {
    if (funCountdownInterval) return; // already running
    updateFunCountdownDisplay();
    funCountdownInterval = setInterval(() => {
        funCountdown--;
        updateFunCountdownDisplay();
        if (funCountdown <= 0) {
            clearInterval(funCountdownInterval);
            funCountdownInterval = null;
            handleFunTimeUp();
        }
    }, 1000);
}
function addFunCountdown(seconds) {
    funCountdown += seconds;
    updateFunCountdownDisplay();
}
function updateFunCountdownDisplay() {
    const timerEl = document.getElementById('fun-timer');
    if (timerEl) {
        const mm = String(Math.floor(funCountdown / 60)).padStart(2, '0');
        const ss = String(funCountdown % 60).padStart(2, '0');
        timerEl.textContent = `Time Left: ${mm}:${ss}`;
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
    function showLevel(n) {
        console.log('[FUN] showLevel called with', n);
        for (let i = 1; i <= totalLevels; i++) {
            const el = document.getElementById('fun-level'+i);
            if (el) el.style.display = (i === n) ? 'block' : 'none';
        }
        // Always initialize games when their level is shown
        if (n === 4) initMemoryGame();
        if (n === 5) initSimonSays();
        if (n === 6) initTypingChallenge();
        if (n === 7) initLogicPuzzle();
        if (n === 8) initPixelArt();
    }
    window.showLevel = showLevel;
    // LEVEL 1: Confetti clicks
    let confettiClicks = 0;
    const confettiBtn = document.getElementById('confetti-btn');
    if (confettiBtn) {
        confettiBtn.addEventListener('click', () => {
            confettiClicks++;
            if (confettiClicks >= 5) {
                showLevel(2);
                addFunCountdown(60);
                ensureTimer();
            }
        });
    }
    // LEVEL 2: Drag to target
    const draggableArea = document.getElementById('draggable-area');
    if (draggableArea) {
        let dropTarget = document.createElement('div');
        dropTarget.textContent = 'Drop Here!';
        dropTarget.className = 'drop-target';
        dropTarget.style.cssText = 'margin:1em auto;padding:2em;background:#222;color:#00f5d4;border:2px dashed #00f5d4;text-align:center;border-radius:6px;max-width:200px;';
        draggableArea.appendChild(dropTarget);
        let completed = false;
        draggableArea.addEventListener('dragstart', e => {
            if (e.target.classList.contains('draggable-card')) {
                e.dataTransfer.setData('text/plain', 'dragged');
            }
        });
        dropTarget.addEventListener('dragover', e => {
            e.preventDefault();
        });
        dropTarget.addEventListener('drop', e => {
            e.preventDefault();
            if (!completed) {
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
    }
    // LEVEL 3: Quiz
    const quizContainer = document.getElementById('quiz-container');
    if (quizContainer) {
        showPuzzle(function onQuizComplete() {
            showLevel(4);
            addFunCountdown(60);
            initMemoryGame();
        });
    }
    // NEW LEVELS: Each has a .complete-level-btn
    document.querySelectorAll('.complete-level-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const next = parseInt(this.dataset.next, 10);
            if (next) {
                showLevel(next);
                addFunCountdown(60);
            }
        });
    });
    // DEV ONLY: Skip to Level dropdown (remove before deploy)
    const skipSel = document.getElementById('skip-to-level');
    if (skipSel) {
        skipSel.addEventListener('change', function() {
            const n = parseInt(this.value, 10);
            if (n) showLevel(n);
        });
    }
    // Show only level 1 at start
    showLevel(1);
})();

    // LEVEL 4: Memory Game
    function initMemoryGame() {
        const memoryGameRoot = document.getElementById('memory-game-root');
        if (!memoryGameRoot) return;
        memoryGameRoot.innerHTML = '';
        const emojis = ['🍎','🍌','🍇','🍒','🍉','🍋'];
        const cardsArr = [...emojis, ...emojis];
        shuffle(cardsArr);
        let flipped = [];
        let matched = [];
        let lock = false;
        // Create a 4x3 grid
        memoryGameRoot.style.display = 'grid';
        memoryGameRoot.style.gridTemplateColumns = 'repeat(4, 60px)';
        memoryGameRoot.style.gridGap = '12px';
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
                if (lock || matched.includes(idx) || flipped.includes(idx)) return;
                this.querySelector('.card-back').style.display = 'none';
                this.querySelector('.card-front').style.display = 'block';
                flipped.push(idx);
                if (flipped.length === 2) {
                    lock = true;
                    setTimeout(() => {
                        const [i1,i2] = flipped;
                        const c1 = memoryGameRoot.querySelector('[data-idx="'+i1+'"]');
                        const c2 = memoryGameRoot.querySelector('[data-idx="'+i2+'"]');
                        if (cardsArr[i1] === cardsArr[i2]) {
                            matched.push(i1,i2);
                            if (matched.length === cardsArr.length) {
                                setTimeout(() => {
                                    memoryGameRoot.innerHTML = '<div class="quiz-result">All pairs matched! 🎉</div>';
                                    addFunCountdown(60);
                                    setTimeout(() => {
                                        showLevel(5);
                                    }, 1000);
                                }, 600);
                                return;
                            }
                        } else {
                            c1.querySelector('.card-back').style.display = 'block';
                            c1.querySelector('.card-front').style.display = 'none';
                            c2.querySelector('.card-back').style.display = 'block';
                            c2.querySelector('.card-front').style.display = 'none';
                        }
                        flipped = [];
                        lock = false;
                    }, 700);
                }
            });
            memoryGameRoot.appendChild(card);
        });
    }


    // LEVEL 8: Pixel Art Coloring
    function initPixelArt() {
        const root = document.getElementById('pixel-art-root');
        if (!root) return;
        root.innerHTML = '';
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

    // LEVEL 7: Logic Puzzle (Lights Out)
    function initLogicPuzzle() {
        const root = document.getElementById('logic-puzzle-root');
        if (!root) return;
        root.innerHTML = '';
        const size = 3;
        let grid = Array(size * size).fill(0).map(() => Math.random() > 0.5 ? 1 : 0);
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
        prompt.innerHTML = sentence.split('').map((ch,i) => `<span data-idx="${i}" style="padding:1px 2px;">${ch === ' ' ? '&nbsp;' : ch}</span>`).join('');
        container.appendChild(prompt);
        const input = document.createElement('input');
        input.type = 'text';
        input.autocomplete = 'off';
        input.spellcheck = false;
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
                status.innerHTML = `Completed in <b>${elapsed.toFixed(2)}</b> seconds!<br>WPM: <b>${wpm}</b> &nbsp; Accuracy: <b>${accuracy}%</b> 🎉`;
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


    // --- Initialize Animate on Scroll ---
    AOS.init({
        duration: 1000,
        once: true,
        offset: 100,
    });

    // --- Sticky Navbar & Active Link Highlighting ---
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('nav ul li a');
    const sections = Array.from(navLinks).map(link => document.querySelector(link.getAttribute('href')));

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
    const titleText = "Shreehari Ballakkuraya";
    const subtitleText = "Building intelligent solutions with data and code.";
    heroTitle.textContent = '';
    heroSubtitle.textContent = '';
    typeWriter(heroTitle, titleText, 0, () => {
        typeWriter(heroSubtitle, subtitleText, 0);
    });


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

    // --- Fun & Interactive Section Logic ---
    const confettiBtn = document.getElementById('confetti-btn');
    if (confettiBtn) {
        confettiBtn.addEventListener('click', (e) => {
            const confettiContainer = document.createElement('div');
            Object.assign(confettiContainer.style, {
                position: 'fixed', left: `${e.clientX}px`, top: `${e.clientY}px`,
                pointerEvents: 'none', zIndex: 9999
            });
            document.body.appendChild(confettiContainer);
            for (let i = 0; i < 30; i++) {
                const confetto = document.createElement('span');
                confetto.textContent = ['🎉', '✨', '🥳', '💥', '🎊'][Math.floor(Math.random() * 5)];
                Object.assign(confetto.style, {
                    position: 'absolute',
                    fontSize: `${16 + Math.random() * 18}px`,
                    transform: 'translate(-50%, -50%)',
                    opacity: 1,
                    transition: 'all 1.2s cubic-bezier(.17,.67,.83,.67)'
                });
                confettiContainer.appendChild(confetto);
                setTimeout(() => {
                    confetto.style.transform = `translate(${Math.random()*200-100}px, ${Math.random()*150-50}px) rotate(${Math.random()*360}deg)`;
                    confetto.style.opacity = 0;
                }, 10);
            }
            setTimeout(() => confettiContainer.remove(), 1400);
        });
    }

    const runCodeBtn = document.getElementById('run-code');
    if (runCodeBtn) {
        runCodeBtn.addEventListener('click', () => {
            const html = document.getElementById('playground-html').value;
            const css = `<style>${document.getElementById('playground-css').value}</style>`;
            const js = `<script>${document.getElementById('playground-js').value}<\/script>`;
            document.getElementById('playground-preview').srcdoc = `${css}${html}${js}`;
        });
    }

    // --- Particles.js Config ---
    if (typeof particlesJS !== 'undefined') {
        particlesJS("particles-js", { "particles": { "number": { "value": 60, "density": { "enable": true, "value_area": 800 } }, "color": { "value": "#ffffff" }, "shape": { "type": "circle" }, "opacity": { "value": 0.5, "random": true }, "size": { "value": 3, "random": true }, "line_linked": { "enable": true, "distance": 150, "color": "#ffffff", "opacity": 0.4, "width": 1 }, "move": { "enable": true, "speed": 2, "direction": "none", "out_mode": "out" } }, "interactivity": { "detect_on": "canvas", "events": { "onhover": { "enable": true, "mode": "grab" }, "onclick": { "enable": true, "mode": "push" } }, "modes": { "grab": { "distance": 140, "line_linked": { "opacity": 1 } }, "push": { "particles_nb": 4 } } }, "retina_detect": true });
    }

});