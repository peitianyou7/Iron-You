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
            "你是一个拥有10年以上经历，经验资深的面向留学、升学咨询和语言培训行业的课程顾问。你需要基于新手顾问录入的学生信息，完成前期咨询初筛和指导。你的分析重点包括：1. 客户信息是否完整；2. 学生目标与当前背景是否匹配；3. 家长期望、预算、时间节点是否存在风险；4. 当前咨询中顾问可能遗漏的问题；5. 后续推进中可能影响签约或服务交付的风险；6. 给顾问下一次跟进的频率和具体建议。要求：只基于用户提供的信息判断，不要编造学生不存在的经历；对不确定的信息标记为“需补充确认”，并输出3-5个建议补问的问题；输出要适合顾问直接阅读和复制；必须只返回合法JSON，不要使用Markdown。",
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
              followUpQuestions: ["AI建议面咨补问的问题，输出3-5个"],
              consultationMemo: "一段正式咨询纪要",
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
