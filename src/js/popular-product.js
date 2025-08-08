
// const slider = document.getElementById('popular-slider');
// const btnLeft = document.getElementById('btn-left');
// const btnRight = document.getElementById('btn-right');

// const BASE_URL = 'https://furniture-store.b.goit.study/api';
// const LIMIT = 4;            
// let page = 1;              
// let totalItems = null;     
// let isLoading = false;

// let scrollAmount = 0;
// let maxScroll = 0;


// async function fetchPopularFurniture({ page, limit }) {
//   const candidates = [
//     `${BASE_URL}/furnitures?type=popular&page=${page}&limit=${limit}`,
//     `${BASE_URL}/furniture?type=popular&page=${page}&limit=${limit}`,
   
//     `${BASE_URL}/furnitures?sortName=rate&sortDirect=desc&page=${page}&limit=${limit}`,
//     `${BASE_URL}/furniture?sortName=rate&sortDirect=desc&page=${page}&limit=${limit}`,
//   ];

//   for (const url of candidates) {
//     try {
//       const res = await fetch(url, { headers: { Accept: 'application/json' } });
//       if (!res.ok) { continue; }
//       const data = await res.json();
//       if (Array.isArray(data?.furnitures)) return data;
//     } catch (_) {}
//   }
//   throw new Error('Жоден маршрут не повернув дані');
// }



// function createFurnitureCard(f) {
//   const li = document.createElement('li');
//   li.className = 'furniture-card';

//   const imageUrl = f.images?.[0] || 'https://via.placeholder.com/300x200?text=No+Image';
//   const colors = Array.isArray(f.color) ? f.color.slice(0, 3) : [];

//   const dots = Array.from({ length: 3 }, (_, i) => {
//     const c = colors[i];
//     return c
//       ? `<span class="color-dot" style="background:${c}"></span>`
//       : `<span class="color-dot placeholder" aria-hidden="true"></span>`;
//   }).join('');

//   li.innerHTML = `
//     <img src="${imageUrl}" alt="${f.name || 'Товар'}" class="card-img" />
//     <h3 class="card-title">${f.name || 'Без назви'}</h3>
//     <div class="card-bottom">
//       <div class="color-list">${dots}</div>
//       <p class="card-price">${typeof f.price === 'number' ? f.price + ' грн' : '—'}</p>
//     </div>
//     <button class="details-btn" data-id="${f._id}">Детальніше</button>
//   `;
//   return li;
// }

// async function loadPopularFirstPage() {
//   isLoading = true;
//   try {
//     const data = await fetchPopularFurniture({ page, limit: LIMIT });
//     const { furnitures, totalItems: total } = data;
//     totalItems = total ?? furnitures.length; 

//     if (!furnitures || furnitures.length === 0) {
//       slider.innerHTML = '<li>Немає популярних товарів.</li>';
//       btnLeft.disabled = true; btnRight.disabled = true;
//       return;
//     }

//     furnitures.forEach(f => slider.appendChild(createFurnitureCard(f)));
//     measureAndBind();
//   } catch (e) {
//     console.error('Помилка завантаження:', e);
//     slider.innerHTML = '<li>Не вдалося завантажити популярні товари.</li>';
//     btnLeft.disabled = true; btnRight.disabled = true;
//   } finally {
//     isLoading = false;
//   }
// }


// async function loadMoreIfNeeded() {
//   if (isLoading) return;
//   const loadedCount = slider.children.length;
//   const noMore = (totalItems != null) && (loadedCount >= totalItems);
//   if (noMore) return;

 
//   const nearEnd = slider.scrollLeft >= (maxScroll - 10);
//   if (!nearEnd) return;

//   isLoading = true;
//   try {
//     page += 1;
//     const data = await fetchPopularFurniture({ page, limit: LIMIT });
//     (data.furnitures || []).forEach(f => slider.appendChild(createFurnitureCard(f)));
//     measureOnly(); 
//   } catch (e) {
//     console.warn('Не вдалось довантажити наступну сторінку:', e.message);
//   } finally {
//     isLoading = false;
//   }
// }


// let stepCache = 320;

// function measureOnly() {
//   maxScroll = Math.max(0, slider.scrollWidth - slider.clientWidth);
//   const first = slider.querySelector('.furniture-card');
//   if (first) {
//     const w = first.getBoundingClientRect().width;
//     const gap = parseFloat(getComputedStyle(slider).gap || getComputedStyle(slider).columnGap || '16') || 16;
//     stepCache = Math.round(w + gap);
//   }
//   updateButtons();
// }

// function measureAndBind() {
//   measureOnly();
//   slider.addEventListener('scroll', () => {
//     updateButtons();
//     loadMoreIfNeeded(); 
//   });
//   window.addEventListener('resize', measureOnly);
//   updateButtons();
// }

// function scrollSlider(direction) {
//   const target = Math.max(0, Math.min(maxScroll, slider.scrollLeft + direction * stepCache));
//   slider.scrollTo({ left: target, behavior: 'smooth' });
// }

// function updateButtons() {
//   maxScroll = Math.max(0, slider.scrollWidth - slider.clientWidth);
//   btnLeft.disabled = slider.scrollLeft <= 0;
//   btnRight.disabled = slider.scrollLeft >= maxScroll - 1;
// }


// function enableSwipe(container) {
//   let startX = 0;
//   container.addEventListener('touchstart', e => { startX = e.touches[0].clientX; });
//   container.addEventListener('touchend', e => {
//     const delta = e.changedTouches[0].clientX - startX;
//     if (delta > 50) scrollSlider(-1);
//     if (delta < -50) scrollSlider(1);
//   });
// }


// btnLeft.addEventListener('click', () => scrollSlider(-1));
// btnRight.addEventListener('click', () => {
//   scrollSlider(1);
 
//   setTimeout(loadMoreIfNeeded, 350);
// });
// enableSwipe(slider);


// loadPopularFirstPage();

const slider = document.getElementById('popular-slider');
const btnLeft = document.getElementById('btn-left');
const btnRight = document.getElementById('btn-right');
const indicators = document.getElementById('slider-indicators');

const BASE_URL = 'https://furniture-store.b.goit.study/api';
const LIMIT = 4;             // тягнемо по 4 за раз
const PER_VIEW = 4;          // показуємо 4 за екран
let page = 1;
let totalItems = null;
let isLoading = false;

let scrollAmount = 0;
let maxScroll = 0;
let stepCache = 320;         // ширина картки + gap
let pageCount = 0;           // к-сть “сторінок” (по 4 картки)
let currentPage = 0;

// ---------- API ----------
async function fetchPopularFurniture({ page, limit }) {
  const candidates = [
    `${BASE_URL}/furnitures?type=popular&page=${page}&limit=${limit}`,
    `${BASE_URL}/furniture?type=popular&page=${page}&limit=${limit}`,
    `${BASE_URL}/furnitures?sortName=rate&sortDirect=desc&page=${page}&limit=${limit}`,
    `${BASE_URL}/furniture?sortName=rate&sortDirect=desc&page=${page}&limit=${limit}`,
  ];

  for (const url of candidates) {
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!res.ok) continue;
      const data = await res.json();
      if (Array.isArray(data?.furnitures)) return data;
    } catch (_) {}
  }
  throw new Error('Жоден маршрут не повернув дані');
}

// ---------- Карта ----------
function createFurnitureCard(f) {
  const li = document.createElement('li');
  li.className = 'furniture-card';

  const imageUrl = f.images?.[0] || 'https://via.placeholder.com/300x200?text=No+Image';
  const colors = Array.isArray(f.color) ? f.color.slice(0, 3) : [];

  const dots = Array.from({ length: 3 }, (_, i) => {
    const c = colors[i];
    return c
      ? `<span class="color-dot" style="background:${c}"></span>`
      : `<span class="color-dot placeholder" aria-hidden="true"></span>`;
  }).join('');

  li.innerHTML = `
    <img src="${imageUrl}" alt="${f.name || 'Товар'}" class="card-img" />
    <h3 class="card-title">${f.name || 'Без назви'}</h3>
    <div class="card-bottom">
      <div class="color-list">${dots}</div>
      <p class="card-price">${typeof f.price === 'number' ? f.price + ' грн' : '—'}</p>
    </div>
    <button class="details-btn" data-id="${f._id}">Детальніше</button>
  `;
  return li;
}

// ---------- Індикатори ----------
function getViewportWidth() {
  const wrapper = slider.parentElement; // .popular-slider-wrapper
  return wrapper.clientWidth;
}

function buildIndicators() {
  const totalItemsNow = slider.children.length;
  pageCount = Math.max(1, Math.ceil(totalItemsNow / PER_VIEW));
  indicators.innerHTML = '';

  for (let i = 0; i < pageCount; i++) {
    const dot = document.createElement('span');
    dot.className = 'page-dot' + (i === currentPage ? ' active' : '');
    dot.addEventListener('click', () => goToPage(i));
    indicators.appendChild(dot);
  }
}

function updateDots() {
  const dots = indicators.querySelectorAll('.page-dot');
  dots.forEach((d, i) => d.classList.toggle('active', i === currentPage));
}

// ---------- Завантаження ----------
async function loadPopularFirstPage() {
  isLoading = true;
  try {
    const data = await fetchPopularFurniture({ page, limit: LIMIT });
    const { furnitures, totalItems: total } = data;
    totalItems = total ?? furnitures.length;

    if (!furnitures || furnitures.length === 0) {
      slider.innerHTML = '<li>Немає популярних товарів.</li>';
      btnLeft.disabled = true; btnRight.disabled = true;
      return;
    }

    furnitures.forEach(f => slider.appendChild(createFurnitureCard(f)));
    measureAndBind();
    currentPage = 0;
    buildIndicators();
    goToPage(0); // старт
  } catch (e) {
    console.error('Помилка завантаження:', e);
    slider.innerHTML = '<li>Не вдалося завантажити популярні товари.</li>';
    btnLeft.disabled = true; btnRight.disabled = true;
  } finally {
    isLoading = false;
  }
}

async function loadMoreIfNeeded() {
  if (isLoading) return;
  const loadedCount = slider.children.length;
  const noMore = (totalItems != null) && (loadedCount >= totalItems);
  if (noMore) return;

  const nearEnd = slider.scrollLeft >= (maxScroll - 10);
  if (!nearEnd) return;

  isLoading = true;
  try {
    page += 1;
    const data = await fetchPopularFurniture({ page, limit: LIMIT });
    (data.furnitures || []).forEach(f => slider.appendChild(createFurnitureCard(f)));
    measureOnly();
    buildIndicators();              // оновлюємо кружечки після довантаження
    updateDots();
  } catch (e) {
    console.warn('Не вдалось довантажити наступну сторінку:', e.message);
  } finally {
    isLoading = false;
  }
}

// ---------- Виміри / скрол ----------
function measureOnly() {
  maxScroll = Math.max(0, slider.scrollWidth - slider.clientWidth);
  const first = slider.querySelector('.furniture-card');
  if (first) {
    const w = first.getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(slider).gap || getComputedStyle(slider).columnGap || '16') || 16;
    stepCache = Math.round(w + gap);
  }
  updateButtons();
}

function measureAndBind() {
  measureOnly();

  slider.addEventListener('scroll', () => {
    updateButtons();
    loadMoreIfNeeded();

    // оновлюємо активний кружечок від реального скрола
    const vw = getViewportWidth();
    const pageByScroll = Math.round(slider.scrollLeft / vw);
    if (pageByScroll !== currentPage) {
      currentPage = Math.max(0, Math.min(pageCount - 1, pageByScroll));
      updateDots();
    }
  });

  window.addEventListener('resize', () => {
    measureOnly();
    // лишаємось на поточній сторінці після ресайзу
    goToPage(currentPage, { smooth: false });
  });

  updateButtons();
}

function scrollSlider(direction) {
  const target = Math.max(0, Math.min(maxScroll, slider.scrollLeft + direction * stepCache));
  slider.scrollTo({ left: target, behavior: 'smooth' });
}

// Переходимо сторінками (по ширині видимої області)
function goToPage(p, opts = { smooth: true }) {
  currentPage = Math.max(0, Math.min(pageCount - 1, p));
  const left = currentPage * getViewportWidth();
  slider.scrollTo({ left, behavior: opts.smooth ? 'smooth' : 'auto' });
  updateButtons();
  updateDots();
}

function updateButtons() {
  maxScroll = Math.max(0, slider.scrollWidth - slider.clientWidth);
  btnLeft.disabled = slider.scrollLeft <= 0;
  btnRight.disabled = slider.scrollLeft >= maxScroll - 1;
}

// ---------- Свайп ----------
function enableSwipe(container) {
  let startX = 0;
  container.addEventListener('touchstart', e => { startX = e.touches[0].clientX; });
  container.addEventListener('touchend', e => {
    const delta = e.changedTouches[0].clientX - startX;
    if (delta > 50) goToPage(currentPage - 1);
    if (delta < -50) goToPage(currentPage + 1);
  });
}

// ---------- Події ----------
btnLeft.addEventListener('click', () => goToPage(currentPage - 1));
btnRight.addEventListener('click', () => {
  goToPage(currentPage + 1);
  setTimeout(loadMoreIfNeeded, 350);
});
enableSwipe(slider);

// ---------- Старт ----------
loadPopularFirstPage();