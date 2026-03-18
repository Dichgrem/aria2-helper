chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'getCookies') {
    sendResponse(true);
  }
});

console.log('AriaNg Download Manager content script loaded');
