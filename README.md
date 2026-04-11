<p align="right">
  <a href="README.md">English</a> |
  <a href="README.zh-CN.md">简体中文</a>
</p>

# Aria2-helper

A browser extension that automatically intercepts downloads and sends them to your aria2 server.

## Privacy Policy

This extension does not collect, store, or transmit any personal data.

All operations are performed locally in the browser or between the user's browser and their own aria2 RPC server. No analytics, tracking, or third-party data sharing is involved.

## Features

- **Auto Intercept**: Automatically intercept browser downloads and send them to aria2
- **Toggle On/Off**: Popup switch to temporarily disable interception — let the browser handle downloads when you need to
- **AriaNg Built-in**: Integrated AriaNg web UI for full download management
- **Protocol Support**: HTTP, HTTPS for aria2 RPC
- **Torrent & Metalink**: Automatically handles `.torrent` and `.metalink` files
- **Cookie & Referer**: Preserves cookies and referer headers for authenticated downloads
- **Context Menu**: Right-click any link to download with Aria2
- **Connection Test**: Verify your aria2 RPC settings directly from the options page
- **Multi-language**: English and Chinese
- **Dark Theme**: Modern dark UI for both popup and settings pages

## Browser Support

| Browser | Min Version | Notes |
|---------|-------------|-------|
| Firefox | 140.0+ | Primary target |
| Chrome | 88+ | MV3 only |
| Edge | 88+ | Chrome-based |

## Requirements

- aria2 running with `--enable-rpc --rpc-listen-all` flags
- Ensure aria2 RPC port (default 6800) is accessible from your browser

## Build from Source

```bash
# Install dependencies
just install

# Download AriaNg web interface
just download-ariang

# Build for Firefox
just build-firefox

# Development mode (HMR)
just dev-firefox

# Package as zip for distribution
just zip-firefox
```

## Architecture

This extension is built with [WXT](https://wxt.dev/), a next-generation web extension framework based on Vite.

```
├── entrypoints/
│   ├── background.ts          # Core logic: download interception, aria2 RPC
│   ├── content.ts             # Content script (minimal)
│   ├── popup/                 # Popup UI: toggle, open AriaNg, settings
│   └── options/               # Settings page: RPC config, connection test
├── public/
│   ├── _locales/              # i18n strings (en, zh_CN)
│   ├── icons/                 # Extension icons
│   └── ariang/                # AriaNg web interface (bundled)
└── wxt.config.ts              # WXT configuration
```
