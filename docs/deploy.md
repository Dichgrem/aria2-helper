# Deployment

## Build

```bash
# Install dependencies + download AriaNg
just install
just download-ariang

# Build for Firefox
just build-firefox    # → .output/firefox-mv2/

# Build for Chrome
just build            # → .output/chrome-mv3/

# Build + zip
just zip-firefox      # → .output/<name>-<version>-firefox.zip
just zip              # → .output/<name>-<version>-chrome.zip
```

## Load in Browser

### Firefox

**Temporary (development):**
1. Navigate to `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on…**
3. Select `manifest.json` from `.output/firefox-mv2/`

The extension stays until Firefox restarts.

**Persistent (Developer Edition / Nightly):**
1. Set `xpinstall.signatures.required = false` in `about:config`
2. Run `just zip-firefox`
3. `about:addons` → gear → **Install Add-on From File…** → select the zip

### Chrome / Edge

1. Run `just build` (or `just zip` and extract)
2. Open `chrome://extensions/` → enable **Developer mode**
3. Click **Load unpacked** → select `.output/chrome-mv3/`

## Publish to Stores

### Firefox Add-ons (AMO)

Published at [addons.mozilla.org/firefox/addon/aria2-helper](https://addons.mozilla.org/firefox/addon/aria2-helper/).

To submit an update:

1. Build and zip: `just zip-firefox`
2. Go to [Firefox Developer Hub](https://addons.mozilla.org/developers/)
3. Submit the zip for review
4. Source code submission: link to the GitHub repo

### Chrome Web Store

1. Build and zip: `just zip`
2. Go to [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole)
3. Create a new item, upload the zip
4. Fill in store listing: description, screenshots, privacy policy

### Privacy Policy

This extension does not collect, store, or transmit any personal data. All operations are performed locally in the browser or between the user's browser and their own aria2 RPC server. Include this statement in your store listing.

## Environment

The extension requires no environment variables or external services — it runs entirely in the browser. The only external dependency is the user's own aria2 server.

### Recommended aria2 Configuration

```bash
aria2c \
  --enable-rpc \
  --rpc-listen-all \
  --rpc-listen-port=6800 \
  --rpc-secret=<your-secret-token> \
  --max-concurrent-downloads=5 \
  --max-connection-per-server=16 \
  --split=16 \
  --dir=/path/to/downloads
```

For more options, see the [aria2 manual](https://aria2.github.io/manual/en/html/aria2c.html).
