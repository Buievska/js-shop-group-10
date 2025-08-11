import axios from 'axios';
import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

// отримання розмітки
const container = document.querySelector('.js-feedback-cart');
const btnBack = document.querySelector('.js-btn-back');
const btnForward = document.querySelector('.js-btn-forward');

// функція для округлення оцінки
function roundRating(rating) {
  if (rating >= 3.3 && rating <= 3.7) {
    return 3.5;
  } else if (rating >= 3.8 && rating <= 4.2) {
    return 4;
  }
  return Math.round(rating * 2) / 2;
}

// функція для відтворення зірок
function renderStars(rating = 0) {
  const full = Math.floor(rating),
    half = rating % 1 >= 0.5,
    empty = 5 - full - (half ? 1 : 0);
  const starSVG =
    '<svg class="star-icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.786L19.335 24 12 19.897 4.665 24l1.401-8.998L.132 9.21l8.2-1.192z"/></svg>';
  const halfSVG = `<svg class="star-icon half" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><defs><linearGradient id="grad"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="#ccc"/></defs><path fill="url(#grad)" d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.786L19.335 24 12 19.897 4.665 24l1.401-8.998L.132 9.21l8.2-1.192z"/></svg>`;
  let s = '';
  s += starSVG.repeat(full);
  if (half) s += halfSVG;
  s +=
    '<svg class="star-icon empty" viewBox="0 0 24 24" width="20" height="20" fill="#ccc"><path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.786L19.335 24 12 19.897 4.665 24l1.401-8.998L.132 9.21l8.2-1.192z"/></svg>'.repeat(
      empty
    );
  return `<div class="rating-stars">${s}</div>`;
}

// Функція для створення розмітки
function createMarkup(arr) {
  return arr
    .map(({ name, descr, rate }) => {
      const starsHTML = renderStars(roundRating(rate));
      // Кожен відгук тепер це swiper-slide
      return `
        <div class="swiper-slide">
          <div class="feedback-item">
            <div class="star-rating">${starsHTML}</div>
            <p class="feedback-descr">"${descr}"</p>
            <p class="feedback-name">${name}</p>
          </div>
        </div>
      `;
    })
    .join('');
}

// Головна і єдина функція, що все завантажує та ініціалізує
async function initFeedbackSlider() {
  const container = document.querySelector('.js-feedback-cart');
  if (!container) return;
  try {
    const response = await axios.get(
      'https://furniture-store.b.goit.study/api/feedbacks?limit=10'
    );
    const reviews = response.data.feedbacks;
    if (!reviews || reviews.length === 0) {
      iziToast.error({
        title: 'Error',
        message: 'Щось пішло не так. Спробуйте пізніше.',
        position: 'topRight',
      });
      return;
    }
    container.innerHTML = createMarkup(reviews);
    const enableLoop = reviews.length > 3;

    const totalBullets = 5;
    // Ініціалізуємо Swiper
    const swiper = new Swiper('.feedback-slider', {
      // ВАЖЛИВО: Реєструємо ОБИДВА модулі - Navigation та Pagination
      modules: [Navigation, Pagination],
      slidesPerGroup: 1,
      slidesPerView: 1,
      spaceBetween: 16,
      loop: false,
      watchOverflow: true,

      // Налаштування для пагінації (крапочок)
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
        renderBullet: function (index, className) {
          if (index < totalBullets) {
            return `<span class="${className}"></span>`;
          }
          return '';
        },
      },
      navigation: {
        nextEl: '.js-btn-forward',
        prevEl: '.js-btn-back',

        disabledClass: 'swiper-button-disabled',
      },
      // Адаптивність
      breakpoints: {
        768: {
          slidesPerGroup: 1,
          slidesPerView: 2,
          spaceBetween: 24,
        },
        1440: {
          slidesPerGroup: 1,
          slidesPerView: 3,
          spaceBetween: 24,
        },
      },
    });

    swiper.on('init slideChange', () => {
      const bullets = document.querySelectorAll('.swiper-pagination-bullet');
      bullets.forEach(b =>
        b.classList.remove('swiper-pagination-bullet-active')
      );
      const activeIndex = swiper.realIndex % totalBullets;
      bullets[activeIndex]?.classList.add('swiper-pagination-bullet-active');
    });
  } catch (error) {
    iziToast.error({
      title: 'Error',
      message: 'Щось пішло не так. Спробуйте пізніше.',
      position: 'topRight',
    });
  }
}

initFeedbackSlider();
