// ==UserScript==
// @name         网站图片（背景图，svg，canvas）抓取预览下载
// @namespace    https://github.com/yujinpan/tampermonkey-extension
// @version      2.0
// @license      MIT
// @description  将站点所有的图片（背景图，svg，canvas）抓取提供预览，直接点击下载。
// @author       yujinpan
// @include      http*://**
// ==/UserScript==

/**
 * 已有功能列表：
 * - 抓取页面上的图片链接，包括 **img，背景图，svg，canvas**
 * - 提供展示抓取的图片的列表快速预览
 * - 提供按钮快速切换抓取的图片展示区
 * - 提供快速下载，点击预览即可下载源图片文件
 * - 提供动态抓取后来加载的图片
 *
 * 2019-5-17 更新内容：
 * - 修复 svg，canvas 展示与下载问题
 * - 增加暗黑透明样式，黑色，白色图片区分明显
 * - 重构核心代码，分模块执行，提高可读性与维护性
 * - 兼容 iframe 的 btoa 方法报错
 */

(() => {
  // 存放抓取与生成的图片
  const urls = new Set();

  // 初始化
  init();

  /**
   * 初始化
   */
  function init() {
    // 创建样式
    createStyle();

    // 创建容器
    const section = document.createElement('section');
    section.id = 'SIR';
    section.innerHTML = `
      <button class="SIR-toggle-button">自动获取图片</button>
      <div class="SIR-cover"></div>
      <ul class="SIR-main">
      </ul>
    `;
    document.body.append(section);

    // 获取按钮与列表 DOM
    const button = section.querySelector('.SIR-toggle-button');
    const main = section.querySelector('.SIR-main');

    // 切换时进行抓取
    let showMain = false;
    button.onclick = () => {
      showMain = !showMain;
      if (showMain) {
        imagesReptile();
        // content
        let imageList = '';
        urls.forEach((url) => {
          imageList += `
            <li>
              <a download="image" title="点击下载" href="${url}">
                <img src='${url}' />
              </a>
            </li>`;
        });
        main.innerHTML = imageList;
      } else {
        main.innerHTML = '';
      }
      section.classList.toggle('active', showMain);
    };
  }

  /**
   * 获取资源列表
   */
  function imagesReptile() {
    const elements = Array.from(document.querySelectorAll('*'));

    // 遍历取出 img，backgroundImage，svg，canvas
    for (const element of elements) {
      const tagName = element.tagName.toLowerCase();

      // img 标签
      if (tagName === 'img') {
        urls.add(getImgUrl(element));
        continue;
      }

      // svg
      if (tagName === 'svg') {
        urls.add(getSvgImage(element));
        continue;
      }

      // canvas
      if (tagName === 'canvas') {
        urls.add(getCanvasImage(element));
        continue;
      }

      // background-image
      const backgroundImage = getComputedStyle(element).backgroundImage;
      if (backgroundImage !== 'none' && backgroundImage.startsWith('url')) {
        urls.add(backgroundImage.slice(5, -2));
      }
    }
  }

  /**
   * 创建样式
   */
  function createStyle() {
    const style = document.createElement('style');
    style.innerHTML = `
      #SIR.active .SIR-cover {
          display: block;
      }
      #SIR.active .SIR-main {
          display: flex;
      }
      .SIR-toggle-button {
          position: fixed;
          right: 0;
          bottom: 0;
          z-index: 99999;
          opacity: 0.5;
      }
      .SIR-toggle-button:hover {
          opacity: 1;
      }
      .SIR-cover,
      .SIR-main {
          display: none;
          position: fixed;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
      }
      .SIR-cover {
          z-index: 99997;
          background: rgba(255, 255, 255, 0.7);
      }
      .SIR-main {
          z-index: 99998;
          overflow-y: auto;
          margin: 0;
          padding: 0;
          list-style-type: none;
          flex-wrap: wrap;
          text-align: center;
          background: rgba(0, 0, 0, 0.7);
      }
      .SIR-main > li {
          box-sizing: border-box;
          width: 10%;
          min-width: 168px;
          min-height: 100px;
          max-height: 200px;
          padding: 1px;
          box-shadow: 0 0 1px darkgrey;
          background: rgba(0, 0, 0, 0.5);
          overflow: hidden;
      }
      .SIR-main > li > a {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100%;
      }
      .SIR-main > li:hover img {
          transform: scale(1.5);
      }
      .SIR-main > li img {
          transition: transform .3s;
          max-width: 100%;
      }
    `;
    document.head.append(style);
  }

  /**
   * 获取 svg 图片链接
   * @param {Elment} svg svg 元素
   */
  function getSvgImage(svg) {
    svg.setAttribute('version', 1.1);
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    try {
      return 'data:image/svg+xml;base64,' + btoa(svg.outerHTML);
    } catch (e) {
      console.log('svg创建失败');
      return '';
    }
  }

  /**
   * 获取 canvas 图片链接
   * @param {Element} canvas canvas 元素
   */
  function getCanvasImage(canvas) {
    return canvas.toDataURL();
  }

  /**
   * 获取 img 的链接
   * @description
   * 兼容 srcset 属性
   * @param {Element} element 图片元素
   */
  function getImgUrl(element) {
    let url;

    // 兼容 srcset 属性
    if (element.srcset) {
      const srcs = element.srcset.split(',');
      url = srcs.reduce((pre, curr) => {
        curr = curr.trim();
        return curr.includes(' ') ? curr.split(' ')[0] : curr;
      }, '');
    } else {
      url = element.src;
    }

    return url;
  }
})();
