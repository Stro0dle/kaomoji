import { icons } from './icons.js';

export const template = `
  <button class="fab" type="button" aria-expanded="false" aria-controls="panel">
    <span class="fab-surface">${icons.face}</span>
  </button>
  <section class="panel" id="panel" inert>
    <div class="header">
      <div>
        <h1>Kaomoji</h1>
        <p class="subtitle"></p>
      </div>
      <div class="header-actions">
        <button class="icon-button settings" type="button" aria-expanded="false" aria-controls="settings">${icons.gear}</button>
        <button class="icon-button close" type="button">${icons.close}</button>
      </div>
    </div>
    <div class="menu" id="settings" role="dialog" inert>
      <fieldset>
        <legend></legend>
        <div class="options"></div>
      </fieldset>
    </div>
    <div class="search-wrap">
      <label class="search-field">
        ${icons.search}
        <input class="search" type="search" autocomplete="off" spellcheck="false">
      </label>
    </div>
    <div class="categories"></div>
    <div class="results"></div>
    <div class="toast" role="status" aria-live="polite"></div>
    <div class="footer"></div>
  </section>
`;
