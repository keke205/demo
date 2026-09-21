(function () {
  "use strict";

  const cases = window.FenqiCases;
  const $ = (id) => document.getElementById(id);
  const money = (n) => "¥" + Number(n).toLocaleString("zh-CN", { maximumFractionDigits: 2 });
  let selectedId = "computer";

  function makeCaseButton(item) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "case-button" + (item.id === selectedId ? " is-selected" : "");
    button.setAttribute("aria-pressed", item.id === selectedId ? "true" : "false");
    const title = document.createElement("strong");
    title.textContent = item.name;
    const tag = document.createElement("small");
    tag.textContent = item.tag;
    button.append(title, tag);
    button.addEventListener("click", () => {
      selectedId = item.id;
      history.replaceState(null, "", "?case=" + encodeURIComponent(item.id));
      render();
    });
    return button;
  }

  function render() {
    const item = cases.find((entry) => entry.id === selectedId) || cases[0];
    $("baseline-cases").replaceChildren(...cases.map(makeCaseButton));
    $("baseline-title").textContent = item.short + "案例";
    $("baseline-offer").textContent = "购买价 " + money(item.price) + "，分 " + item.terms + " 期；题目给定的分期总费用为 " + money(item.totalFee) + "。";
    $("baseline-note").textContent = item.provenance;
    $("baseline-opening").textContent = "期初可用余额：" + money(item.opening);
    $("baseline-source").hidden = !item.sourceUrl;
    if (item.sourceUrl) $("baseline-source").href = item.sourceUrl;

    const rows = item.income.map((income, index) => {
      const row = document.createElement("tr");
      ["第 " + (index + 1) + " 月", money(income), money(item.fixed[index]), money(item.special[index])].forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.append(cell);
      });
      return row;
    });
    $("baseline-rows").replaceChildren(...rows);
  }

  const queryId = new URLSearchParams(location.search).get("case");
  if (cases.some((item) => item.id === queryId)) selectedId = queryId;
  render();
})();
