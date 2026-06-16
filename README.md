# 📋 Daily Planner

> 一款基于 Electron + React 的桌面端日程安排与打卡应用。

<p align="center">
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue" alt="Platform" />
  <img src="https://img.shields.io/badge/electron-33.x-9feaf9" alt="Electron" />
  <img src="https://img.shields.io/badge/react-19.x-61dafb" alt="React" />
  <img src="https://img.shields.io/badge/tailwind-3.x-38bdf8" alt="Tailwind" />
  <img src="https://img.shields.io/badge/vite-6.x-646cff" alt="Vite" />
</p>

---

## ✨ 功能特性

- **📅 紧凑日程视图** — 今日页面显示紧凑日程列表，顶部时间进度条，无需滚动
- **📆 周视图** — 7 列网格布局，所有任务按天排列，重复任务自动展开
- **🔄 重复任务** — 设置星期几重复，自动映射到对应日期，无需手动生成
- **✅ 勾选完成** — 今日/周视图中一键勾选完成，重复任务按天追踪完成状态
- **🔔 桌面通知** — 开启提醒后，在任务开始时间自动弹出系统通知
- **📊 统计分析** — GitHub 风格贡献热力图，recharts 周完成趋势图，优先级分布
- **🌗 暗黑模式** — 支持浅色/暗黑模式手动切换
- **🎨 主题换色** — 8 种预设主题色，一键切换全局风格
- **💾 本地存储** — 使用 lowdb 将数据持久化到本地 JSON 文件，无需网络
- **🖥️ 桌面原生** — Electron 打包为 Windows/macOS/Linux 原生应用

---

## 🏗️ 设计理念

**一切皆 Task**。重复只是属性（`repeatEnabled` + `weekdays`），排程靠日期 + 时间。

| 概念 | 说明 |
|---|---|
| **一次性任务** | 创建后默认归入今天，可设时间和时长 |
| **重复任务** | 勾选 🔄 后选择星期几，视图层自动映射到各天 |
| **完成追踪** | 重复任务通过 `completedDates` 按天追踪，今日勾选仅影响今天 |
| **提醒通知** | 布尔开关，在 `scheduledTime` 时弹出桌面通知 |
| **任务管理** | 集中在「所有任务」页面进行新建、编辑、删除 |
| **日程查看** | 今日/周视图仅做查看和勾选，不做增删改 |

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
| 数据库 | lowdb v5 (JSON file) |
| 打包 | electron-builder |

---

## 📁 项目结构

```
daily-planner/
├── electron/
│   ├── main.ts              # 窗口管理 + 桌面通知定时器
│   ├── preload.ts           # 预加载脚本（contextBridge API）
│   └── database.ts          # lowdb 数据库封装 + 自动数据迁移
├── scripts/
│   └── build-electron.mjs   # esbuild 构建 Electron 主进程
├── src/
│   ├── main.tsx             # React 渲染入口
│   ├── App.tsx              # 路由：/ | /week | /all | /stats | /settings
│   ├── index.css            # Tailwind + CSS 变量 + 动画关键帧
│   ├── vite-env.d.ts        # TypeScript 类型声明
│   ├── types/
│   │   └── task.ts          # 统一 Task 数据模型 + localDateStr() 工具
│   ├── services/
│   │   └── theme.ts         # 主题色系统（8 组预设）
│   ├── context/
│   │   └── TaskContext.tsx   # 全局状态管理 + 重复任务视图层展开
│   ├── components/
│   │   ├── Layout.tsx       # 侧边栏 + 内容区布局
│   │   ├── Sidebar.tsx      # 导航：今日 / 周视图 / 所有任务 / 统计 / 设置
│   │   ├── ScheduleList.tsx # 今日紧凑日程列表（无滚动）
│   │   ├── WeekGridView.tsx # 周视图 7 列网格
│   │   ├── TaskModal.tsx    # 统一任务编辑弹窗（含重复开关）
│   │   ├── ContributionHeatmap.tsx  # GitHub 风格热力图
│   │   ├── ColorPicker.tsx  # 主题色选择器
│   │   ├── ConfirmDialog.tsx # 确认对话框
│   │   └── EmptyState.tsx   # 空状态插画
│   └── pages/
│       ├── TodayPage.tsx    # 今日：紧凑日程列表 + 勾选
│       ├── WeekPage.tsx     # 周视图：7 列网格 + 勾选
│       ├── AllTasksPage.tsx # 所有任务：筛选 + 新建 + 编辑 + 删除
│       ├── StatisticsPage.tsx# 统计分析：热力图 + 趋势图 + 优先级分布
│       └── SettingsPage.tsx # 设置：外观 + 主题色 + 通知测试
├── public/icon.svg
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.mjs
├── postcss.config.mjs
├── tsconfig.json
└── README.md
```

---

## 🚀 快速开始

### 环境要求

- **Node.js** >= 20
- **npm** >= 9

### 安装与运行

```bash
git clone <repo-url> && cd daily-planner
npm install
npm run dev
```

启动后：
- Vite 开发服务器 → `http://localhost:5173`
- Electron 窗口自动打开
- 修改 `src/` → HMR 热更新
- 修改 `electron/` → 窗口自动重载

---

## 📦 构建与打包

```bash
npm run build          # 生产构建
npm run build:win      # Windows 安装包
npm run build:mac      # macOS DMG
npm run build:linux    # Linux AppImage
npm run build:all      # 全平台
```

打包产物位于 `release/` 目录。打包前将 `public/icon.svg` 导出为 512×512 PNG 放入 `public/icon.png`。

---

## 🎯 使用指南

### 创建任务

在侧边栏进入「**所有任务**」页面，点击 **+ 新建任务**：
- **任务名称**（必填）
- **描述**（可选）
- **优先级**：高 🔥 / 中 ⚡ / 低 🌱
- **时间** & **时长**
- **🔔 提醒**：勾选后在开始时间弹通知
- **🔄 重复**：勾选后选择星期几，自动映射到对应日期

### 查看日程

- **今日**：紧凑日程列表，顶部显示时间进度条，当前时段高亮
- **周视图**：7 列网格，一周内所有任务一览无余

### 勾选完成

在今日或周视图中，点击任务左侧圆形复选框即可标记完成：
- 一次性任务 → 直接标记完成
- 重复任务 → 仅标记当天的完成状态，次日刷新

### 编辑 / 删除

进入「**所有任务**」页面，悬停任务项即可看到 ✏️ 编辑和 🗑 删除按钮。

### 查看统计

「**统计**」页面提供：
- 📅 完成热力图（近 3 个月，类 GitHub 贡献图）
- 📊 本周完成趋势柱状图
- 📈 优先级分布条形图

---

## 📄 数据存储

数据存储在单个 JSON 文件中，`tasks` 数组包含所有任务：

```
Windows: %APPDATA%/daily-planner/tasks.json
macOS:   ~/Library/Application Support/daily-planner/tasks.json
Linux:   ~/.config/daily-planner/tasks.json
```

启动时自动迁移旧格式数据，可手动备份或迁移。

---

## 🧑‍💻 开发命令

| 命令 | 说明 |
|---|---|
| `npm run dev` | 启动开发环境（Vite + Electron 并行） |
| `npm run build` | 生产构建 |
| `npm run lint` | TypeScript 类型检查 |
| `npm run build:electron` | 单独构建 Electron 主进程 |
| `npm run build:win` / `:mac` / `:linux` | 平台打包 |
| `npm run build:all` | 全平台打包 |

---

## 📝 许可

MIT License
| `npm run build:electron:watch` | 监听模式构建 Electron 主进程 |
| `npm run build:win` | 打包 Windows 安装包 |
| `npm run build:mac` | 打包 macOS DMG |
| `npm run build:linux` | 打包 Linux AppImage |

---

## 📝 许可

MIT License
