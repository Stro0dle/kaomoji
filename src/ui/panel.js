import { insertIntoChat } from '../chat.js';
import { ALL, RECENT, categoryName, findGroups, normalize } from '../search.js';
import { keys, readJSON, writeJSON } from '../storage.js';

const MARGIN = 12;
const GAP = 10;
const RECENT_LIMIT = 24;
const ADDED_HIGHLIGHT = 700;
const ERROR_TOAST = 3200;

function loadRecent() {
  const saved = readJSON(keys.recent);
  return Array.isArray(saved) ? saved.filter(face => typeof face === 'string').slice(0, RECENT_LIMIT) : [];
}

export function createPanel(root, { categories, locale, anchor, toast, onClose }) {
  const panel = root.querySelector('.panel');
  const closeButton = root.querySelector('.close');
  const subtitle = root.querySelector('.subtitle');
  const search = root.querySelector('.search');
  const categoryBar = root.querySelector('.categories');
  const results = root.querySelector('.results');
  const footer = root.querySelector('.footer');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const total = categories.reduce((sum, category) => sum + category.items.length, 0);

  let selected = ALL;
  let recent = loadRecent();
  let isOpen = false;
  let rendered = false;
  let size = { width: 0, height: 0 };

  function selectedName() {
    if (selected === RECENT) return locale.t.recent;
    const category = categories.find(item => item.id === selected);
    return category ? categoryName(category, locale.code) : locale.t.all;
  }

  function remember(face) {
    const hadRecent = recent.length > 0;
    recent = [face, ...recent.filter(item => item !== face)].slice(0, RECENT_LIMIT);
    writeJSON(keys.recent, recent);
    if (!hadRecent) renderCategories();
  }

  function insert(face, button) {
    const result = insertIntoChat(face);
    if (result === 'no-chat') return toast.show(locale.t.noChat, ERROR_TOAST);
    if (result === 'too-long') return toast.show(locale.t.tooLong, ERROR_TOAST);
    button.classList.add('added');
    setTimeout(() => button.classList.remove('added'), ADDED_HIGHLIGHT);
    remember(face);
    toast.show(locale.t.added);
  }

  function renderCategories() {
    const entries = [
      [ALL, locale.t.all],
      ...(recent.length ? [[RECENT, locale.t.recent]] : []),
      ...categories.map(category => [category.id, categoryName(category, locale.code)]),
    ];
    if (!entries.some(([id]) => id === selected)) selected = ALL;
    categoryBar.replaceChildren(...entries.map(([id, name]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'category';
      button.dataset.id = id;
      button.textContent = name;
      button.setAttribute('aria-pressed', String(id === selected));
      return button;
    }));
  }

  function renderGroup(group) {
    const section = document.createElement('section');
    section.className = 'group';
    const heading = document.createElement('h2');
    heading.className = 'group-title';
    const name = document.createElement('span');
    name.textContent = group.name;
    const count = document.createElement('span');
    count.className = 'group-count';
    count.textContent = locale.format(group.items.length);
    heading.append(name, count);
    const grid = document.createElement('div');
    grid.className = 'grid';
    for (const face of group.items) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'face';
      button.dataset.face = face;
      button.textContent = face;
      button.setAttribute('aria-label', locale.t.insert(face));
      grid.appendChild(button);
    }
    section.append(heading, grid);
    return section;
  }

  function renderEmpty() {
    const empty = document.createElement('p');
    empty.className = 'empty';
    const title = document.createElement('strong');
    title.textContent = locale.t.emptyTitle;
    const hint = document.createElement('span');
    hint.textContent = selected === ALL ? locale.t.emptyAll : locale.t.emptyIn(selectedName());
    empty.append(title, hint);
    return empty;
  }

  function renderResults() {
    const query = normalize(search.value.trim());
    const groups = findGroups({
      categories, recent, selected, query, code: locale.code, recentLabel: locale.t.recent,
    });
    const count = groups.reduce(
      (sum, group) => sum + (group.id === RECENT && selected === ALL ? 0 : group.items.length), 0,
    );
    subtitle.textContent = !query && selected === ALL
      ? locale.t.total(locale.format(total))
      : locale.t.results(count, locale.format(count));
    results.replaceChildren(...(groups.length ? groups.map(renderGroup) : [renderEmpty()]));
  }

  function selectCategory(button) {
    selected = button.dataset.id;
    for (const child of categoryBar.children) {
      child.setAttribute('aria-pressed', String(child === button));
    }
    renderResults();
    results.scrollTop = 0;
    const left = button.offsetLeft - 14;
    const right = button.offsetLeft + button.offsetWidth + 14 - categoryBar.clientWidth;
    const behavior = reducedMotion.matches ? 'auto' : 'smooth';
    if (categoryBar.scrollLeft > left) categoryBar.scrollTo({ left, behavior });
    else if (categoryBar.scrollLeft < right) categoryBar.scrollTo({ left: right, behavior });
  }

  function measure() {
    size = { width: panel.offsetWidth, height: panel.offsetHeight };
  }

  function reposition() {
    if (!isOpen) return;
    const { x, y } = anchor.position;
    const anchorSize = anchor.size;
    const right = x + anchorSize + GAP;
    const preferred = right + size.width <= window.innerWidth - MARGIN ? right : x - size.width - GAP;
    const left = Math.max(MARGIN, Math.min(preferred, window.innerWidth - size.width - MARGIN));
    const top = Math.max(MARGIN, Math.min(y, window.innerHeight - size.height - MARGIN));
    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
    panel.style.transformOrigin = `${x + anchorSize / 2 - left}px ${y + anchorSize / 2 - top}px`;
  }

  function setOpen(open) {
    if (open === isOpen) return;
    isOpen = open;
    if (open && !rendered) {
      renderCategories();
      renderResults();
      rendered = true;
    }
    if (open) {
      measure();
      reposition();
    } else {
      onClose();
    }
    panel.classList.toggle('open', open);
    panel.inert = !open;
    anchor.setExpanded(open);
    if (open) search.focus({ preventScroll: true });
  }

  function applyLanguage() {
    const { t, code } = locale;
    panel.lang = code;
    panel.setAttribute('aria-label', t.panel);
    closeButton.setAttribute('aria-label', t.close);
    search.placeholder = t.searchPlaceholder;
    search.setAttribute('aria-label', t.searchLabel);
    categoryBar.setAttribute('aria-label', t.categories);
    footer.textContent = t.footer;
    if (rendered) {
      renderCategories();
      renderResults();
    }
  }

  closeButton.addEventListener('click', () => {
    setOpen(false);
    anchor.focus();
  });
  categoryBar.addEventListener('click', event => {
    const button = event.target.closest('.category');
    if (button) selectCategory(button);
  });
  categoryBar.addEventListener('wheel', event => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    event.preventDefault();
    categoryBar.scrollLeft += event.deltaY;
  }, { passive: false });
  results.addEventListener('click', event => {
    const button = event.target.closest('.face');
    if (button) insert(button.dataset.face, button);
  });
  search.addEventListener('input', () => {
    renderResults();
    results.scrollTop = 0;
  });
  window.addEventListener('resize', () => {
    if (!isOpen) return;
    measure();
    reposition();
  });

  locale.subscribe(applyLanguage);
  applyLanguage();

  return {
    get isOpen() {
      return isOpen;
    },
    toggle() {
      setOpen(!isOpen);
    },
    close() {
      setOpen(false);
    },
    reposition,
  };
}
