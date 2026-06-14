# 📋 Daily Planner

> 一款基于 Electron + React 的桌面端日常计划管理与打卡应用。

<p align="center">
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue" alt="Platform" />
  <img src="https://img.shields.io/badge/electron-33.x-9feaf9" alt="Electron" />
  <img src="https://img.shields.io/badge/react-19.x-61dafb" alt="React" />
  <img src="https://img.shields.io/badge/tailwind-3.x-38bdf8" alt="Tailwind" />
  <img src="https://img.shields.io/badge/vite-6.x-646cff" alt="Vite" />
</p>

---

## ✨ 功能特性

- **📅 任务管理** — 创建、编辑、删除任务，支持优先级（高/中/低）、标签、截止日期与时间
- **✅ 打卡完成** — 圆形复选框带弹性动画，完成后自动下沉并添加删除线
- **🔄 重复任务** — 支持每天/每周/每月重复，完成时自动生成下一周期任务
- **🔔 桌面通知** — 到达提醒时间自动弹出系统通知，点击可聚焦应用窗口
- **📊 统计分析** — GitHub 风格贡献热力图，recharts 周完成趋势图，优先级分布
- **🌗 暗黑模式** — 支持浅色/暗黑模式，可跟随系统偏好或手动切换
- **🎨 主题换色** — 8 种预设主题色，一键切换全局按钮、链接、高亮颜色
- **💾 本地存储** — 使用 lowdb 将数据持久化到本地 JSON 文件，无需网络
- **🖥️ 桌面原生** — Electron 打包为 Windows/macOS/Linux 原生应用

---

## 🛠️ 技术栈

| 层级 | 技术 |
|---|---|
| 桌面框架 | Electron 33 |
| 前端框架 | React 19 + TypeScript |
| 构建工具 | Vite 6 (渲染) + esbuild (主进程) |
| CSS 框架 | Tailwind CSS 3 (dark mode: class) |
| 路由 | react-router-dom v7 (HashRouter) |
| 图表 | recharts |
| 图标 | @heroicons/react (outline) |
| 数据库 | lowdb v5 (JSON file) |
| 打包 | electron-builder |

---

## 📁 项目结构

```
daily-planner/
├── electron/
│   ├── main.ts              # Electron 主进程（窗口、IPC、通知定时器）
│   ├── preload.ts           # 预加载脚本（contextBridge API）
│   └── database.ts          # lowdb 数据库封装（CRUD 操作）
├── scripts/
│   └── build-electron.mjs   # esbuild 构建 Electron 脚本
├── src/
│   ├── main.tsx             # React 渲染入口
│   ├── App.tsx              # 路由配置 + 全局 Provider
│   ├── index.css            # Tailwind + CSS 变量 + 动画关键帧
│   ├── vite-env.d.ts        # TypeScript 类型声明
│   ├── types/
│   │   └── task.ts          # Task 数据模型 + 常量配置
│   ├── services/
│   │   └── theme.ts         # 主题色系统（8 组预设）
│   ├── context/
│   │   └── TaskContext.tsx   # 全局任务状态管理
│   ├── components/
│   │   ├── Layout.tsx       # 侧边栏 + 内容区布局
│   │   ├── Sidebar.tsx      # 导航侧边栏
│   │   ├── TaskCard.tsx     # 任务卡片（复选框 + 优先级 + 标签）
│   │   ├── AddTaskModal.tsx # 新建任务模态框
│   │   ├── ContributionHeatmap.tsx  # GitHub 风格热力图
│   │   ├── ColorPicker.tsx  # 主题色选择器
│   │   └── EmptyState.tsx   # 空状态插画
│   └── pages/
│       ├── TodayPage.tsx    # 今日计划（默认页）
│       ├── AllTasksPage.tsx  # 所有任务
│       ├── CompletedPage.tsx # 已完成
│       ├── StatisticsPage.tsx# 统计分析（热力图 + 图表）
│       └── SettingsPage.tsx  # 设置（主题色切换）
├── public/
│   └── icon.svg             # 应用图标（占位）
├── index.html               # Vite HTML 入口
├── package.json             # 依赖 + 脚本 + electron-builder 配置
├── vite.config.ts           # Vite 配置
├── tailwind.config.mjs      # Tailwind 配置（动画 + 暗黑模式）
├── postcss.config.mjs       # PostCSS 配置
├── tsconfig.json            # TypeScript 配置
└── .gitignore
```

---

## 🚀 快速开始

### 环境要求

- **Node.js** >= 20
- **npm** >= 9

### 安装与运行

```bash
# 1. 克隆项目
git clone <repo-url>
cd daily-planner

# 2. 安装依赖
npm install

# 3. 启动开发环境（Vite + Electron 热重载）
npm run dev
```

启动后：
- Vite 开发服务器 → `http://localhost:5173`
- Electron 窗口自动打开，加载 Vite 页面
- 修改 `src/` 下代码 → 渲染进程 HMR 热更新
- 修改 `electron/` 下代码 → Electron 窗口自动重载

---

## 📦 构建与打包

### 生产构建

```bash
# 构建渲染进程 + 主进程
npm run build
```

产物：
- `dist/` — Vite 打包的渲染进程
- `dist-electron/` — esbuild 编译的主进程

### 打包为桌面安装包

```bash
# Windows（NSIS .exe 安装包）
npm run build:win

# macOS（DMG）
npm run build:mac

# Linux（AppImage）
npm run build:linux

# 全平台
npm run build:all
```

打包产物位于 `release/` 目录。

### 应用图标

打包前将 `public/icon.svg` 导出为 **512×512 PNG**，命名为 `icon.png` 放入 `public/` 目录。或使用在线工具生成：https://icon.kitchen/

---

## 🎯 使用指南

### 添加任务

点击右下角 **+** 按钮，填写任务信息：
- **任务名称**（必填）
- **描述**（可选）
- **优先级**：高 🔥 / 中 ⚡ / 低 🌱
- **截止日期** & 时间
- **重复**：不重复 / 每天 / 每周 / 每月
- **标签**（如 工作、个人、学习）

### 完成任务

点击任务左侧的 **圆形复选框** 即可标记完成：
- 普通任务 → 标记完成，卡片下沉并降低透明度
- 重复任务 → 同时自动生成下个周期的同款任务

### 查看统计

点击侧边栏 **统计分析** 查看：
- 📅 完成热力图（近 3 个月，类似 GitHub 贡献图）
- 📊 本周完成趋势柱状图
- 📈 优先级分布条形图

### 切换主题

点击侧边栏 **设置**，从 8 种预设主题色中选择。

### 暗黑模式

点击侧边栏底部的 **🌙 暗黑模式** 按钮切换。

---

## 📄 数据存储

所有任务数据存储在本地文件中：

```
Windows: %APPDATA%/daily-planner/tasks.json
macOS:   ~/Library/Application Support/daily-planner/tasks.json
Linux:   ~/.config/daily-planner/tasks.json
```

数据为 JSON 格式，可手动备份或迁移。

---

## 🧑‍💻 开发命令

| 命令 | 说明 |
|---|---|
| `npm run dev` | 启动开发环境（Vite + Electron 并行） |
| `npm run build` | 生产构建（类型检查 + Vite 打包 + Electron 编译） |
| `npm run lint` | TypeScript 类型检查 |
| `npm run build:electron` | 单独构建 Electron 主进程 |
| `npm run build:electron:watch` | 监听模式构建 Electron 主进程 |
| `npm run build:win` | 打包 Windows 安装包 |
| `npm run build:mac` | 打包 macOS DMG |
| `npm run build:linux` | 打包 Linux AppImage |

---

## 📝 许可

MIT License
