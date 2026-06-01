const loginPage = document.querySelector("#login-page");
const appPage = document.querySelector("#app-page");
const loginForm = document.querySelector("#login-form");
const loginError = document.querySelector("#login-error");
const currentUser = document.querySelector("#current-user");
const logoutButton = document.querySelector("#logout-button");

const form = document.querySelector("#student-form");
const button = document.querySelector("#submit-button");
const statusEl = document.querySelector("#status");
const emptyState = document.querySelector("#empty-state");
const resultEl = document.querySelector("#result");

const STORAGE_KEY = "studyAdvisorUser";
const ROLE_LABELS = {
  consultant: "顾问",
  supervisor: "顾问主管",
};

initSession();

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = Object.fromEntries(new FormData(loginForm).entries());
  const username = String(data.username || "").trim();
  const password = String(data.password || "").trim();
  const role = data.role === "supervisor" ? "supervisor" : "consultant";

  if (!username || !password) {
    loginError.classList.remove("hidden");
    return;
  }

  const user = { username, role };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  loginError.classList.add("hidden");
  showApp(user);
});

logoutButton.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  form.reset();
  resultEl.classList.add("hidden");
  emptyState.classList.remove("hidden");
  emptyState.textContent = "点击左侧按钮后，这里会显示 DeepSeek 返回的真实分析结果。";
  statusEl.textContent = "待分析";
  showLogin();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const user = getStoredUser();
  if (!user) {
    showLogin();
    return;
  }

  const payload = {
    ...Object.fromEntries(new FormData(form).entries()),
    currentUser: {
      username: user.username,
      role: user.role,
      roleLabel: ROLE_LABELS[user.role],
    },
  };
  setLoading(true);

  try {
    const response = await fetch("/api/analyze-student", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "分析失败");
    }

    renderResult(data);
    statusEl.textContent = "已完成";
  } catch (error) {
    statusEl.textContent = "失败";
    emptyState.textContent = error.message;
    emptyState.classList.remove("hidden");
    resultEl.classList.add("hidden");
  } finally {
    setLoading(false);
  }
});

function initSession() {
  const user = getStoredUser();
  if (user) {
    showApp(user);
  } else {
    showLogin();
  }
}

function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw);
    if (!user.username || !ROLE_LABELS[user.role]) return null;
    return user;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function showLogin() {
  loginPage.classList.remove("hidden");
  appPage.classList.add("hidden");
}

function showApp(user) {
  loginPage.classList.add("hidden");
  appPage.classList.remove("hidden");
  currentUser.textContent = `当前用户：${user.username}｜身份：${ROLE_LABELS[user.role]}`;

  if (user.role === "supervisor") {
    // 后续展示顾问团队数据、学生分配、顾问表现等。
  }
}

function setLoading(isLoading) {
  button.disabled = isLoading;
  button.textContent = isLoading ? "AI 分析中..." : "开始 AI 初筛";
  statusEl.textContent = isLoading ? "分析中" : statusEl.textContent;
}

function renderResult(data) {
  emptyState.classList.add("hidden");
  resultEl.classList.remove("hidden");

  renderList("#missing-info", data.missingInfo);
  renderList("#recommendations", data.recommendations);
  renderList("#next-steps", data.nextSteps);

  document.querySelector("#memo").textContent = data.consultationMemo || "";

  const riskContainer = document.querySelector("#risk-points");
  riskContainer.innerHTML = "";
  for (const risk of data.riskPoints || []) {
    const item = document.createElement("div");
    item.className = "risk-item";
    item.innerHTML = `
      <div>
        <strong>${escapeHtml(risk.title || "未命名风险")}</strong>
        <p>${escapeHtml(risk.reason || "")}</p>
      </div>
      <span>${escapeHtml(risk.level || "中")}</span>
    `;
    riskContainer.appendChild(item);
  }
}

function renderList(selector, items = []) {
  const list = document.querySelector(selector);
  list.innerHTML = "";
  for (const item of items) {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
