// Terminal Portfolio - 完整版 JavaScript (包含打字特效、年資計算與效能優化)

document.addEventListener('DOMContentLoaded', function () {
    // 計算工作年資 (從 2019/3 到現在)
    function calculateYearsOfExperience() {
        const startDate = new Date(2019, 2); // 2019年3月
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

    // 打字機效果
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

    // ===== 初始化區塊打字機特效 =====
    const initCmdElement = document.getElementById('typing-init-cmd');
    const initMsg1Element = document.getElementById('init-message-1');
    const initMsg2Element = document.getElementById('init-message-2');
    const mottoCmdLineElement = document.getElementById('motto-cmd-line');
    const mottoCmdElement = document.getElementById('typing-motto-cmd');
    const mottoContentElement = document.getElementById('motto-content');
    const mottoElement = document.getElementById('typing-motto');

    if (initCmdElement && initMsg1Element && initMsg2Element && mottoElement) {
        (async function () {
            await new Promise(resolve => setTimeout(resolve, 200));
            await typeWriter(initCmdElement, './init_portfolio.sh', 30);
            await new Promise(resolve => setTimeout(resolve, 150));

            initMsg1Element.style.opacity = '1';
            initMsg1Element.style.transition = 'opacity 0.3s ease-in';
            await typeWriter(initMsg1Element, 'Initializing portfolio...', 30);
            await new Promise(resolve => setTimeout(resolve, 150));

            initMsg2Element.style.opacity = '1';
            initMsg2Element.style.transition = 'opacity 0.3s ease-in';
            await typeWriter(initMsg2Element, 'Loading developer profile...', 30);
            await new Promise(resolve => setTimeout(resolve, 250));

            mottoCmdLineElement.style.opacity = '1';
            mottoCmdLineElement.style.transition = 'opacity 0.3s ease-in';
            await new Promise(resolve => setTimeout(resolve, 150));

            await typeWriter(mottoCmdElement, 'echo $MOTTO', 30);
            await new Promise(resolve => setTimeout(resolve, 150));

            mottoContentElement.style.opacity = '1';
            mottoContentElement.style.transition = 'opacity 0.3s ease-in';
            await new Promise(resolve => setTimeout(resolve, 150));

            await typeWriter(mottoElement, '成就感來自於學習', 150);
            await new Promise(resolve => setTimeout(resolve, 300));

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

    // Smooth scrolling
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

    // ===== 效能優化：捲軸與可見性控制 =====
    const terminalBody = document.querySelector('.terminal-body');
    const allLines = document.querySelectorAll('.cmd-line, .output-line');

    // 效能快取：存儲元素的 offsetTop，避免捲軸時頻繁觸發 Layout
    let lineCache = [];
    function updateLineCache() {
        lineCache = Array.from(allLines).map(line => ({
            element: line,
            top: line.offsetTop,
            height: line.offsetHeight
        }));
    }

    window.addEventListener('resize', updateLineCache);
    updateLineCache(); // 初始計算

    let ticking = false;
    function updateLinesVisibility() {
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

        // 監聽收合區塊的切換事件，展開內容會改變 offsetTop，必須重新整理 cache
        const accordionItems = document.querySelectorAll('.achievement-item');
        accordionItems.forEach(item => {
            item.addEventListener('toggle', () => {
                // 延遲一下等待顯示動畫完成再更新 cache
                setTimeout(updateLineCache, 350);
            });
        });

        updateLinesVisibility();
    }

    // Highlight menu
    if (terminalBody) {
        terminalBody.addEventListener('scroll', () => {
            let current = '';
            const sectionsElements = document.querySelectorAll('.cmd-section');
            sectionsElements.forEach(section => {
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

    // ===== 整合 animations.js 邏輯 (Intersection Observer) =====
    async function initSectionTyping(config) {
        const { commandId, contentId, command } = config;
        const commandElement = document.getElementById(commandId);
        const contentElement = document.getElementById(contentId);
        if (!commandElement || !contentElement) return;

        await typeWriter(commandElement, command, 30);
        await new Promise(resolve => setTimeout(resolve, 300));

        contentElement.style.opacity = '1';
        contentElement.style.transition = 'opacity 0.5s ease-in';

        const lines = contentElement.querySelectorAll('.output-line, .json-output, .skills-columns, .stats-container, .stats-container-left');
        lines.forEach((line, index) => {
            line.style.opacity = '0';
            setTimeout(() => {
                line.style.opacity = '1';
                line.style.transition = 'opacity 0.3s ease-in';
                // 顯示後更新 cache 以確保捲軸效果準確
                updateLineCache();
            }, index * 80);
        });
    }

    const sectionConfigs = [
        { commandId: 'typing-about-cmd', contentId: 'about-content', command: 'cat about.txt' },
        { commandId: 'typing-skills-cmd', contentId: 'skills-content', command: 'ls -la skills/' },
        { commandId: 'typing-experience-cmd', contentId: 'experience-content', command: 'cat projects_experience.md' },
        { commandId: 'typing-projects-cmd', contentId: 'projects-content', command: 'cat opensource_projects.md' },
        { commandId: 'typing-blog-cmd', contentId: 'blog-content', command: 'ls -l blog/' },
        { commandId: 'typing-stats-cmd', contentId: 'stats-content', command: 'cat stats.json' },
        { commandId: 'typing-contact-cmd', contentId: 'contact-content', command: 'cat contact.txt' }
    ];

    // Edge 相容性修正：root 必須設為 scroll container (.terminal-body)
    // 若 root 不設定，預設為 document viewport，但捲軸在 .terminal-body 上
    // Edge 嚴格遵守規範，sections 相對 viewport 永遠不可見 → 動畫永不觸發
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
});
