// ==UserScript==
// @name         恢复文本选择
// @namespace    https://github.com/yujinpan/tampermonkey-extension
// @version      1.0
// @license      MIT
// @description  解除文本选择的禁用。
// @author       yujinpan
// @include      http*://**
// @run-at       document-start
// ==/UserScript==

(() => {
  const style = document.createElement('style');
  style.innerHTML = '*,*::after,*::before { user-select: auto !important; }';
})();