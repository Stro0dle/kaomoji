// ==UserScript==
// @name         BC Kaomoji
// @namespace    https://github.com/Stro0dle/bc-kaomoji
// @version      2.1.1
// @description  A draggable kaomoji panel for the Bondage Club chat.
// @author       Stro0dle
// @match        https://*.bondageprojects.elementfx.com/R*/*
// @match        https://*.bondage-europe.com/R*/*
// @match        https://*.bondageeurope.com/R*/*
// @match        https://*.bondageprojects.com/R*/*
// @match        https://*.bondage-asia.com/club/R*
// @icon64       data:image/svg+xml,<svg viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="%230a84ff" stroke-width="2" stroke-linecap="round"><circle cx="14" cy="14" r="11"/><path d="M9.2 12.2c.6-.9 1.9-.9 2.5 0M16.3 12.2c.6-.9 1.9-.9 2.5 0M10 16.2c2.2 2.6 5.8 2.6 8 0"/></svg>
// @homepageURL  https://github.com/Stro0dle/bc-kaomoji
// @updateURL    https://github.com/Stro0dle/bc-kaomoji/raw/main/bcKaomojiLoader.user.js
// @downloadURL  https://github.com/Stro0dle/bc-kaomoji/raw/main/bcKaomojiLoader.user.js
// @run-at       document-end
// @grant        none
// ==/UserScript==

(() => {
  'use strict';
  const script = document.createElement('script');
  script.crossOrigin = 'anonymous';
  script.src = `https://stro0dle.github.io/bc-kaomoji/bundle.js?${Date.now()}`;
  document.head.appendChild(script);
})();
