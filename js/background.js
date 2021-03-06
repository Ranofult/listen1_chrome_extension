/* global Github */
chrome.browserAction.onClicked.addListener((tab) => { // eslint-disable-line no-unused-vars
  chrome.tabs.create({
    url: chrome.extension.getURL('listen1.html'),
  }, (new_tab) => { // eslint-disable-line no-unused-vars
    // Tab opened.
  });
});

function hack_referer_header(details) {
  const replace_referer = true;
  let replace_origin = true;
  let add_referer = true;
  let add_origin = true;

  let referer_value = '';
  let origin_value = '';
  let ua_value = '';

  if (details.url.indexOf('://music.163.com/') !== -1) {
    referer_value = 'http://music.163.com/';
  }
  if (details.url.indexOf('://gist.githubusercontent.com/') !== -1) {
    referer_value = 'https://gist.githubusercontent.com/';
  }

  if (details.url.indexOf('.xiami.com/') !== -1) {
    add_origin = false;
    add_referer = false;
    // referer_value = "https://www.xiami.com";
  }

  if (details.url.indexOf('c.y.qq.com/') !== -1) {
    referer_value = 'https://y.qq.com/';
    origin_value = 'https://y.qq.com';
  }
  if ((details.url.indexOf('i.y.qq.com/') !== -1)
    || (details.url.indexOf('qqmusic.qq.com/') !== -1)
    || (details.url.indexOf('music.qq.com/') !== -1)
    || (details.url.indexOf('imgcache.qq.com/') !== -1)) {
    referer_value = 'https://y.qq.com/';
  }

  if (details.url.indexOf('.kugou.com/') !== -1) {
    referer_value = 'http://www.kugou.com/';
  }

  if (details.url.indexOf('.kuwo.cn/') !== -1) {
    referer_value = 'http://www.kuwo.cn/';
  }

  if (details.url.indexOf('.bilibili.com/') !== -1 || details.url.indexOf('.bilivideo.com/') !== -1) {
    referer_value = 'https://www.bilibili.com/';
    replace_origin = false;
    add_origin = false;
  }

  if (details.url.indexOf('.migu.cn') !== -1) {
    referer_value = 'http://music.migu.cn/v3/music/player/audio?from=migu';
  }

  if (details.url.indexOf('m.music.migu.cn') !== -1) {
    referer_value = 'https://m.music.migu.cn/';
  }

  if ((details.url.indexOf('app.c.nf.migu.cn') !== -1)
    || (details.url.indexOf('d.musicapp.migu.cn') !== -1)) {
    ua_value = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30';
    add_origin = false;
    add_referer = false;
  }

  if (details.url.indexOf('jadeite.migu.cn') !== -1) {
    ua_value = 'okhttp/3.12.12';
    add_origin = false;
    add_referer = false;
  }

  if (origin_value === '') {
    origin_value = referer_value;
  }

  let isRefererSet = false;
  let isOriginSet = false;
  let isUASet = false;
  const headers = details.requestHeaders;
  const blockingResponse = {};

  for (let i = 0, l = headers.length; i < l; i += 1) {
    if (replace_referer && (headers[i].name === 'Referer') && (referer_value !== '')) {
      headers[i].value = referer_value;
      isRefererSet = true;
    }
    if (replace_origin && (headers[i].name === 'Origin') && (origin_value !== '')) {
      headers[i].value = origin_value;
      isOriginSet = true;
    }
    if ((headers[i].name === 'User-Agent') && (ua_value !== '')) {
      headers[i].value = ua_value;
      isUASet = true;
    }
  }

  if (add_referer && (!isRefererSet) && (referer_value !== '')) {
    headers.push({
      name: 'Referer',
      value: referer_value,
    });
  }

  if (add_origin && (!isOriginSet) && (origin_value !== '')) {
    headers.push({
      name: 'Origin',
      value: origin_value,
    });
  }

  if ((!isUASet) && (ua_value !== '')) {
    headers.push({
      name: 'User-Agent',
      value: ua_value,
    });
  }

  blockingResponse.requestHeaders = headers;
  return blockingResponse;
}

const urls = ['*://music.163.com/*', '*://*.xiami.com/*', '*://i.y.qq.com/*', '*://c.y.qq.com/*', '*://*.kugou.com/*', '*://*.kuwo.cn/*', '*://*.bilibili.com/*', '*://*.bilivideo.com/*', '*://*.migu.cn/*', '*://*.githubusercontent.com/*'];

try {
  chrome.webRequest.onBeforeSendHeaders.addListener(hack_referer_header, {
    urls,
  }, ['requestHeaders', 'blocking', 'extraHeaders']);
} catch (err) {
  // before chrome v72, extraHeader is not supported
  chrome.webRequest.onBeforeSendHeaders.addListener(hack_referer_header, {
    urls,
  }, ['requestHeaders', 'blocking']);
}

/**
 * Get tokens.
 */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type !== 'code') {
    return;
  }

  const code = request.query.split('=')[1];
  Github.handleCallback(code);
  sendResponse();
});

// at end of background.js
chrome.commands.onCommand.addListener((command) => {
  const [viewWindow] = chrome.extension.getViews().filter((p) => p.location.href.endsWith('listen1.html'));

  switch (command) {
    case 'play_next':
      viewWindow.document.querySelector('.li-next').click();
      break;
    case 'play_prev':
      viewWindow.document.querySelector('.li-previous').click();
      break;
    case 'play_pause':
      viewWindow.document.querySelector('.play').click();
      break;
    default:
    // console.log('不支持的快捷键')
  }
});
