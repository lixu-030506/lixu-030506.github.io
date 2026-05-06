/* ============================================
   李走走的诗歌手册 — 交互逻辑
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  // ===== 1. 主题切换 =====
  var themeToggle = document.getElementById('theme-toggle');
  var savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme');
      var next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  }

  // ===== 2. 自定义光标 =====
  var cursor = document.getElementById('cursor');
  if (cursor && window.matchMedia('(hover: hover)').matches) {
    var mx = 0, my = 0, cx = 0, cy = 0;
    document.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; });
    (function loop() {
      cx += (mx - cx) * 0.12; cy += (my - cy) * 0.12;
      cursor.style.left = cx + 'px'; cursor.style.top = cy + 'px';
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll('a, button, .post-item, .theme-toggle').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursor.classList.add('hover'); });
      el.addEventListener('mouseleave', function () { cursor.classList.remove('hover'); });
    });
  }

  // ===== 3. 首页标题逐字动画（双层：中文 + 英文）=====
  var titleCn = document.getElementById('title-cn');
  var titleEn = document.getElementById('title-en');
  var heroTitle = document.getElementById('hero-title');

  function splitToChars(el) {
    var text = el.textContent;
    el.innerHTML = '';
    var arr = [];
    for (var i = 0; i < text.length; i++) {
      var span = document.createElement('span');
      if (text[i] === ' ') {
        span.className = 'char char-space';
        span.innerHTML = '&nbsp;';
      } else {
        span.className = 'char';
        span.textContent = text[i];
      }
      el.appendChild(span);
      arr.push(span);
    }
    return arr;
  }

  if (titleCn && titleEn) {
    var cnChars = splitToChars(titleCn);
    var enChars = splitToChars(titleEn);

    // 中文逐字入场
    cnChars.forEach(function (ch, idx) {
      setTimeout(function () { ch.classList.add('visible'); }, 300 + idx * 80);
    });

    // 英文也预设为 visible（但 CSS 中 opacity:0 控制隐藏）
    enChars.forEach(function (ch) { ch.classList.add('visible'); });

    // 全部出现后启动呼吸
    setTimeout(function () {
      if (heroTitle) heroTitle.classList.add('breathing');
    }, 300 + cnChars.length * 80 + 500);
  }

  // 三击彩蛋
  if (heroTitle) {
    var clickCount = 0, clickTimer = null;
    heroTitle.addEventListener('click', function () {
      clickCount++;
      if (clickTimer) clearTimeout(clickTimer);
      if (clickCount >= 3) { triggerBurst(heroTitle); clickCount = 0; }
      clickTimer = setTimeout(function () { clickCount = 0; }, 600);
    });
  }

  // ===== 4. 粒子 Canvas 系统 =====
  var canvas = document.getElementById('particle-canvas');
  if (canvas) {
    var ctx = canvas.getContext('2d');
    var W, H, particles = [], ripples = [];
    var mouse = { x: -9999, y: -9999 };
    var PARTICLE_COUNT = 80;
    var charsArr = '藤蔓乌鸦雪月光油桃窗槐枝深空鹤雨雾落夜远方故乡山河路风灯影夏秋春冬'.split('');

    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);

    document.addEventListener('mousemove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; });
    // 点击产生涟漪
    document.addEventListener('click', function (e) {
      ripples.push({ x: e.clientX, y: e.clientY, r: 0, maxR: 180, opacity: 0.5 });
    });

    // 创建粒子
    function makeParticle() {
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        char: charsArr[Math.floor(Math.random() * charsArr.length)],
        size: 14 + Math.random() * 22,
        opacity: 0.2 + Math.random() * 0.6,
        baseOpacity: 0.2 + Math.random() * 0.6,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.2 - Math.random() * 0.3,
        rotation: (Math.random() - 0.5) * 0.5,
        rotationSpeed: (Math.random() - 0.5) * 0.004,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.01 + Math.random() * 0.02
      };
    }

    for (var i = 0; i < PARTICLE_COUNT; i++) particles.push(makeParticle());

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      var rgb = isDark ? '180, 175, 168' : '42, 42, 42';

      // 绘制涟漪
      for (var r = ripples.length - 1; r >= 0; r--) {
        var rip = ripples[r];
        rip.r += 3;
        rip.opacity -= 0.008;
        if (rip.opacity <= 0) { ripples.splice(r, 1); continue; }
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(' + rgb + ', ' + rip.opacity + ')';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 绘制粒子
      for (var j = 0; j < particles.length; j++) {
        var p = particles[j];

        // 鼠标排斥
        var dx = p.x - mouse.x, dy = p.y - mouse.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200 && dist > 0) {
          var force = (200 - dist) / 200 * 1.2;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
          p.opacity = p.baseOpacity * (0.2 + (dist / 200) * 0.8);
        } else {
          p.opacity += (p.baseOpacity - p.opacity) * 0.015;
        }

        // 涟漪推力
        for (var rr = 0; rr < ripples.length; rr++) {
          var rp = ripples[rr];
          var rdx = p.x - rp.x, rdy = p.y - rp.y;
          var rd = Math.sqrt(rdx * rdx + rdy * rdy);
          if (Math.abs(rd - rp.r) < 30 && rd > 0) {
            p.x += (rdx / rd) * 2;
            p.y += (rdy / rd) * 2;
          }
        }

        // 摇摆运动
        p.wobble += p.wobbleSpeed;
        p.x += p.vx + Math.sin(p.wobble) * 0.3;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        // 边界循环
        if (p.y < -50) { p.y = H + 50; p.x = Math.random() * W; }
        if (p.x < -50) p.x = W + 50;
        if (p.x > W + 50) p.x = -50;

        // 绘制字符
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.font = p.size + 'px "Noto Serif SC", Georgia, serif';
        ctx.fillStyle = 'rgba(' + rgb + ', ' + p.opacity + ')';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.char, 0, 0);
        ctx.restore();
      }

      requestAnimationFrame(draw);
    }
    draw();
  }

  // ===== 5. 滚动动画 =====
  var scrollObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.post-item, .section-title').forEach(function (el) {
    scrollObserver.observe(el);
  });

  // 文章内容逐段淡入
  var postContent = document.getElementById('post-content');
  if (postContent) {
    var lineObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

    postContent.querySelectorAll('p, h2, h3, blockquote, ul, ol').forEach(function (el) {
      lineObserver.observe(el);
    });
  }

  // ===== 6. 菜单 =====
  var menuToggle = document.getElementById('menu-toggle');
  var fullMenu = document.getElementById('full-menu');
  var menuClose = document.getElementById('menu-close');
  var topControls = document.getElementById('top-controls');

  function openMenu() {
    if (fullMenu) fullMenu.classList.add('active');
    if (topControls) topControls.style.opacity = '0';
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    if (fullMenu) fullMenu.classList.remove('active');
    if (topControls) topControls.style.opacity = '1';
    document.body.style.overflow = '';
  }

  if (menuToggle) menuToggle.addEventListener('click', openMenu);
  if (menuClose) menuClose.addEventListener('click', closeMenu);
  if (fullMenu) fullMenu.addEventListener('click', function (e) { if (e.target === fullMenu) closeMenu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  // ===== 7. 页面链接淡出 =====
  document.querySelectorAll('a[href^="/"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      if (this.hostname === window.location.hostname && !this.getAttribute('target')) {
        e.preventDefault();
        var href = this.getAttribute('href');
        var wrapper = document.querySelector('.page-wrapper');
        if (wrapper) { wrapper.style.transition = 'opacity 0.3s ease'; wrapper.style.opacity = '0'; }
        setTimeout(function () { window.location.href = href; }, 300);
      }
    });
  });

  // ===== 8. 三击爆炸效果 =====
  function triggerBurst(element) {
    var rect = element.getBoundingClientRect();
    var centerX = rect.left + rect.width / 2;
    var centerY = rect.top + rect.height / 2;
    var burstChars = '雪月光藤蔓乌鸦雾雨夜风灯影落花深空鹤'.split('');

    for (var i = 0; i < 50; i++) {
      (function (idx) {
        var el = document.createElement('div');
        el.className = 'burst-particle';
        el.textContent = burstChars[Math.floor(Math.random() * burstChars.length)];
        el.style.left = centerX + 'px';
        el.style.top = centerY + 'px';
        el.style.fontSize = (10 + Math.random() * 18) + 'px';
        el.style.color = 'var(--accent)';
        el.style.opacity = '1';
        document.body.appendChild(el);

        var angle = (Math.PI * 2 / 50) * idx + (Math.random() - 0.5) * 0.6;
        var dist = 120 + Math.random() * 250;
        var tx = centerX + Math.cos(angle) * dist;
        var ty = centerY + Math.sin(angle) * dist;

        if (typeof gsap !== 'undefined') {
          gsap.to(el, {
            x: tx - centerX, y: ty - centerY,
            opacity: 0, rotation: (Math.random() - 0.5) * 400,
            duration: 1 + Math.random() * 0.8, ease: 'power2.out',
            onComplete: function () { el.remove(); }
          });
        } else {
          el.style.transition = 'all ' + (1 + Math.random() * 0.8) + 's ease-out';
          requestAnimationFrame(function () {
            el.style.transform = 'translate(' + (tx - centerX) + 'px,' + (ty - centerY) + 'px) rotate(' + ((Math.random() - 0.5) * 400) + 'deg)';
            el.style.opacity = '0';
          });
          setTimeout(function () { el.remove(); }, 2500);
        }
      })(i);
    }

    // 标题震动
    if (typeof gsap !== 'undefined') {
      gsap.to(element, { scale: 1.08, duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.inOut' });
    }
  }

  // ===== 9. GSAP 增强 =====
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // 文章卡片滚动入场（带交错延迟）
    gsap.utils.toArray('.post-item').forEach(function (item, i) {
      gsap.from(item, {
        scrollTrigger: { trigger: item, start: 'top 88%', toggleActions: 'play none none none' },
        opacity: 0, y: 50, duration: 0.7, delay: i * 0.06, ease: 'power2.out'
      });
    });

    // section-title 滚动入场
    gsap.utils.toArray('.section-title').forEach(function (el) {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 85%' },
        opacity: 0, y: 30, duration: 0.8, ease: 'power2.out'
      });
    });

    // 文章内容逐段 GSAP 动画（增强版）
    var postContentEl = document.getElementById('post-content');
    if (postContentEl) {
      gsap.utils.toArray(postContentEl.querySelectorAll('p, h2, h3, blockquote')).forEach(function (el, i) {
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' },
          opacity: 0, y: 24, duration: 0.6, delay: i * 0.03, ease: 'power2.out'
        });
      });
    }
  }

});
