// ==UserScript==
// @name         电影天堂,阳光电影去掉广告与高亮高分电影
// @namespace    https://github.com/yujinpan/tampermonkey-extension
// @version      1.4
// @license      MIT
// @description  主要是在电影天堂,阳光电影网站去掉页面上的广告（隐藏广告比较烦）。还有就是标记高分和获奖的电影，方便找到精华电影。
// @author       yujinpan
// @match        http*://*dytt8.net/*
// @match        http*://www.ygdy8.com/*
// @match        http*://www.dy2018.com/*
// @match        http*://www.xiaopian.com/*
// ==/UserScript==

/**
 * 已有功能列表：
 *  - 功能1：删除第一次加载出现的广告
 *  - 功能2：标记高分电影
 *  - 功能3：去掉搜索框的广告跳转
 *  - 功能4：去掉中间页面上的flash广告
 *  - 功能5：删除右下角的flash广告
 *  - 功能6：去掉按任意键弹出广告
 *  - 功能7：去掉首次点击任何地方弹出广告
 *  - 功能8：删除所有图片广告
 *  - 功能9：删除【紧急通知】
 */

// 功能1：删除第一次加载出现的广告
// 功能5：删除右下角的flash广告
// 功能8：删除所有图片广告
// 功能9：删除【紧急通知】
(function() {
  // 生成广告列表实例
  var ads = new Ads(['link', 'flash', 'img', 'notice']);

  // 循环搜索广告
  var adSearchCounter = 0;
  (function removeAd() {
    adSearchCounter++;
    console.log('第' + adSearchCounter + '次查找广告。');

    var elems = document.body.children;

    // 查找全屏链接广告
    var link = elems[0];
    if (ads.get('link') && link && link.nodeName === 'A' && link.href) {
      link.remove();
      ads.remove('link');
      console.log(`找到全屏链接广告！成功删除！`);
    }

    // 查找右下角flash窗口
    var flash = elems[elems.length - 1];
    if (ads.get('flash') && flash && flash.style.position === 'fixed') {
      flash.remove();
      ads.remove('flash');
      console.log('找到右下角flash窗口！成功删除！');
    }

    var images = document.body.querySelectorAll('img');
    if (images.length) {
      Array.from(images).forEach(item => {
        var parent = item.parentNode;
        var grantParent = parent ? parent.parentNode : null;
        if (parent) {
          if (parent.tagName === 'A') parent.remove();
          if (grantParent && grantParent.parentNode === document.body) grantParent.remove();
        }
        item.remove();
        // 移除广告后是空盒子也移除掉
        if (parent && !parent.childNodes.length) parent.remove();
        if (grantParent && !grantParent.childNodes.length) grantParent.remove();
      });
      ads.remove('img');
      console.log('找到图片广告！成功删除！');
    }

    var noticeElm = document.body.querySelector('div[class^="notice"]');
    if (noticeElm) {
      noticeElm.remove();
      ads.remove('notice');
      console.log('找到【紧急通知】！成功删除！');
    }

    // 判断是否删除完毕
    if (!ads.get()) return;

    // 超过20次就不再查找了
    if (adSearchCounter > 100) {
      return console.log('未找到，寻找结束！');
    }

    setTimeout(removeAd, 50);
  })();

  /**
   * 广告列表类
   * @param {Array} ads 广告集合 ['link', 'flash']
   * @method remove(adName) 移除广告
   * @method get(adName) 获取广告是否移除，默认无参数返回广告的总数量
   */
  function Ads(ads) {
    var _ads = {};
    var _adsLen = 0;
    ads.forEach(function(ad) {
      _ads[ad] = true;
      _adsLen++;
    });

    return {
      remove,
      get
    };

    // 移除广告
    function remove(key) {
      if (_ads[key]) {
        _ads[key] = false;
        _adsLen--;
      }
    }

    // 获取广告移除状态
    function get(key) {
      return key ? _ads[key] : _adsLen;
    }
  }
})();

// 功能2：标记高分电影
(function() {
  var markWords = ['高分', '获奖'];
  var allText = document.querySelectorAll('a, p');
  var textMark = function(text, markWords) {
    markWords.forEach(function(word) {
      text = text.replace(
        new RegExp(word),
        '<strong style="color: red;font-size: 18px;">' + word + '</strong>'
      );
    });
    return text;
  };
  allText.forEach(function(aElem) {
    aElem.innerHTML = textMark(aElem.innerHTML, markWords);
  });
})();

// 功能3：去掉搜索框的广告跳转
// ** 该功能目前与功能6有重合部分，先去掉 **
// (function() {
//   document
//     .querySelector('input[name="keyword"]')
//     .addEventListener('keydown', function(e) {
//       e.stopPropagation();
//     });
// })();

// 功能4：去掉中间页面上的flash广告
// (还可以提高网站性能，不影响页面布局)
(function() {
  var containWidth = document.querySelector('.contain').clientWidth;
  // 递归移除父级，除与广告的尺寸不一致就停止
  // 误差范围宽度30px，高度10px
  var removeParentUntilDiffSize = function(elem) {
    var elemW = elem.clientWidth;
    var elemH = elem.clientHeight;
    var parent = elem.parentNode;
    var parentW = parent.clientWidth;
    var parentH = parent.clientHeight;
    if (checkSize(parentW, elemW, 30) && checkSize(parentH, elemH, 10)) {
      removeParentUntilDiffSize(parent);
    } else {
      elem.remove();
    }
  };
  // 校验大小是否在误差之内
  var checkSize = function(current, target, range) {
    return current > target - 30 && current < target + 30;
  };
  document.querySelectorAll('iframe').forEach(function(elem) {
    if (elem.clientWidth === containWidth) {
      removeParentUntilDiffSize(elem);
    } else {
      elem.src = '';
    }
  });
})();

// 功能6：去掉按任意键弹出广告
(function() {
  document.addEventListener(
    'keydown',
    function(e) {
      e.stopPropagation();
    },
    true
  );
})();

// 功能7：去掉首次点击任何地方弹出广告
(function() {
  document.addEventListener(
    'click',
    function(e) {
      e.stopPropagation();
    },
    true
  );
})();
