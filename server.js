const http = require("http");
const fs = require("fs");
const path = require("path");

loadEnv();

const PORT = Number(process.env.PORT || 3000);
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";

const publicDir = path.join(__dirname, "public");

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "POST" && req.url === "/api/analyze-student") {
      const body = await readJson(req);
      const result = await analyzeStudent(body);
      return sendJson(res, 200, result);
    }

    if (req.method === "GET") {
      const filePath = req.url === "/" ? "/index.html" : decodeURIComponent(req.url);
      return serveStatic(res, path.join(publicDir, filePath));
    }

    sendJson(res, 405, { error: "Method not allowed" });
  } catch (error) {
    sendJson(res, 500, {
      error: error.message || "Server error",
    });
  }
});

server.listen(PORT, () => {
  console.log(`Demo running at http://localhost:${PORT}`);
});

async function analyzeStudent(profile) {
  if (!DEEPSEEK_API_KEY) {
    throw new Error("Missing DEEPSEEK_API_KEY. Create a .env file from .env.example first.");
  }

  const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "你是一个给留学、升学顾问使用的AI助手。你的任务是根据学生信息识别缺失信息、咨询风险、初步方案方向，并生成咨询纪要和下一步跟进建议。必须只返回合法JSON，不要使用Markdown。",
        },
        {
          role: "user",
          content: JSON.stringify({
            outputSchema: {
              missingInfo: ["需要补充的信息"],
              riskPoints: [
                {
                  title: "风险标题",
                  level: "高/中/低",
                  reason: "风险原因",
                },
              ],
              recommendations: ["初步建议方向"],
              consultationMemo: "一段正式咨询纪要",
              nextSteps: ["下一步跟进事项"],
            },
            studentProfile: profile,
          }),
        },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`DeepSeek API error ${response.status}: ${detail}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("DeepSeek returned an empty response.");
  }

  return JSON.parse(content);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(raw || "{}"));
      } catch {
        reject(new Error("Invalid JSON request body"));
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

function serveStatic(res, filePath) {
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(publicDir)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.readFile(resolved, (error, data) => {
    if (error) {
      res.writeHead(404);
      return res.end("Not found");
    }

    const ext = path.extname(resolved);
    const contentType =
      ext === ".html"
        ? "text/html; charset=utf-8"
        : ext === ".css"
          ? "text/css; charset=utf-8"
          : ext === ".js"
            ? "application/javascript; charset=utf-8"
            : "application/octet-stream";

    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
}

function loadEnv() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}
