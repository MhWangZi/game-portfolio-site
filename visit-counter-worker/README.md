# Visit Counter Worker

Cloudflare Worker + KV 访问统计，只记录匿名计数，不存 IP、邮箱、姓名或来源。

## 部署

```powershell
cd visit-counter-worker
npm install
Copy-Item wrangler.toml.example wrangler.toml
npx wrangler login
npx wrangler kv namespace create VISIT_COUNTER_KV
```

把命令返回的 `id` 填到 `wrangler.toml`，然后部署：

```powershell
npm run deploy
```

部署完成后，把 Worker 地址写入 GitHub 仓库 Secret：

```text
VISIT_COUNTER_URL=https://game-design-visit-counter.<your-subdomain>.workers.dev
```

前台构建时会通过 `VITE_VISIT_COUNTER_URL` 读取这个地址。
