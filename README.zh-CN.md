# Aria2-helper

一个自动拦截浏览器下载并发送到 aria2 服务器的浏览器扩展。

## 隐私政策

本扩展不收集、存储或传输任何个人数据。

所有操作均在浏览器本地完成，或仅与用户自己的 aria2 RPC 服务器通信。不涉及任何分析、追踪或第三方数据共享。

## 功能

- **自动拦截**：自动拦截浏览器下载并发送到 aria2
- **一键开关**：Popup 界面提供快捷开关，随时启用/禁用下载拦截
- **内置 AriaNg**：集成 AriaNg 网页界面，完整的下载管理体验
- **协议支持**：HTTP、HTTPS 用于 aria2 RPC 通信
- **种子与 Metalink**：自动处理 `.torrent` 和 `.metalink` 文件
- **Cookie 与 Referer**：保留 Cookie 和 Referer，支持需要认证的下载
- **右键菜单**：右键任意链接即可用 Aria2 下载
- **连接测试**：在设置页直接验证 aria2 RPC 配置
- **多语言**：支持中文和英文
- **深色主题**：Popup 和设置页均采用现代深色 UI

## 浏览器支持

| 浏览器 | 最低版本 | 备注 |
|--------|---------|------|
| Firefox | 140.0+ | 主要目标平台 |
| Chrome | 88+ | 仅 MV3 |
| Edge | 88+ | 基于 Chromium |

## 使用前提

- aria2 已启动并启用 `--enable-rpc --rpc-listen-all` 参数
- 浏览器可以访问 aria2 RPC 端口（默认 6800）

## 从源码构建

```bash
# 安装依赖
just install

# 下载 AriaNg 界面
just download-ariang

# 构建 Firefox 版本
just build-firefox

# 开发模式（支持热更新）
just dev-firefox

# 打包为 zip 分发
just zip-firefox
```

## 项目结构

本扩展基于 [WXT](https://wxt.dev/) 框架构建，这是一个基于 Vite 的新一代 Web 扩展开发工具。

```
├── entrypoints/
│   ├── background.ts          # 核心逻辑：下载拦截、aria2 RPC 通信
│   ├── content.ts             # Content Script（最小化）
│   ├── popup/                 # Popup 界面：开关、打开 AriaNg、设置
│   └── options/               # 设置页：RPC 配置、连接测试
├── public/
│   ├── _locales/              # 国际化文件（en、zh_CN）
│   ├── icons/                 # 扩展图标
│   └── ariang/                # AriaNg 界面（打包内嵌）
└── wxt.config.ts              # WXT 配置文件
```
