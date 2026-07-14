// Функция для привязки событий
const addEvent = (target = document, event, callback) => {
  const element = typeof target === 'string' ? document.getElementById(target) : target;
  element?.addEventListener(event, callback);
};

// Функция для обновления переменной
const updateVar = (name, value, unit = '') => {
  root.style.setProperty(`--${name}`, value + unit);
};