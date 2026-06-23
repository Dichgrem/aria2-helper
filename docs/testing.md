# Testing

There are currently no automated tests for this project.

Browser extension testing is inherently complex — it requires a browser runtime with WebExtensions APIs (`browser.downloads`, `browser.webRequest`, `browser.cookies`, etc.). Standard Node.js test runners can't provide these APIs.

## Manual Testing Checklist

When making changes, verify:

### Download Interception (webRequest path)
1. Set up aria2 with `aria2c --enable-rpc --rpc-listen-all`
2. Load the extension in Firefox/Chrome dev mode
3. Visit a page with a direct download link (e.g. a GitHub release asset)
4. Click the link — the download should appear in aria2, not the browser

### Download Interception (downloads.onCreated path)
1. Visit a page with `<a download>` links
2. Click the link — aria2 should receive it

### Context Menu
1. Right-click any link → "Download with Aria2" → should add to aria2
2. Right-click → "Open Aria2" → should open AriaNg in a new tab

### Popup Toggle
1. Click extension icon → toggle to OFF
2. Download something → should go to browser normally
3. Toggle back to ON → next download should go to aria2

### Settings
1. Open settings page → change RPC host to an invalid value
2. Click "Test Connection" → should show error
3. Fix the value → "Test Connection" → should show "Connected"
4. Save settings → reload popup → verify settings persisted

### Edge Cases
- POST-triggered downloads (e.g. OpenWrt LuCI exports) should stay in browser
- `blob:` / `data:` URLs should be ignored
- `.torrent` files should be sent as base64 via `aria2.addTorrent`
- `.metalink` files should be sent as base64 via `aria2.addMetalink`

## Future

If automated testing is added, consider:
- [Playwright](https://playwright.dev/) with browser extension support for E2E
- [wxt's E2E test helpers](https://wxt.dev/guide/essentials/testing.html) for integration
- [vitest-webextension-mock](https://github.com/sinclairzx81/vitest-webextension) for unit tests with mocked `browser.*` APIs
