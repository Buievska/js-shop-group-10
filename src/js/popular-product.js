const slider = document.getElementById('popular-slider');
const btnLeft = document.getElementById('btn-left');
const btnRight = document.getElementById('btn-right');

const BASE_URL = 'https://furniture-store.b.goit.study/api';
let scrollAmount = 0;
let maxScroll = 0;

async function fetchPopularFurniture() {
  const url = `${BASE_URL}/furniture?type=popular&limit=30&page=1`;

  const response = await fetch(url);
  if (!response.ok) throw new Error('Не вдалося завантажити популярні товари');
  return await response.json();
}


function createFurnitureCard(f) {
  const li = document.createElement('li');
  li.className = 'furniture-card';

  const imageUrl = f.images?.[0] || 'https://via.placeholder.com/300x200?text=No+Image';

  li.innerHTML = `
    <img src="${imageUrl}" alt="${f.name}" class="card-img" />
    <h3 class="card-title">${f.name}</h3>
    <p class="card-color">
      Колір:
      <span style="display:inline-block;width:14px;height:14px;background:${f.color?.[0]};border-radius:50%;border:1px solid #000"></span>
    </p>
    <p class="card-price">Ціна: ${f.price} грн</p>
    <button class="details-btn" data-id="${f._id}">Детальніше</button>
  `;

  return li;
}


async function loadPopular() {
  try {
    const { furnitures } = await fetchPopularFurniture();

    if (!furnitures || furnitures.length < 3) {
      slider.innerHTML = '<li>Недостатньо популярних товарів для показу.</li>';
      btnLeft.disabled = true;
      btnRight.disabled = true;
      return;
    }

    furnitures.forEach(f => {
      const card = createFurnitureCard(f);
      slider.appendChild(card);
    });

    maxScroll = slider.scrollWidth - slider.clientWidth;
    enableSwipe(slider);
    updateButtons();
  } catch (err) {
    console.error('Помилка завантаження:', err);
  }
}


function scrollSlider(direction) {
  const step = 320;
  scrollAmount += direction * step;
  scrollAmount = Math.max(0, Math.min(scrollAmount, maxScroll));
  slider.scrollTo({ left: scrollAmount, behavior: 'smooth' });
  updateButtons();
}


function enableSwipe(container) {
  let startX = 0;
  container.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  });
  container.addEventListener('touchend', (e) => {
    const delta = e.changedTouches[0].clientX - startX;
    if (delta > 50) scrollSlider(-1);
    if (delta < -50) scrollSlider(1);
  });
}

function updateButtons() {
  maxScroll = slider.scrollWidth - slider.clientWidth;
  btnLeft.disabled = slider.scrollLeft <= 0;
  btnRight.disabled = slider.scrollLeft >= maxScroll - 10;
}


btnLeft.addEventListener('click', () => scrollSlider(-1));
btnRight.addEventListener('click', () => scrollSlider(1));

loadPopular();