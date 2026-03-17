// popup.js - Popup logic

document.addEventListener('DOMContentLoaded', async () => {
  const captureStatus = document.getElementById('captureStatus');
  const openAriangBtn = document.getElementById('openAriang');
  const openSettingsBtn = document.getElementById('openSettings');

  const stored = await chrome.storage.local.get('settings');
  const settings = stored.settings || {};

  if (settings.autoCapture) {
    captureStatus.textContent = 'Auto Capture: Enabled';
    captureStatus.className = 'status enabled';
  } else {
    captureStatus.textContent = 'Auto Capture: Disabled';
    captureStatus.className = 'status disabled';
  }

  openAriangBtn.addEventListener('click', () => {
    const protocol = settings.rpcProtocol === 'https' ? 'https' : 'http';
    let ariangUrl = `ariang/index.html#!/settings/rpc/set/${protocol}/${settings.rpcHost || 'localhost'}/${settings.rpcPort || 6800}/jsonrpc`;
    if (settings.rpcSecret) {
      ariangUrl += '/' + btoa(settings.rpcSecret);
    }
    chrome.tabs.create({ url: ariangUrl });
    window.close();
  });

  openSettingsBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'options.html' });
    window.close();
  });
});