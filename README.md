# 游戏设计笔记

一个静态个人站点，用于记录玩法原型、系统拆解、设计笔记与项目复盘。前台使用 Vite + React + TypeScript + Three.js + GSAP，部署到 GitHub Pages。

## 本地运行

```bash
npm install
npm run dev
```

## 构建与预览

```bash
npm run build
npm run preview
```

## 内容维护

- 条目数据：`src/data/works.ts`
- 类型定义：`src/types.ts`
- 图片与视频：`public/media/`
- 下载文件：`public/downloads/`
- 联系入口：`src/components/SiteFooter.tsx`

## 后台入口

安全后台不放在 GitHub Pages 前端内。Cloudflare Workers 方案位于 `admin-worker/`，密码哈希、pepper 和 session secret 需要通过 Workers Secrets 配置。
