// ====== DOM ======
const slider     = document.getElementById('popular-slider');            // <ul>
const scroller   = document.querySelector('.popular-slider-wrapper');    // обгортка (скрол-контейнер)
const btnLeft    = document.getElementById('btn-left');
const btnRight   = document.getElementById('btn-right');
const indicators = document.getElementById('slider-indicators');

// ====== STATE ======
const BASE_URL   = 'https://furniture-store.b.goit.study/api';
const LIMIT      = 4;     // тягнемо по 4 за раз
let page         = 1;     // сторінка бекенду
let totalItems   = null;  // загальна к-сть (з бекенду)
let isLoading    = false;

let pageCount    = 0;     // к-сть «сторінок» = ceil(total/perView)
let currentPage  = 0;     // 0-based

// ====== API (із підстраховкою маршрутів) ======
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

// ====== РЕНДЕР КАРТКИ ======
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
    <div class="card-content">
      <h3 class="card-title">${f.name || 'Без назви'}</h3>
      <div class="color-list">${dots}</div>
      <p class="card-price">${typeof f.price === 'number' ? f.price + ' грн' : '—'}</p>
      <button class="details-btn" data-id="${f._id}">Детальніше</button>
    </div>
  `;
  return li;
}

// ====== МЕТРИКИ (точний крок сторінки) ======
// cardW   — фактична ширина картки
// gap     — фактичний gap із CSS
// per     — скільки карток влазить зараз у вікно
// pageW   — ширина «сторінки» = per*(cardW+gap) - gap
function getMetrics() {
  const first = slider.querySelector('.furniture-card');
  const gap = parseFloat(getComputedStyle(slider).gap || '16') || 16;

  if (!first) {
    return {
      cardW: 0,
      gap,
      per: 1,
      pageW: scroller.clientWidth || 0
    };
  }

  const cardW = first.getBoundingClientRect().width;
  const per   = Math.max(1, Math.floor((scroller.clientWidth + gap) / (cardW + gap)));
  const pageW = per * (cardW + gap) - gap;

  return { cardW, gap, per, pageW };
}

// ====== ІНДИКАТОРИ ======
function buildIndicators() {
  const total = (typeof totalItems === 'number' && totalItems > 0)
    ? totalItems
    : slider.children.length;

  const { per } = getMetrics();
  pageCount = Math.max(1, Math.ceil(total / per));

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

// ====== ЗАВАНТАЖЕННЯ ======
async function loadPopularFirstPage() {
  isLoading = true;
  try {
    const data = await fetchPopularFurniture({ page, limit: LIMIT });
    const { furnitures, totalItems: total } = data;
    totalItems = typeof total === 'number' ? total : furnitures.length;

    if (!furnitures || furnitures.length === 0) {
      slider.innerHTML = '<li>Немає популярних товарів.</li>';
      btnLeft.disabled = true;
      btnRight.disabled = true;
      return;
    }

    furnitures.forEach(f => slider.appendChild(createFurnitureCard(f)));

    bindScrollAndResize();
    currentPage = 0;
    buildIndicators();
    goToPage(0, { smooth: false });
  } catch (e) {
    console.error('Помилка завантаження:', e);
    slider.innerHTML = '<li>Не вдалося завантажити популярні товари.</li>';
    btnLeft.disabled = true;
    btnRight.disabled = true;
  } finally {
    isLoading = false;
  }
}

async function loadMoreIfNeeded() {
  if (isLoading) return;

  const loadedCount = slider.children.length;
  const noMore = (typeof totalItems === 'number') && (loadedCount >= totalItems);
  if (noMore) return;

  // довантажуємо, коли майже в кінці
  const maxScroll = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
  if (scroller.scrollLeft < (maxScroll - 10)) return;

  isLoading = true;
  try {
    page += 1;
    const data = await fetchPopularFurniture({ page, limit: LIMIT });
    (data.furnitures || []).forEach(f => slider.appendChild(createFurnitureCard(f)));

    buildIndicators();
    updateDots();
  } catch (e) {
    console.warn('Не вдалось довантажити наступну сторінку:', e.message);
  } finally {
    isLoading = false;
  }
}

// ====== СКРОЛ/РЕСАЙЗ ======
function bindScrollAndResize() {
  scroller.addEventListener('scroll', () => {
    const { pageW } = getMetrics();
    const pageByScroll = pageW > 0 ? Math.round(scroller.scrollLeft / pageW) : 0;
    if (pageByScroll !== currentPage) {
      currentPage = Math.max(0, Math.min(pageCount - 1, pageByScroll));
      updateDots();
      updateButtons();
    }
    loadMoreIfNeeded();
  });

  window.addEventListener('resize', () => {
    // при зміні розміру перераховуємо індикатори/сторінки
    buildIndicators();
    currentPage = Math.max(0, Math.min(pageCount - 1, currentPage));
    goToPage(currentPage, { smooth: false });
  });

  updateButtons();
}

// ====== НАВІГАЦІЯ ======
function scrollSlider(direction) {
  const { pageW } = getMetrics();
  const maxScroll = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
  const target = Math.max(0, Math.min(maxScroll, scroller.scrollLeft + direction * pageW));
  scroller.scrollTo({ left: target, behavior: 'smooth' });
}

function goToPage(p, opts = { smooth: true }) {
  currentPage = Math.max(0, Math.min(pageCount - 1, p));
  const { pageW } = getMetrics();
  const left = currentPage * pageW;
  scroller.scrollTo({ left, behavior: opts.smooth ? 'smooth' : 'auto' });
  updateButtons();
  updateDots();
}

function updateButtons() {
  btnLeft.disabled  = currentPage <= 0;
  btnRight.disabled = currentPage >= pageCount - 1;
}

// ====== СВАЙП ======
function enableSwipe(container) {
  let startX = 0;
  container.addEventListener('touchstart', e => { startX = e.touches[0].clientX; });
  container.addEventListener('touchend', e => {
    const delta = e.changedTouches[0].clientX - startX;
    if (delta > 50) goToPage(currentPage - 1);
    if (delta < -50) goToPage(currentPage + 1);
  });
}

// ====== ПОДІЇ ======
btnLeft.addEventListener('click', () => goToPage(currentPage - 1));
btnRight.addEventListener('click', () => {
  goToPage(currentPage + 1);
  setTimeout(loadMoreIfNeeded, 350);
});
enableSwipe(scroller);

// ====== СТАРТ ======
loadPopularFirstPage();