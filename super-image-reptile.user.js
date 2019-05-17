// ==UserScript==
// @name         网站图片（背景图，svg，canvas）抓取预览下载
// @namespace    https://github.com/yujinpan/tampermonkey-extension
// @version      1.0
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
 */

// 抓取的图片
const urls = new Set();
const svgs = new Set();
const canvas = new Set();

showImageList();

// 获取资源列表
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
      svgs.add(element);
      continue;
    }

    // canvas
    if (tagName === 'canvas') {
      canvas.add(element);
      continue;
    }

    // background-image
    const backgroundImage = getComputedStyle(element).backgroundImage;
    if (backgroundImage !== 'none' && backgroundImage.startsWith('url')) {
      urls.add(backgroundImage.slice(5, -2));
    }
  }
}

// 创建展示列表
function showImageList() {
  // style
  const style = document.createElement('style');
  style.innerHTML = `
    .SIR-toggle-button {
        position: fixed;
        right: 0;
        bottom: 0;
        z-index: 9999;
        opacity: 0.5;
    }
    .SIR-toggle-button:hover {
      opacity: 1;
    }
    .SIR-main {
        position: fixed;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        z-index: 9998;
        overflow-y: auto;
        margin: 0;
        padding: 0;
        list-style-type: none;
        display: none;
        flex-wrap: wrap;
        text-align: center;
        min-height: 100%;
        background: #eee;
    }
    .SIR-main > li {
        box-sizing: border-box;
        width: 10%;
        min-height: 100px;
        max-height: 200px;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 1px;
        border: 1px solid #ddd;
        cursor: pointer;
        background: inherit;
        overflow: hidden;
    }
    .SIR-main > li:hover > img,
    .SIR-main > li:hover > svg,
    .SIR-main > li:hover > canvas {
        transform: scale(1.5);
    }
    .SIR-main > li > img,
    .SIR-main > li > svg,
    .SIR-main > li > canvas {
        transition: transform .3s;
        max-width: 100%;
        max-height: 100%;
    }
  `;

  // container
  const section = document.createElement('section');
  section.id = 'SIR';
  section.innerHTML = `
    <button class="SIR-toggle-button">自动获取图片</button>
    <ul title="点击下载" class="SIR-main">
    </ul>
  `;

  document.head.append(style);
  document.body.append(section);

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
        imageList += `<li><img src='${url}'</li>`;
      });
      svgs.forEach((svg) => {
        imageList += `<li>${svg}</li>`;
      });
      canvas.forEach((canvas) => {
        imageList += `<li>${canvas}</li>`;
      });
      main.innerHTML = imageList;
    } else {
      main.innerHTML = '';
    }
    main.style.display = showMain ? 'flex' : 'none';
  };

  // 点击事件委托给父级
  main.onclick = (e) => {
    let target = e.target;
    if (target.tagName === 'LI') {
      target = target.firstChild;
    }
    switch (target.tagName) {
      case 'IMG':
        downloadUrl(target.src);
        break;
      case 'SVG':
        downloadSvg(target);
        break;
      case 'CANVAS':
        downloadCanvas(target);
      default:
    }
  };
}

// 为 url 生成下载链接
function downloadUrl(url) {
  var a = document.createElement('a');
  a.target = '_blank';
  a.href = url;
  a.download = 'image';
  a.click();
}

// 为 svg 生成下载链接
function downloadSvg(svg) {
  const image = new Image();
  image.src =
    'data:image/svg+xml;base64,' +
    window.btoa(unescape(encodeURIComponent(svg.outerHTML)));

  const canvas = document.createElement('canvas');
  canvas.width = svg.clientWidth;
  canvas.height = svg.clientHeight;

  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0);

  downloadCanvas(canvas);
}

// 为 canvas 生成下载链接
function downloadCanvas(canvas) {
  downloadUrl(canvas.toDataURL());
}

// 获 img 的链接
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
