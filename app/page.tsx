"use client";

import { FormEvent, useEffect, useState } from "react";
import ConsultantDashboard from "@/components/ConsultantDashboard";

type UserRole = "consultant" | "supervisor";

type StoredUser = {
  username: string;
  role: UserRole;
};

type StudentProfile = {
  studentName: string;
  grade: string;
  applicationGoal: string;
  goals: string;
  academics: string;
  activities: string;
  budget: string;
  consultantNotes: string;
};

type RiskPoint = {
  title?: string;
  level?: string;
  reason?: string;
};

type AnalysisResult = {
  missingInfo?: string[];
  riskPoints?: RiskPoint[];
  recommendations?: string[];
  followUpQuestions?: string[];
  consultationMemo?: string;
};

const STORAGE_KEY = "studyAdvisorUser";

const roleLabels: Record<UserRole, string> = {
  consultant: "顾问",
  supervisor: "顾问主管",
};

const defaultProfile: StudentProfile = {
  studentName: "王同学",
  grade: "高二",
  applicationGoal: "美国本科",
  goals: "希望申请美国 Top 50 综合大学，偏商科或经济方向。家长希望尽量冲刺名校。",
  academics: "校内均分 88，托福 92，SAT 尚未出分。",
  activities: "校内社团、志愿服务，活动经历较分散，缺少专业主线。",
  budget: "预算未明确，地区偏好未确认。",
  consultantNotes: "学生表达能力不错，但缺少可验证成果。家庭对选校层级存在分歧。",
};

export default function HomePage() {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [consultantView, setConsultantView] = useState<"dashboard" | "analysis">(
    "dashboard",
  );

  useEffect(() => {
    setUser(getStoredUser());
    setHasHydrated(true);
  }, []);

  function handleLogin(nextUser: StoredUser) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
    setConsultantView("dashboard");
  }

  function handleLogout() {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setConsultantView("dashboard");
  }

  if (!hasHydrated) {
    return null;
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-6">
      <header className="mb-4 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-blue-600">Signed in</p>
          <p className="mt-1 font-bold text-slate-900">
            当前用户：{user.username}｜身份：{roleLabels[user.role]}
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="h-11 rounded-lg bg-slate-900 px-5 text-sm font-bold text-white"
        >
          退出登录
        </button>
      </header>

      {user.role === "consultant" && consultantView === "dashboard" && (
        <ConsultantDashboard
          onCreateStudent={() => setConsultantView("analysis")}
        />
      )}

      {user.role === "consultant" && consultantView === "analysis" && (
        <AnalysisWorkspace
          user={user}
          onBack={() => setConsultantView("dashboard")}
        />
      )}

      {user.role === "supervisor" && <AnalysisWorkspace user={user} />}
    </main>
  );
}

function LoginPage({ onLogin }: { onLogin: (user: StoredUser) => void }) {
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const username = String(formData.get("username") || "").trim();
    const password = String(formData.get("password") || "").trim();
    const role =
      formData.get("role") === "supervisor" ? "supervisor" : "consultant";

    if (!username || !password) {
      setError("请输入用户名和密码。");
      return;
    }

    setError("");
    onLogin({ username, role });
  }

  return (
    <section className="grid min-h-screen place-items-center bg-slate-100 p-6">
      <form
        onSubmit={handleSubmit}
        className="grid w-full max-w-md gap-4 rounded-lg border border-slate-200 bg-white p-7 shadow-lg"
      >
        <div className="mb-2">
          <p className="mb-1 text-xs font-bold uppercase text-blue-600">
            Welcome
          </p>
          <h1 className="text-3xl font-bold text-slate-900">留学顾问助手</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            AI 辅助咨询分析与跟进管理工具
          </p>
        </div>

        <label className="grid gap-1.5 text-sm font-semibold text-slate-600">
          用户名
          <input
            name="username"
            autoComplete="username"
            placeholder="请输入用户名"
            className="h-11 rounded-lg border border-slate-300 px-3 text-slate-900 outline-none focus:border-blue-500"
          />
        </label>

        <label className="grid gap-1.5 text-sm font-semibold text-slate-600">
          密码
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="请输入密码"
            className="h-11 rounded-lg border border-slate-300 px-3 text-slate-900 outline-none focus:border-blue-500"
          />
        </label>

        <fieldset className="grid gap-2">
          <legend className="mb-1 text-sm font-bold text-slate-600">
            身份选择
          </legend>
          <label className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800">
            <input type="radio" name="role" value="consultant" defaultChecked />
            顾问
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800">
            <input type="radio" name="role" value="supervisor" />
            顾问主管
          </label>
        </fieldset>

        {error && <p className="text-sm font-bold text-red-600">{error}</p>}

        <button
          type="submit"
          className="h-12 rounded-lg bg-blue-600 font-bold text-white hover:bg-blue-700"
        >
          登录
        </button>
      </form>
    </section>
  );
}

function AnalysisWorkspace({
  user,
  onBack,
}: {
  user: StoredUser;
  onBack?: () => void;
}) {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [status, setStatus] = useState<"待分析" | "分析中" | "已完成" | "失败">(
    "待分析",
  );

  if (user.role === "supervisor") {
    // 后续展示顾问团队数据、学生分配、顾问表现等。
  }

  return (
    <div className="grid gap-4">
      {onBack && (
        <div>
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            返回顾问工作台
          </button>
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-[minmax(360px,520px)_1fr]">
      <StudentFormPanel setResult={setResult} status={status} setStatus={setStatus} />
      <AnalysisPanel result={result} status={status} />
      </div>
    </div>
  );
}

function StudentFormPanel({
  setResult,
  status,
  setStatus,
}: {
  setResult: (result: AnalysisResult | null) => void;
  status: "待分析" | "分析中" | "已完成" | "失败";
  setStatus: (status: "待分析" | "分析中" | "已完成" | "失败") => void;
}) {
  const [profile, setProfile] = useState<StudentProfile>(defaultProfile);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("分析中");

    try {
      const response = await fetch("/api/analyze-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "分析失败");
      }
      setResult(data);
      setStatus("已完成");
    } catch (error) {
      setResult({
        consultationMemo:
          error instanceof Error ? error.message : "分析失败，请稍后重试。",
      });
      setStatus("失败");
    }
  }

  function updateField(key: keyof StudentProfile, value: string) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-lg">
      <div className="mb-6">
        <p className="mb-1 text-xs font-bold uppercase text-blue-600">
          MVP Demo
        </p>
        <h1 className="text-3xl font-bold text-slate-900">留学顾问助手</h1>
        <p className="mt-2 leading-7 text-slate-700">
          录入学生基础信息，调用 DeepSeek 生成缺失信息、风险点、建议方向和咨询纪要。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <TextInput
          label="学生姓名"
          value={profile.studentName}
          onChange={(value) => updateField("studentName", value)}
        />
        <div className="grid gap-3 md:grid-cols-2">
          <TextInput
            label="当前年级"
            value={profile.grade}
            onChange={(value) => updateField("grade", value)}
          />
          <TextInput
            label="申请目标"
            value={profile.applicationGoal}
            onChange={(value) => updateField("applicationGoal", value)}
          />
        </div>
        <TextArea
          label="目标与诉求"
          value={profile.goals}
          onChange={(value) => updateField("goals", value)}
        />
        <TextArea
          label="成绩与标化"
          value={profile.academics}
          onChange={(value) => updateField("academics", value)}
        />
        <TextArea
          label="活动/科研/竞赛"
          value={profile.activities}
          onChange={(value) => updateField("activities", value)}
        />
        <TextArea
          label="家庭预算与限制"
          value={profile.budget}
          onChange={(value) => updateField("budget", value)}
        />
        <TextArea
          label="顾问备注"
          value={profile.consultantNotes}
          onChange={(value) => updateField("consultantNotes", value)}
        />
        <button
          type="submit"
          disabled={status === "分析中"}
          className="h-12 rounded-lg bg-blue-600 font-bold text-white disabled:cursor-wait disabled:opacity-70"
        >
          {status === "分析中" ? "AI 分析中..." : "开始 AI 初筛"}
        </button>
      </form>
    </section>
  );
}

function AnalysisPanel({
  result,
  status,
}: {
  result: AnalysisResult | null;
  status: "待分析" | "分析中" | "已完成" | "失败";
}) {
  const [followUpPlan, setFollowUpPlan] = useState("");
  const [planStatus, setPlanStatus] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  async function handleCopyMemo() {
    const memo = result?.consultationMemo || "";
    if (!memo) {
      setCopyStatus("暂无内容");
      return;
    }

    try {
      await navigator.clipboard.writeText(memo);
      setCopyStatus("已复制");
    } catch {
      setCopyStatus("复制失败");
    }
  }

  function handleSubmitPlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!followUpPlan.trim()) {
      setPlanStatus("请先填写跟进计划");
      return;
    }

    setPlanStatus("已提交，等待主管审核");
  }

  return (
    <section className="min-h-[calc(100vh-144px)] rounded-lg border border-slate-200 bg-white p-6 shadow-lg">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-bold uppercase text-blue-600">
            AI Analysis
          </p>
          <h2 className="text-2xl font-bold text-slate-900">分析结果</h2>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
          {status}
        </span>
      </div>

      {!result ? (
        <div className="grid min-h-72 place-items-center rounded-lg border border-dashed border-slate-300 text-center text-slate-500">
          点击左侧按钮后，这里会显示 DeepSeek 返回的真实分析结果。
        </div>
      ) : (
        <div className="grid gap-4">
          <ResultSection title="缺失信息" items={result.missingInfo} />
          <ResultSection
            title="AI建议面咨补问问题"
            items={result.followUpQuestions}
          />
          <RiskSection risks={result.riskPoints} />
          <ResultSection title="初步建议方向" items={result.recommendations} />
          <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h3 className="font-bold text-slate-900">咨询纪要</h3>
              <div className="flex items-center gap-2">
                {copyStatus && (
                  <span className="text-xs font-semibold text-slate-500">
                    {copyStatus}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleCopyMemo}
                  className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  一键复制
                </button>
              </div>
            </div>
            <p className="leading-7 text-slate-700">
              {result.consultationMemo || "暂无咨询纪要。"}
            </p>
          </article>
          <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="mb-2 font-bold text-slate-900">下一步跟进计划</h3>
            <p className="mb-3 text-sm leading-6 text-slate-500">
              顾问可根据 AI 分析结果自行编辑跟进计划。提交后，后续将由主管审核跟进措施是否可行并返回给顾问。
            </p>
            <form onSubmit={handleSubmitPlan} className="grid gap-3">
              <textarea
                value={followUpPlan}
                onChange={(event) => {
                  setFollowUpPlan(event.target.value);
                  setPlanStatus("");
                }}
                placeholder="请输入下一步跟进计划，例如：明天下午微信补问预算和目标院校；本周内预约一次家长面咨；确认语言考试计划和材料清单。"
                className="min-h-32 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-blue-500"
              />
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm font-semibold text-slate-500">
                  {planStatus || "提交后进入主管审核流程"}
                </span>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
                >
                  提交跟进计划
                </button>
              </div>
            </form>
          </article>
        </div>
      )}
    </section>
  );
}

function TextInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-slate-600">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-lg border border-slate-300 px-3 text-slate-900 outline-none focus:border-blue-500"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-slate-600">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-20 rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500"
      />
    </label>
  );
}

function ResultSection({
  title,
  items,
}: {
  title: string;
  items?: string[];
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h3 className="mb-2 font-bold text-slate-900">{title}</h3>
      <ul className="list-disc space-y-1 pl-5 leading-7 text-slate-700">
        {(items?.length ? items : ["暂无数据。"]).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}

function RiskSection({ risks }: { risks?: RiskPoint[] }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h3 className="mb-3 font-bold text-slate-900">风险点</h3>
      <div className="grid gap-3">
        {(risks?.length
          ? risks
          : [{ title: "暂无风险点", reason: "暂无数据。", level: "低" }]
        ).map((risk) => (
          <div
            key={`${risk.title}-${risk.reason}`}
            className="flex justify-between gap-4 rounded-lg bg-red-50 p-3"
          >
            <div>
              <strong className="text-slate-900">{risk.title}</strong>
              <p className="mt-1 leading-6 text-slate-500">{risk.reason}</p>
            </div>
            <span className="h-fit rounded-full bg-red-700 px-2 py-1 text-xs font-bold text-white">
              {risk.level || "中"}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}

function getStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw) as StoredUser;
    if (!user.username || !roleLabels[user.role]) return null;
    return user;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}
