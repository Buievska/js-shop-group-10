import axios from 'axios';

import Swiper from 'swiper';
import 'swiper/swiper-bundle.css';

const url = 'https://furniture-store.b.goit.study/api/feedbacks?limit=10';

// отримання розмітки
const container = document.querySelector('.js-feedback-cart');
const btnBack = document.querySelector('.js-btn-back');
const btnForward = document.querySelector('.js-btn-forward');

let cachedReviews = [];

let page = 1;

// обробник кнопки forward
btnForward.addEventListener('click', onLoadForward);

// обробник кнопки back

btnBack.addEventListener('click', onLoadBack);

// Функція для відображення відгуків для різних екранів

function displayReviews(reviews) {
  const screenWidth = window.innerWidth;
  let reviewsToShow;

  if (screenWidth < 768) {
    reviewsToShow = reviews.slice(0, 1);
  } else if (screenWidth < 1140) {
    reviewsToShow = reviews.slice(0, 2);
  } else {
    reviewsToShow = reviews.slice(0, 3);
  }

  container.innerHTML = createMarkup(reviewsToShow);
}

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

async function fetchCustomerReviews(page = 1, limit = 10) {
  const url = `https://furniture-store.b.goit.study/api/feedbacks?page=${page}&limit=${limit}`;
  const { data } = await axios.get(url);
  return data;
}

// Отримання та  відображення відгуків
fetchCustomerReviews(page)
  .then(response => {
    cachedReviews = response.feedbacks;
    displayReviews(cachedReviews);
    updateButtons(response);
  })
  .catch(error => {
    console.error('Error fetching reviews:', error);
  });

// Функція для створення розмітки
function createMarkup(arr) {
  return arr
    .map(({ name, descr, rate }) => {
      const starsHTML = renderStars(roundRating(rate));
      return `
        <li class="feedback-item">
          <div class="star-rating">${starsHTML}</div>
          <p class="feedback-descr">"${descr}"</p>
          <p class="feedback-name">${name}</p>
        </li>
      `;
    })
    .join('');
}

// Обробник події resize
window.addEventListener('resize', () => {
  displayReviews(cachedReviews);
});

async function onLoadForward() {
  page++;
  try {
    const data = await fetchCustomerReviews(page);
    console.log(data);
    if (!data.feedbacks.length) {
      page--;
      alert('Відгуків більше немає!');
      return;
    }
    cachedReviews = data.feedbacks;
    displayReviews(cachedReviews);
    updateButtons(data);
  } catch (error) {
    alert(error.message);
  }
}

async function onLoadBack() {
  if (page > 1) page--;
  try {
    const data = await fetchCustomerReviews(page);
    cachedReviews = data.feedbacks;
    displayReviews(cachedReviews);
    updateButtons(data);
  } catch (error) {
    alert(error.message);
  }
}

// Функція блокування/розблокування кнопок
function updateButtons(data) {
  // Отключаем back на первой странице
  btnBack.disabled = page === 1;

  // Отключаем forward, если отзывов меньше лимита или их нет (значит, это последняя страница)
  btnForward.disabled = !data.feedbacks.length || data.feedbacks.length < 10;
}
