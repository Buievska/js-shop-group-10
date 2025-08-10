

import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';


const sliderContainer = document.getElementById('popular-slider-container');
const sliderList = document.getElementById('popular-slider');
const btnLeft = document.getElementById('btn-left');
const btnRight = document.getElementById('btn-right');
const indicators = document.getElementById('slider-indicators');

let swiperInstance = null;


const BASE_URL = 'https://furniture-store.b.goit.study/api';
const LIMIT = 8;
let page = 1;
let totalItems = null;
let isLoading = false;


const cacheById = new Map();

async function fetchPopularFurniture({ page, limit }) {
  const url = `${BASE_URL}/furnitures?type=popular&page=${page}&limit=${limit}`;
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data?.furnitures)) return data;
  } catch (error) {
    console.error('Fetch error:', error);
  }
  throw new Error('Не вдалося отримати дані з API');
}


async function fetchFurnitureById(id) {
  id = String(id);
  const urls = [
    `${BASE_URL}/furnitures/${id}`,
    `${BASE_URL}/furniture/${id}`,
    `${BASE_URL}/furnitures?id=${id}`,
    `${BASE_URL}/furniture?id=${id}`,
  ];
  for (const u of urls) {
    try {
      const r = await fetch(u, { headers: { Accept: 'application/json' } });
      if (!r.ok) continue;
      const j = await r.json();
      const item = j?.furniture || j?.furnitures?.[0] || (j?._id && j);
      if (item) return item;
    } catch {}
  }
  return null;
}


function createFurnitureCardsMarkup(furnitures) {
  return furnitures
    .map(f => {
      const imageUrl =
        f.images?.[0] || 'https://via.placeholder.com/300x200?text=No+Image';
      const colors = Array.isArray(f.color) ? f.color.slice(0, 3) : [];
      const dots = Array.from({ length: 3 }, (_, i) => {
        const c = colors[i];
        return c
          ? `<span class="color-dot" style="background:${c}"></span>`
          : `<span class="color-dot placeholder"></span>`;
      }).join('');
      return `
      <li class="furniture-card swiper-slide">
        <img src="${imageUrl}" alt="${f.name || 'Товар'}" class="card-img" />
        <div class="card-content">
          <h3 class="card-title">${f.name || 'Без назви'}</h3>
          <div class="color-list">${dots}</div>
          <p class="card-price">${
            typeof f.price === 'number' ? f.price + ' грн' : '—'
          }</p>
          <button class="details-btn" data-id="${f._id}">Детальніше</button>
        </div>
      </li>`;
    })
    .join('');
}


async function loadMoreIfNeeded() {
  const loadedCount = sliderList.children.length;
  const noMoreItems =
    typeof totalItems === 'number' && loadedCount >= totalItems;
  if (isLoading || noMoreItems) return;

  isLoading = true;
  try {
    page += 1;
    const data = await fetchPopularFurniture({ page, limit: LIMIT });
    const newFurnitures = data.furnitures || [];
    if (newFurnitures.length > 0) {
      
      newFurnitures.forEach(f => cacheById.set(String(f._id), f));

      const newSlidesMarkup = createFurnitureCardsMarkup(newFurnitures);
      sliderList.insertAdjacentHTML('beforeend', newSlidesMarkup);
      swiperInstance.update();
    }
  } catch (e) {
    console.warn('Не вдалось довантажити наступну сторінку:', e.message);
  } finally {
    isLoading = false;
  }
}

async function initPopularSlider() {
  if (!sliderContainer) return;

  const TOTAL_BULLETS = 7;
  isLoading = true;

  try {
    const data = await fetchPopularFurniture({ page, limit: LIMIT });
    const { furnitures, totalItems: total } = data;
    totalItems = typeof total === 'number' ? total : furnitures.length;

    if (!furnitures || furnitures.length === 0) {
      sliderList.innerHTML = '<li class="swiper-slide">Популярні товари відсутні.</li>';
      return;
    }

    
    furnitures.forEach(f => cacheById.set(String(f._id), f));

   
    sliderList.innerHTML = createFurnitureCardsMarkup(furnitures);

    
    swiperInstance = new Swiper(sliderContainer, {
      modules: [Navigation, Pagination],
      slidesPerView: 'auto',
      spaceBetween: 16,
      loop: false,
      breakpoints: {
        768: { slidesPerView: 2, spaceBetween: 20 },
        1440: { slidesPerView: 4, spaceBetween: 24 },
      },
      navigation: {
        nextEl: btnRight,
        prevEl: btnLeft,
      },
      pagination: {
        el: indicators,
        clickable: true,
        bulletClass: 'popular-bullet',
        bulletActiveClass: 'popular-bullet-active',
        renderBullet: (index, className) =>
          index < TOTAL_BULLETS ? `<span class="${className}"></span>` : '',
      },
      on: {
        reachEnd: async () => await loadMoreIfNeeded(),
        slideChange: function () {
          const bullets = indicators.querySelectorAll('.popular-bullet');
          if (bullets.length === 0) return;
          bullets.forEach(b => b.classList.remove('popular-bullet-active'));
          const activeIndex = this.realIndex % TOTAL_BULLETS;
          if (bullets[activeIndex]) {
            bullets[activeIndex].classList.add('popular-bullet-active');
          }
        },
      },
    });

    swiperInstance.pagination.update();
    swiperInstance.emit('slideChange');
  } catch (error) {
    console.error('Помилка ініціалізації слайдера:', error);
    iziToast.error({
      title: 'Помилка',
      message: 'Не вдалося завантажити товари.',
      position: 'topRight',
    });
  } finally {
    isLoading = false;
  }
}


sliderList.addEventListener('click', async (e) => {
  const btn = e.target.closest('.details-btn');
  if (!btn) return;

  const id = String(btn.dataset.id);
  let item = cacheById.get(id);

  if (!item) {
    item = await fetchFurnitureById(id);
  }

  if (item && typeof window.showModal === 'function') {
    window.showModal(item);
  } else {
    iziToast.error({
      title: 'Помилка',
      message: 'Товар не знайдено або showModal недоступний.',
      position: 'topRight',
    });
  }
});



initPopularSlider();






