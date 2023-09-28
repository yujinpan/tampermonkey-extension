// ==UserScript==
// @name         Hide Image 隐藏图片
// @namespace    https://github.com/yujinpan/tampermonkey-extension
// @version      1.0
// @license      MIT
// @description  Hide all image in website。
// @author       yujinpan
// @include      http*://**
// @run-at       document-start
// ==/UserScript==

(function () {
  const style = document.createElement('style');
  style.innerHTML = 'img,video{display:none!important;}*{background-image:none!important;}';
  document.head.append(style);
})();