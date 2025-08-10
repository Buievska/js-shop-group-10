// import Swiper from 'swiper';
// import { Navigation, Pagination } from 'swiper/modules';
// import 'swiper/css';
// import 'swiper/css/navigation';
// import 'swiper/css/pagination';
// import iziToast from 'izitoast';
// import 'izitoast/dist/css/iziToast.min.css';

// const sliderContainer = document.getElementById('popular-slider-container');
// const sliderList = document.getElementById('popular-slider');
// const btnLeft = document.getElementById('btn-left');
// const btnRight = document.getElementById('btn-right');
// const indicators = document.getElementById('slider-indicators');

// // зняти можливі “чужі” стилі (grid/wrap), якщо клас є
// if (sliderList) sliderList.classList.remove('furniture-list');

// let swiperInstance = null;

// const BASE_URL = 'https://furniture-store.b.goit.study/api';
// const LIMIT = 8;
// let page = 1;
// let totalItems = null;
// let isLoading = false;

// const cacheById = new Map();

// async function fetchPopularFurniture({ page, limit }) {
//   const url = `${BASE_URL}/furnitures?type=popular&page=${page}&limit=${limit}`;
//   try {
//     const res = await fetch(url, { headers: { Accept: 'application/json' } });
//     if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
//     const data = await res.json();
//     if (Array.isArray(data?.furnitures)) return data;
//   } catch (error) {
//     console.error('Fetch error:', error);
//   }
//   throw new Error('Не вдалося отримати дані з API');
// }

// async function fetchFurnitureById(id) {
//   id = String(id);
//   const urls = [
//     `${BASE_URL}/furnitures/${id}`,
//     `${BASE_URL}/furniture/${id}`,
//     `${BASE_URL}/furnitures?id=${id}`,
//     `${BASE_URL}/furniture?id=${id}`,
//   ];
//   for (const u of urls) {
//     try {
//       const r = await fetch(u, { headers: { Accept: 'application/json' } });
//       if (!r.ok) continue;
//       const j = await r.json();
//       const item = j?.furniture || j?.furnitures?.[0] || (j?._id && j);
//       if (item) return item;
//     } catch {}
//   }
//   return null;
// }

// function createFurnitureCardsMarkup(furnitures) {
//   return furnitures
//     .map(f => {
//       const imageUrl =
//         f.images?.[0] || 'https://via.placeholder.com/300x200?text=No+Image';
//       const colors = Array.isArray(f.color) ? f.color.slice(0, 3) : [];
//       const dots = Array.from({ length: 3 }, (_, i) => {
//         const c = colors[i];
//         return c
//           ? `<span class="color-dot" style="background:${c}"></span>`
//           : `<span class="color-dot placeholder"></span>`;
//       }).join('');
//       return `
//       <li class="furniture-card swiper-slide">
//         <img src="${imageUrl}" alt="${f.name || 'Товар'}" class="card-img" />
//         <div class="card-content">
//           <h3 class="card-title">${f.name || 'Без назви'}</h3>
//           <div class="color-list">${dots}</div>
//           <p class="card-price">${typeof f.price === 'number' ? f.price + ' грн' : '—'}</p>
//           <button class="details-btn" data-id="${f._id}">Детальніше</button>
//         </div>
//       </li>`;
//     })
//     .join('');
// }

// async function loadMoreIfNeeded() {
//   const loadedCount = sliderList.children.length;
//   const noMoreItems = typeof totalItems === 'number' && loadedCount >= totalItems;
//   if (isLoading || noMoreItems) return;

//   isLoading = true;
//   try {
//     page += 1;
//     const data = await fetchPopularFurniture({ page, limit: LIMIT });
//     const newFurnitures = data.furnitures || [];
//     if (newFurnitures.length > 0) {
//       newFurnitures.forEach(f => cacheById.set(String(f._id), f));
//       const newSlidesMarkup = createFurnitureCardsMarkup(newFurnitures);
//       sliderList.insertAdjacentHTML('beforeend', newSlidesMarkup);
//       swiperInstance.update();
//     }
//   } catch (e) {
//     console.warn('Не вдалось довантажити наступну сторінку:', e.message);
//   } finally {
//     isLoading = false;
//   }
// }

// async function initPopularSlider() {
//   if (!sliderContainer) return;

//   const TOTAL_BULLETS = 7;
//   isLoading = true;

//   try {
//     const data = await fetchPopularFurniture({ page, limit: LIMIT });
//     const { furnitures, totalItems: total } = data;
//     totalItems = typeof total === 'number' ? total : furnitures.length;

//     if (!furnitures || furnitures.length === 0) {
//       sliderList.innerHTML = '<li class="swiper-slide">Популярні товари відсутні.</li>';
//       return;
//     }

//     furnitures.forEach(f => cacheById.set(String(f._id), f));
//     sliderList.innerHTML = createFurnitureCardsMarkup(furnitures);

//     const debounce = (fn, ms = 120) => {
//       let t;
//       return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
//     };

//     swiperInstance = new Swiper(sliderContainer, {
//       modules: [Navigation, Pagination],
//       slidesPerView: 1,
//       spaceBetween: 16,
//       loop: false,
//       breakpoints: {
//         768:  { slidesPerView: 2, spaceBetween: 20 },
//         1440: { slidesPerView: 4, spaceBetween: 24 },
//       },
//       navigation: {
//         nextEl: btnRight,
//         prevEl: btnLeft,
//       },
//       pagination: {
//         el: indicators,
//         clickable: true,
//         bulletClass: 'popular-bullet',
//         bulletActiveClass: 'popular-bullet-active',
//         renderBullet: (index, className) =>
//           index < TOTAL_BULLETS ? `<span class="${className}"></span>` : '',
//       },

//       // підстраховки для ресайзу/DOM-змін
//       observer: true,
//       observeParents: true,
//       observeSlideChildren: true,
//       updateOnWindowResize: true,
//       roundLengths: true,
//       watchOverflow: true,

//       on: {
//         resize() { this.update(); },
//         beforeResize() { this.updateSize(); },
//         reachEnd: async () => await loadMoreIfNeeded(),
//         slideChange: function () {
//           const bullets = indicators.querySelectorAll('.popular-bullet');
//           if (!bullets.length) return;
//           bullets.forEach(b => b.classList.remove('popular-bullet-active'));
//           const activeIndex = this.realIndex % TOTAL_BULLETS;
//           bullets[activeIndex]?.classList.add('popular-bullet-active');
//         },
//       },
//     });

//     // дати верстці “осісти”, потім оновити
//     requestAnimationFrame(() => swiperInstance?.update());

//     // глобальний ресайз із дебаунсом
//     window.addEventListener('resize', debounce(() => {
//       if (!swiperInstance) return;
//       swiperInstance.updateSize();
//       swiperInstance.updateSlides();
//       swiperInstance.update();
//     }, 120));

//     swiperInstance.pagination.update();
//     swiperInstance.emit('slideChange');
//   } catch (error) {
//     console.error('Помилка ініціалізації слайдера:', error);
//     iziToast.error({
//       title: 'Помилка',
//       message: 'Не вдалося завантажити товари.',
//       position: 'topRight',
//     });
//   } finally {
//     isLoading = false;
//   }
// }

// sliderList.addEventListener('click', async (e) => {
//   const btn = e.target.closest('.details-btn');
//   if (!btn) return;

//   const id = String(btn.dataset.id);
//   let item = cacheById.get(id);

//   if (!item) {
//     item = await fetchFurnitureById(id);
//   }

//   if (item && typeof window.showModal === 'function') {
//     window.showModal(item);
//   } else {
//     iziToast.error({
//       title: 'Помилка',
//       message: 'Товар не знайдено або showModal недоступний.',
//       position: 'topRight',
//     });
//   }
// });

// initPopularSlider();

import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

// DOM
const sliderContainer = document.getElementById('popular-slider-container');
const sliderList = document.getElementById('popular-slider');
const btnLeft = document.getElementById('btn-left');
const btnRight = document.getElementById('btn-right');
const indicators = document.getElementById('slider-indicators');

// МОДАЛКА (готова розмітка має бути в HTML)
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');

const BASE_URL = 'https://furniture-store.b.goit.study/api';
const LIMIT = 8;
let page = 1;
let totalItems = null;
let isLoading = false;

const cacheById = new Map();
// зробимо кеш і модалку доступними глобально (щоб інші файли теж могли викликати)
window.__popularCache = cacheById;

function showModal(furniture) {
  if (!modal || !modalBody) return;

  modalBody.innerHTML = `
    <div class="modal-wrapper">
      <div class="modal-images">
        <img class="main-image" src="${furniture.images?.[0] || ''}" alt="${furniture.name || ''}" />
        <div class="modal-thumbs">${(furniture.images || [])
          .slice(1)
          .map(i => `<img src="${i}" alt="${furniture.name || ''}"/>`)
          .join('')}</div>
      </div>
      <div class="modal-info">
        <h2 class="modal-title">${furniture.name || ''}</h2>
        <p class="modal-subtitle">${furniture.category?.name || 'Категорія'}</p>
        <p class="modal-price">${typeof furniture.price === 'number' ? furniture.price.toLocaleString() : 'N/A'} грн</p>
        <p class="modal-description">${furniture.description || ''}</p>
        <button class="modal-order-btn">Перейти до замовлення</button>
      </div>
    </div>`;
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}
window.showModal = showModal; // місток для зовнішніх викликів

function closeModal() {
  if (!modal) return;
  modal.classList.add('hidden');
  document.body.style.overflow = '';
}

// Хелпери
const debounce = (fn, ms = 120) => {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
};

// API
async function fetchPopularFurniture({ page, limit }) {
  const url = `${BASE_URL}/furnitures?type=popular&page=${page}&limit=${limit}`;
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data?.furnitures)) {
      data.furnitures.forEach(f => cacheById.set(String(f._id), f));
      return data;
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
  throw new Error('Не вдалося отримати дані з API');
}

// Надійний пошук одного товару по ID (кілька можливих маршрутів/форматів відповіді)
async function fetchFurnitureById(id) {
  id = String(id);
  const candidates = [
    `${BASE_URL}/furnitures/${id}`,
    `${BASE_URL}/furniture/${id}`,
    `${BASE_URL}/furnitures?id=${id}`,
    `${BASE_URL}/furniture?id=${id}`,
  ];
  for (const url of candidates) {
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!res.ok) continue;
      const j = await res.json();
      const item = j?.furniture || j?.furnitures?.[0] || (j?._id && j);
      if (item) {
        cacheById.set(id, item);
        return item;
      }
    } catch (_) {}
  }
  return null;
}

// Рендер карток
function createFurnitureCardsMarkup(furnitures) {
  return furnitures.map(f => {
    const imageUrl = f.images?.[0] || 'https://via.placeholder.com/300x200?text=No+Image';
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
          <p class="card-price">${typeof f.price === 'number' ? f.price + ' грн' : '—'}</p>
          <button class="details-btn" data-id="${f._id}">Детальніше</button>
        </div>
      </li>`;
  }).join('');
}

let swiperInstance = null;
const TOTAL_BULLETS = 7;

async function loadMoreIfNeeded() {
  if (isLoading) return;
  if (totalItems !== null && sliderList.children.length >= totalItems) return;

  isLoading = true;
  page += 1;

  try {
    const data = await fetchPopularFurniture({ page, limit: LIMIT });
    if (data?.furnitures?.length) {
      const markup = createFurnitureCardsMarkup(data.furnitures);
      sliderList.insertAdjacentHTML('beforeend', markup);
      swiperInstance?.update();
    }
  } catch (e) {
    console.warn('Не вдалось довантажити:', e.message);
  } finally {
    isLoading = false;
  }
}

async function initPopularSlider() {
  if (!sliderContainer) return;

  // страховка від сторонніх стилів
  sliderList?.classList.remove('furniture-list');

  isLoading = true;
  try {
    const data = await fetchPopularFurniture({ page, limit: LIMIT });
    totalItems = typeof data.totalItems === 'number' ? data.totalItems : data.furnitures.length;

    sliderList.innerHTML = createFurnitureCardsMarkup(data.furnitures);

    swiperInstance = new Swiper(sliderContainer, {
      modules: [Navigation, Pagination],
      loop: window.innerWidth < 768,
      spaceBetween: 16,
      // чіткі кількості, десктоп = 4
      breakpoints: {
        0:    { slidesPerView: 1, centeredSlides: true,  spaceBetween: 8  },
        768:  { slidesPerView: 2, centeredSlides: false, spaceBetween: 20 },
        1440: { slidesPerView: 4, centeredSlides: false, spaceBetween: 24 },
      },
      navigation: { nextEl: btnRight, prevEl: btnLeft },
      pagination: {
        el: indicators,
        clickable: true,
        bulletClass: 'popular-bullet',
        bulletActiveClass: 'popular-bullet-active',
        renderBullet: (index, className) => index < TOTAL_BULLETS ? `<span class="${className}"></span>` : '',
      },

      // підстраховки для ресайзу/DOM-змін
      observer: true,
      observeParents: true,
      observeSlideChildren: true,
      updateOnWindowResize: true,
      roundLengths: true,
      watchOverflow: true,

      on: {
        resize() { this.update(); },
        beforeResize() { this.updateSize(); },
        slideChange() {
          const bullets = indicators.querySelectorAll('.popular-bullet');
          if (!bullets.length) return;
          const activeIndex = this.realIndex % TOTAL_BULLETS;
          bullets.forEach((b, i) => b.classList.toggle('popular-bullet-active', i === activeIndex));

          const slidesLeft = this.slides.length - this.realIndex - this.params.slidesPerView;
          if (slidesLeft <= 3) loadMoreIfNeeded();
        },
        reachEnd: () => loadMoreIfNeeded(),
      },
    });

    // дати верстці «осісти», потім оновити
    requestAnimationFrame(() => swiperInstance?.update());
    window.addEventListener('resize', debounce(() => {
      if (!swiperInstance) return;
      swiperInstance.updateSize();
      swiperInstance.updateSlides();
      swiperInstance.update();
    }, 120));

    swiperInstance.emit('slideChange');
  } catch (error) {
    console.error('Помилка ініціалізації слайдера:', error);
    iziToast.error({ title: 'Помилка', message: 'Не вдалося завантажити товари.' });
  } finally {
    isLoading = false;
  }
}

// Відкриття модалки з картки
sliderList.addEventListener('click', async e => {
  const btn = e.target.closest('.details-btn');
  if (!btn) return;

  const id = String(btn.dataset.id);
  let item = cacheById.get(id);

  if (!item) {
    iziToast.info({ title: 'Завантаження...', message: 'Отримуємо деталі товару.' });
    item = await fetchFurnitureById(id);
  }

  if (item) {
    showModal(item);
  } else {
    iziToast.error({ title: 'Помилка', message: 'Не вдалося завантажити інформацію про товар.' });
  }
});

// Закриття модалки
modalClose?.addEventListener('click', closeModal);
window.addEventListener('click', e => { if (e.target === modal) closeModal(); });
window.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal?.classList.contains('hidden')) closeModal(); });

// Старт
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initPopularSlider, 100);
});



