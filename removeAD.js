// ==UserScript==
// @name         电影天堂(www.dytt8.net)去掉广告与高亮高分电影
// @namespace    https://github.com/yujinpan/tampermonkey-extension
// @version      0.4
// @license      MIT
// @description  提高电影天堂(www.dytt8.net)网站浏览体验与效率。
// @author       yujinpan
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.18.2/babel.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.16.0/polyfill.js
// @match        www.dytt8.net/*
// ==/UserScript==

/**
 * 已有功能列表：
 *  - 功能1：删除第一次加载出现的广告
 *  - 功能2：标记高分电影
 *  - 功能3：去掉搜索框的广告跳转
 *  - 功能4：去掉中间页面上的flash广告
 *  - 功能5：删除右下角的flash广告
 */

// 功能1：删除第一次加载出现的广告
// 功能5：删除右下角的flash广告
(function () {
    // 生成广告列表实例
    const ads = new Ads(['link', 'flash']);

    // 循环搜索广告
    let adSearchCounter = 0;
    (function removeAd() {
        adSearchCounter++;
        console.log(`第${adSearchCounter}次查找广告。`);

        const elems = document.body.children;

        // 查找全屏链接广告
        const link = elems[0];
        if (ads.get('link') && link && link.nodeName === 'A' && link.href) {
            link.remove();
            ads.remove('link');
            console.log(`找到全屏链接广告！成功删除！`);
        }

        // 查找右下角flash窗口
        const flash = elems[elems.length - 1];
        if (ads.get('flash') && flash && flash.style.position === 'fixed') {
            flash.remove();
            ads.remove('flash');
            console.log('找到右下角flash窗口！成功删除！');
        }

        // 判断是否删除完毕
        if (!ads.get()) return;


        // 超过20次就不再查找了
        if (adSearchCounter > 20) {
            return console.log('未找到，寻找结束！');
        }

        setTimeout(removeAd, 300);
    })();

    /**
     * 广告列表类
     * @param {Array} ads 广告集合 ['link', 'flash']
     * @method remove(adName) 移除广告
     * @method get(adName) 获取广告是否移除，默认无参数返回广告的总数量
     */
    function Ads(ads) {
        let _ads = {};
        let _adsLen = 0;
        ads.forEach(ad => {
            _ads[ad] = true;
            _adsLen++;
        });

        return {
            remove, get
        }

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

// 功能4：去掉中间页面上的flash广告
// (还可以提高网站性能，不影响页面布局)
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
