export const ALL = 'all';
export const RECENT = 'recent';

export function normalize(value) {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLocaleLowerCase();
}

export function prepareCategories(categories) {
  for (const category of categories) {
    const names = typeof category.name === 'string' ? [category.name] : Object.values(category.name);
    category.id ??= names[0];
    category.search = normalize(`${names.join(' ')} ${category.keywords || ''}`);
  }
  return categories;
}

export function categoryName(category, code) {
  if (typeof category.name === 'string') return category.name;
  return category.name[code] || category.name.en || category.id;
}

export function findGroups({ categories, recent, selected, query, code, recentLabel }) {
  const byFace = items => items.filter(face => normalize(face).includes(query));

  if (selected === RECENT) {
    const items = query ? byFace(recent) : recent;
    return items.length ? [{ id: RECENT, name: recentLabel, items }] : [];
  }

  const groups = [];
  if (selected === ALL && !query && recent.length) {
    groups.push({ id: RECENT, name: recentLabel, items: recent });
  }
  for (const category of categories) {
    if (selected !== ALL && selected !== category.id) continue;
    const items = !query || category.search.includes(query) ? category.items : byFace(category.items);
    if (items.length) groups.push({ id: category.id, name: categoryName(category, code), items });
  }
  return groups;
}
