// options.js - Settings page logic

const defaultSettings = {
  rpcHost: 'localhost',
  rpcPort: 6800,
  rpcProtocol: 'http',
  rpcSecret: '',
  autoCapture: true,
  excludedProtocols: ['data:', 'blob:', 'file:'],
  excludedSites: [],
  excludedFileTypes: [],
  minFileSize: 0,
  showNotifications: true
};

async function loadSettings() {
  const stored = await chrome.storage.local.get('settings');
  const settings = { ...defaultSettings, ...stored.settings };

  document.getElementById('rpcHost').value = settings.rpcHost;
  document.getElementById('rpcPort').value = settings.rpcPort;
  document.getElementById('rpcProtocol').value = settings.rpcProtocol;
  document.getElementById('rpcSecret').value = settings.rpcSecret || '';
  document.getElementById('autoCapture').checked = settings.autoCapture;
  document.getElementById('showNotifications').checked = settings.showNotifications;
  document.getElementById('minFileSize').value = settings.minFileSize;

  const excludedProtocols = Array.isArray(settings.excludedProtocols)
    ? settings.excludedProtocols
    : settings.excludedProtocols.split('\n').filter(Boolean);
  document.getElementById('excludedProtocols').value = excludedProtocols.join('\n');

  const excludedSites = Array.isArray(settings.excludedSites)
    ? settings.excludedSites
    : settings.excludedSites.split('\n').filter(Boolean);
  document.getElementById('excludedSites').value = excludedSites.join('\n');

  const excludedFileTypes = Array.isArray(settings.excludedFileTypes)
    ? settings.excludedFileTypes
    : settings.excludedFileTypes.split('\n').filter(Boolean);
  document.getElementById('excludedFileTypes').value = excludedFileTypes.join('\n');

  testConnection();
}

async function saveSettings() {
  const settings = {
    rpcHost: document.getElementById('rpcHost').value.trim() || 'localhost',
    rpcPort: parseInt(document.getElementById('rpcPort').value) || 6800,
    rpcProtocol: document.getElementById('rpcProtocol').value,
    rpcSecret: document.getElementById('rpcSecret').value,
    autoCapture: document.getElementById('autoCapture').checked,
    showNotifications: document.getElementById('showNotifications').checked,
    minFileSize: parseInt(document.getElementById('minFileSize').value) || 0,
    excludedProtocols: document.getElementById('excludedProtocols')
      .value
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean),
    excludedSites: document.getElementById('excludedSites')
      .value
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean),
    excludedFileTypes: document.getElementById('excludedFileTypes')
      .value
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
  };

  try {
    await chrome.storage.local.set({ settings });
    showStatus('Settings saved successfully!', 'success');
  } catch (error) {
    showStatus('Failed to save settings: ' + error.message, 'error');
  }
}

async function testConnection() {
  const rpcHost = document.getElementById('rpcHost').value.trim() || 'localhost';
  const rpcPort = document.getElementById('rpcPort').value || '6800';
  const rpcProtocol = document.getElementById('rpcProtocol').value;
  const rpcSecret = document.getElementById('rpcSecret').value;

  const connectionStatus = document.getElementById('connectionStatus');
  connectionStatus.textContent = 'Connecting...';
  connectionStatus.className = 'connection-status';

  try {
    const httpProtocol = rpcProtocol === 'https' ? 'https' : 'http';
    const rpcUrl = `${httpProtocol}://${rpcHost}:${rpcPort}/jsonrpc`;

    const rpcParams = rpcSecret ? ['token:' + rpcSecret] : [];
    
    const result = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', rpcUrl, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.timeout = 10000;
      
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.error) {
              reject(new Error(data.error.message));
            } else {
              resolve(data);
            }
          } catch (e) {
            reject(new Error('Invalid response'));
          }
        } else {
          reject(new Error('HTTP ' + xhr.status));
        }
      };
      
      xhr.onerror = () => reject(new Error('Connection failed'));
      xhr.ontimeout = () => reject(new Error('Connection timeout'));
      
      xhr.send(JSON.stringify({
        jsonrpc: '2.0',
        id: 'test-' + Date.now(),
        method: 'aria2.getVersion',
        params: rpcParams
      }));
    });

    connectionStatus.textContent = 'Connected';
    connectionStatus.className = 'connection-status connected';
  } catch (error) {
    connectionStatus.textContent = 'Failed: ' + error.message;
    connectionStatus.className = 'connection-status';
  }
}

function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = 'status ' + type;
  status.style.display = 'block';

  setTimeout(() => {
    status.style.display = 'none';
  }, 3000);
}

document.getElementById('saveSettings').addEventListener('click', saveSettings);
document.getElementById('testConnection').addEventListener('click', testConnection);

loadSettings();