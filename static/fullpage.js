// 全屏滚动功能，PC端专用
(function() {
    // 获取所有section（只选取一级section，避免home-blank等）
    const sections = Array.from(document.querySelectorAll('.home-page > .section1, .home-page > .section2, .home-page > .section3, .home-page > .section4, .home-page > .section5, .home-page > .section6, .home-page > .section7, .home-page > .section8, .home-page > .section9, .home-page > .section10, .home-page > .section11, .home-page > .section12, .home-page > .section13, .home-page > .section14, .home-page > .section15, footer'));
    if (!sections.length) return;
    let current = 0;
    let isScrolling = false;

    // 右侧导航点
    function createNav() {
        const nav = document.createElement('div');
        nav.className = 'fp-dots';
        sections.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.className = 'fp-dot' + (i === 0 ? ' active' : '');
            dot.addEventListener('click', () => scrollTo(i));
            nav.appendChild(dot);
        });
        document.body.appendChild(nav);
    }

    function updateNav() {
        document.querySelectorAll('.fp-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === current);
        });
    }

    function scrollTo(idx) {
        if (isScrolling || idx < 0 || idx >= sections.length) return;
        isScrolling = true;
        current = idx;
        // 计算目标section距离页面顶部的距离
        const rect = sections[idx].getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const targetY = rect.top + scrollTop - 70;
        window.scrollTo({ top: targetY, behavior: 'smooth' });
        updateNav();
        setTimeout(() => { isScrolling = false; }, 700);
    }

    // 鼠标滚轮事件
    let wheelTimeout = null;
    window.addEventListener('wheel', function(e) {
        if (isScrolling) return;
        e.preventDefault();
        clearTimeout(wheelTimeout);
        wheelTimeout = setTimeout(() => {
            if (e.deltaY > 0) {
                scrollTo(current + 1);
            } else if (e.deltaY < 0) {
                scrollTo(current - 1);
            }
        }, 40);
    }, {passive: false});

    // 键盘事件
    window.addEventListener('keydown', function(e) {
        if (isScrolling) return;
        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
            scrollTo(current + 1);
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            scrollTo(current - 1);
        }
    });

    // 滚动后自动修正current
    window.addEventListener('scroll', function() {
        if (isScrolling) return;
        let minDist = Infinity, idx = current;
        sections.forEach((sec, i) => {
            const rect = sec.getBoundingClientRect();
            const dist = Math.abs(rect.top);
            if (dist < minDist) {
                minDist = dist;
                idx = i;
            }
        });
        if (idx !== current) {
            current = idx;
            updateNav();
        }
    });

    // section9 动画控制
    function section9Effects() {
        const section9 = document.querySelector('.section9');
        if (!section9) return;
        // 掉落图片
        const fall1 = section9.querySelector('.section9-fallimg1');
        const fall2 = section9.querySelector('.section9-fallimg2');
        const mid1 = section9.querySelector('.section9-midimg1');
        const mid2 = section9.querySelector('.section9-midimg2');
        let fallDone = false;
        // 进入section9时触发掉落
        function triggerFall() {
            if (fallDone) return;
            setTimeout(() => {
                fall1.classList.add('falling');
                fall2.classList.add('falling');
                setTimeout(() => {
                    mid1.classList.add('glow');
                    mid2.classList.add('glow');
                }, 800);
            }, 1000);
            fallDone = true;
        }
        // 监听滚动，进入section9时触发
        window.addEventListener('scroll', function() {
            const rect = section9.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.5 && rect.bottom > window.innerHeight * 0.3) {
                triggerFall();
            }
        });
        // 水滴动画hover已用CSS实现
        // 滚动到下一个section时，四角图片离场
        window.addEventListener('scroll', function() {
            const rect = section9.getBoundingClientRect();
            if (rect.bottom < window.innerHeight * 0.4) {
                section9.classList.add('out-move');
            } else {
                section9.classList.remove('out-move');
            }
        });
    }
    section9Effects();

    // section11 动画控制
    function section11Effects() {
        const section11 = document.querySelector('.section11');
        if (!section11) return;
        let lastState = false;
        function playAnim() {
            section11.classList.add('open');
        }
        function resetAnim() {
            section11.classList.remove('open');
            // 强制reflow以便下次进入能重新播放动画
            void section11.offsetWidth;
        }
        window.addEventListener('scroll', function() {
            const rect = section11.getBoundingClientRect();
            const inView = rect.top < window.innerHeight * 0.5 && rect.bottom > window.innerHeight * 0.3;
            if (inView && !lastState) {
                playAnim();
                lastState = true;
            } else if (!inView && lastState) {
                resetAnim();
                lastState = false;
            }
        });
    }
    section11Effects();

    // 初始化
    createNav();
    updateNav();
})();
