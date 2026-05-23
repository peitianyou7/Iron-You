const form = document.querySelector("#student-form");
const button = document.querySelector("#submit-button");
const statusEl = document.querySelector("#status");
const emptyState = document.querySelector("#empty-state");
const resultEl = document.querySelector("#result");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = Object.fromEntries(new FormData(form).entries());
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
