# 留学顾问助手 Demo

这是一个可部署到 Vercel 的最小可用 Demo：

- `public/`：前端静态页面
- `api/analyze-student.js`：Vercel Serverless Function，用于调用 DeepSeek
- `server.js`：本地开发服务器

## 本地运行

复制 `.env.example` 为 `.env`，填入 DeepSeek API Key。

```powershell
node server.js
```

打开：

```txt
http://localhost:3000
```

## Vercel 环境变量

部署到 Vercel 后，在 Project Settings > Environment Variables 添加：

```txt
DEEPSEEK_API_KEY=你的DeepSeek Key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
```
