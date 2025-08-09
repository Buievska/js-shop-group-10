const BASE_URL = 'https://furniture-store.b.goit.study/api';

const categoryList = document.getElementById('category-list');
const furnitureList = document.getElementById('furniture-list');
const pagination = document.getElementById('pagination');
const loadMoreBtn = document.getElementById('load-more-mobile');

let loadedPagesCount = 1;
let allLoadedFurnitures = [];

let currentPage = 1;
const limit = 8;
let selectedCategory = '';
let totalPages = 1;

// --- Додаємо SVG-іконки у body ---
(function addSvgIcons() {
  const svgSprite = `
    <svg xmlns="http://www.w3.org/2000/svg" style="display:none;">
      <symbol id="icon-left-arrow" viewBox="0 0 32 32">
        <path d="M16.943 23.057l-5.724-5.724h12.781v-2.667h-12.781l5.724-5.724-1.885-1.885-8.943 8.943 8.943 8.943 1.885-1.885z"></path>
      </symbol>
      <symbol id="icon-right-arrow" viewBox="0 0 32 32">
        <path d="M15.057 23.057l1.885 1.885 8.943-8.943-8.943-8.943-1.885 1.885 5.724 5.724h-12.781v2.667h12.781l-5.724 5.724z"></path>
      </symbol>
    </svg>
  `;
  document.body.insertAdjacentHTML('afterbegin', svgSprite);
})();

// --- Отримати категорії ---
async function getCategories() {
  const res = await fetch(`${BASE_URL}/categories`);
  if (!res.ok) throw new Error('Помилка отримання категорій');
  return await res.json();
}

// --- Отримати меблі ---
async function getFurnitures(page = 1, category = '') {
  let url = `${BASE_URL}/furnitures?page=${page}&limit=${limit}`;
  if (category) url += `&category=${category}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Помилка отримання меблів');
  return await res.json();
}

// --- Рендер категорій ---
function renderCategories(categories) {
  const fallbackImg = './img/furniture-list/всі-товари.png';

  const imageMap = {
    'Всі товари': 'всі-товари.png',
    "М'які меблі": 'мякі-меблі.png',
    'Шафи та системи зберігання': 'шафи.png',
    'Ліжка та матраци': 'ліжка.png',
    Столи: 'столи.png',
    'Стільці та табурети': 'стільці.png',
    Кухні: 'кухні.png',
    'Меблі для дитячої': 'меблі-дитячі.png',
    'Меблі для офісу': 'меблі-офіс.png',
    'Меблі для передпокою': 'передпокій.png',
    'Меблі для ванної кімнати': 'меблі-вана.png',
    'Садові та вуличні меблі': 'меблі-садові.png',
    'Декор та аксесуари': 'декор.png',
  };

  const markup = categories
    .map(cat => {
      let name = cat.name.replace(/^"|"$/g, '');
      const imgFile = imageMap[name] || 'всі-товари.png';
      const imgPath = `./img/furniture-list/${imgFile}`;

      return `
        <li class="category-btn-tile" data-category="${cat._id}">
          <img src="${imgPath}" alt="${name}" onerror="this.onerror=null;this.src='${fallbackImg}'" />
          <span class="category-label">${name}</span>
        </li>
      `;
    })
    .join('');

  categoryList.innerHTML = `
    <li class="category-btn-tile active" data-category="">
      <img src="${fallbackImg}" alt="Всі товари" />
      <span class="category-label">Всі товари</span>
    </li>
    ${markup}
  `;
}

// --- Рендер меблів ---
function renderFurnitureList(furnitures) {
  furnitureList.innerHTML = furnitures
    .map(
      ({ images, name, color, price, _id }) => `
    <li class="furniture-item" data-id="${_id}">
      <img src="${images[0]}" alt="${name}" />
      <div class="furniture-item-content">
        <h3>${name}</h3>
        <div>${renderColorSwatches(color)}</div>
        <p>${price} грн</p>
        <button class="details-btn" data-id="${_id}">Детальніше</button>
      </div>
    </li>
  `
    )
    .join('');
}

// --- Колірні кружечки ---
function renderColorSwatches(color) {
  const colors = Array.isArray(color) ? color : [color];
  return colors
    .map(
      c =>
        `<span class="color-swatch" title="${c}" style="background-color: ${c};"></span>`
    )
    .join('');
}

// --- Пагінація ---
function createPageButton(text, { active = false, onClick = null } = {}) {
  const btn = document.createElement('button');
  btn.textContent = text;
  btn.classList.add('page-btn');
  if (active) btn.classList.add('active');
  if (onClick) btn.addEventListener('click', onClick);
  return btn;
}

function createArrowButton(
  direction,
  { disabled = false } = {},
  onClick = null
) {
  const btn = document.createElement('button');
  btn.classList.add('btn-circle');
  if (disabled) btn.disabled = true;
  if (!disabled && onClick) btn.addEventListener('click', onClick);

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '20');
  svg.setAttribute('height', '20');

  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttributeNS(
    'http://www.w3.org/1999/xlink',
    'href',
    direction === 'left' ? '#icon-left-arrow' : '#icon-right-arrow'
  );

  svg.appendChild(use);
  btn.appendChild(svg);

  return btn;
}

function createDots() {
  const span = document.createElement('span');
  span.classList.add('pagination-dots');
  span.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span>`;
  return span;
}

function renderPagination(current, total) {
  pagination.innerHTML = '';

  pagination.appendChild(
    createArrowButton('left', { disabled: current === 1 }, () => {
      currentPage--;
      loadFurniture();
    })
  );

  if (total <= 5) {
    for (let i = 1; i <= total; i++) {
      pagination.appendChild(
        createPageButton(i, {
          active: i === current,
          onClick: () => {
            currentPage = i;
            loadFurniture();
          },
        })
      );
    }
  } else if (current <= 3) {
    for (let i = 1; i <= 3; i++) {
      pagination.appendChild(
        createPageButton(i, {
          active: i === current,
          onClick: () => {
            currentPage = i;
            loadFurniture();
          },
        })
      );
    }
    pagination.appendChild(createDots());
    pagination.appendChild(
      createPageButton(total, {
        onClick: () => {
          currentPage = total;
          loadFurniture();
        },
      })
    );
  } else if (current >= total - 2) {
    pagination.appendChild(
      createPageButton(1, {
        onClick: () => {
          currentPage = 1;
          loadFurniture();
        },
      })
    );
    pagination.appendChild(createDots());
    for (let i = total - 2; i <= total; i++) {
      pagination.appendChild(
        createPageButton(i, {
          active: i === current,
          onClick: () => {
            currentPage = i;
            loadFurniture();
          },
        })
      );
    }
  } else {
    pagination.appendChild(
      createPageButton(1, {
        onClick: () => {
          currentPage = 1;
          loadFurniture();
        },
      })
    );
    pagination.appendChild(createDots());
    pagination.appendChild(
      createPageButton(current - 1, {
        onClick: () => {
          currentPage--;
          loadFurniture();
        },
      })
    );
    pagination.appendChild(createPageButton(current, { active: true }));
    pagination.appendChild(
      createPageButton(current + 1, {
        onClick: () => {
          currentPage++;
          loadFurniture();
        },
      })
    );
    pagination.appendChild(createDots());
    pagination.appendChild(
      createPageButton(total, {
        onClick: () => {
          currentPage = total;
          loadFurniture();
        },
      })
    );
  }

  pagination.appendChild(
    createArrowButton('right', { disabled: current === total }, () => {
      currentPage++;
      loadFurniture();
    })
  );
}

// --- Завантажити меблі ---
async function loadFurniture() {
  const isMobile = window.innerWidth <= 768;

  try {
    const data = await getFurnitures(
      isMobile ? 1 : currentPage,
      selectedCategory
    );
    totalPages = Math.ceil(data.totalItems / limit);

    if (isMobile) {
      if (loadedPagesCount === 1) {
        allLoadedFurnitures = data.furnitures;
      }
      renderFurnitureList(allLoadedFurnitures);

      if (loadMoreBtn) {
        loadMoreBtn.style.display =
          allLoadedFurnitures.length >= data.totalItems
            ? 'none'
            : 'inline-block';
      }

      pagination.innerHTML = '';
      pagination.classList.add('hidden');
    } else {
      renderFurnitureList(data.furnitures);
      if (loadMoreBtn) loadMoreBtn.style.display = 'none';

      if (totalPages > 1) {
        renderPagination(currentPage, totalPages);
        pagination.classList.remove('hidden');
      } else {
        pagination.innerHTML = '';
        pagination.classList.add('hidden');
      }
    }
  } catch (err) {
    console.error('Помилка завантаження меблів:', err);
  }
}

// --- Обробники подій ---
if (categoryList) {
  categoryList.addEventListener('click', e => {
    const target = e.target.closest('li.category-btn-tile');
    if (!target) return;

    if (selectedCategory === target.dataset.category) return;

    selectedCategory = target.dataset.category;
    currentPage = 1;
    loadedPagesCount = 1;
    allLoadedFurnitures = [];

    [...categoryList.children].forEach(li => li.classList.remove('active'));
    target.classList.add('active');

    loadFurniture();
  });
}

if (loadMoreBtn) {
  loadMoreBtn.addEventListener('click', async () => {
    loadedPagesCount++;
    try {
      const data = await getFurnitures(loadedPagesCount, selectedCategory);
      allLoadedFurnitures = [...allLoadedFurnitures, ...data.furnitures];
      renderFurnitureList(allLoadedFurnitures);

      if (allLoadedFurnitures.length >= data.totalItems) {
        loadMoreBtn.style.display = 'none';
      }
    } catch (err) {
      console.error('Помилка завантаження меблів при "Показати ще":', err);
    }
  });
}

// --- Ініціалізація ---
(async function init() {
  try {
    const categories = await getCategories();
    renderCategories(categories);
    loadFurniture();
  } catch (err) {
    console.error('Помилка ініціалізації:', err);
  }
})();
