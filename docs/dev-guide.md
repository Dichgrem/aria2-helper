# Development Guide

## Requirements

- Node.js >= 18
- [pnpm](https://pnpm.io/) — package manager
- [just](https://github.com/casey/just) — task runner
- [Biome](https://biomejs.dev/) — formatter + linter
- Firefox >= 140 (primary dev target) or Chrome >= 88

## Quick Start

```bash
# Install dependencies
just install

# Download AriaNg web UI (required before first build)
just download-ariang

# Start dev mode with HMR (Firefox)
just dev-firefox

# Or for Chrome
just dev
```

WXT opens a clean browser profile with the extension loaded. Changes to `entrypoints/` trigger automatic rebuild and reload.

## Dev Commands

| Command | What it does |
|---|---|
| `just install` | Install dependencies via pnpm |
| `just dev` | Start WXT dev mode (Chrome target, HMR) |
| `just dev-firefox` | Start WXT dev mode (Firefox target, HMR) |
| `just build` | Production build for Chrome |
| `just build-firefox` | Production build for Firefox |
| `just zip` | Build + zip for Chrome |
| `just zip-firefox` | Build + zip for Firefox |
| `just lint` | Lint with Biome (`biome check`) |
| `just lint-fix` | Lint + auto-fix with Biome |
| `just fmt` | Format with Biome (`biome format --write`) |
| `just download-ariang` | Download and extract AriaNg into `public/ariang/` |

## Architecture Overview

The extension has 4 entrypoints (WXT auto-bundles each):

| Entrypoint | Type | Purpose |
|---|---|---|
| `background.ts` | Service Worker | Core logic, download interception, RPC client |
| `content.ts` | Content Script | Injected into all pages (minimal) |
| `popup/main.ts` | Popup | Toolbar popup UI |
| `options/main.ts` | Options Page | Settings form |

### Download Interception Flow

Two complementary paths ensure no download is missed:

1. **`webRequest.onHeadersReceived`** — intercepts `Content-Disposition: attachment` responses *before* the body loads. This is critical for one-time signed URLs (e.g. GitHub releases) where the browser would otherwise consume the URL before aria2 can fetch it.

2. **`downloads.onCreated`** — catches downloads that bypass webRequest, such as `<a download>` clicks. The extension cancels the browser download then re-submits to aria2.

Edge cases handled:
- POST-triggered downloads (e.g. form exports) — detected via `SKIP_URLS`, left to browser
- `blob:` / `data:` URLs — skipped (aria2 can't access local protocols)
- `.torrent` / `.metalink` files — fetched as blob, base64-encoded, sent via `aria2.addTorrent` / `aria2.addMetalink`

### Settings Storage

All settings stored in `browser.storage.local` under the `settings` key. The background script listens for `storage.onChanged` to reload settings when another part of the extension (popup/options) modifies them.

Default settings:
```ts
{
  enabled: true,
  rpcHost: "localhost",
  rpcPort: 6800,
  rpcProtocol: "http",
  rpcSecret: "",
  showNotifications: true,
}
```

### RPC Communication

All aria2 RPC calls go through `sendAria2Request()` in `background.ts`:
- JSON-RPC 2.0 over HTTP POST to `<protocol>://<host>:<port>/jsonrpc`
- If `rpcSecret` is set, prepends `token:<secret>` to params array
- 30-second timeout
- Handles redirects, auth errors, connection failures

## Build Output

```
.output/
└── firefox-mv2/    # (or chrome-mv3/)
    ├── background.js
    ├── popup.html
    ├── options.html
    ├── content-scripts/
    │   └── content.js
    ├── chunks/      # Shared chunks
    └── ariang/      # Copied from public/
```

## Notes

- **No tsconfig.json** — WXT generates TypeScript config internally
- **`browser` is auto-imported** — never write `import { browser } from "wxt/browser"`; WXT injects it
- **`wxt prepare`** runs on `postinstall` to generate type stubs into `.wxt/`
- **Firefox >= 140.0** is the primary target; the strict_min_version is enforced in `wxt.config.ts`
- **`.output/` and `.wxt/`** are build artifacts — never edit files there
