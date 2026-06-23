# Usage Guide

## Installation

### From Firefox Add-ons (Recommended)

Install from [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/aria2-helper/).

### Load Temporarily (Development)

1. Open Firefox, navigate to `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on…**
3. Select `manifest.json` from `.output/firefox-mv2/` (after `just build-firefox`)
4. The extension loads and stays active until Firefox restarts

### Side-load (Persistent, Firefox)

For persistent installation in Firefox Developer Edition or Nightly:

1. Set `xpinstall.signatures.required = false` in `about:config`
2. Build the extension: `just zip-firefox`
3. Go to `about:addons` → gear icon → **Install Add-on From File…**
4. Select the generated `.zip` from the project root

### Chrome / Edge

1. Build: `just build` (or `just zip`)
2. Open `chrome://extensions/`, enable **Developer mode**
3. Click **Load unpacked** → select `.output/chrome-mv3/`

---

## Prerequisites

aria2 must be running with RPC enabled:

```bash
aria2c --enable-rpc --rpc-listen-all
```

By default the extension connects to `http://localhost:6800/jsonrpc` with no secret token. If your aria2 uses `--rpc-secret=<token>`, enter it in the settings.

---

## Configuration

Open the settings page by:
- Clicking the extension icon → **Settings**
- Or right-click the extension icon → **Manage Extension** → **Options**

### Settings

| Setting | Description | Default |
|---------|-------------|---------|
| RPC Host | aria2 server hostname or IP | `localhost` |
| RPC Port | aria2 RPC port (must match `--rpc-listen-port`) | `6800` |
| RPC Protocol | `http` or `https` | `http` |
| RPC Secret | `--rpc-secret` value (leave empty if none) | *(empty)* |
| Show Notifications | Show browser notifications on download success/failure | `true` |
| Intercept Downloads | Master toggle for download interception | `true` |

### Connection Test

Click **Test Connection** to send `aria2.getVersion` to your RPC endpoint. A green "Connected" confirms the settings are correct.

---

## Daily Use

### Popup

Click the extension icon in the toolbar to open the popup:

- **Intercepting: ON / OFF** — toggle download interception. OFF lets the browser handle downloads normally.
- **Open AriaNg** — opens the built-in AriaNg web UI in a new tab, pre-configured with your RPC settings. Full download management: pause, resume, remove, reorder, view progress/speed/peers.
- **Settings** — opens the settings page.

### Download Interception

When enabled, the extension automatically:

1. Detects when the browser starts a download (or a server responds with `Content-Disposition: attachment`)
2. Cancels the browser's download
3. Sends the URL to aria2 with cookies and referer headers preserved
4. Shows a notification: "Download added to Aria2"

This works for:
- Direct file links
- Download buttons (`<a download>`)
- Server-triggered downloads (`Content-Disposition: attachment`)
- `.torrent` and `.metalink` files (sent as base64-encoded blobs)

### Context Menu

Right-click any link on any page:

- **Download with Aria2** — sends the link URL directly to aria2
- **Open Aria2** — opens AriaNg in a new tab (with RPC settings pre-filled)

---

## AriaNg Web UI

The bundled [AriaNg](https://github.com/mayswind/AriaNg) provides a full aria2 management interface:

- View active, waiting, and stopped downloads
- Pause / resume / remove downloads
- Adjust download order
- Monitor download speed, progress, peers
- Modify global and per-download settings
- Access via the popup's **Open AriaNg** button or right-click **Open Aria2**

AriaNg connects directly to your aria2 RPC — no relay, no cloud. All data stays on your machine.

---

## Troubleshooting

### "Failed to add download to Aria2"

- Verify aria2 is running: `aria2c --enable-rpc --rpc-listen-all`
- Check RPC host/port in settings match your aria2 configuration
- If using `--rpc-secret`, make sure it's entered in settings
- Run **Test Connection** in the settings page to diagnose

### Downloads go to browser instead of aria2

- Check the popup toggle: is it **Intercepting: ON**?
- Verify the **Intercept Downloads** checkbox in settings
- If it's a POST-triggered download (form submit), the extension intentionally leaves it to the browser — this is by design

### aria2 can't download a file the browser could

- Some sites require specific cookies or referer headers. The extension passes cookies from the active tab automatically. If a download fails, try right-click → "Download with Aria2" from the same tab where you're logged in.
- One-time signed URLs (common on GitHub, file hosts) are intercepted *before* the browser consumes them — this should work automatically.
