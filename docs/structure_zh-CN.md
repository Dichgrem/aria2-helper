# 项目结构

```
aria2-helper/
├── entrypoints/
│   ├── background.ts     # 核心：下载拦截、aria2 JSON-RPC 通信、右键菜单
│   ├── popup/
│   │   ├── index.html    # Popup 界面
│   │   └── main.ts       # Popup 逻辑：开关、打开 AriaNg、打开设置
│   └── options/
│       ├── index.html    # 设置页界面
│       └── main.ts       # 设置逻辑：RPC 配置表单、连接测试
├── public/
│   ├── _locales/
│   │   ├── en/messages.json    # 英文国际化字符串
│   │   └── zh_CN/messages.json # 中文国际化字符串
│   ├── icons/                  # 扩展图标（16/48/128px）
│   └── ariang/                 # AriaNg 界面（构建前下载，不纳入版本控制）
├── scripts/
│   └── download-ariang.ts      # 独立脚本：下载并解压 AriaNg 发行版 zip
├── docs/                       # 文档
├── wxt.config.ts               # WXT 配置（manifest、权限、构建目标）
├── package.json
├── pnpm-lock.yaml
├── Justfile                    # 任务命令
├── CHANGELOG.md
├── README.md
├── README.zh-CN.md
└── LICENSE
```

## 入口点

WXT 自动检测 `entrypoints/` 下的文件，每个成为一个独立 bundle。

### background.ts

扩展核心。以持久化 Service Worker / Background Page 方式运行。

**职责：**
- **设置管理** — 从 `browser.storage.local` 加载/保存，响应存储变更
- **下载拦截** — 两条互补路径：
  - `webRequest.onHeadersReceived` — 在 body 加载前拦截 `Content-Disposition: attachment`，防止签名 URL 被浏览器消费
  - `downloads.onCreated` — 捕获绕过 webRequest 的下载（如 `<a download>`）
- **aria2 JSON-RPC 客户端** — 通过 HTTP/HTTPS 发送 `aria2.addUri`、`aria2.addTorrent`、`aria2.addMetalink`，支持 `token:` 密钥认证
- **右键菜单** — 右键链接「Download with Aria2」和「Open Aria2」
- **Cookie 与 Referer 透传** — 获取下载 URL 的 Cookie，传递 `Referer` 头
- **通知** — 通过 `browser.notifications` 弹出成功/失败提示

**数据流：**
1. 用户点击下载链接，或服务器返回 `Content-Disposition: attachment`
2. 扩展取消浏览器下载
3. 获取该 URL 的 Cookie + Referer
4. 向配置的 RPC 端点发送 `aria2.addUri`（或 `.addTorrent`/`.addMetalink`）
5. 弹出通知

### popup/

工具栏弹出窗口（点击扩展图标）。三个按钮：
- **Toggle** — 启用/禁用下载拦截
- **Open AriaNg** — 在新标签页打开内置 AriaNg，自动填入 RPC 配置
- **Settings** — 打开设置页

通过 `browser.storage.local` 读写设置。

### options/

全页设置表单（通过 `options_ui.open_in_tab` 在新标签页打开）。

**配置项：**
| 设置 | 类型 | 默认值 |
|------|------|--------|
| RPC Host | text | `localhost` |
| RPC Port | number | `6800` |
| RPC Protocol | select | `http` |
| RPC Secret | password | （空） |
| Show Notifications | checkbox | `true` |
| Intercept Downloads | checkbox | `true` |

**连接测试** — 发送 `aria2.getVersion` 验证 RPC 配置是否正确。

## public/_locales/

遵循 WebExtensions `__MSG_key__` 约定的国际化字符串。已定义 key：
- `extName`、`extDescription`
- `downloadAdded`、`downloadError`
- `settingsTitle`、`rpcHost`、`rpcPort`、`rpcProtocol`、`rpcSecret`
- `saveSettings`、`showNotifications`

## wxt.config.ts

WXT 配置。关键设置：
- **Manifest v3**，含 `gecko` 专属的 `browser_specific_settings`（Firefox >= 140.0）
- 权限：`contextMenus`、`cookies`、`downloads`、`notifications`、`storage`、`tabs`、`webRequest`、`webRequestBlocking`
- Host 权限：`<all_urls>`
- 默认语言：`en`
