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
function renderStars(rating, max = 5) {
  let stars = '';
  for (let i = 1; i <= max; i++) {
    if (rating >= i) {
      stars += '<span class="star star--full">★</span>';
    } else if (rating >= i - 0.5) {
      stars += `
        <span class="star star--half">
          <span class="star-bg">★</span>
          <span class="star-fg">★</span>
        </span>`;
    } else {
      stars += '<span class="star star--empty">★</span>';
    }
  }
  return stars;
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

    // Ініціалізуємо Swiper
    const swiper = new Swiper('.feedback-slider', {
      // ВАЖЛИВО: Реєструємо ОБИДВА модулі - Navigation та Pagination
      modules: [Navigation, Pagination],
      slidesPerGroup: 1,
      slidesPerView: 1,
      spaceBetween: 16,
      // loop: enableLoop,
      // Налаштування для пагінації (крапочок)
      pagination: {
        el: '.swiper-pagination', // <-- вказуємо клас контейнера
        clickable: true, // <-- робимо крапки клікабельними
      },
      // Налаштування для навігації (стрілок)
      navigation: {
        nextEl: '.js-btn-forward',
        prevEl: '.js-btn-back',
      },
      // Адаптивність
      breakpoints: {
        768: {
          slidesPerGroup: 2,
          slidesPerView: 2,
          spaceBetween: 24,
        },
        1440: {
          slidesPerGroup: 3,
          slidesPerView: 3,
          spaceBetween: 24,
        },
      },
    });
  } catch (error) {
    iziToast.error({
      title: 'Error',
      message: 'Щось пішло не так. Спробуйте пізніше.',
      position: 'topRight',
    });
  }
}
// Запускаємо всю логіку
initFeedbackSlider();
