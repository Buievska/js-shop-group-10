import Accordion from 'accordion-js';
import 'accordion-js/dist/accordion.min.css';

document.addEventListener('DOMContentLoaded', function () {
  new Accordion('.accordion-container', {
    duration: 300,
    showMultiple: false, // одночасно буде відкрита лише одна відповідь
    openOnInit: [], // при завантаженні сторінки видно тільки запитання
    elementClass: 'ac',
    triggerClass: 'ac-trigger',
    panelClass: 'ac-panel',
    activeClass: 'is-active',
  });
});
