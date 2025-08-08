// --- header.js ---

// Плавний скрол до секцій + закриття меню, якщо треба
export function initHeaderNavigation() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
  
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
  
        if (this.closest('.menu')) {
          const menu = document.querySelector('.menu');
          const overlay = document.querySelector('.menu-overlay');
          const body = document.body;
          if (menu && overlay && body) {
            menu.classList.remove('open');
            overlay.classList.remove('visible');
            body.classList.remove('no-scroll');
          }
        }
      });
    });
  }
  
  // Інші події навігації
  document.addEventListener('DOMContentLoaded', () => {
    const logo = document.querySelector('.header-logo');
    const burgerBtn = document.querySelector('.burger-btn');
    const closeBtn = document.querySelector('.close-btn');
    const menu = document.querySelector('.menu');
    const overlay = document.querySelector('.menu-overlay');
    const body = document.body;
  
    const openMenu = () => {
      if (menu && overlay && body) {
        menu.classList.add('open');
        overlay.classList.add('visible');
        body.classList.add('no-scroll');
      }
    };
  
    const closeMenu = () => {
      if (menu && overlay && body) {
        menu.classList.remove('open');
        overlay.classList.remove('visible');
        body.classList.remove('no-scroll');
      }
    };
  
    if (burgerBtn) {
      burgerBtn.addEventListener('click', openMenu);
    }
  
    if (closeBtn) {
      closeBtn.addEventListener('click', closeMenu);
    }
  
    if (overlay) {
      overlay.addEventListener('click', closeMenu);
    }
  
    if (logo) {
      logo.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeMenu();
      }
    });
  });
  


/*для main.js 
import { initHeaderNavigation } from './header.js';

document.addEventListener('DOMContentLoaded', () => {
  initHeaderNavigation();
});
*/

 
