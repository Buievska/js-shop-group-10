const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');
// const btn = document.getElementByClassName('details-btn');
const list = document.querySelector('.furniture-list');
let result;

const fetchProducts = () => {
  fetch('https://furniture-store.b.goit.study/api/furnitures?page=1&limit=10')
    .then(response => {
      // Проверка успешности ответа
      if (!response.ok) {
        throw new Error('Ошибка сети');
      }

      return response.json();
    })
    .then(data => {
      console.log(data); // Здесь обработка полученных данных
      result = data;

      if (result?.furnitures) {
        list.innerHTML = `
            <div>
                ${result?.furnitures.map(item => {
                  return `<button
                        data-id="${item._id}"
                        class="details-btn"
                      >
                        Open Modal
                      </button>`;
                })}
            </div>
        `;

        const btn = document.querySelectorAll('.details-btn');
        btn.forEach(elem => {
          elem.addEventListener('click', e => {
            const id = e.target.dataset.id;
            const item = result?.furnitures?.find(f => f._id === id);
            if (item) showModal(item);
          });
        });
      }
    })
    .catch(error => {
      console.error('Ошибка при получении данных:', error);
    });
};
fetchProducts();

// Функція рендерингу зірочок (для рейтингу):
function renderStars(rating = 0) {
  const full = Math.floor(rating),
    half = rating % 1 >= 0.5,
    empty = 5 - full - (half ? 1 : 0);
  const starSVG =
    '<svg class="star-icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.786L19.335 24 12 19.897 4.665 24l1.401-8.998L.132 9.21l8.2-1.192z"/></svg>';
  const halfSVG = `<svg class="star-icon half" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><defs><linearGradient id="grad"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="#ccc"/></defs><path fill="url(#grad)" d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.786L19.335 24 12 19.897 4.665 24l1.401-8.998L.132 9.21l8.2-1.192z"/></svg>`;
  let s = '';
  s += starSVG.repeat(full);
  if (half) s += halfSVG;
  s +=
    '<svg class="star-icon empty" viewBox="0 0 24 24" width="20" height="20" fill="#ccc"><path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.786L19.335 24 12 19.897 4.665 24l1.401-8.998L.132 9.21l8.2-1.192z"/></svg>'.repeat(
      empty
    );
  return `<div class="rating-stars">${s}</div>`;
}
//   Функція показу модального вікна:
function showModal(furniture) {
  modalBody.innerHTML = `
    <div class="modal-wrapper">
      <div class="modal-images">
        <img class="main-image" src="${furniture.images[0]}" alt="${
    furniture.name
  }" />
        <div class="modal-thumbs">${furniture.images
          .slice(1)
          .map(i => `<img src="${i}" alt="${furniture.name}"/>`)
          .join('')}</div>
      </div>
      <div class="modal-info">
        <h2 class="modal-title">${furniture.name}</h2>
        <p class="modal-subtitle">${furniture.category.name}</p>
        <p class="modal-price">${furniture.price.toLocaleString()} грн</p>
        ${renderStars(furniture.rate || 0)}
        <div class="modal-colors"><p>Колір:</p> <div class="color-list">${renderColorSwatches(
          furniture.color
        )}</div></div>
        <p class="modal-description">${furniture.description}</p>
        <p class="modal-size">Розмір: ${furniture.sizes || '280x180x85'}</p>
        <button class="modal-order-btn">Перейти до замовлення</button>
      </div>
    </div>
  `;
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  const swatches = document.querySelectorAll('.color-swatch');
  swatches[0].classList.add('selected');

  swatches.forEach(color => {
    color.addEventListener('click', e => {
      swatches.forEach(el => el.classList.remove('selected'));
      e.currentTarget.classList.add('selected');
    });
  });
}

function renderColorSwatches(color) {
  if (Array.isArray(color)) {
    return color
      .map(
        c =>
          `<span class="color-swatch" title="${c}" style="background-color: ${c};"></span>`
      )
      .join('');
  } else {
    return `<span class="color-swatch" title="${color}" style="background-color: ${color};"></span>`;
  }
}

//   Функція закриття модального вікна:
function closeModal() {
  modal.classList.add('hidden');
  document.body.style.overflow = '';
}
//   Події, повʼязані з модальним вікном (в initEvents)
modalClose.addEventListener('click', closeModal);
window.addEventListener('click', e => {
  if (e.target === modal) closeModal();
});
window.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// const btn = document.querySelectorAll('.details-btn');
// btn.forEach(elem => {
//   console.log(btn);
//   elem.addEventListener('click', e => {
//     console.log(result);
//     // const btn = e.target.closest('.details-btn');
//     const id = e.target.dataset.id;
//     console.log('asd');
//     console.log(result);
//     //   if (!btn) return;
//     const item = result?.furnitures?.find(f => f._id === id);
//     if (item) showModal(item);
//   });
// });
