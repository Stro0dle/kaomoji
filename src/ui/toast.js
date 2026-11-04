export function createToast(element) {
  let timer = 0;

  return {
    show(message, duration = 1800) {
      clearTimeout(timer);
      element.textContent = message;
      element.classList.add('show');
      timer = setTimeout(() => element.classList.remove('show'), duration);
    },
  };
}
