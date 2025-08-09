
const slider     = document.getElementById('popular-slider');            
const scroller   = document.querySelector('.popular-slider-wrapper');    
const btnLeft    = document.getElementById('btn-left');
const btnRight   = document.getElementById('btn-right');
const indicators = document.getElementById('slider-indicators');


const BASE_URL   = 'https://furniture-store.b.goit.study/api';
const LIMIT      = 4;     
let page         = 1;     
let totalItems   = null;  
let isLoading    = false;

let pageCount    = 0;     
let currentPage  = 0;    


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
    
    buildIndicators();
    currentPage = Math.max(0, Math.min(pageCount - 1, currentPage));
    goToPage(currentPage, { smooth: false });
  });

  updateButtons();
}


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

    const totalBullets = 7; 
    
    const swiper = new Swiper('.feedback-slider', {
     
      modules: [Navigation, Pagination],
      slidesPerGroup: 1,
      slidesPerView: 1,
      spaceBetween: 16,
      loop: true, 
      
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
      },
     
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

    swiper.on('slideChange', () => {
      const bullets = document.querySelectorAll('.swiper-pagination-bullet');
      bullets.forEach(b =>
        b.classList.remove('swiper-pagination-bullet-active')
      );

      const activeIndex = swiper.realIndex % totalBullets;
      bullets[activeIndex].classList.add('swiper-pagination-bullet-active');
    });
  } catch (error) {
    iziToast.error({
      title: 'Error',
      message: 'Щось пішло не так. Спробуйте пізніше.',
      position: 'topRight',
    });
  }
}



function enableSwipe(container) {
  let startX = 0;
  container.addEventListener('touchstart', e => { startX = e.touches[0].clientX; });
  container.addEventListener('touchend', e => {
    const delta = e.changedTouches[0].clientX - startX;
    if (delta > 50) goToPage(currentPage - 1);
    if (delta < -50) goToPage(currentPage + 1);
  });
}


btnLeft.addEventListener('click', () => goToPage(currentPage - 1));
btnRight.addEventListener('click', () => {
  goToPage(currentPage + 1);
  setTimeout(loadMoreIfNeeded, 350);
});
enableSwipe(scroller);


loadPopularFirstPage();

slider.addEventListener('click', e => {
  const btn = e.target.closest('.details-btn');
  if (!btn) return;

  const id = btn.dataset.id;

 
  const item = result?.furnitures?.find(f => f._id === id);
  if (item) {
    showModal(item); 
  }
});