// ==UserScript==
// @name         恢复右键功能
// @namespace    https://github.com/yujinpan/tampermonkey-extension
// @version      1.0
// @license      MIT
// @description  恢复右键原始的功能。
// @author       yujinpan
// @include      http*://**
// @run-at       document-start
// ==/UserScript==

(() => {
  EventTarget.prototype.addEventListener_ = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function () {
    if (arguments[0] === 'contextmenu') {
      const cb = arguments[1];
      arguments[1] = (e) => {
        e.preventDefault = () => {};
        cb(e);
      };
    }
    this.addEventListener_.apply(this, arguments);
  };
})();