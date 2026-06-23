# 部署

## 构建

```bash
# 安装依赖 + 下载 AriaNg
just install
just download-ariang

# 构建 Firefox 版本
just build-firefox    # → .output/firefox-mv2/

# 构建 Chrome 版本
just build            # → .output/chrome-mv3/

# 构建 + 打包 zip
just zip-firefox      # → .output/<name>-<version>-firefox.zip
just zip              # → .output/<name>-<version>-chrome.zip
```

## 在浏览器中加载

### Firefox

**临时加载（开发）：**
1. 访问 `about:debugging#/runtime/this-firefox`
2. 点击 **临时载入附加组件…**
3. 选择 `.output/firefox-mv2/` 下的 `manifest.json`

扩展在 Firefox 重启前保持激活。

**持久安装（Developer Edition / Nightly）：**
1. 在 `about:config` 中设置 `xpinstall.signatures.required = false`
2. 运行 `just zip-firefox`
3. `about:addons` → 齿轮 → **从文件安装附加组件…** → 选择 zip 文件

### Chrome / Edge

1. 运行 `just build`（或 `just zip` 后解压）
2. 打开 `chrome://extensions/` → 开启 **开发者模式**
3. 点击 **加载已解压的扩展程序** → 选择 `.output/chrome-mv3/`

## 发布到商店

### Firefox 附加组件（AMO）

已发布在 [addons.mozilla.org/zh-CN/firefox/addon/aria2-helper](https://addons.mozilla.org/zh-CN/firefox/addon/aria2-helper/)。

提交更新：

1. 构建并打包：`just zip-firefox`
2. 访问 [Firefox Developer Hub](https://addons.mozilla.org/developers/)
3. 提交 zip 文件等待审核
4. 提交源代码：提供 GitHub 仓库链接

### Chrome Web Store

1. 构建并打包：`just zip`
2. 访问 [Chrome 开发者控制台](https://chrome.google.com/webstore/devconsole)
3. 创建新项目，上传 zip
4. 填写商店信息：描述、截图、隐私政策

### 隐私政策

本扩展不收集、存储或传输任何个人数据。所有操作均在浏览器本地或用户浏览器与自己的 aria2 RPC 服务器之间完成。在商店页面中附上此声明。

## 运行环境

扩展无需任何环境变量或外部服务——完全在浏览器中运行。唯一的外部依赖是用户自己的 aria2 服务器。

### 推荐的 aria2 配置

```bash
aria2c \
  --enable-rpc \
  --rpc-listen-all \
  --rpc-listen-port=6800 \
  --rpc-secret=<你的密钥> \
  --max-concurrent-downloads=5 \
  --max-connection-per-server=16 \
  --split=16 \
  --dir=/path/to/downloads
```

更多选项参见 [aria2 手册](https://aria2.github.io/manual/en/html/aria2c.html)。
