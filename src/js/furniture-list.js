const BASE_URL = 'https://furniture-store.b.goit.study/api';

const categoryList = document.getElementById('category-list');
const furnitureList = document.getElementById('furniture-list');
const pagination = document.getElementById('pagination');
const loadMoreBtn = document.getElementById('load-more-mobile');
const loader = document.getElementById('loader');

let loadedPagesCount = 1;
let allLoadedFurnitures = [];
let currentPage = 1;
const limit = 8;
let selectedCategory = '';
let totalPages = 1;

// --- Лоадер ---
function showLoader() {
  loader.classList.remove('hidden');
}
function hideLoader() {
  loader.classList.add('hidden');
}

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

// --- Показ/приховування кнопки "Показати ще" ---
function toggleLoadMoreButton() {
  if (window.innerWidth < 768) {
    loadMoreBtn.classList.remove('hidden');
  } else {
    loadMoreBtn.classList.add('hidden');
  }
}
toggleLoadMoreButton();
window.addEventListener('resize', toggleLoadMoreButton);

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
  const result = await res.json();
  furnitureList.setAttribute('data-items', JSON.stringify(result?.furnitures));
  return result;
}

// --- Рендер категорій ---
function getImageUrl(name) {
  if (!name) name = 'vsi-tovary.png';
  return new URL(`../img/furniture-list/${name}`, import.meta.url).href;
}

function renderCategories(categories) {
  const fallbackImg = getImageUrl('vsi-tovary.png');

  const imageMap = {
    'Всі товари': 'vsi-tovary.png',
    "М'які меблі": 'myaki-mebli.png',
    'Шафи та системи зберігання': 'shafy-sistemy-zberigannya.png',
    'Ліжка та матраци': 'lizka-matratsi.png',
    Столи: 'stoly.png',
    'Стільці та табурети': 'stiltsi-taburety.png',
    Кухні: 'kuhni.png',
    'Меблі для дитячої': 'mebli-dytyacha.png',
    'Меблі для офісу': 'mebli-ofis.png',
    'Меблі для передпокою': 'mebli-peredpokiy.png',
    'Меблі для ванної кімнати': 'mebli-vanna.png',
    'Садові та вуличні меблі': 'sadovi-mebli.png',
    'Декор та аксесуари': 'dekor-aksesuari.png',
  };

  const markup = categories
    .map(cat => {
      const name = cat.name.replace(/^"|"$/g, '');
      const imgFile = imageMap[name] || 'vsi-tovary.png';
      const imgPath = getImageUrl(imgFile);

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
  if (onClick) {
    btn.addEventListener('click', () => {
      showLoader(); 
      onClick();
    });
  }
  return btn;
}

function createArrowButton(direction, { disabled = false } = {}, onClick = null) {
  const btn = document.createElement('button');
  btn.classList.add('btn-circle');
  if (disabled) btn.disabled = true;
  if (!disabled && onClick) {
    btn.addEventListener('click', () => {
      showLoader(); 
      onClick();
    });
  }

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '25');
  svg.setAttribute('height', '25');

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
      if (currentPage > 1) {
        currentPage--;
        loadFurniture();
      }
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
      if (currentPage < totalPages) {
        currentPage++;
        loadFurniture();
      }
    })
  );
}

// --- Завантажити меблі ---
async function loadFurniture() {
  if (currentPage < 1) currentPage = 1;
  if (currentPage > totalPages) currentPage = totalPages;

  try {
    
    const data = await getFurnitures(currentPage, selectedCategory);
    totalPages = Math.ceil(data.totalItems / limit);

    if (window.innerWidth < 768) {
      if (currentPage === 1) {
        allLoadedFurnitures = data.furnitures;
      } else {
        allLoadedFurnitures = [...allLoadedFurnitures, ...data.furnitures];
      }

      renderFurnitureList(allLoadedFurnitures);

      if (allLoadedFurnitures.length >= data.totalItems) {
        loadMoreBtn.classList.add('hidden');
      } else {
        loadMoreBtn.classList.remove('hidden');
      }

      pagination.classList.add('hidden');
    } else {
      renderFurnitureList(data.furnitures);
      loadMoreBtn.classList.add('hidden');

      if (totalPages > 1) {
        pagination.classList.remove('hidden');
        renderPagination(currentPage, totalPages);
      } else {
        pagination.innerHTML = '';
        pagination.classList.add('hidden');
      }
    }
  } catch (err) {
    console.error('Помилка завантаження меблів:', err);
  } finally {
    hideLoader();
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

    furnitureList.innerHTML = '';

    [...categoryList.children].forEach(li => li.classList.remove('active'));
    target.classList.add('active');

    
    loadFurniture();
  });
}

if (loadMoreBtn) {
  loadMoreBtn.addEventListener('click', async () => {
    currentPage++;
    try {
      showLoader(); 
      const data = await getFurnitures(currentPage, selectedCategory);
      allLoadedFurnitures = [...allLoadedFurnitures, ...data.furnitures];
      renderFurnitureList(allLoadedFurnitures);

      if (allLoadedFurnitures.length >= data.totalItems) {
        loadMoreBtn.classList.add('hidden');
      }
    } catch (err) {
      console.error('Помилка завантаження меблів при "Показати ще":', err);
    } finally {
      hideLoader(); 
    }
  });
}

// =================================================================
// ВІДКЛАДЕНЕ ЗАВАНТАЖЕННЯ КАТАЛОГУ (версія 2.0)
// =================================================================

// Ваша основна функція ініціалізації (залишається без змін)
async function initializeFurnitureList() {
  try {
    const categories = await getCategories();
    renderCategories(categories);
    loadFurniture();
  } catch (err) {
    console.error('Помилка ініціалізації каталогу:', err);
  }
}

// Нова логіка "лінивого" запуску
const lazyLoadFurnitureList = () => {
  // Викликаємо нашу основну функцію
  initializeFurnitureList();

  // Видаляємо слухачів, щоб вони не спрацьовували знову
  window.removeEventListener('scroll', lazyLoadFurnitureList);
  window.removeEventListener('mousemove', lazyLoadFurnitureList);
  window.removeEventListener('touchstart', lazyLoadFurnitureList);
};

// Додаємо слухачів, які спрацюють лише ОДИН РАЗ ({ once: true })
// при першій же взаємодії користувача зі сторінкою
window.addEventListener('scroll', lazyLoadFurnitureList, { once: true });
window.addEventListener('mousemove', lazyLoadFurnitureList, { once: true });
window.addEventListener('touchstart', lazyLoadFurnitureList, { once: true });
