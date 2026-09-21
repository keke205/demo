(function (root) {
  "use strict";

  function cents(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) throw new Error("请输入有效金额。");
    return Math.round(n * 100);
  }

  function yuan(valueInCents) {
    return valueInCents / 100;
  }

  function splitFirst(total, count) {
    const base = Math.floor(total / count);
    const remainder = total - base * count;
    return Array.from({ length: count }, (_, i) => base + (i === 0 ? remainder : 0));
  }

  function requireMoney(value, label) {
    const amount = cents(value);
    if (amount < 0) throw new Error(label + "不能为负数。");
    return amount;
  }

  function minPoint(rows, key) {
    return rows.reduce((best, row) => row[key] < best.value ? { month: row.month, value: row[key] } : best,
      { month: rows[0].month, value: rows[0][key] });
  }

  function calculate(data) {
    const price = requireMoney(data.price, "购买价");
    const totalFee = requireMoney(data.totalFee, "分期费用");
    const opening = cents(data.opening);
    const terms = Number(data.terms);
    if (price <= 0) throw new Error("购买价必须大于0。");
    if (!Number.isInteger(terms) || terms < 1 || terms > 24) throw new Error("期数只能是1—24之间的整数。");
    if (!Array.isArray(data.months) || data.months.length !== terms) throw new Error("请填写与期数一致的逐月收支。");

    const principalParts = splitFirst(price, terms);
    const feeParts = splitFirst(totalFee, terms);
    let cashBalance = opening;
    let installmentBalance = opening;
    const rows = [];
    for (let i = 0; i < terms; i += 1) {
      const month = data.months[i];
      const income = requireMoney(month.income, "收入");
      const fixed = requireMoney(month.fixed, "固定支出");
      const special = requireMoney(month.special, "特殊支出");
      const cashPayment = i === 0 ? price : 0;
      const installmentPayment = principalParts[i] + feeParts[i];
      cashBalance += income - fixed - special - cashPayment;
      installmentBalance += income - fixed - special - installmentPayment;
      rows.push({
        month: i + 1,
        income: yuan(income), fixed: yuan(fixed), special: yuan(special),
        cashPayment: yuan(cashPayment), installmentPayment: yuan(installmentPayment),
        cashBalance: yuan(cashBalance), installmentBalance: yuan(installmentBalance)
      });
    }
    const cashMin = minPoint(rows, "cashBalance");
    const installmentMin = minPoint(rows, "installmentBalance");
    const finalDifference = rows[rows.length - 1].installmentBalance - rows[rows.length - 1].cashBalance;
    return {
      price: yuan(price), totalFee: yuan(totalFee), totalPayment: yuan(price + totalFee), terms,
      firstPayment: yuan(principalParts[0] + feeParts[0]),
      laterPayment: yuan(principalParts[terms - 1] + feeParts[terms - 1]),
      equalPayments: principalParts[0] + feeParts[0] === principalParts[terms - 1] + feeParts[terms - 1],
      rows,
      cashMin: { month: cashMin.month, value: cashMin.value },
      installmentMin: { month: installmentMin.month, value: installmentMin.value },
      finalDifference: yuan(cents(finalDifference))
    };
  }

  const api = { calculate, cents, splitFirst };
  root.FenqiLogic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
