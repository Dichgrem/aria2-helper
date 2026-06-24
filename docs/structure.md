# Project Structure

```
aria2-helper/
├── entrypoints/
│   ├── background.ts     # Core: download interception, aria2 JSON-RPC, context menu
│   ├── popup/
│   │   ├── index.html    # Popup UI markup
│   │   └── main.ts       # Popup logic: enable/disable toggle, open AriaNg, open settings
│   └── options/
│       ├── index.html    # Settings page markup
│       └── main.ts       # Settings logic: RPC config form, connection test
├── public/
│   ├── _locales/
│   │   ├── en/messages.json    # English i18n strings
│   │   └── zh_CN/messages.json # Chinese i18n strings
│   ├── icons/                  # Extension icons (16/48/128px)
│   └── ariang/                 # AriaNg web UI (downloaded at build time, not committed)
├── scripts/
│   └── download-ariang.ts      # Standalone script: downloads and extracts AriaNg release zip
├── docs/                       # Documentation
├── wxt.config.ts               # WXT framework config (manifest, permissions, build targets)
├── package.json
├── pnpm-lock.yaml
├── Justfile                    # Task runner commands
├── CHANGELOG.md
├── README.md
├── README.zh-CN.md
└── LICENSE
```

## Entrypoints

WXT auto-detects files under `entrypoints/` and each becomes a separate bundle.

### background.ts

The extension's core. Runs as a persistent service worker / background page.

**Responsibilities:**
- **Settings management** — load/save from `browser.storage.local`, react to storage changes
- **Download interception** — two complementary paths:
  - `webRequest.onHeadersReceived` — intercepts `Content-Disposition: attachment` before the body loads, preventing signed URLs from being consumed by the browser
  - `downloads.onCreated` — catches downloads that bypass webRequest (e.g. `<a download>`)
- **aria2 JSON-RPC client** — sends `aria2.addUri`, `aria2.addTorrent`, `aria2.addMetalink` over HTTP/HTTPS with optional `token:` secret
- **Context menu** — "Download with Aria2" and "Open Aria2" on right-click
- **Cookie & Referer passthrough** — fetches cookies for the download URL, passes `Referer` header
- **Notifications** — success/error toasts via `browser.notifications`

**Data flow:**
1. User clicks a download link or server responds with `Content-Disposition: attachment`
2. Extension cancels the browser download
3. Fetches cookies + referer for the URL
4. Sends `aria2.addUri` (or `.addTorrent`/`.addMetalink`) to the configured RPC endpoint
5. Shows notification

### popup/

The toolbar popup (click the extension icon). Three buttons:
- **Toggle** — enable/disable download interception
- **Open AriaNg** — opens the bundled AriaNg UI in a new tab, pre-configured with RPC settings
- **Settings** — opens the options page

Reads/writes settings via `browser.storage.local`.

### options/

A full-page settings form (opens in a new tab via `options_ui.open_in_tab`).

**Fields:**
| Setting | Type | Default |
|---------|------|---------|
| RPC Host | text | `localhost` |
| RPC Port | number | `6800` |
| RPC Protocol | select | `http` |
| RPC Secret | password | (empty) |
| Show Notifications | checkbox | `true` |
| Intercept Downloads | checkbox | `true` |

**Connection Test** — sends `aria2.getVersion` to verify the RPC config works.

## public/_locales/

i18n strings following the WebExtensions `__MSG_key__` convention. Keys defined:
- `extName`, `extDescription`
- `downloadAdded`, `downloadError`
- `settingsTitle`, `rpcHost`, `rpcPort`, `rpcProtocol`, `rpcSecret`
- `saveSettings`, `showNotifications`

## wxt.config.ts

WXT configuration. Key settings:
- **Manifest v3** with `gecko`-specific `browser_specific_settings` (Firefox >= 140.0)
- Permissions: `contextMenus`, `cookies`, `downloads`, `notifications`, `storage`, `tabs`, `webRequest`, `webRequestBlocking`
- Host permissions: `<all_urls>`
- Default locale: `en`
