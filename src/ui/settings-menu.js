import { icons } from '../icons.js';

export function createSettingsMenu(root, { locale }) {
  const button = root.querySelector('.settings');
  const menu = root.querySelector('.menu');
  const legend = menu.querySelector('legend');
  const options = menu.querySelector('.options');
  let isOpen = false;

  options.replaceChildren(...Object.entries(locale.languages).map(([code, strings]) => {
    const option = document.createElement('label');
    option.className = 'option';
    option.lang = code;
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'language';
    input.value = code;
    const name = document.createElement('span');
    name.textContent = strings.label;
    option.append(input, name);
    option.insertAdjacentHTML('beforeend', icons.check);
    return option;
  }));

  function setOpen(open, { moveFocus = false } = {}) {
    if (open === isOpen) return;
    isOpen = open;
    menu.classList.toggle('open', open);
    menu.inert = !open;
    button.setAttribute('aria-expanded', String(open));
    if (!moveFocus) return;
    if (open) menu.querySelector('input:checked')?.focus({ preventScroll: true });
    else button.focus({ preventScroll: true });
  }

  function applyLanguage() {
    const { t, code } = locale;
    button.title = t.settings;
    button.setAttribute('aria-label', t.settings);
    menu.setAttribute('aria-label', t.settings);
    legend.textContent = t.language;
    for (const input of options.querySelectorAll('input')) input.checked = input.value === code;
  }

  button.addEventListener('click', event => setOpen(!isOpen, { moveFocus: event.detail === 0 }));
  menu.addEventListener('change', event => locale.set(event.target.value));
  document.addEventListener('pointerdown', event => {
    if (!isOpen) return;
    const path = event.composedPath();
    if (!path.includes(menu) && !path.includes(button)) setOpen(false);
  }, true);

  locale.subscribe(applyLanguage);
  applyLanguage();

  return {
    get isOpen() {
      return isOpen;
    },
    close(options) {
      setOpen(false, options);
    },
  };
}
