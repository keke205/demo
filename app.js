(function () {
  "use strict";

  const cases = window.FenqiCases;
  const logic = window.FenqiLogic;
  const $ = (id) => document.getElementById(id);
  const money = (n) => (n < 0 ? "-" : "") + "¥" + Math.abs(n).toLocaleString("zh-CN", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  const number = (n) => Number(n).toFixed(2);
  let state = { caseId: "computer", price: 6000, terms: 12, totalFee: 432, opening: 5000, months: [], result: null };

  function cloneCase(c) {
    state.caseId = c.id;
    state.price = c.price;
    state.terms = c.terms;
    state.totalFee = c.totalFee;
    state.opening = c.opening;
    state.months = Array.from({ length: c.terms }, (_, i) => ({ income: c.income[i], fixed: c.fixed[i], special: c.special[i] }));
    state.result = null;
  }

  function currentCase() { return cases.find((c) => c.id === state.caseId); }

  function show(view) {
    if (view === "result" && !state.result) return;
    for (const v of ["home", "offer", "budget", "result"]) $("view-" + v).hidden = v !== view;
    document.querySelectorAll(".step").forEach((b) => {
      b.classList.toggle("is-active", b.dataset.step === view);
      const unavailable = (b.dataset.step === "result" && !state.result);
      b.disabled = unavailable;
      b.setAttribute("aria-disabled", unavailable ? "true" : "false");
      if (b.dataset.step === view) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function caseButton(c) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "case-button" + (state.caseId === c.id ? " is-selected" : "");
    b.setAttribute("aria-pressed", state.caseId === c.id ? "true" : "false");
    const title = document.createElement("strong"); title.textContent = c.name;
    const tag = document.createElement("small"); tag.textContent = c.tag;
    b.append(title, tag);
    b.addEventListener("click", () => { cloneCase(c); renderOffer(); renderBudget(); });
    return b;
  }

  function renderOffer() {
    const grid = $("case-grid"); grid.replaceChildren(...cases.map(caseButton));
    $("price").value = state.price;
    $("terms").value = state.terms;
    $("total-fee").value = state.totalFee;
    const c = currentCase();
    $("case-provenance").textContent = c ? c.provenance : "当前数字由你在本地修改，现按自定义模拟案例计算，不对应任何银行或平台的实际报价。";
    $("case-source").hidden = !c || !c.sourceUrl;
    if (c && c.sourceUrl) $("case-source").href = c.sourceUrl;
    $("offer-error").hidden = true;
    const resultStep = document.querySelector('.step[data-step="result"]');
    if (resultStep) { resultStep.disabled = !state.result; resultStep.setAttribute("aria-disabled", state.result ? "false" : "true"); }
  }

  function readRequired(id, label, allowNegative) {
    const raw = $(id).value.trim();
    if (raw === "") throw new Error("请填写" + label + "。");
    const n = Number(raw);
    if (!Number.isFinite(n) || (!allowNegative && n < 0)) throw new Error(label + "必须是有效数字" + (allowNegative ? "" : "，且不能为负数") + "。");
    if (Math.abs(n) > 10000000) throw new Error(label + "超出本演示允许的范围。");
    return n;
  }

  function readOffer() {
    const price = readRequired("price", "购买价", false);
    const terms = readRequired("terms", "分期期数", false);
    const totalFee = readRequired("total-fee", "分期总费用", false);
    if (price <= 0) throw new Error("购买价必须大于0。");
    if (!Number.isInteger(terms) || terms < 1 || terms > 24) throw new Error("分期期数只能是1—24之间的整数。");
    if (state.months.length !== terms) {
      const last = state.months[state.months.length - 1] || { income: 2000, fixed: 1500, special: 0 };
      state.months = Array.from({ length: terms }, (_, i) => state.months[i] || { income: last.income, fixed: last.fixed, special: 0 });
    }
    state.price = price; state.terms = terms; state.totalFee = totalFee; state.result = null;
    return true;
  }

  function markCustom() {
    if (state.caseId === "custom") return;
    state.caseId = "custom";
    state.result = null;
    document.querySelectorAll(".case-button").forEach((b) => { b.classList.remove("is-selected"); b.setAttribute("aria-pressed", "false"); });
    $("case-provenance").textContent = "当前数字由你在本地修改，现按自定义模拟案例计算，不对应任何银行或平台的实际报价。";
    $("case-source").hidden = true;
    const resultStep = document.querySelector('.step[data-step="result"]');
    if (resultStep) { resultStep.disabled = true; resultStep.setAttribute("aria-disabled", "true"); }
  }

  function makeCell(value, field, index) {
    const td = document.createElement("td");
    const input = document.createElement("input");
    input.type = "number"; input.inputMode = "decimal"; input.step = "0.01"; input.min = "0";
    input.value = value; input.dataset.field = field; input.dataset.index = index;
    input.setAttribute("aria-label", "第" + (index + 1) + "个月" + ({ income: "收入", fixed: "固定支出", special: "特殊支出" }[field]));
    td.append(input); return td;
  }

  function renderBudget() {
    $("opening").value = state.opening;
    const body = $("budget-rows"); body.replaceChildren();
    state.months.forEach((m, i) => {
      const tr = document.createElement("tr");
      const month = document.createElement("td"); month.textContent = "第 " + (i + 1) + " 月";
      tr.append(month, makeCell(m.income, "income", i), makeCell(m.fixed, "fixed", i), makeCell(m.special, "special", i));
      body.append(tr);
    });
    $("budget-error").hidden = true;
  }

  function setColumn(field, value) {
    for (const input of $("budget-rows").querySelectorAll(`[data-field="${field}"]`)) input.value = value;
    $("budget-error").hidden = true;
  }

  function restoreBudget() {
    renderBudget();
  }

  function readBudget() {
    state.opening = readRequired("opening", "期初余额", true);
    const next = Array.from({ length: state.terms }, () => ({}));
    for (const input of $("budget-rows").querySelectorAll("input")) {
      const raw = input.value.trim();
      const n = Number(raw);
      if (raw === "" || !Number.isFinite(n) || n < 0 || n > 10000000) throw new Error(input.getAttribute("aria-label") + "必须是0以上的有效金额。");
      next[Number(input.dataset.index)][input.dataset.field] = n;
    }
    state.months = next;
  }

  function showError(id, e) { const el = $(id); el.textContent = e.message || String(e); el.hidden = false; }

  function explainPressure(r) {
    const row = r.rows[r.installmentMin.month - 1];
    const parts = [];
    if (row.special > 0) parts.push("特殊支出" + money(row.special));
    parts.push("固定支出" + money(row.fixed));
    parts.push("当期分期款" + money(row.installmentPayment));
    return "第" + row.month + "个月，收入" + money(row.income) + "，同时有" + parts.join("、") + "。叠加此前累计收支后，分期路径月末余额降到" + money(row.installmentBalance) + "，为本情景最低。";
  }

  function renderResult() {
    const r = state.result;
    $("metric-price").textContent = money(r.price);
    $("metric-total").textContent = money(r.totalPayment);
    $("metric-fee").textContent = money(r.totalFee);
    $("metric-period").textContent = r.equalPayments ? money(r.firstPayment) : "首期" + money(r.firstPayment) + " · 后续" + money(r.laterPayment);
    $("pressure-title").textContent = "分期后，第" + r.installmentMin.month + "个月余额最低";
    $("pressure-copy").textContent = "本演示情景下，该月月末余额为" + money(r.installmentMin.value) + "。一次性支付路径的最低余额发生在第" + r.cashMin.month + "个月。";
    $("cash-min").textContent = "第" + r.cashMin.month + "个月 · " + money(r.cashMin.value);
    $("installment-min").textContent = "第" + r.installmentMin.month + "个月 · " + money(r.installmentMin.value);
    $("why-pressure").textContent = explainPressure(r);
    const early = r.rows[0];
    const balanceCompare = r.finalDifference === 0 ? "相同" : "相差" + money(Math.abs(r.finalDifference)) + "（分期路径更" + (r.finalDifference < 0 ? "低" : "高") + "）";
    const firstMonth = early.installmentPayment < early.cashPayment ? "分期让第1个月少支付" + money(early.cashPayment - early.installmentPayment) : "分期未减少第1个月的付款";
    $("tradeoff").textContent = "第1个月，一次性支付" + money(early.cashPayment) + "，分期支付" + money(early.installmentPayment) + "；" + firstMonth + "。正常完成" + r.terms + "期后，总共多支付" + money(r.totalFee) + "；最后一个月的两种月末余额" + balanceCompare + "。这只是收支情景对照，不是借款建议。";
    const body = $("result-rows"); body.replaceChildren();
    r.rows.forEach((row) => {
      const tr = document.createElement("tr");
      if (row.month === r.installmentMin.month) tr.classList.add("highlight");
      const cells = ["第 " + row.month + " 月", money(row.income), money(row.fixed + row.special), money(row.cashPayment), money(row.installmentPayment), money(row.cashBalance), money(row.installmentBalance)];
      cells.forEach((value, i) => { const td = document.createElement("td"); td.textContent = value; if (i >= 5 && Number(row[i === 5 ? "cashBalance" : "installmentBalance"]) < 0) td.classList.add("negative"); tr.append(td); });
      body.append(tr);
    });
    renderChart(r);
    const monthSelect = $("compare-month");
    const previousMonth = Number(monthSelect.value) || r.installmentMin.month;
    monthSelect.replaceChildren(...r.rows.map((row) => {
      const option = document.createElement("option");
      option.value = row.month;
      option.textContent = "第 " + row.month + " 月";
      return option;
    }));
    monthSelect.value = String(Math.min(previousMonth, r.terms));
    renderMonthComparison();
  }

  function renderMonthComparison() {
    if (!state.result) return;
    const month = Number($("compare-month").value) || 1;
    const row = state.result.rows[month - 1];
    const difference = row.installmentBalance - row.cashBalance;
    $("compare-cash").textContent = money(row.cashBalance);
    $("compare-installment").textContent = money(row.installmentBalance);
    $("compare-difference").textContent = money(Math.abs(difference)) + (difference === 0 ? "" : difference > 0 ? "（分期更高）" : "（一次性更高）");
  }

  function renderChart(r) {
    const W = 900, H = 310, L = 70, R = 22, T = 20, B = 48;
    const values = r.rows.flatMap((x) => [x.cashBalance, x.installmentBalance, 0]);
    const low = Math.min(...values), high = Math.max(...values);
    const pad = Math.max(500, (high - low) * 0.12);
    const yMin = low - pad, yMax = high + pad;
    const x = (i) => L + (r.terms === 1 ? (W - L - R) / 2 : i * (W - L - R) / (r.terms - 1));
    const y = (v) => T + (yMax - v) * (H - T - B) / (yMax - yMin);
    const esc = (n) => Number(n).toFixed(1);
    const path = (key) => r.rows.map((row, i) => (i ? "L" : "M") + esc(x(i)) + " " + esc(y(row[key]))).join(" ");
    const labels = Array.from({ length: 5 }, (_, i) => yMax - (yMax - yMin) * i / 4);
    const grids = labels.map((v) => `<line x1="${L}" y1="${esc(y(v))}" x2="${W - R}" y2="${esc(y(v))}" stroke="#e5ebef"/><text x="${L - 12}" y="${esc(y(v) + 4)}" text-anchor="end" fill="#788c9b" font-size="11">${Math.round(v).toLocaleString("zh-CN")}</text>`).join("");
    const ticks = r.rows.map((row, i) => `<text x="${esc(x(i))}" y="${H - 16}" text-anchor="middle" fill="#788c9b" font-size="11">${row.month}</text>`).join("");
    const mx = x(r.installmentMin.month - 1), my = y(r.installmentMin.value);
    $("chart").innerHTML = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${grids}<line x1="${L}" y1="${esc(y(0))}" x2="${W - R}" y2="${esc(y(0))}" stroke="#abb9c4" stroke-dasharray="5 5"/><line x1="${esc(mx)}" y1="${T}" x2="${esc(mx)}" y2="${H - B}" stroke="#9bc8c1" stroke-dasharray="4 5"/><path d="${path("cashBalance")}" fill="none" stroke="#2f6ea4" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><path d="${path("installmentBalance")}" fill="none" stroke="#087e79" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${esc(mx)}" cy="${esc(my)}" r="7" fill="#087e79" stroke="#fff" stroke-width="3"/>${ticks}<text x="${W - R}" y="${H - 16}" text-anchor="end" fill="#788c9b" font-size="11">月份</text></svg>`;
    $("chart").setAttribute("aria-label", "一次性支付和分期支付第1到第" + r.terms + "个月的月末余额折线图；分期路径最低余额在第" + r.installmentMin.month + "个月，为" + money(r.installmentMin.value));
  }

  function init() {
    const queryId = new URLSearchParams(location.search).get("case");
    cloneCase(cases.find((c) => c.id === queryId) || cases[0]);
    renderOffer(); renderBudget(); show("home");
    $("start-button").addEventListener("click", () => show("offer"));
    $("offer-next").addEventListener("click", () => { try { readOffer(); renderBudget(); show("budget"); } catch (e) { showError("offer-error", e); } });
    $("calculate-button").addEventListener("click", () => { try { readBudget(); state.result = logic.calculate({ price: state.price, terms: state.terms, totalFee: state.totalFee, opening: state.opening, months: state.months }); renderResult(); show("result"); } catch (e) { showError("budget-error", e); } });
    $("edit-budget").addEventListener("click", () => show("budget"));
    $("copy-income").addEventListener("click", () => { const first = $("budget-rows").querySelector('[data-field="income"]'); if (first) setColumn("income", first.value); });
    $("copy-fixed").addEventListener("click", () => { const first = $("budget-rows").querySelector('[data-field="fixed"]'); if (first) setColumn("fixed", first.value); });
    $("clear-special").addEventListener("click", () => setColumn("special", 0));
    $("reset-budget").addEventListener("click", restoreBudget);
    $("compare-month").addEventListener("change", renderMonthComparison);
    $("reset-button").addEventListener("click", () => { cloneCase(cases[0]); renderOffer(); renderBudget(); show("home"); });
    document.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => show(b.dataset.go)));
    document.querySelectorAll(".step").forEach((b) => b.addEventListener("click", () => { if (b.dataset.step === "budget") { try { readOffer(); renderBudget(); } catch (e) { show("offer"); showError("offer-error", e); return; } } show(b.dataset.step); }));
    for (const id of ["price", "terms", "total-fee"]) $(id).addEventListener("input", markCustom);
  }

  init();
})();
