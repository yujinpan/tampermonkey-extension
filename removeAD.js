// ==UserScript==
// @name         电影天堂去掉广告
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  shows how to use babel compiler
// @author       You
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.18.2/babel.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.16.0/polyfill.js
// @match        www.dytt8.net/*
// ==/UserScript==

// Your code here...
(function () {

    // 功能1：删除第一次加载出现的广告
    let adSearchCounter = 0;
    (function removeAd() {
        adSearchCounter++;
        console.log(`第${adSearchCounter}次查找广告。`);
        let ad = document.body.children[0];
        if (ad && ad.nodeName === 'A' && ad.href) {
            console.log(`找到！成功删除广告！`, ad);
            return ad.remove();
        } else if (adSearchCounter > 20) {
            return console.log('未找到，寻找结束！');
        }
        setTimeout(removeAd, 300);
    })();

    // 功能2：标记高分电影
    let markWords = ['高分', '获奖'];
    let allText = document.querySelectorAll('a, p');
    allText.forEach(aElem => {
        aElem.innerHTML = textMark(aElem.innerHTML, markWords);
    });

    function textMark(text, markWords) {
        markWords.forEach(word => text = text.replace(new RegExp(word), '<strong style="color: red;font-size: 18px;">' + word + '</strong>'));
        return text;
    }

    // 功能3：去掉搜索框的广告跳转
    document.querySelector('input[name="keyword"]').addEventListener('keydown', (e) => { e.stopPropagation(); });

})();