document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.header');
  const menu = document.querySelector('.menu');
  const burgerBtn = document.querySelector('.burger-btn');
  const closeBtn = document.querySelector('.close-btn');
  const overlay = document.querySelector('.menu-overlay');
  const body = document.body;
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  if (!menu || !burgerBtn || !header || !body) {
    return;
  }
  const closeMenu = () => {
    if (menu.classList.contains('is-open')) {
      menu.classList.remove('is-open');
      header.classList.remove('menu-is-open');
      body.classList.remove('no-scroll');
    }
  };
  const toggleMenu = () => {
    const isMenuOpening = menu.classList.toggle('is-open');
    header.classList.toggle('menu-is-open', isMenuOpening);
    body.classList.toggle('no-scroll', isMenuOpening);
  };
  burgerBtn.addEventListener('click', toggleMenu);
  if (closeBtn) {
    closeBtn.addEventListener('click', closeMenu);
  }
  if (overlay) {
    overlay.addEventListener('click', closeMenu);
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeMenu();
    }
  });
  anchorLinks.forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
      closeMenu();
    });
  });
});