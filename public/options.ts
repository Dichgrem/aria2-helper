interface Settings {
  rpcHost: string;
  rpcPort: number;
  rpcProtocol: string;
  rpcSecret: string;
  autoCapture: boolean;
  excludedProtocols: string[];
  excludedSites: string[];
  excludedFileTypes: string[];
  minFileSize: number;
  showNotifications: boolean;
}

const defaultSettings: Settings = {
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

const getEl = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;

async function loadSettings(): Promise<void> {
  const stored = await chrome.storage.local.get('settings');
  const settings: Settings = stored.settings ? { ...defaultSettings, ...stored.settings } : defaultSettings;

  getEl<HTMLInputElement>('rpcHost').value = settings.rpcHost;
  getEl<HTMLInputElement>('rpcPort').value = settings.rpcPort.toString();
  getEl<HTMLSelectElement>('rpcProtocol').value = settings.rpcProtocol;
  getEl<HTMLInputElement>('rpcSecret').value = settings.rpcSecret || '';
  getEl<HTMLInputElement>('autoCapture').checked = settings.autoCapture;
  getEl<HTMLInputElement>('showNotifications').checked = settings.showNotifications;
  getEl<HTMLInputElement>('minFileSize').value = settings.minFileSize.toString();

  const excludedProtocols = Array.isArray(settings.excludedProtocols)
    ? settings.excludedProtocols
    : String(settings.excludedProtocols).split('\n').filter(Boolean);
  getEl<HTMLTextAreaElement>('excludedProtocols').value = excludedProtocols.join('\n');

  const excludedSites = Array.isArray(settings.excludedSites)
    ? settings.excludedSites
    : String(settings.excludedSites).split('\n').filter(Boolean);
  getEl<HTMLTextAreaElement>('excludedSites').value = excludedSites.join('\n');

  const excludedFileTypes = Array.isArray(settings.excludedFileTypes)
    ? settings.excludedFileTypes
    : String(settings.excludedFileTypes).split('\n').filter(Boolean);
  getEl<HTMLTextAreaElement>('excludedFileTypes').value = excludedFileTypes.join('\n');

  testConnection();
}

async function saveSettings(): Promise<void> {
  const settings: Settings = {
    rpcHost: getEl<HTMLInputElement>('rpcHost').value.trim() || 'localhost',
    rpcPort: parseInt(getEl<HTMLInputElement>('rpcPort').value) || 6800,
    rpcProtocol: getEl<HTMLSelectElement>('rpcProtocol').value,
    rpcSecret: getEl<HTMLInputElement>('rpcSecret').value,
    autoCapture: getEl<HTMLInputElement>('autoCapture').checked,
    showNotifications: getEl<HTMLInputElement>('showNotifications').checked,
    minFileSize: parseInt(getEl<HTMLInputElement>('minFileSize').value) || 0,
    excludedProtocols: getEl<HTMLTextAreaElement>('excludedProtocols')
      .value
      .split('\n')
      .map((line: string) => line.trim())
      .filter(Boolean),
    excludedSites: getEl<HTMLTextAreaElement>('excludedSites')
      .value
      .split('\n')
      .map((line: string) => line.trim())
      .filter(Boolean),
    excludedFileTypes: getEl<HTMLTextAreaElement>('excludedFileTypes')
      .value
      .split('\n')
      .map((line: string) => line.trim())
      .filter(Boolean)
  };

  try {
    await chrome.storage.local.set({ settings });
    showStatus('Settings saved successfully!', 'success');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    showStatus('Failed to save settings: ' + message, 'error');
  }
}

async function testConnection(): Promise<void> {
  const rpcHost = getEl<HTMLInputElement>('rpcHost').value.trim() || 'localhost';
  const rpcPort = getEl<HTMLInputElement>('rpcPort').value || '6800';
  const rpcProtocol = getEl<HTMLSelectElement>('rpcProtocol').value;
  const rpcSecret = getEl<HTMLInputElement>('rpcSecret').value;

  const connectionStatus = getEl<HTMLDivElement>('connectionStatus');
  connectionStatus.textContent = 'Connecting...';
  connectionStatus.className = 'connection-status';

  try {
    const httpProtocol = rpcProtocol === 'https' ? 'https' : 'http';
    const rpcUrl = `${httpProtocol}://${rpcHost}:${rpcPort}/jsonrpc`;

    const rpcParams = rpcSecret ? ['token:' + rpcSecret] : [];
    
    await new Promise<void>((resolve, reject) => {
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
              resolve();
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
    const message = error instanceof Error ? error.message : 'Unknown error';
    connectionStatus.textContent = 'Failed: ' + message;
    connectionStatus.className = 'connection-status';
  }
}

function showStatus(message: string, type: string): void {
  const status = getEl<HTMLDivElement>('status');
  status.textContent = message;
  status.className = 'status ' + type;
  status.style.display = 'block';

  setTimeout(() => {
    status.style.display = 'none';
  }, 3000);
}

getEl<HTMLButtonElement>('saveSettings').addEventListener('click', saveSettings);
getEl<HTMLButtonElement>('testConnection').addEventListener('click', testConnection);

loadSettings();

export {};
