import axios from "axios";
import iziToast from "izitoast";

const orderModal = document.querySelector('.order-modal-overlay');
const orderForm = document.querySelector('.order-modal-form');

function closeOrderModal(event) {
    const orderModalClose = document.querySelector('.open-order');
    if (orderModalClose) {
        orderModalClose.classList.remove('open-order');
        document.body.style.overflow = '';
    }
};

function openOrderModal(event) {
    if (orderModal) {
        const lastModal = document.getElementById('modal');
        lastModal.classList.add('hidden');
        orderModal.classList.add('open-order');
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeOrderModal();
            }
        });
        orderModal.addEventListener('click', (event) => {
            if (event.target === orderModal) {
                closeOrderModal();
            }
        });
    }
};

orderForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!orderForm.checkValidity()) {
    iziToast.warning({
        title: 'Увага',
        message: 'Будь ласка, заповніть всі обов’язкові поля',
        position: 'topRight'
    });
    return;
    }
    const inputEmail = event.target.elements["user-email"].value.trim();
    const inputPhone = event.target.elements["user-phone"].value.trim();
    const inputComment = event.target.elements["user-comment"].value.trim();
    const orderData = {
        "email": inputEmail,
        "phone": inputPhone,
        "modelId": "682f9bbf8acbdf505592ac36",
        "color": "#1212ca",
        "comment": inputComment
    };
    try {
        const response = await axios.post('https://furniture-store.b.goit.study/api-docs/#/order', orderData);
        closeOrderModal();
        orderForm.reset();
        iziToast.success({
            title: 'Готово!',
            message: 'Замовлення успішно створено',
            position: 'topRight'
        });
    }
    catch (error) {
        iziToast.error({
            title: 'Помилка',
            message: 'Не вдалося створити замовлення',
            position: 'topRight'
        });
    };
});

const btnCloseOrder = document.querySelector('.order-modal-close');
btnCloseOrder.addEventListener("click", closeOrderModal);

document.addEventListener('click', (e) => {
    if (e.target.matches('.modal-order-btn')) {
        openOrderModal();
    }
});



