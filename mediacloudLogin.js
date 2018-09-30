// ==UserScript==
// @name         媒体云 - 快速登陆
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  shows how to use babel compiler
// @author       You
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.18.2/babel.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.16.0/polyfill.js
// @match        http://*/login*
// ==/UserScript==

// Your code here...
(function () {
    var loginEle = $('#login');
    if (loginEle.length) {
        try {
            loginEle.find('input[name="username"]').val('admin@cmstop.com')
                .next().val('123456')
                .next().find('.button.cloud-icon-user-login').removeClass('disabled').click();
        } catch (err) { console.log(err); }
    }
})();