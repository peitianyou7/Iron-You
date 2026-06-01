import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const profile = await request.json();
    const result = await analyzeStudent(profile);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 },
    );
  }
}

async function analyzeStudent(profile: unknown) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const baseUrl = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
  const model = process.env.DEEPSEEK_MODEL || "deepseek-chat";

  if (!apiKey) {
    throw new Error(
      "Missing DEEPSEEK_API_KEY. Add it in Vercel Project Settings > Environment Variables.",
    );
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
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
