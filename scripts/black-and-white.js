// ==UserScript==
// @name         黑白
// @namespace    https://github.com/yujinpan/tampermonkey-extension
// @version      1.0
// @license      MIT
// @description  网站黑白化。
// @author       yujinpan
// @include      http*://**
// ==/UserScript==

(function () {
  var html = document.querySelector('html');
  var style = html.getAttribute('style') || '';
  if (style && style.slice(-1) !== ';') style += ';';
  html.setAttribute('style',
    style +
    'filter: progid:DXImageTransform.Microsoft.BasicImage(grayscale=1);' +
    'filter: grayscale(100%);');
})();