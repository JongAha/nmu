// section9 SVG水滴大幅度不规则晃动动画（GSAP+MorphSVG）
document.addEventListener('DOMContentLoaded', function () {
    if (window.MorphSVGPlugin && gsap && gsap.registerPlugin) {
        gsap.registerPlugin(MorphSVGPlugin);
    }
    const droplets = document.querySelectorAll('.section9-droplet');
    // 多种大幅度水滴形状path
    const shapes = [
        // 椭圆
        'M45,10 Q80,20 70,45 Q80,80 45,70 Q10,80 20,45 Q10,20 45,10 Z',
        // 圆滑四边形
        'M45,10 Q80,25 80,45 Q80,70 45,80 Q10,70 10,45 Q10,25 45,10 Z',
        // 五边形
        'M45,10 Q80,20 75,45 Q80,80 45,80 Q10,80 15,45 Q10,20 45,10 Z',
        // 六边形
        'M45,10 Q70,20 80,45 Q70,70 45,80 Q20,70 10,45 Q20,20 45,10 Z',
        // 不规则水滴
        'M45,10 Q85,30 70,50 Q80,85 45,75 Q10,85 20,50 Q5,30 45,10 Z',
        // 夸张椭圆
        'M45,10 Q90,45 45,80 Q0,45 45,10 Z',
        // 原始圆形
        'M45,10 Q80,10 80,45 Q80,80 45,80 Q10,80 10,45 Q10,10 45,10 Z'
    ];
    droplets.forEach(svg => {
        const path = svg.querySelector('path');
        if (!path) return;
        // 缓慢大幅度不规则晃动
        function morphLoop() {
            const idx = Math.floor(Math.random() * shapes.length);
            gsap.to(path, {
                duration: gsap.utils.random(2.2, 3.2),
                morphSVG: shapes[idx],
                ease: 'sine.inOut',
                onComplete: morphLoop
            });
        }
        morphLoop();
        // hover变形动画
        svg.addEventListener('mouseenter', () => {
            gsap.to(path, {
                duration: 0.5,
                morphSVG: shapes[4], // 不规则水滴
                ease: 'elastic.out(1, 0.5)'
            });
            svg.classList.add('gsap-hover');
        });
        svg.addEventListener('mouseleave', () => {
            gsap.to(path, {
                duration: 0.7,
                morphSVG: shapes[0], // 椭圆
                ease: 'expo.out'
            });
            svg.classList.remove('gsap-hover');
        });
    });
});

// section10 动画逻辑
(function(){
    function playSection10Animation() {
        const leftImgWrap = document.querySelector('.section10-bg-left');
        const rightImgWrap = document.querySelector('.section10-bg-right');
        const leftImg = document.querySelector('.section10-left-img');
        const rightImg = document.querySelector('.section10-right-img');
        const ball = document.querySelector('.section10-ball');
        const popup1 = document.querySelector('.section10-popup1');
        const popup2 = document.querySelector('.section10-popup2');
        const popup3 = document.querySelector('.section10-popup3');
        if (!leftImgWrap || !rightImgWrap || !ball) return;

        // 修正popup2布局：文字在左，图片在右
        if (popup2) {
            const text = popup2.querySelector('.section10-popup-text');
            const img = popup2.querySelector('.section10-popup-img');
            if (text && img) {
                popup2.style.display = 'flex';
                popup2.style.flexDirection = 'row';
                text.style.order = '0';
                img.style.order = '1';
                text.style.textAlign = 'left';
                img.style.marginLeft = '24px';
            }
        }

    // 初始状态
    gsap.set(leftImgWrap, {x: '-30%', y: '30%', opacity: 0});
    gsap.set(rightImgWrap, {x: '30%', y: '-30%', opacity: 0});
    gsap.set(ball, {x: 0, y: 0, opacity: 1});
    gsap.set([popup1, popup2, popup3], {opacity: 0});

        // 左下角图片移入
        const leftTween = gsap.to(leftImgWrap, {x: 0, y: 0, opacity: 1, duration: 1.2, ease: 'power3.out'});
        // 右上角图片移入
        const rightTween = gsap.to(rightImgWrap, {x: 0, y: 0, opacity: 1, duration: 1.2, ease: 'power3.out', delay: 0.2});

        // 多段抛物线物理弹跳路径
        const area = document.querySelector('.section10-anim-area');
        const areaW = area.offsetWidth;
        const areaH = area.offsetHeight;
        const ballSize = ball.offsetWidth;

        // 生成多段弹跳路径（始终从左上到右下，最后一跳落在右下角）
        function generateBouncePath(bounceCount) {
            const pathArr = [];
            let startX = 0, startY = 0;
            // 终点（右下角）
            const endX = areaW - ballSize - 12;
            const endY = areaH - ballSize - 12;
            // 每跳水平/竖直距离
            let dx = (endX - startX) / bounceCount;
            let dy = (endY - startY) / bounceCount;
            let maxHeight = areaH * 0.32; // 第一跳最大高度
            let decay = 0.55; // 每次弹跳高度衰减
            for (let i = 0; i < bounceCount; i++) {
                let nextX = startX + dx;
                let nextY = startY + dy;
                // 顶点高度（抛物线顶点y坐标，越小越高）
                let peakY = Math.min(startY, nextY) - maxHeight;
                let midX = (startX + nextX) / 2;
                // 路径三点：起点-顶点-终点
                pathArr.push([
                    {x: startX, y: startY},
                    {x: midX, y: peakY},
                    {x: nextX, y: nextY}
                ]);
                startX = nextX;
                startY = nextY;
                maxHeight *= decay;
            }
            return pathArr;
        }

        // 弹跳次数（4~6次，取决于区域宽度）
        let bounceCount = 5;
        if (areaW < 500 || areaH < 400) bounceCount = 4;
        if (areaW > 900 || areaH > 700) bounceCount = 6;
        const bouncePaths = generateBouncePath(bounceCount);

        // 弹窗弹出时机（1/3, 2/3, 最后）
        const popupSteps = [Math.floor(bouncePaths.length/3)-2, Math.floor(bouncePaths.length*2/3)-2, bouncePaths.length - 3];

        // 等待图片动画结束后1秒再开始小球动画
        Promise.all([
            leftTween.finished,
            rightTween.finished
        ]).then(()=>{
            setTimeout(()=>{
                let tl = gsap.timeline();
                for (let i = 0; i < bouncePaths.length; i++) {
                    tl.to(ball, {
                        duration: 0.6 + 0.18 * i,
                        motionPath: {
                            path: bouncePaths[i],
                            curviness: 1.2,
                            autoRotate: false
                        },
                        ease: 'power2.out',
                        onUpdate: function() {
                            if (typeof gsap.plugins.MotionPathPlugin !== 'undefined') {
                                gsap.set(ball, {x: ball._gsap.x, y: ball._gsap.y});
                            }
                        },
                        onComplete: ()=>{
                            // 弹窗弹出
                            if (i === popupSteps[0]) {
                                gsap.to(popup1, {opacity: 1, duration: 0.5});
                            }
                            if (i === popupSteps[1]) {
                                gsap.to(popup2, {opacity: 1, duration: 0.5});
                                // 让popup2更靠下
                                // if (popup2) popup2.style.transform = 'translateY(60px)';
                            }
                            if (i === popupSteps[2]) {
                                gsap.to(popup3, {opacity: 1, duration: 0.5});
                            }
                        }
                    });
                }
            }, 1000);
        });
    }

    // 进入section10时触发动画
    function setupSection10Trigger() {
        let lastVisible = false;
        window.addEventListener('scroll', () => {
            const section = document.querySelector('.section10');
            if (!section) return;
            const rect = section.getBoundingClientRect();
            const inView = rect.top < window.innerHeight && rect.bottom > 0;
            if (inView && !lastVisible) {
                playSection10Animation();
            }
            lastVisible = inView;
        });
        // 若初始就在视口内
        window.addEventListener('DOMContentLoaded', ()=>{
            const section = document.querySelector('.section10');
            if (!section) return;
            const rect = section.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                playSection10Animation();
            }
        });
    }
    setupSection10Trigger();
})();




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

    // section3/section4 衔接动画与滚动控制
    (function () {
        const section3 = document.querySelector('.section3');
        const section3ExpandBox = section3 && section3.querySelector('.section3-expand-box');
        const section3ExpandText = section3 && section3.querySelector('.section3-expand-text');
        const section4 = document.querySelector('.section4');
        const section4Text = section4 && section4.querySelector('.section4-text');
        const section4Animate = section4 && section4.querySelector('.section4-animate');
        const counter = section4 && section4.querySelector('#counter');
        let transitionTriggered = false;
        let section4Timer = null;
        let lastSection4InView = false;

        // section4 动画与计数控制
        function animateCounter(element, target) {
            const duration = 1500;
            const increment = target / (duration / 16);
            let current = 0;
            function updateCounter() {
                current += increment;
                if (current < target) {
                    element.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    element.textContent = target;
                }
            }
            updateCounter();
        }
        function isSection4InView() {
            if (!section4) return false;
            const rect = section4.getBoundingClientRect();
            return rect.top < window.innerHeight * 0.5 && rect.bottom > window.innerHeight * 0.3;
        }
        function enterSection4() {
            if (!section4Text || !section4Animate) return;
            section4Text.classList.remove('hide');
            section4Text.style.display = '';
            section4Animate.classList.remove('show');
            section4Animate.style.display = 'none';
            if (counter) {
                counter.textContent = '0';
                animateCounter(counter, parseInt(counter.getAttribute('data-target'), 10));
            }
            // 5s后section4-text下滑消失，section4-animate上滑出现
            section4Timer = setTimeout(() => {
                section4Text.classList.add('hide');
                setTimeout(() => {
                    section4Text.style.display = 'none';
                    section4Animate.style.display = 'flex';
                    setTimeout(() => {
                        section4Animate.classList.add('show');
                    }, 30);
                }, 600);
            }, 5000);
        }
        function leaveSection4() {
            if (section4Timer) {
                clearTimeout(section4Timer);
                section4Timer = null;
            }
            if (section4Text && section4Animate) {
                section4Text.classList.remove('hide');
                section4Text.style.display = '';
                section4Animate.classList.remove('show');
                section4Animate.style.display = 'none';
            }
        }
        window.addEventListener('scroll', function () {
            const inView = isSection4InView();
            if (inView && !lastSection4InView) {
                enterSection4();
                lastSection4InView = true;
            } else if (!inView && lastSection4InView) {
                leaveSection4();
                lastSection4InView = false;
            }
        });
        // 页面初始如果就在section4也要触发
        if (isSection4InView()) {
            enterSection4();
            lastSection4InView = true;
        }
    })();

    // section4 动画与计数控制
    (function() {
        const section4 = document.querySelector('.section4');
        if (!section4) return;
        const text = section4.querySelector('.section4-text');
        const animate = section4.querySelector('.section4-animate');
        const counter = section4.querySelector('#counter');
        let textTimer = null;
        let counting = false;
        let lastInView = false;
        function animateCounter(element, target) {
            const duration = 1500;
            const increment = target / (duration / 16);
            let current = 0;
            function updateCounter() {
                current += increment;
                if (current < target) {
                    element.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    element.textContent = target;
                }
            }
            updateCounter();
        }
        function isSectionInView() {
            const rect = section4.getBoundingClientRect();
            return rect.top < window.innerHeight * 0.5 && rect.bottom > window.innerHeight * 0.3;
        }
        function enterSection() {
            if (!text || !animate) return;
            text.style.opacity = 1;
            text.style.display = '';
            animate.style.display = 'none';
            if (counter) {
                counter.textContent = '0';
                animateCounter(counter, parseInt(counter.getAttribute('data-target'), 10));
            }
            textTimer = setTimeout(() => {
                text.style.opacity = 0;
                setTimeout(() => {
                    text.style.display = 'none';
                    animate.style.display = 'flex';
                }, 500);
            }, 5000);   // 5秒后切换
        }
        function leaveSection() {
            if (textTimer) {
                clearTimeout(textTimer);
                textTimer = null;
            }
            if (text && animate) {
                text.style.opacity = 1;
                text.style.display = '';
                animate.style.display = 'none';
            }
        }
        window.addEventListener('scroll', function() {
            const inView = isSectionInView();
            if (inView && !lastInView) {
                enterSection();
                lastInView = true;
            } else if (!inView && lastInView) {
                leaveSection();
                lastInView = false;
            }
        });
        // 页面初始如果就在section4也要触发
        if (isSectionInView()) {
            enterSection();
            lastInView = true;
        }
    })();

    // 初始化
    createNav();
    updateNav();
})();


//section1动画
document.addEventListener('DOMContentLoaded', function () {
    const section1 = document.querySelector('.section1');
    if (!section1) return;
    const bgimg = section1.querySelector('.section1-bgimg');
    const letters = Array.from(section1.querySelectorAll('.section1-letter'));
    const svg = section1.querySelector('.section1-lines');

    // 1. 背景图从下方弹入
    gsap.set(bgimg, {
        y: 800, // 减少初始位移，让弹入更明显
        opacity: 1,
        width: '100vw',
        position: 'absolute',
        left: 0,
        bottom: 0,
        zIndex: 1
    });
    gsap.to(bgimg, {
        y: 0,
        duration: 2,
        ease: 'bounce.out',
        delay: 0.2
    });

    // 2. 六张图片依次生长
    const letterYOffsets = [-5, -18, -10, -12, -8, -26];
    letters.forEach((img, i) => {
        gsap.set(img, {
            y: 80,
            scale: 0.2,
            opacity: 0,
            x: 0,
            rotate: 0,
            zIndex: 3
        });
        gsap.to(img, {
            y: `${letterYOffsets[i]}vh`,
            scale: 1,
            opacity: 1,
            duration: 0.7,
            delay: 1.1 + i * 0.18,
            ease: 'back.out(1.7)'
        });
    });

    // 3. 增加晃动幅度和频率
    const swingFreqs = [1.5, 1.8, 1.3, 2.0, 1.6, 1.9]; // 增加频率
    const swingAmps = [80, 90, 70, 95, 75, 85]; // 大幅增加晃动幅度
    const rotAmps = [25, 30, 20, 35, 22, 28]; // 增加旋转幅度

    let swingDamp = 1;
    let swingStart = null;

    // 修复线根部位置计算
    function getLineRoots() {
        const roots = [];
        const sectionRect = section1.getBoundingClientRect();
        const bgRect = bgimg.getBoundingClientRect();

        // 根部在背景图顶部中央区域均匀分布
        for (let i = 0; i < 6; i++) {
            // 在背景图顶部区域均匀分布根部
            const rootX = bgRect.left + (bgRect.width / 7) * (i + 1) - sectionRect.left;
            const rootY = bgRect.top - sectionRect.top + 10; // 在背景图顶部稍微上方
            roots.push({ x: rootX, y: rootY });
        }
        return roots;
    }

    function getLetterCenter(img) {
        const imgRect = img.getBoundingClientRect();
        const secRect = section1.getBoundingClientRect();
        return {
            x: imgRect.left + imgRect.width / 2 - secRect.left,
            y: imgRect.top + imgRect.height / 2 - secRect.top + 50
        };
    }

    // 修复SVG曲线绘制
    function drawLines() {
        if (!svg) return;
        svg.innerHTML = '';

        const roots = getLineRoots();

        letters.forEach((img, i) => {
            const root = roots[i];
            const end = getLetterCenter(img);

            // 确保坐标有效
            if (!root || !end || isNaN(root.x) || isNaN(root.y) || isNaN(end.x) || isNaN(end.y)) {
                return;
            }

            // 创建更自然的曲线控制点
            const midX = (root.x + end.x) / 2;
            const controlY = Math.min(root.y, end.y) - 50; // 控制点在上方形成弧线

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            // 使用二次贝塞尔曲线创建更平滑的连接
            path.setAttribute('d', `M${root.x},${root.y} Q${midX},${controlY} ${end.x},${end.y}`);
            path.setAttribute('stroke', '#fbe3f9');
            path.setAttribute('stroke-width', '3');
            path.setAttribute('fill', 'none');
            path.setAttribute('opacity', '0.7');
            path.setAttribute('class', `line-${i}`);

            svg.appendChild(path);
        });
    }

    // 晃动动画参数
    const swingParams = [
        { angle: 32, duration: 1.2 },
        { angle: -28, duration: 1.3 },
        { angle: 36, duration: 1.1 },
        { angle: -30, duration: 1.4 },
        { angle: 28, duration: 1.2 },
        { angle: -34, duration: 1.3 },
    ];

    // 动画主函数
    function playsection1Animation() {
        // 1. bgimg从下方弹入
        gsap.set(bgimg, { y: 400 });
        gsap.to(bgimg, { y: 0, duration: 1.6, ease: 'power3.out' });

        // 2. letter依次弹出并晃动
        letters.forEach((img, i) => {
            gsap.set(img, { scale: 0, y: 80, rotate: 0 });
        });
        // 依次弹出
        letters.forEach((img, i) => {
            gsap.to(img, {
                scale: 1,
                y: 0,
                duration: 0.7,
                delay: 0.3 + i * 0.18,
                ease: 'back.out(1.7)',
                onStart: () => { drawLines(); }, // 每次弹出时重绘线
                onUpdate: () => { drawLines(); },
                onComplete: () => {
                    // 晃动动画，初期剧烈后缓慢阻尼
                    gsap.to(img, {
                        rotate: swingParams[i].angle,
                        duration: swingParams[i].duration,
                        ease: 'power2.out',
                        yoyo: true,
                        repeat: 1,
                        onUpdate: drawLines,
                        onComplete: () => {
                            gsap.to(img, {
                                rotate: 0,
                                duration: 1.6,
                                ease: 'elastic.out(1, 0.3)',
                                onUpdate: drawLines
                            });
                        }
                    });
                }
            });
        });
    }

    // 监听窗口resize，保持线连接
    window.addEventListener('resize', () => {
        if (section1 && section1.offsetParent !== null) {
            drawLines();
        }
    });

    // fullpage.js集成：每次进入section1都重播动画
    function setupFullpagesection1() {
        if (window.fullpage_api) {
            // fullpage.js v4+ API
            window.fullpage_api.setAllowScrolling(true);
            window.fullpage_api.on('afterLoad', function (origin, destination, direction) {
                if (destination && destination.item && destination.item.classList.contains('section1')) {
                    playsection1Animation();
                }
            });
        } else {
            // 兜底：滚动检测
            let lastVisible = false;
            window.addEventListener('scroll', () => {
                const rect = section1.getBoundingClientRect();
                const inView = rect.top < window.innerHeight && rect.bottom > 0;
                if (inView && !lastVisible) {
                    playsection1Animation();
                }
                lastVisible = inView;
            });
        }
    }

    // 增强晃动动画
    function animateSwing(now) {
        if (!swingStart) swingStart = now;
        const t = (now - swingStart) / 1000;

        // 延长剧烈晃动时间到5秒，然后缓慢减弱
        swingDamp = t < 8 ? 1 : Math.max(0.15, 1 - (t - 5) * 0.12);

        letters.forEach((img, i) => {
            // 增加复合晃动效果
            const swing1 = Math.sin(t * swingFreqs[i] + i) * swingAmps[i] * swingDamp;
            const swing2 = Math.cos(t * swingFreqs[i] * 0.8 + i * 1.2) * swingAmps[i] * 0.3 * swingDamp;
            const rot = Math.sin(t * swingFreqs[i] * 0.7 + i * 0.8) * rotAmps[i] * swingDamp;
            const yOffset = letterYOffsets[i];

            gsap.set(img, {
                x: swing1 + swing2,
                rotate: rot,
                y: `${yOffset}vh`
            });
        });

        drawLines();
        requestAnimationFrame(animateSwing);
    }

    // 初始绘制连接线
    drawLines();
    // 启动晃动动画
    requestAnimationFrame(animateSwing);

    setupFullpagesection1();

    // 窗口大小变化时重绘
    window.addEventListener('resize', function () {
        setTimeout(drawLines, 100);
    });

});


// section14 动画逻辑
document.addEventListener('DOMContentLoaded', function () {
    const section14 = document.querySelector('.section14');
    if (!section14) return;
    const bgimg = section14.querySelector('.section14-bgimg');
    const letters = Array.from(section14.querySelectorAll('.section14-letter'));
    const svg = section14.querySelector('.section14-lines');

    // 1. 背景图从下方弹入
    gsap.set(bgimg, {
        y: 800, // 减少初始位移，让弹入更明显
        opacity: 1,
        width: '100vw',
        position: 'absolute',
        left: 0,
        bottom: 0,
        zIndex: 1
    });
    gsap.to(bgimg, {
        y: 0,
        duration: 2,
        ease: 'bounce.out',
        delay: 0.2
    });

    // 2. 六张图片依次生长
    const letterYOffsets = [-5, -18, -10, -12, -8, -26];
    letters.forEach((img, i) => {
        gsap.set(img, {
            y: 80,
            scale: 0.2,
            opacity: 0,
            x: 0,
            rotate: 0,
            zIndex: 3
        });
        gsap.to(img, {
            y: `${letterYOffsets[i]}vh`,
            scale: 1,
            opacity: 1,
            duration: 0.7,
            delay: 1.1 + i * 0.18,
            ease: 'back.out(1.7)'
        });
    });

    // 3. 增加晃动幅度和频率
    const swingFreqs = [1.5, 1.8, 1.3, 2.0, 1.6, 1.9]; // 增加频率
    const swingAmps = [80, 90, 70, 95, 75, 85]; // 大幅增加晃动幅度
    const rotAmps = [25, 30, 20, 35, 22, 28]; // 增加旋转幅度

    let swingDamp = 1;
    let swingStart = null;

    // 修复线根部位置计算
    function getLineRoots() {
        const roots = [];
        const sectionRect = section14.getBoundingClientRect();
        const bgRect = bgimg.getBoundingClientRect();

        // 根部在背景图顶部中央区域均匀分布
        for (let i = 0; i < 6; i++) {
            // 在背景图顶部区域均匀分布根部
            const rootX = bgRect.left + (bgRect.width / 7) * (i + 1) - sectionRect.left;
            const rootY = bgRect.top - sectionRect.top + 10; // 在背景图顶部稍微上方
            roots.push({ x: rootX, y: rootY });
        }
        return roots;
    }

    function getLetterCenter(img) {
        const imgRect = img.getBoundingClientRect();
        const secRect = section14.getBoundingClientRect();
        return {
            x: imgRect.left + imgRect.width / 2 - secRect.left,
            y: imgRect.top + imgRect.height / 2 - secRect.top + 50
        };
    }

    // 修复SVG曲线绘制
    function drawLines() {
        if (!svg) return;
        svg.innerHTML = '';

        const roots = getLineRoots();

        letters.forEach((img, i) => {
            const root = roots[i];
            const end = getLetterCenter(img);

            // 确保坐标有效
            if (!root || !end || isNaN(root.x) || isNaN(root.y) || isNaN(end.x) || isNaN(end.y)) {
                return;
            }

            // 创建更自然的曲线控制点
            const midX = (root.x + end.x) / 2;
            const controlY = Math.min(root.y, end.y) - 50; // 控制点在上方形成弧线

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            // 使用二次贝塞尔曲线创建更平滑的连接
            path.setAttribute('d', `M${root.x},${root.y} Q${midX},${controlY} ${end.x},${end.y}`);
            path.setAttribute('stroke', '#fbe3f9');
            path.setAttribute('stroke-width', '3');
            path.setAttribute('fill', 'none');
            path.setAttribute('opacity', '0.7');
            path.setAttribute('class', `line-${i}`);

            svg.appendChild(path);
        });
    }

    // 晃动动画参数
    const swingParams = [
        { angle: 32, duration: 1.2 },
        { angle: -28, duration: 1.3 },
        { angle: 36, duration: 1.1 },
        { angle: -30, duration: 1.4 },
        { angle: 28, duration: 1.2 },
        { angle: -34, duration: 1.3 },
    ];

    // 动画主函数
    function playSection14Animation() {
        // 1. bgimg从下方弹入
        gsap.set(bgimg, { y: 400 });
        gsap.to(bgimg, { y: 0, duration: 1.6, ease: 'power3.out' });

        // 2. letter依次弹出并晃动
        letters.forEach((img, i) => {
            gsap.set(img, { scale: 0, y: 80, rotate: 0 });
        });
        // 依次弹出
        letters.forEach((img, i) => {
            gsap.to(img, {
                scale: 1,
                y: 0,
                duration: 0.7,
                delay: 0.3 + i * 0.18,
                ease: 'back.out(1.7)',
                onStart: () => { drawLines(); }, // 每次弹出时重绘线
                onUpdate: () => { drawLines(); },
                onComplete: () => {
                    // 晃动动画，初期剧烈后缓慢阻尼
                    gsap.to(img, {
                        rotate: swingParams[i].angle,
                        duration: swingParams[i].duration,
                        ease: 'power2.out',
                        yoyo: true,
                        repeat: 1,
                        onUpdate: drawLines,
                        onComplete: () => {
                            gsap.to(img, {
                                rotate: 0,
                                duration: 1.6,
                                ease: 'elastic.out(1, 0.3)',
                                onUpdate: drawLines
                            });
                        }
                    });
                }
            });
        });
    }

    // 监听窗口resize，保持线连接
    window.addEventListener('resize', () => {
        if (section14 && section14.offsetParent !== null) {
            drawLines();
        }
    });

    // fullpage.js集成：每次进入section14都重播动画
    function setupFullpageSection14() {
        if (window.fullpage_api) {
            // fullpage.js v4+ API
            window.fullpage_api.setAllowScrolling(true);
            window.fullpage_api.on('afterLoad', function (origin, destination, direction) {
                if (destination && destination.item && destination.item.classList.contains('section14')) {
                    playSection14Animation();
                }
            });
        } else {
            // 兜底：滚动检测
            let lastVisible = false;
            window.addEventListener('scroll', () => {
                const rect = section14.getBoundingClientRect();
                const inView = rect.top < window.innerHeight && rect.bottom > 0;
                if (inView && !lastVisible) {
                    playSection14Animation();
                }
                lastVisible = inView;
            });
        }
    }

    // 增强晃动动画
    function animateSwing(now) {
        if (!swingStart) swingStart = now;
        const t = (now - swingStart) / 1000;

        // 延长剧烈晃动时间到5秒，然后缓慢减弱
        swingDamp = t < 8 ? 1 : Math.max(0.15, 1 - (t - 5) * 0.12);

        letters.forEach((img, i) => {
            // 增加复合晃动效果
            const swing1 = Math.sin(t * swingFreqs[i] + i) * swingAmps[i] * swingDamp;
            const swing2 = Math.cos(t * swingFreqs[i] * 0.8 + i * 1.2) * swingAmps[i] * 0.3 * swingDamp;
            const rot = Math.sin(t * swingFreqs[i] * 0.7 + i * 0.8) * rotAmps[i] * swingDamp;
            const yOffset = letterYOffsets[i];

            gsap.set(img, {
                x: swing1 + swing2,
                rotate: rot,
                y: `${yOffset}vh`
            });
        });

        drawLines();
        requestAnimationFrame(animateSwing);
    }

    // 初始绘制连接线
    drawLines();
    // 启动晃动动画
    requestAnimationFrame(animateSwing);

    setupFullpageSection14();

    // 窗口大小变化时重绘
    window.addEventListener('resize', function () {
        setTimeout(drawLines, 100);
    });

});
