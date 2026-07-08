# 个人游戏作品集网站

一个面向招聘/实习的游戏作品集网站原型，使用 Vite + React + TypeScript + Tailwind CSS + Three.js + GSAP。

## 本地运行

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
npm run preview
```

## 发布到 GitHub Pages

1. 用 GitHub Desktop 登录你的 GitHub 账号。
2. 添加这个本地仓库：`C:\Users\31595\Documents\Codex\2026-07-08\w\work\game-portfolio-site`
3. 点击 Publish repository，仓库名建议用 `game-portfolio-site`。
4. 在 GitHub 网页仓库中打开 Settings -> Pages。
5. Source 选择 GitHub Actions。
6. 推送到 `main` 后，`.github/workflows/deploy.yml` 会自动构建并发布 `dist`。

## 替换你的真实内容

- 作品数据：`src/data/works.ts`
- 类型定义：`src/types.ts`
- 截图/视频：`public/media/`
- Windows EXE 下载包：替换 `public/downloads/windows-demo-placeholder.zip`
- 联系方式：`src/components/SiteFooter.tsx`

当前站点只提供“视频/截图 + EXE 下载”的 v1 路线，不在浏览器中直接执行 `.exe`。未来如果有 Godot Web 或 Unity WebGL 构建，可以把作品数据扩展为 iframe/web-playable 入口。
