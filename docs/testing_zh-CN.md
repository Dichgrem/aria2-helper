# 测试

本项目目前没有自动化测试。

浏览器扩展测试天然复杂——需要提供 WebExtensions API（`browser.downloads`、`browser.webRequest`、`browser.cookies` 等）的浏览器运行时。标准 Node.js 测试框架无法提供这些 API。

## 手动测试清单

修改代码后，请验证：

### 下载拦截（webRequest 路径）
1. 用 `aria2c --enable-rpc --rpc-listen-all` 启动 aria2
2. 在 Firefox/Chrome 开发模式下加载扩展
3. 访问有直接下载链接的页面（如 GitHub release 资源）
4. 点击链接——下载应出现在 aria2 而非浏览器中

### 下载拦截（downloads.onCreated 路径）
1. 访问有 `<a download>` 链接的页面
2. 点击链接——aria2 应收到了

### 右键菜单
1. 右键任意链接 → "Download with Aria2" → 应添加到 aria2
2. 右键 → "Open Aria2" → 应在新标签页打开 AriaNg

### Popup 开关
1. 点击扩展图标 → 切换到 OFF
2. 下载文件 → 应正常走浏览器
3. 切回 ON → 下次下载应走 aria2

### 设置
1. 打开设置页 → 将 RPC host 改为无效值
2. 点击 "Test Connection" → 应显示错误
3. 改回正确值 → "Test Connection" → 应显示 "Connected"
4. 保存设置 → 刷新 popup → 确认设置持久化

### 边界情况
- POST 触发的下载（如 OpenWrt LuCI 导出）应留在浏览器
- `blob:` / `data:` URL 应被忽略
- `.torrent` 文件应以 base64 通过 `aria2.addTorrent` 发送
- `.metalink` 文件应以 base64 通过 `aria2.addMetalink` 发送

## 未来计划

如果引入自动化测试，可考虑：
- [Playwright](https://playwright.dev/) 配合浏览器扩展支持做 E2E
- [wxt 的 E2E 测试工具](https://wxt.dev/guide/essentials/testing.html) 做集成测试
- [vitest-webextension-mock](https://github.com/sinclairzx81/vitest-webextension) 用 mock `browser.*` API 做单元测试
