// ==UserScript==
// @name         电影天堂去掉广告与高亮高分电影
// @namespace    https://greasyfork.org/zh-CN/users/226081-yujinpan
// @version      0.3
// @license MIT
// @description  电影天堂网站去掉广告与高亮高分电影
// @author       yujinpan
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.18.2/babel.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.16.0/polyfill.js
// @match        www.dytt8.net/*
// ==/UserScript==

// 功能1：删除第一次加载出现的广告
(function () {
    let adSearchCounter = 0;
    (function removeAd() {
        adSearchCounter++;
        console.log(`第${adSearchCounter}次查找广告。`);
        const ad = document.body.children[0];
        if (ad && ad.nodeName === 'A' && ad.href) {
            console.log(`找到！成功删除广告！`, ad);
            return ad.remove();
        } else if (adSearchCounter > 20) {
            return console.log('未找到，寻找结束！');
        }
        setTimeout(removeAd, 300);
    })();
})();

// 功能2：标记高分电影
(function () {
    const markWords = ['高分', '获奖'];
    const allText = document.querySelectorAll('a, p');
    const textMark = (text, markWords) => {
        markWords.forEach(word => text = text.replace(new RegExp(word), '<strong style="color: red;font-size: 18px;">' + word + '</strong>'));
        return text;
    };
    allText.forEach(aElem => {
        aElem.innerHTML = textMark(aElem.innerHTML, markWords);
    });
})();

// 功能3：去掉搜索框的广告跳转
(function () {
    document.querySelector('input[name="keyword"]').addEventListener('keydown', (e) => { e.stopPropagation(); });
})();

// 功能4：去掉页面上的flash广告（还可以提高网站性能），不影响页面布局
(function () {
    const containWidth = document.querySelector('.contain').clientWidth;
    // 递归移除父级，除与广告的尺寸不一致就停止
    // 误差范围宽度30px，高度10px
    const removeParentUntilDiffSize = (elem) => {
        const elemW = elem.clientWidth;
        const elemH = elem.clientHeight;
        const parent = elem.parentNode;
        const parentW = parent.clientWidth;
        const parentH = parent.clientHeight;
        if (checkSize(parentW, elemW, 30) && checkSize(parentH, elemH, 10)) {
            removeParentUntilDiffSize(parent);
        } else {
            elem.remove();
        }
    };
    // 校验大小是否在误差之内
    const checkSize = (current, target, range) => {
        return current > target - 30 && current < target + 30;
    }
    document.querySelectorAll('iframe').forEach(elem => {
        if (elem.clientWidth === containWidth) {
            removeParentUntilDiffSize(elem);
        } else {
            elem.src = '';
        }
    });
})();
