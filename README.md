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

隐藏入口为：

```text
https://mhwangzi.github.io/game-portfolio-site/#/admin
```

当前实现是“伪后台”：前端用构建时注入的 SHA-256 hash 做门禁，只展示访问统计等非敏感内容。它能避开普通访客，但不能当作真正安全后台使用。真正需要编辑内容、上传文件或保存私密数据时，使用 `admin-worker/` 里的服务端认证方案。

生成伪后台密码 hash：

```bash
npm run hash:pseudo-admin -- "你的后台密码"
```

把输出写入 GitHub 仓库 Secret：

```text
PSEUDO_ADMIN_HASH=<上一步输出的 64 位 hash>
```

访问统计 Worker 位于 `visit-counter-worker/`。部署后把 Worker 地址写入 GitHub 仓库 Secret：

```text
VISIT_COUNTER_URL=https://game-design-visit-counter.<your-subdomain>.workers.dev
```
