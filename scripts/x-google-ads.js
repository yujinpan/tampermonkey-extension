// ==UserScript==
// @name         屏蔽谷歌广告(remove Google Ads)
// @namespace    https://github.com/yujinpan/tampermonkey-extension
// @version      1.0
// @license      MIT
// @description  屏蔽烦人的谷歌广告(remove Google Ads)。
// @author       yujinpan
// @include      http*://**
// @run-at       document-start
// ==/UserScript==

(() => {
  const style = document.createElement('style');
  style.innerHTML = '* [data-adsbygoogle-status] {display: none !important}';
  document.head.append(style);
})();