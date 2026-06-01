"use client";

import { useState } from "react";

type ConsultantTabKey =
  | "students"
  | "addStudent"
  | "followToday"
  | "workPlan"
  | "workData";

type ConsultantTab = {
  key: ConsultantTabKey;
  label: string;
  description: string;
};

const consultantTabs: ConsultantTab[] = [
  {
    key: "students",
    label: "我的学生列表",
    description: "查看和管理当前顾问负责的学生资源",
  },
  {
    key: "addStudent",
    label: "新增学生",
    description: "录入新的学生信息并建立咨询档案",
  },
  {
    key: "followToday",
    label: "今日应跟进客户",
    description: "查看今天需要联系、回访或推进的客户",
  },
  {
    key: "workPlan",
    label: "今日工作计划",
    description: "安排今天的重点咨询、跟进和转化任务",
  },
  {
    key: "workData",
    label: "今日工作数据",
    description: "查看今日新增、跟进、邀约、到访等关键数据",
  },
];

type ConsultantDashboardProps = {
  onCreateStudent: () => void;
};

export default function ConsultantDashboard({
  onCreateStudent,
}: ConsultantDashboardProps) {
  const [activeTab, setActiveTab] = useState<ConsultantTabKey>("students");

  const activeTabInfo = consultantTabs.find((tab) => tab.key === activeTab);

  return (
    <section className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">顾问工作台</h2>
        <p className="mt-2 text-sm text-slate-500">
          你可以在这里管理学生资源、安排跟进计划，并查看每日工作数据。
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">功能菜单</h3>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500">
              可扩展
            </span>
          </div>

          <div className="space-y-2">
            {consultantTabs.map((tab) => {
              const isActive = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                    isActive
                      ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="text-sm font-semibold">{tab.label}</div>
                  <div
                    className={`mt-1 text-xs leading-5 ${
                      isActive ? "text-blue-600" : "text-slate-400"
                    }`}
                  >
                    {tab.description}
                  </div>
                </button>
              );
            })}

            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-400">
              后续可继续新增功能选项卡
            </div>
          </div>
        </aside>

        <main className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 border-b border-slate-100 pb-4">
            <h3 className="text-xl font-bold text-slate-900">
              {activeTabInfo?.label}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              {activeTabInfo?.description}
            </p>
          </div>

          {activeTab === "students" && <MyStudentsPlaceholder />}

          {activeTab === "addStudent" && (
            <AddStudentPlaceholder onCreateStudent={onCreateStudent} />
          )}

          {activeTab === "followToday" && <TodayFollowPlaceholder />}

          {activeTab === "workPlan" && <TodayWorkPlanPlaceholder />}

          {activeTab === "workData" && <TodayWorkDataPlaceholder />}
        </main>
      </div>
    </section>
  );
}

function MyStudentsPlaceholder() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-slate-50 p-4">
        <h4 className="font-semibold text-slate-900">我的学生列表</h4>
        <p className="mt-2 text-sm text-slate-500">
          后续这里将展示当前顾问负责的学生资源，包括学生姓名、意向国家、申请阶段、跟进状态和风险等级。
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <DataCard title="负责学生" value="--" />
        <DataCard title="重点跟进" value="--" />
        <DataCard title="高风险学生" value="--" />
      </div>

      <div className="rounded-xl border border-slate-200">
        <div className="grid grid-cols-5 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500">
          <span>学生姓名</span>
          <span>意向方向</span>
          <span>申请阶段</span>
          <span>跟进状态</span>
          <span>操作</span>
        </div>
        <div className="px-4 py-8 text-center text-sm text-slate-400">
          暂无学生数据，后续接入学生列表。
        </div>
      </div>
    </div>
  );
}

function AddStudentPlaceholder({
  onCreateStudent,
}: {
  onCreateStudent: () => void;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <h4 className="font-semibold text-slate-900">新增学生</h4>
      <p className="mt-2 text-sm text-slate-500">
        后续这里将放置学生信息录入表单，包括基础信息、当前学历、语言成绩、意向国家、预算、时间规划和备注。
      </p>

      <button
        type="button"
        onClick={onCreateStudent}
        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        新建学生档案
      </button>
    </div>
  );
}

function TodayFollowPlaceholder() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-slate-50 p-4">
        <h4 className="font-semibold text-slate-900">今日应跟进客户</h4>
        <p className="mt-2 text-sm text-slate-500">
          后续这里将展示今天需要跟进的客户，例如待测试、待回访、待定校、待签约、待补材料的学生。
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
        暂无今日跟进任务。
      </div>
    </div>
  );
}

function TodayWorkPlanPlaceholder() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-slate-50 p-4">
        <h4 className="font-semibold text-slate-900">今日工作计划</h4>
        <p className="mt-2 text-sm text-slate-500">
          后续这里可以记录今日重点任务，例如电话回访、微信跟进、邀约上门、方案输出、合同推进等。
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <PlanCard title="上午计划" content="待添加" />
        <PlanCard title="下午计划" content="待添加" />
        <PlanCard title="重点客户" content="待添加" />
        <PlanCard title="今日目标" content="待添加" />
      </div>
    </div>
  );
}

function TodayWorkDataPlaceholder() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-slate-50 p-4">
        <h4 className="font-semibold text-slate-900">今日工作数据</h4>
        <p className="mt-2 text-sm text-slate-500">
          后续这里将统计顾问今日的关键工作数据，用于复盘和主管查看。
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <DataCard title="新增学生" value="--" />
        <DataCard title="已跟进客户" value="--" />
        <DataCard title="邀约上门" value="--" />
        <DataCard title="有效沟通" value="--" />
      </div>
    </div>
  );
}

function DataCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

function PlanCard({ title, content }: { title: string; content: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-2 text-sm text-slate-400">{content}</div>
    </div>
  );
}
