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
  // 1. intercept ads trigger
  const script = document.createElement('script');
  script.innerHTML = `
    interceptProp(window, 'adsbygoogle', {push: () => {}});
    interceptProp(window, 'dataLayer', {push: () => {}});
    
    function interceptProp(obj, prop, overrideVal) {
      let _val;
      Object.defineProperty(obj, prop, {
        get() {return _val;},
        set(val) {
          _val = val;
          Object.assign(_val, overrideVal)
        }
      })
    }
  `;
  document.head.prepend(script);

  // 2. remove exist ads
  const style = document.createElement('style');
  style.innerHTML = '* [data-ad-client] {display: none !important}';
  document.head.append(style);


  // 3. disable ads scripts add
  new MutationObserver((mutations) => {
    mutations.forEach(item => {
      if (item.type === 'childList') {
        item.addedNodes.forEach(node => {
          if (
            node.src &&
            node.src.includes('ads')
          ) {
            node.remove();
          }
        });
      }
    });
  }).observe(document.head, {childList: true});
})();