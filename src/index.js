import styles from './styles.css';
import { categories } from './data/categories.js';
import { createLocale } from './locale.js';
import { prepareCategories } from './search.js';
import { template } from './template.js';
import { createFloatingButton } from './ui/floating-button.js';
import { createPanel } from './ui/panel.js';
import { createSettingsMenu } from './ui/settings-menu.js';
import { createToast } from './ui/toast.js';

const HOST_ID = 'bc-kaomoji-host';

function mount() {
  if (document.getElementById(HOST_ID)) return;

  const host = document.createElement('div');
  host.id = HOST_ID;
  host.style.cssText = 'position:fixed;inset:0;z-index:2147483647;pointer-events:none;';
  const root = host.attachShadow({ mode: 'open' });
  root.innerHTML = `<style>${styles}</style>${template}`;
  document.body.appendChild(host);

  const locale = createLocale();
  const toast = createToast(root.querySelector('.toast'));
  let panel = null;

  const button = createFloatingButton(root.querySelector('.fab'), {
    onActivate: () => panel.toggle(),
    onMove: () => panel?.reposition(),
    onSaveError: () => toast.show(locale.t.noSave, 3200),
  });
  const menu = createSettingsMenu(root, { locale });
  panel = createPanel(root, {
    categories: prepareCategories(categories),
    locale,
    anchor: button,
    toast,
    onClose: () => menu.close(),
  });

  const applyLanguage = () => {
    root.querySelector('.fab').lang = locale.code;
    button.setLabels({ label: locale.t.open, title: locale.t.openTitle });
  };
  locale.subscribe(applyLanguage);
  applyLanguage();

  root.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (menu.isOpen) {
      event.preventDefault();
      menu.close({ moveFocus: true });
    } else if (panel.isOpen) {
      event.preventDefault();
      panel.close();
      button.focus();
    }
  });
}

if (document.body) mount();
else window.addEventListener('DOMContentLoaded', mount, { once: true });
