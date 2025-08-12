// import Swiper from 'swiper';
// import { Navigation, Pagination } from 'swiper/modules';
// import 'swiper/css';
// import 'swiper/css/navigation';
// import 'swiper/css/pagination';
// import iziToast from 'izitoast';
// import 'izitoast/dist/css/iziToast.min.css';

// // DOM
// const sliderContainer = document.getElementById('popular-slider-container');
// const sliderList = document.getElementById('popular-slider');
// const btnLeft = document.getElementById('btn-left');
// const btnRight = document.getElementById('btn-right');
// const indicators = document.getElementById('slider-indicators');

// // МОДАЛКА (готова розмітка має бути в HTML)
// const modal = document.getElementById('modal');
// const modalBody = document.getElementById('modal-body');
// const modalClose = document.getElementById('modal-close');

// const BASE_URL = 'https://furniture-store.b.goit.study/api';
// const LIMIT = 8;
// let page = 1;
// let totalItems = null;
// let isLoading = false;

// const cacheById = new Map();
// // зробимо кеш і модалку доступними глобально (щоб інші файли теж могли викликати)
// window.__popularCache = cacheById;

// function showModal(furniture) {
//   if (!modal || !modalBody) return;

//   modalBody.innerHTML = `
//     <div class="modal-wrapper">
//       <div class="modal-images">
//         <img class="main-image" src="${furniture.images?.[0] || ''}" alt="${furniture.name || ''}" />
//         <div class="modal-thumbs">${(furniture.images || [])
//           .slice(1)
//           .map(i => `<img src="${i}" alt="${furniture.name || ''}"/>`)
//           .join('')}</div>
//       </div>
//       <div class="modal-info">
//         <h2 class="modal-title">${furniture.name || ''}</h2>
//         <p class="modal-subtitle">${furniture.category?.name || 'Категорія'}</p>
//         <p class="modal-price">${typeof furniture.price === 'number' ? furniture.price.toLocaleString() : 'N/A'} грн</p>
//         <p class="modal-description">${furniture.description || ''}</p>
//         <button class="modal-order-btn">Перейти до замовлення</button>
//       </div>
//     </div>`;
//   modal.classList.remove('hidden');
//   document.body.style.overflow = 'hidden';
// }
// window.showModal = showModal; // місток для зовнішніх викликів

// function closeModal() {
//   if (!modal) return;
//   modal.classList.add('hidden');
//   document.body.style.overflow = '';
// }

//   Функція показу модального вікна:
// function showModal(furniture) {
//   modalBody.innerHTML = `
//     <div class="modal-wrapper">
//       <div class="modal-images">
//         <img class="main-image" src="${furniture.images[0]}" alt="${
//     furniture.name
//   }" />
//         <div class="modal-thumbs">${furniture.images
//           .slice(1)
//           .map(
//             i => `<img class="modal-thumb" src="${i}" alt="${furniture.name}"/>`
//           )
//           .join('')}</div>
//       </div>
//       <div class="modal-info">
//         <h2 class="modal-title">${furniture.name}</h2>
//         <p class="modal-subtitle">${furniture.category.name}</p>
//         <p class="modal-price">${furniture.price.toLocaleString()} грн</p>
//         ${renderStars(furniture.rate || 0)}
//         <div class="modal-colors"><p>Колір:</p> <div class="color-list">${renderColorSwatches(
//           furniture.color
//         )}</div></div>
//         <p class="modal-description">${furniture.description}</p>
//         <p class="modal-size">Розмір: ${furniture.sizes || '280x180x85'}</p>
//         <button class="modal-order-btn">Перейти до замовлення</button>
//       </div>
//     </div>
//   `;
//   modal.classList.remove('hidden');
//   document.body.style.overflow = 'hidden';

//   const swatches = document.querySelectorAll('.modal .color-swatch');
//   swatches[0].classList.add('selected');

//   swatches.forEach(color => {
//     color.addEventListener('click', e => {
//       swatches.forEach(el => el.classList.remove('selected'));
//       e.currentTarget.classList.add('selected');
//     });
//   });
// }

// function renderColorSwatches(color) {
//   if (Array.isArray(color)) {
//     return color
//       .map(
//         c =>
//           `<span class="color-swatch" title="${c}" style="background-color: ${c};"></span>`
//       )
//       .join('');
//   } else {
//     return `<span class="color-swatch" title="${color}" style="background-color: ${color};"></span>`;
//   }
// }

// //   Функція закриття модального вікна:
// function closeModal() {
//   modal.classList.add('hidden');
//   document.body.style.overflow = '';
// }
// //   Події, повʼязані з модальним вікном (в initEvents)
// modalClose.addEventListener('click', closeModal);
// window.addEventListener('click', e => {
//   if (e.target === modal) closeModal();
// });
// window.addEventListener('keydown', e => {
//   if (e.key === 'Escape') closeModal();
// });
// // Хелпери
// const debounce = (fn, ms = 120) => {
//   let t;
//   return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
// };

// // API
// async function fetchPopularFurniture({ page, limit }) {
//   const url = `${BASE_URL}/furnitures?type=popular&page=${page}&limit=${limit}`;
//   try {
//     const res = await fetch(url, { headers: { Accept: 'application/json' } });
//     if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
//     const data = await res.json();
//     if (Array.isArray(data?.furnitures)) {
//       data.furnitures.forEach(f => cacheById.set(String(f._id), f));
//       return data;
//     }
//   } catch (error) {
//     console.error('Fetch error:', error);
//   }
//   throw new Error('Не вдалося отримати дані з API');
// }

// // Надійний пошук одного товару по ID (кілька можливих маршрутів/форматів відповіді)
// async function fetchFurnitureById(id) {
//   id = String(id);
//   const candidates = [
//     `${BASE_URL}/furnitures/${id}`,
//     `${BASE_URL}/furniture/${id}`,
//     `${BASE_URL}/furnitures?id=${id}`,
//     `${BASE_URL}/furniture?id=${id}`,
//   ];
//   for (const url of candidates) {
//     try {
//       const res = await fetch(url, { headers: { Accept: 'application/json' } });
//       if (!res.ok) continue;
//       const j = await res.json();
//       const item = j?.furniture || j?.furnitures?.[0] || (j?._id && j);
//       if (item) {
//         cacheById.set(id, item);
//         return item;
//       }
//     } catch (_) {}
//   }
//   return null;
// }

// // Рендер карток
// function createFurnitureCardsMarkup(furnitures) {
//   return furnitures.map(f => {
//     const imageUrl = f.images?.[0] || 'https://via.placeholder.com/300x200?text=No+Image';
//     const colors = Array.isArray(f.color) ? f.color.slice(0, 3) : [];
//     const dots = Array.from({ length: 3 }, (_, i) => {
//       const c = colors[i];
//       return c
//         ? `<span class="color-dot" style="background:${c}"></span>`
//         : `<span class="color-dot placeholder"></span>`;
//     }).join('');
//     return `
//       <li class="furniture-card swiper-slide">
//         <img src="${imageUrl}" alt="${f.name || 'Товар'}" class="card-img" />
//         <div class="card-content">
//           <h3 class="card-title">${f.name || 'Без назви'}</h3>
//           <div class="color-list">${dots}</div>
//           <p class="card-price">${typeof f.price === 'number' ? f.price + ' грн' : '—'}</p>
//           <button class="details-btn" data-id="${f._id}">Детальніше</button>
//         </div>
//       </li>`;
//   }).join('');
// }

// let swiperInstance = null;
// const TOTAL_BULLETS = 7;

// async function loadMoreIfNeeded() {
//   if (isLoading) return;
//   if (totalItems !== null && sliderList.children.length >= totalItems) return;

//   isLoading = true;
//   page += 1;

//   try {
//     const data = await fetchPopularFurniture({ page, limit: LIMIT });
//     if (data?.furnitures?.length) {
//       const markup = createFurnitureCardsMarkup(data.furnitures);
//       sliderList.insertAdjacentHTML('beforeend', markup);
//       swiperInstance?.update();
//     }
//   } catch (e) {
//     console.warn('Не вдалось довантажити:', e.message);
//   } finally {
//     isLoading = false;
//   }
// }

// async function initPopularSlider() {
//   if (!sliderContainer) return;

//   // страховка від сторонніх стилів
//   sliderList?.classList.remove('furniture-list');

//   isLoading = true;
//   try {
//     const data = await fetchPopularFurniture({ page, limit: LIMIT });
//     totalItems = typeof data.totalItems === 'number' ? data.totalItems : data.furnitures.length;

//     sliderList.innerHTML = createFurnitureCardsMarkup(data.furnitures);

//     swiperInstance = new Swiper(sliderContainer, {
//       modules: [Navigation, Pagination],
//       loop: window.innerWidth < 768,
//       spaceBetween: 16,
//       // чіткі кількості, десктоп = 4
//       breakpoints: {
//         0:    { slidesPerView: 1, centeredSlides: true,  spaceBetween: 8  },
//         768:  { slidesPerView: 2, centeredSlides: false, spaceBetween: 20 },
//         1440: { slidesPerView: 4, centeredSlides: false, spaceBetween: 24 },
//       },
//       navigation: { nextEl: btnRight, prevEl: btnLeft },
//       pagination: {
//         el: indicators,
//         clickable: true,
//         bulletClass: 'popular-bullet',
//         bulletActiveClass: 'popular-bullet-active',
//         renderBullet: (index, className) => index < TOTAL_BULLETS ? `<span class="${className}"></span>` : '',
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
//         slideChange() {
//           const bullets = indicators.querySelectorAll('.popular-bullet');
//           if (!bullets.length) return;
//           const activeIndex = this.realIndex % TOTAL_BULLETS;
//           bullets.forEach((b, i) => b.classList.toggle('popular-bullet-active', i === activeIndex));

//           const slidesLeft = this.slides.length - this.realIndex - this.params.slidesPerView;
//           if (slidesLeft <= 3) loadMoreIfNeeded();
//         },
//         reachEnd: () => loadMoreIfNeeded(),
//       },
//     });

//     // дати верстці «осісти», потім оновити
//     requestAnimationFrame(() => swiperInstance?.update());
//     window.addEventListener('resize', debounce(() => {
//       if (!swiperInstance) return;
//       swiperInstance.updateSize();
//       swiperInstance.updateSlides();
//       swiperInstance.update();
//     }, 120));

//     swiperInstance.emit('slideChange');
//   } catch (error) {
//     console.error('Помилка ініціалізації слайдера:', error);
//     iziToast.error({ title: 'Помилка', message: 'Не вдалося завантажити товари.' });
//   } finally {
//     isLoading = false;
//   }
// }

// // Відкриття модалки з картки
// sliderList.addEventListener('click', async e => {
//   const btn = e.target.closest('.details-btn');
//   if (!btn) return;

//   const id = String(btn.dataset.id);
//   let item = cacheById.get(id);

//   if (!item) {
//     iziToast.info({ title: 'Завантаження...', message: 'Отримуємо деталі товару.' });
//     item = await fetchFurnitureById(id);
//   }

//   if (item) {
//     showModal(item);
//   } else {
//     iziToast.error({ title: 'Помилка', message: 'Не вдалося завантажити інформацію про товар.' });
//   }
// });

// // Закриття модалки
// modalClose?.addEventListener('click', closeModal);
// window.addEventListener('click', e => { if (e.target === modal) closeModal(); });
// window.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal?.classList.contains('hidden')) closeModal(); });

// // Старт
// document.addEventListener('DOMContentLoaded', () => {
//   setTimeout(initPopularSlider, 100);
// });

import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

// ===== DOM =====
const sliderContainer = document.getElementById('popular-slider-container');
const sliderList = document.getElementById('popular-slider');
const btnLeft = document.getElementById('btn-left');
const btnRight = document.getElementById('btn-right');
const indicators = document.getElementById('slider-indicators');

// МОДАЛКА (готова розмітка має бути в HTML)
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');

// ===== CONFIG / STATE =====
const BASE_URL = 'https://furniture-store.b.goit.study/api';
const LIMIT = 8;
let page = 1;
let totalItems = null;
let isLoading = false;

const cacheById = new Map();
window.__popularCache = cacheById; // зробимо кеш доступним глобально

// ===== HELPERS =====
const debounce = (fn, ms = 120) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};

// Простий рендер зірок з перевірками
function renderStars(rate = 0) {
  const r = Math.max(0, Math.min(5, Math.round(Number(rate) || 0)));
  return `<div class="stars" aria-label="Рейтинг ${r} з 5">${'★'.repeat(
    r
  )}${'☆'.repeat(5 - r)}</div>`;
}

function renderColorSwatches(color) {
  if (Array.isArray(color) && color.length) {
    return color
      .map(
        c =>
          `<span class="color-swatch" title="${String(
            c
          )}" style="background-color:${String(c)};"></span>`
      )
      .join('');
  }
  if (typeof color === 'string' && color.trim()) {
    return `<span class="color-swatch" title="${color}" style="background-color:${color};"></span>`;
  }
  return ''; // немає кольорів
}

// ===== MODAL =====
function showModal(furniture = {}) {
  if (!modal || !modalBody) return;

  const imgs = Array.isArray(furniture.images) ? furniture.images : [];
  const mainImg =
    imgs[0] || 'https://via.placeholder.com/600x450?text=No+Image';
  const name = furniture.name || 'Без назви';
  const category = furniture.category?.name || 'Категорія';
  const price =
    typeof furniture.price === 'number'
      ? furniture.price.toLocaleString()
      : 'N/A';
  const sizes = furniture.sizes || '—';
  const desc = furniture.description || '';

  modalBody.innerHTML = `
    <div class="modal-wrapper">
      <div class="modal-images">
        <img class="main-image" src="${mainImg}" alt="${name}" />
        <div class="modal-thumbs">
          ${imgs
            .slice(1)
            .map(i => `<img class="modal-thumb" src="${i}" alt="${name}" />`)
            .join('')}
        </div>
      </div>
      <div class="modal-info">
        <h2 class="modal-title">${name}</h2>
        <p class="modal-subtitle">${category}</p>
        <p class="modal-price">${price} грн</p>
        ${renderStars(furniture.rate)}
        <div class="modal-colors">
          <p>Колір:</p>
          <div class="color-list">${renderColorSwatches(furniture.color)}</div>
        </div>
        <p class="modal-description">${desc}</p>
        <p class="modal-size">Розмір: ${sizes}</p>
        <button class="modal-order-btn">Перейти до замовлення</button>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  // кліки по превʼю → підміняємо головне фото
  modalBody.querySelector('.modal-thumbs')?.addEventListener('click', e => {
    const thumb = e.target.closest('.modal-thumb');
    if (!thumb) return;
    const main = modalBody.querySelector('.main-image');
    if (main) main.src = thumb.src;
  });

  // вибір кольору
  const swatches = modalBody.querySelectorAll('.color-swatch');
  if (swatches.length) {
    swatches[0].classList.add('selected');
    swatches.forEach(s =>
      s.addEventListener('click', e => {
        swatches.forEach(el => el.classList.remove('selected'));
        e.currentTarget.classList.add('selected');
      })
    );
  }
}
window.showModal = showModal; // на випадок зовнішніх викликів

function closeModal() {
  if (!modal) return;
  modal.classList.add('hidden');
  document.body.style.overflow = '';
}

// ===== API =====
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

// ===== RENDER CARDS =====
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

// ===== SWIPER =====
let swiperInstance = null;
const TOTAL_BULLETS = 7;

async function loadMoreIfNeeded() {
  if (isLoading) return;
  if (
    totalItems !== null &&
    sliderList &&
    sliderList.children.length >= totalItems
  )
    return;

  isLoading = true;
  page += 1;

  try {
    const data = await fetchPopularFurniture({ page, limit: LIMIT });
    if (data?.furnitures?.length && sliderList) {
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
  if (!sliderContainer || !sliderList) return;

  // страховка від сторонніх стилів
  sliderList.classList.remove('furniture-list');

  isLoading = true;
  try {
    const data = await fetchPopularFurniture({ page, limit: LIMIT });
    totalItems =
      typeof data.totalItems === 'number'
        ? data.totalItems
        : data.furnitures.length;

    sliderList.innerHTML = createFurnitureCardsMarkup(data.furnitures);

    const options = {
      modules: [Navigation, Pagination],
      loop: false,
      spaceBetween: 16,
      breakpoints: {
        0: { slidesPerView: 1, centeredSlides: true, spaceBetween: 8 },
        768: { slidesPerView: 2, centeredSlides: false, spaceBetween: 20 },
        1440: { slidesPerView: 4, centeredSlides: false, spaceBetween: 24 },
      },
      // підстраховки для ресайзу/DOM-змін
      observer: true,
      observeParents: true,
      observeSlideChildren: true,
      updateOnWindowResize: true,
      roundLengths: true,
      watchOverflow: true,
      on: {
        // Подія, що спрацьовує один раз після ініціалізації
        init: function () {
          if (btnLeft && btnRight) {
            // `this` тут - це екземпляр Swiper
            btnLeft.classList.toggle('btn-disabled', this.isBeginning);
            btnRight.classList.toggle('btn-disabled', this.isEnd);
          }
        },

        // Подія, що спрацьовує при кожній зміні слайду
        slideChange: function () {
          if (btnLeft && btnRight) {
            btnLeft.classList.toggle('btn-disabled', this.isBeginning);
            btnRight.classList.toggle('btn-disabled', this.isEnd);
          }

          // Ваш існуючий код для індикаторів
          if (indicators) {
            const bullets = indicators.querySelectorAll('.popular-bullet');
            if (bullets.length) {
              const activeIndex = this.realIndex % TOTAL_BULLETS;
              bullets.forEach((b, i) =>
                b.classList.toggle('popular-bullet-active', i === activeIndex)
              );
            }
          }

          // Ваш існуючий код для довантаження
          const slidesLeft =
            this.slides.length - this.realIndex - this.params.slidesPerView;
          if (slidesLeft <= 3) loadMoreIfNeeded();
        },

        // Подія при зміні розміру вікна
        resize: function () {
          this.update();
          // Також оновлюємо стан кнопок, оскільки isBeginning/isEnd може змінитися
          if (btnLeft && btnRight) {
            btnLeft.classList.toggle('btn-disabled', this.isBeginning);
            btnRight.classList.toggle('btn-disabled', this.isEnd);
          }
        },

        // Інші ваші обробники
        beforeResize() {
          this.updateSize();
        },
        reachEnd: () => loadMoreIfNeeded(),
      },
    };

    if (btnLeft && btnRight) {
      options.navigation = { nextEl: btnRight, prevEl: btnLeft };
    }
    if (indicators) {
      options.pagination = {
        el: indicators,
        clickable: true,
        bulletClass: 'popular-bullet',
        bulletActiveClass: 'popular-bullet-active',
        renderBullet: (index, className) =>
          index < TOTAL_BULLETS ? `<span class="${className}"></span>` : '',
      };
    }

    swiperInstance = new Swiper(sliderContainer, options);

    // дати верстці «осісти», потім оновити
    requestAnimationFrame(() => swiperInstance?.update());
    window.addEventListener(
      'resize',
      debounce(() => {
        if (!swiperInstance) return;
        swiperInstance.updateSize();
        swiperInstance.updateSlides();
        swiperInstance.update();
      }, 120)
    );

    swiperInstance.emit('slideChange');
  } catch (error) {
    console.error('Помилка ініціалізації слайдера:', error);
    iziToast.error({
      title: 'Помилка',
      message: 'Не вдалося завантажити товари.',
    });
  } finally {
    isLoading = false;
  }
}

// ===== BOOTSTRAP / EVENTS =====

function initializePage() {
  // 1. Налаштовуємо модалку (це можна робити одразу)
  modalClose?.addEventListener('click', closeModal);
  window.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal?.classList.contains('hidden'))
      closeModal();
  });

  // 2. Налаштовуємо делегування кліків (теж можна одразу)
  if (sliderList) {
    sliderList.addEventListener('click', async e => {
      const btn = e.target.closest('.details-btn');
      if (!btn) return;

      const id = String(btn.dataset.id);
      let item = cacheById.get(id);

      if (!item) {
        iziToast.info({
          title: 'Завантаження...',
          message: 'Отримуємо деталі товару.',
        });
        item = await fetchFurnitureById(id);
      }

      item
        ? showModal(item)
        : iziToast.error({
            title: 'Помилка',
            message: 'Не вдалося завантажити інформацію про товар.',
          });
    });
  }

  // 3. Створюємо спостерігача для секції зі слайдером
  const popularSection = document.querySelector('.popular-section');
  if (!popularSection) {
    console.error(
      'Не знайдено секцію для слайдера. Завантаження не відбудеться.'
    );
    return;
  }

  const sliderObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Якщо секція з'явилась в полі зору - запускаємо ініціалізацію
          initPopularSlider();
          // І припиняємо спостереження, бо нам це потрібно лише один раз
          observer.unobserve(popularSection);
        }
      });
    },
    { rootMargin: '200px' }
  );

  // Кажемо спостерігачу стежити за нашою секцією
  sliderObserver.observe(popularSection);
}

// Запускаємо всю ініціалізацію після завантаження HTML
document.addEventListener('DOMContentLoaded', initializePage);
