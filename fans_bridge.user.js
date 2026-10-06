// ==UserScript==
// @name         Quick HC - FANS Bridge
// @namespace    quick-hc-fans
// @version      1.2
// @description  Tiny bridge: lets the Quick HC dashboard (React) send FANS messages through Tampermonkey (bypasses CORS, uses your logged-in FANS session)
// @match        https://shahnawazhussain9916-tech.github.io/amznemp_access/*
// @match        http://localhost:3000/*
// @updateURL    https://shahnawazhussain9916-tech.github.io/amznemp_access/fans_bridge.user.js
// @downloadURL  https://shahnawazhussain9916-tech.github.io/amznemp_access/fans_bridge.user.js
// @grant        GM_xmlhttpRequest
// @connect      fans-dub.amazon.com
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';
  const FANS_API = 'https://fans-dub.amazon.com/api/message/new';
  // Marker on the page's DOM (shared between Tampermonkey and the page) so the dashboard can see the bridge is installed
  document.documentElement.setAttribute('data-qh-fans-bridge', '1.2');
  console.log('[FANS bridge] v1.2 active');

  const reply = (id, ok, error) =>
    window.postMessage({ type: 'QH_FANS_RESULT', id, ok, error }, window.location.origin);

  window.addEventListener('message', e => {
    if (e.origin !== window.location.origin || !e.data) return;
    if (e.data.type === 'QH_FANS_PING') {            // lets the dashboard know the bridge is installed
      window.postMessage({ type: 'QH_FANS_PONG' }, window.location.origin);
      return;
    }
    if (e.data.type !== 'QH_FANS_SEND') return;
    const { id, login, text } = e.data;
    if (!id || !login || !text) return reply(id, false, 'Bad request');
    GM_xmlhttpRequest({
      method: 'POST',
      url: FANS_API,
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      data: JSON.stringify({ to: login, directReports: '', messageText: text, cannedResponses: [] }),
      withCredentials: true,
      onload: r => reply(id, r.status >= 200 && r.status < 300, 'HTTP ' + r.status),
      onerror: () => reply(id, false, 'FANS unreachable')
    });
  });
})();