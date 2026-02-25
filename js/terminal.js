// Terminal Portfolio - 完整版 JavaScript

document.addEventListener('DOMContentLoaded', function () {

    // ===== 桌面開場動畫 =====
    const desktopOverlay = document.getElementById('desktop-overlay');
    const cmdIcon = document.getElementById('cmd-icon');
    const miniWindow = document.getElementById('mini-cmd-window');
    const taskbarTime = document.getElementById('taskbar-time');

    // 工作列時鐘
    function updateClock() {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        if (taskbarTime) taskbarTime.textContent = `${h}:${m}`;
    }
    updateClock();
    setInterval(updateClock, 1000);

    // 主頁面從圖示中心放大展開
    const terminalContainer = document.querySelector('.terminal-container');

    // 初始狀態：主頁面縮小到 0（覆蓋層後面看不到）
    if (terminalContainer && desktopOverlay) {
        terminalContainer.style.transform = 'scale(0)';
        terminalContainer.style.transformOrigin = '50% 50%';
    }

    function launchFromIcon() {
        if (!desktopOverlay) return;
        if (desktopOverlay.dataset.launched) return;
        desktopOverlay.dataset.launched = 'true';

        if (cmdIcon) cmdIcon.classList.add('selected');

        // 計算圖示中心相對於視窗的百分比，設為放大原點
        const iconRect = cmdIcon
            ? cmdIcon.getBoundingClientRect()
            : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
        const originX = ((iconRect.left + iconRect.width / 2) / window.innerWidth * 100).toFixed(1) + '%';
        const originY = ((iconRect.top + iconRect.height / 2) / window.innerHeight * 100).toFixed(1) + '%';

        if (terminalContainer) {
            terminalContainer.style.transformOrigin = `${originX} ${originY}`;
            terminalContainer.style.transition = 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)';
            terminalContainer.style.transform = 'scale(1)';
        }

        // 同步淡出桌面覆蓋層
        desktopOverlay.classList.add('fade-out');
        setTimeout(() => {
            desktopOverlay.remove();
            if (terminalContainer) terminalContainer.style.transition = '';
            document.dispatchEvent(new CustomEvent('portfolioReady'));
        }, 600);
    }

    // 雙擊觸發（桌面）
    if (cmdIcon) {
        cmdIcon.addEventListener('dblclick', launchFromIcon);
    }

    // 雙觸觸發（手機）
    if (cmdIcon) {
        let tapCount = 0;
        let tapTimer = null;
        cmdIcon.addEventListener('touchend', (e) => {
            e.preventDefault();
            tapCount++;
            if (tapCount === 1) {
                tapTimer = setTimeout(() => { tapCount = 0; }, 350);
            } else if (tapCount >= 2) {
                clearTimeout(tapTimer);
                tapCount = 0;
                launchFromIcon();
            }
        });
    }

    // ===== 假游標自動動畫 =====
    const fakeCursor = document.getElementById('fake-cursor');
    if (fakeCursor && cmdIcon) {
        function clickAnim(cb) {
            fakeCursor.classList.add('clicking');
            setTimeout(() => {
                fakeCursor.classList.remove('clicking');
                if (cb) setTimeout(cb, 100);
            }, 180);
        }

        function runCursorAnim() {
            if (desktopOverlay && desktopOverlay.dataset.launched) return;

            const iconRect = cmdIcon.getBoundingClientRect();
            const targetX = iconRect.left + iconRect.width / 2;
            const targetY = iconRect.top + iconRect.height / 2;

            // 游標從中間偏右下進入
            fakeCursor.style.transition = 'none';
            fakeCursor.style.left = (window.innerWidth * 0.62) + 'px';
            fakeCursor.style.top = (window.innerHeight * 0.62) + 'px';
            fakeCursor.style.opacity = '0';

            setTimeout(() => {
                fakeCursor.style.opacity = '1';
                fakeCursor.style.transition =
                    'left 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94),' +
                    'top  0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94),' +
                    'opacity 0.2s ease';
                fakeCursor.style.left = targetX + 'px';
                fakeCursor.style.top = targetY + 'px';

                // 抵達後雙擊
                setTimeout(() => {
                    clickAnim(() => {
                        clickAnim(() => {
                            fakeCursor.style.opacity = '0';
                            setTimeout(launchFromIcon, 80);
                        });
                    });
                }, 500);
            }, 80);
        }

        runCursorAnim();
    }

    // ===== 工作年資 =====
    function calculateYearsOfExperience() {
        const startDate = new Date(2019, 2);
        const currentDate = new Date();
        let years = currentDate.getFullYear() - startDate.getFullYear();
        const months = currentDate.getMonth() - startDate.getMonth();
        if (months < 0 || (months === 0 && currentDate.getDate() < startDate.getDate())) {
            years--;
        }
        return years < 1 ? 1 : years;
    }

    const yearsElement = document.getElementById('years-experience');
    if (yearsElement) {
        yearsElement.textContent = calculateYearsOfExperience();
    }

    // ===== 打字機效果 =====
    function typeWriter(element, text, speed = 100) {
        return new Promise((resolve) => {
            let i = 0;
            function type() {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                    setTimeout(type, speed);
                } else {
                    resolve();
                }
            }
            type();
        });
    }

    // ===== 捲軸與可見性控制 =====
    const terminalBody = document.querySelector('.terminal-body');
    const allLines = document.querySelectorAll('.cmd-line, .output-line');

    let lineCache = [];
    function updateLineCache() {
        lineCache = Array.from(allLines).map(line => ({
            element: line,
            top: line.offsetTop,
            height: line.offsetHeight
        }));
    }

    window.addEventListener('resize', updateLineCache);
    updateLineCache();

    let ticking = false;
    function updateLinesVisibility() {
        if (!terminalBody) return;
        const scrollTop = terminalBody.scrollTop;
        const viewportHeight = terminalBody.clientHeight;
        const fadeZoneHeight = viewportHeight * 0.3;
        const fadeStartPosition = viewportHeight - fadeZoneHeight;

        lineCache.forEach(cache => {
            const line = cache.element;
            const relativeTop = cache.top - scrollTop;
            if (relativeTop < fadeStartPosition) {
                line.style.opacity = '1';
                line.style.transform = 'translateX(0)';
            } else if (relativeTop < viewportHeight) {
                const progress = 1 - ((relativeTop - fadeStartPosition) / fadeZoneHeight);
                const easedProgress = Math.pow(progress, 0.5);
                line.style.opacity = easedProgress;
                line.style.transform = `translateX(${-10 * (1 - easedProgress)}px)`;
            } else {
                line.style.opacity = '0';
                line.style.transform = 'translateX(-10px)';
            }
        });
        ticking = false;
    }

    if (terminalBody) {
        terminalBody.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateLinesVisibility);
                ticking = true;
            }
        });

        document.querySelectorAll('.achievement-item').forEach(item => {
            item.addEventListener('toggle', () => { setTimeout(updateLineCache, 350); });
        });

        updateLinesVisibility();
    }

    // ===== Smooth scrolling =====
    const menuLinks = document.querySelectorAll('.menu-link');
    menuLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ===== Highlight menu =====
    if (terminalBody) {
        terminalBody.addEventListener('scroll', () => {
            let current = '';
            document.querySelectorAll('.cmd-section').forEach(section => {
                if (terminalBody.scrollTop >= section.offsetTop - 100) {
                    current = section.getAttribute('id');
                }
            });
            menuLinks.forEach(link => {
                const isActive = link.getAttribute('href') === '#' + current;
                link.style.color = isActive ? '#a8c0ff' : '#7a9cff';
                link.style.fontWeight = isActive ? '600' : '400';
            });
        });
    }

    // ===== Section Typing (Intersection Observer) =====
    async function initSectionTyping(config) {
        const { commandId, contentId, command } = config;
        const commandElement = document.getElementById(commandId);
        const contentElement = document.getElementById(contentId);
        if (!commandElement || !contentElement) return;

        await typeWriter(commandElement, command, 12);
        await new Promise(resolve => setTimeout(resolve, 300));
        contentElement.style.opacity = '1';
        contentElement.style.transition = 'opacity 0.5s ease-in';

        const lines = contentElement.querySelectorAll(
            '.output-line, .json-output, .skills-columns, .stats-container, .stats-container-left'
        );
        lines.forEach((line, index) => {
            line.style.opacity = '0';
            setTimeout(() => {
                line.style.opacity = '1';
                line.style.transition = 'opacity 0.3s ease-in';
                updateLineCache();
            }, index * 80);
        });

        // 等待前面的文字全數顯示完畢後，再透過 IntersectionObserver 偵測捲動顯示
        const codeWindows = contentElement.querySelectorAll('.code-window');
        if (codeWindows.length > 0) {
            codeWindows.forEach(cw => {
                let linesBefore = 0;
                for (const line of lines) {
                    if (cw.contains(line) || cw === line) break;
                    if (!cw.contains(line)) linesBefore++;
                }

                setTimeout(() => {
                    const codeWindowObserver = new IntersectionObserver((entries, observer) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                entry.target.classList.add('visible');
                                observer.unobserve(entry.target);
                            }
                        });
                    }, { root: null, threshold: 0.1 });
                    codeWindowObserver.observe(cw);
                }, linesBefore * 80 + 400); // 前面行數跑完後再多加 400ms 的緩衝時間
            });
        }
    }

    const sectionConfigs = [
        { commandId: 'typing-about-cmd', contentId: 'about-content', command: 'cat about.txt' },
        { commandId: 'typing-skills-cmd', contentId: 'skills-content', command: 'ls -la skills/' },
        { commandId: 'typing-experience-cmd', contentId: 'experience-content', command: 'cat projects_experience.md' },
        { commandId: 'typing-projects-cmd', contentId: 'projects-content', command: 'cat opensource_projects.md' },
        { commandId: 'typing-blog-cmd', contentId: 'blog-content', command: 'ls -l note/' },
        { commandId: 'typing-stats-cmd', contentId: 'stats-content', command: 'cat stats.json' },
        { commandId: 'typing-contact-cmd', contentId: 'contact-content', command: 'cat contact.txt' }
    ];

    const observerRoot = terminalBody || null;
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.animated) {
                const sectionId = entry.target.id;
                if (sectionId === 'about-content') return;
                const config = sectionConfigs.find(s => s.contentId === sectionId);
                if (config) {
                    initSectionTyping(config);
                    entry.target.dataset.animated = 'true';
                }
            }
        });
    }, { root: observerRoot, threshold: 0.05, rootMargin: '0px 0px -10% 0px' });

    sectionConfigs.forEach(config => {
        const element = document.getElementById(config.contentId);
        if (element && config.contentId !== 'about-content') {
            sectionObserver.observe(element);
        }
    });

    // ===== 初始打字動畫（等桌面覆蓋層完成後才啟動）=====
    const initCmdElement = document.getElementById('typing-init-cmd');
    const initMsg1Element = document.getElementById('init-message-1');
    const initMsg2Element = document.getElementById('init-message-2');
    const mottoCmdLineEl = document.getElementById('motto-cmd-line');
    const mottoCmdElement = document.getElementById('typing-motto-cmd');
    const mottoContentEl = document.getElementById('motto-content');
    const mottoElement = document.getElementById('typing-motto');

    function startPortfolio() {
        (async () => {
            await new Promise(r => setTimeout(r, 200));

            // 1. ./init_portfolio.sh
            if (initCmdElement) {
                await typeWriter(initCmdElement, './init_portfolio.sh', 12);
            }
            await new Promise(r => setTimeout(r, 80));

            // 2. Initializing portfolio...
            if (initMsg1Element) {
                initMsg1Element.style.opacity = '1';
                initMsg1Element.style.transition = 'opacity 0.3s ease-in';
                await typeWriter(initMsg1Element, 'Initializing portfolio...', 12);
            }
            await new Promise(r => setTimeout(r, 60));

            // 3. Loading developer profile...
            if (initMsg2Element) {
                initMsg2Element.style.opacity = '1';
                initMsg2Element.style.transition = 'opacity 0.3s ease-in';
                await typeWriter(initMsg2Element, 'Loading developer profile...', 12);
            }
            await new Promise(r => setTimeout(r, 120));

            // 4. echo $MOTTO
            if (mottoCmdLineEl) {
                mottoCmdLineEl.style.opacity = '1';
                mottoCmdLineEl.style.transition = 'opacity 0.3s ease-in';
            }
            await new Promise(r => setTimeout(r, 80));
            if (mottoCmdElement) await typeWriter(mottoCmdElement, 'echo $MOTTO', 12);
            await new Promise(r => setTimeout(r, 80));

            // 5. 成就感來自於學習
            if (mottoContentEl) {
                mottoContentEl.style.opacity = '1';
                mottoContentEl.style.transition = 'opacity 0.4s ease-in';
            }
            await new Promise(r => setTimeout(r, 100));
            if (mottoElement) await typeWriter(mottoElement, '成就感來自於學習', 80);
            await new Promise(r => setTimeout(r, 300));

            // 6. cat about.txt（成就感跑完後才開始）
            const aboutContent = document.getElementById('about-content');
            if (aboutContent && !aboutContent.dataset.animated) {
                initSectionTyping({
                    commandId: 'typing-about-cmd',
                    contentId: 'about-content',
                    command: 'cat about.txt'
                });
                aboutContent.dataset.animated = 'true';
            }
        })();
    }

    // 有桌面覆蓋層 → 等 portfolioReady；否則直接啟動
    if (document.getElementById('desktop-overlay')) {
        document.addEventListener('portfolioReady', startPortfolio, { once: true });
    } else {
        startPortfolio();
    }

});
