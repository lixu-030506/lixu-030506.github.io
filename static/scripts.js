document.addEventListener('DOMContentLoaded', function () {

  // 给所有内部链接添加淡出效果
  document.querySelectorAll('a[href^="/"], a[href^="' + window.location.origin + '"]').forEach(link => {
    link.addEventListener('click', function (e) {
      // 只处理本站内部链接
      if (this.hostname === window.location.hostname) {
        e.preventDefault();
        const href = this.getAttribute('href');

        // 淡出 main 区域
        const main = document.querySelector('main');
        if (main) {
          main.style.transition = 'opacity 0.35s ease';
          main.style.opacity = '0';
        }

        // 延迟跳转
        setTimeout(() => {
          window.location.href = href;
        }, 380);
      }
    });
  });

});
// 滾動時檢查元素是否進入視窗
document.addEventListener('DOMContentLoaded', function () {
  const elements = document.querySelectorAll('.post-item, h2');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1  // 當 10% 進入視窗就觸發
  });

  elements.forEach(el => observer.observe(el));
});
document.addEventListener('DOMContentLoaded', function () {

  // 漢堡選單
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuClose = document.getElementById('menu-close');

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.add('active');
    });

    menuClose.addEventListener('click', () => {
      mobileMenu.classList.remove('active');
    });

    mobileMenu.addEventListener('click', (e) => {
      if (e.target === mobileMenu) mobileMenu.classList.remove('active');
    });
  }
});
document.addEventListener('DOMContentLoaded', function () {
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuClose = document.getElementById('menu-close');
  const topControls = document.getElementById('top-controls');

  if (menuToggle && mobileMenu && topControls) {
    // 打开菜单
    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.add('active');
      topControls.classList.add('hidden'); // 隐藏右上角图标
    });

    // 关闭菜单
    menuClose.addEventListener('click', () => {
      mobileMenu.classList.remove('active');
      topControls.classList.remove('hidden'); // 恢复显示图标
    });

    // 点击菜单外部关闭
    mobileMenu.addEventListener('click', (e) => {
      if (e.target === mobileMenu) {
        mobileMenu.classList.remove('active');
        topControls.classList.remove('hidden');
      }
    });
  }
});
document.addEventListener('DOMContentLoaded', function () {
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuClose = document.getElementById('menu-close');
  const topControls = document.getElementById('top-controls');

  if (menuToggle && mobileMenu && topControls) {
    // 打开菜单
    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.add('active');
      topControls.classList.add('hidden');
      document.body.classList.add('menu-open');  // 锁住页面滚动
    });

    // 关闭菜单（两种方式）
    const closeMenu = () => {
      mobileMenu.classList.remove('active');
      topControls.classList.remove('hidden');
      document.body.classList.remove('menu-open');
    };

    menuClose.addEventListener('click', closeMenu);

    mobileMenu.addEventListener('click', (e) => {
      if (e.target === mobileMenu) closeMenu();
    });
  }
});
document.addEventListener('DOMContentLoaded', function () {
  const bgLayer = document.querySelector('.bg-layer');
  const contentOverlay = document.querySelector('.content-overlay');

  if (!bgLayer || !contentOverlay) return;

  // 视差效果：背景图随滚动缓慢移动
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const parallaxSpeed = 0.4; // 数值越小移动越慢
    bgLayer.style.transform = `translateY(${scrollY * parallaxSpeed}px)`;
  });

  // 内容淡入（当进入视口时）
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        contentOverlay.classList.add('visible');
      }
    });
  }, { threshold: 0.2 });

  observer.observe(contentOverlay);
});