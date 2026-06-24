# 开发指南

## 环境要求

- Node.js >= 18
- [pnpm](https://pnpm.io/) — 包管理器
- [just](https://github.com/casey/just) — 任务运行器
- [Biome](https://biomejs.dev/) — 格式化 + 代码检查
- Firefox >= 140（主要开发目标）或 Chrome >= 88

## 快速启动

```bash
# 安装依赖
just install

# 下载 AriaNg 界面（首次构建前必须执行）
just download-ariang

# 启动开发模式（Firefox，支持热更新）
just dev-firefox

# 或 Chrome
just dev
```

WXT 会打开一个干净的浏览器配置文件并加载扩展。修改 `entrypoints/` 下的文件会触发自动重新构建和重载。

## 开发命令

| 命令 | 说明 |
|---|---|
| `just install` | 通过 pnpm 安装依赖 |
| `just dev` | 启动 WXT 开发模式（Chrome 目标，HMR） |
| `just dev-firefox` | 启动 WXT 开发模式（Firefox 目标，HMR） |
| `just build` | 生产构建（Chrome） |
| `just build-firefox` | 生产构建（Firefox） |
| `just zip` | 构建 + 打包 zip（Chrome） |
| `just zip-firefox` | 构建 + 打包 zip（Firefox） |
| `just lint` | Biome 代码检查（`biome check`） |
| `just lint-fix` | Biome 代码检查 + 自动修复 |
| `just fmt` | Biome 格式化（`biome format --write`） |
| `just download-ariang` | 下载并解压 AriaNg 到 `public/ariang/` |

## 架构概览

扩展有 4 个入口点（WXT 自动打包）：

| 入口点 | 类型 | 用途 |
|---|---|---|
| `background.ts` | Service Worker | 核心逻辑、下载拦截、RPC 客户端 |
| `popup/main.ts` | Popup | 工具栏弹出窗口 |
| `options/main.ts` | Options Page | 设置表单 |

### 下载拦截流程

两条互补路径确保不遗漏任何下载：

1. **`webRequest.onHeadersReceived`** — 在 body 加载*之前*拦截 `Content-Disposition: attachment` 响应。这对一次性签名 URL（如 GitHub Releases）至关重要——否则浏览器会在 aria2 获取之前就消费掉该 URL。

2. **`downloads.onCreated`** — 捕获绕过 webRequest 的下载，如 `<a download>` 点击。扩展取消浏览器下载后重新提交给 aria2。

已处理的边界情况：
- POST 触发的下载（如表单导出）— 通过 `SKIP_URLS` 检测，留给浏览器处理
- `blob:` / `data:` URL — 跳过（aria2 无法访问本地协议）
- `.torrent` / `.metalink` 文件 — 以 blob 方式获取、base64 编码后通过 `aria2.addTorrent` / `aria2.addMetalink` 发送

### 设置存储

所有设置存储在 `browser.storage.local` 的 `settings` key 下。background script 监听 `storage.onChanged`，当扩展其他部分（popup/options）修改设置时自动重载。

默认设置：
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

### RPC 通信

所有 aria2 RPC 调用通过 `background.ts` 中的 `sendAria2Request()` 进行：
- JSON-RPC 2.0，HTTP POST 到 `<protocol>://<host>:<port>/jsonrpc`
- 如果设置了 `rpcSecret`，在 params 数组前追加 `token:<secret>`
- 30 秒超时
- 处理重定向、认证错误、连接失败

## 构建产物

```
.output/
└── firefox-mv2/    # （或 chrome-mv3/）
    ├── background.js
    ├── popup.html
    ├── options.html
    ├── content-scripts/
    │   └── content.js
    ├── chunks/      # 共享 chunk
    └── ariang/      # 从 public/ 复制
```

## 注意事项

- **无 tsconfig.json** — WXT 内部生成 TypeScript 配置
- **`browser` 自动导入** — 不要写 `import { browser } from "wxt/browser"`；WXT 自动注入
- **`wxt prepare`** 在 `postinstall` 时运行，生成类型存根到 `.wxt/`
- **Firefox >= 140.0** 是主要目标平台；严格最低版本在 `wxt.config.ts` 中声明
- **`.output/` 和 `.wxt/`** 是构建产物——永远不要编辑其中的文件
