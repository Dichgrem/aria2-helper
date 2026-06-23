# 使用指南

## 安装

### 从 Firefox 附加组件商店安装（推荐）

从 [Firefox 附加组件](https://addons.mozilla.org/zh-CN/firefox/addon/aria2-helper/) 安装。

### 临时加载（开发）

1. 打开 Firefox，访问 `about:debugging#/runtime/this-firefox`
2. 点击 **临时载入附加组件…**
3. 选择 `.output/firefox-mv2/` 下的 `manifest.json`（先执行 `just build-firefox`）
4. 扩展加载并保持激活直到 Firefox 重启

### 侧载安装（持久化，Firefox）

适用于 Firefox Developer Edition 或 Nightly：

1. 在 `about:config` 中设置 `xpinstall.signatures.required = false`
2. 构建扩展：`just zip-firefox`
3. 访问 `about:addons` → 齿轮图标 → **从文件安装附加组件…**
4. 选择项目根目录下生成的 `.zip` 文件

### Chrome / Edge

1. 构建：`just build`（或 `just zip`）
2. 打开 `chrome://extensions/`，开启 **开发者模式**
3. 点击 **加载已解压的扩展程序** → 选择 `.output/chrome-mv3/`

---

## 前提条件

aria2 必须启用 RPC 运行：

```bash
aria2c --enable-rpc --rpc-listen-all
```

默认情况下，扩展连接到 `http://localhost:6800/jsonrpc`，不使用密钥。如果你的 aria2 使用了 `--rpc-secret=<token>`，请在设置中填入。

---

## 配置

打开设置页：
- 点击扩展图标 → **Settings**
- 或右键扩展图标 → **管理扩展** → **选项**

### 设置项

| 设置 | 说明 | 默认值 |
|------|------|--------|
| RPC Host | aria2 服务器地址或 IP | `localhost` |
| RPC Port | aria2 RPC 端口（需匹配 `--rpc-listen-port`） | `6800` |
| RPC Protocol | `http` 或 `https` | `http` |
| RPC Secret | `--rpc-secret` 的值（未设置则留空） | *（空）* |
| Show Notifications | 下载成功/失败时弹出浏览器通知 | `true` |
| Intercept Downloads | 下载拦截总开关 | `true` |

### 连接测试

点击 **Test Connection** 向 RPC 端点发送 `aria2.getVersion`。绿色 "Connected" 表示配置正确。

---

## 日常使用

### Popup 弹窗

点击工具栏中的扩展图标打开弹窗：

- **Intercepting: ON / OFF** — 切换下载拦截。关闭后由浏览器正常处理下载。
- **Open AriaNg** — 在新标签页打开内置 AriaNg 界面，自动填入 RPC 配置。完整的下载管理：暂停、恢复、删除、排序、查看进度/速度/节点。
- **Settings** — 打开设置页。

### 下载拦截

启用后，扩展自动完成：

1. 检测浏览器开始下载（或服务器返回 `Content-Disposition: attachment`）
2. 取消浏览器下载
3. 将 URL 发送给 aria2，附带 Cookie 和 Referer
4. 弹出通知：「Download added to Aria2」

支持以下场景：
- 直接文件链接
- 下载按钮（`<a download>`）
- 服务器触发的下载（`Content-Disposition: attachment`）
- `.torrent` 和 `.metalink` 文件（以 base64 blob 方式发送）

### 右键菜单

在任意页面右键链接：

- **Download with Aria2** — 直接将链接 URL 发送给 aria2
- **Open Aria2** — 在新标签页打开 AriaNg（预填 RPC 设置）

---

## AriaNg 界面

内置的 [AriaNg](https://github.com/mayswind/AriaNg) 提供完整的 aria2 管理功能：

- 查看活跃、等待、已停止的下载
- 暂停 / 恢复 / 删除下载
- 调整下载顺序
- 监控下载速度、进度、节点
- 修改全局和单个下载设置
- 通过 Popup 的 **Open AriaNg** 按钮或右键菜单 **Open Aria2** 访问

AriaNg 直接连接你的 aria2 RPC——无中转、无云端。所有数据留在本机。

---

## 故障排除

### "Failed to add download to Aria2"

- 确认 aria2 正在运行：`aria2c --enable-rpc --rpc-listen-all`
- 检查设置中的 RPC 地址/端口是否匹配 aria2 配置
- 如果使用了 `--rpc-secret`，确认已在设置中填入
- 在设置页运行 **Test Connection** 诊断

### 下载仍然走浏览器而非 aria2

- 检查 Popup 开关：是否为 **Intercepting: ON**？
- 检查设置中的 **Intercept Downloads** 复选框
- 如果是 POST 触发的下载（表单提交），扩展会刻意留给浏览器处理——这是设计如此

### aria2 无法下载浏览器能下载的文件

- 某些网站需要特定 Cookie 或 Referer。扩展会自动传递当前标签页的 Cookie。如果下载失败，尝试在已登录的标签页中右键 → "Download with Aria2"
- 一次性签名 URL（常见于 GitHub、文件托管站）会在浏览器消费之前被拦截——此过程应自动工作
