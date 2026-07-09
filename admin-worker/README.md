# Cloudflare Workers Admin Console

`/admin` 不能由 GitHub Pages 静态文件安全实现。这个目录提供 Cloudflare Workers 方案：密码验证、session cookie、API 鉴权和后台页面都在 Worker 服务端完成。

## 安全边界

- 前端仓库不存储明文密码、密码哈希、API Key 或 secret。
- `ADMIN_PASSWORD_HASH` 使用 Argon2id。
- `ADMIN_PEPPER` 与 `SESSION_SECRET` 通过 Cloudflare Workers Secrets 配置。
- 登录成功后设置 `HttpOnly; Secure; SameSite=Lax; Path=/admin` session cookie。
- `/admin/api/*` 每个接口都会验证 session。
- 登录失败只返回统一错误提示。
- 单个 IP 连续失败 5 次后会进入短暂冷却。

## 安装

```bash
cd admin-worker
npm install
Copy-Item .dev.vars.example .dev.vars
Copy-Item wrangler.toml.example wrangler.toml
```

## 生成 pepper 和 session secret

PowerShell:

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
```

把第一个值作为 `ADMIN_PEPPER`，第二个值作为 `SESSION_SECRET`。不要提交 `.dev.vars`。

## 生成 Argon2id 密码哈希

```powershell
$env:ADMIN_PEPPER="上一步生成的 pepper"
npm run hash -- "你的后台密码"
```

命令会输出 `$argon2id$...` 格式哈希。把输出值作为 `ADMIN_PASSWORD_HASH`。

## 配置 Cloudflare Workers Secrets

```bash
npx wrangler secret put ADMIN_PASSWORD_HASH
npx wrangler secret put ADMIN_PEPPER
npx wrangler secret put SESSION_SECRET
```

可选：

```bash
npx wrangler secret put SESSION_TTL_SECONDS
```

默认 session 有效期为 7200 秒。

## KV 存储

后台表单会把草稿状态写入 `DESIGN_ARCHIVE_KV`。创建 KV 后，把 namespace id 填入 `wrangler.toml`：

```bash
npx wrangler kv namespace create DESIGN_ARCHIVE_KV
```

没有 KV 时，Worker 仍能打开后台，但保存内容只会使用默认状态，不会持久化。

## 本地开发

因为 session cookie 带 `Secure`，本地建议用 HTTPS：

```bash
npm run dev
```

访问：

```text
https://localhost:8787/admin
```

## 部署

```bash
npm run deploy
```

要让路径真正是 `/admin`，需要满足其中一种条件：

1. 给站点绑定 Cloudflare 管理的自定义域，并把 Worker route 配成 `example.com/admin*`。
2. 直接使用 Workers 的自定义域，例如 `admin.example.com`。
3. 临时使用 `*.workers.dev/admin`，再从前台页面或书签访问。

默认 GitHub Pages 域名 `mhwangzi.github.io` 不能绑定 Cloudflare Worker route，因此无法在该域名下安全实现真正的 `/admin`。
