"use strict";

const assert = require("node:assert/strict");
const logic = require("../logic.js");
const cases = require("../cases.js");

function calculateCase(item) {
  return logic.calculate({
    price: item.price,
    terms: item.terms,
    totalFee: item.totalFee,
    opening: item.opening,
    months: item.income.map((income, index) => ({ income, fixed: item.fixed[index], special: item.special[index] }))
  });
}

const expectations = {
  computer: { total: 6432, payment: 536, cashMonth: 2, cashValue: -3400, installmentMonth: 2, installmentValue: 1528 },
  phone: { total: 4980, payment: 830, cashMonth: 3, cashValue: -2200, installmentMonth: 6, installmentValue: -280 },
  tablet: { total: 3780, payment: 420, cashMonth: 5, cashValue: -2150, installmentMonth: 9, installmentValue: -1330 }
};

for (const item of cases) {
  const result = calculateCase(item);
  const expected = expectations[item.id];
  assert.equal(result.totalPayment, expected.total, item.id + " 总支付");
  assert.equal(result.firstPayment, expected.payment, item.id + " 每期支付");
  assert.equal(result.laterPayment, expected.payment, item.id + " 后续每期支付");
  assert.deepEqual(result.cashMin, { month: expected.cashMonth, value: expected.cashValue }, item.id + " 一次性路径最低点");
  assert.deepEqual(result.installmentMin, { month: expected.installmentMonth, value: expected.installmentValue }, item.id + " 分期路径最低点");
  assert.equal(result.finalDifference, -item.totalFee, item.id + " 最终余额差等于分期费用");
}

const computer = cases.find((item) => item.id === "computer");
const changed = calculateCase({ ...computer, special: computer.special.map((value, index) => index === 4 ? value + 4000 : value) });
assert.equal(changed.installmentMin.month, 5, "修改特殊支出后压力月份应更新");
assert.equal(changed.installmentMin.value, -1980, "修改特殊支出后余额应更新");

const split = logic.calculate({
  price: 100,
  terms: 3,
  totalFee: 0,
  opening: 0,
  months: Array.from({ length: 3 }, () => ({ income: 0, fixed: 0, special: 0 }))
});
assert.equal(split.firstPayment, 33.34, "不能整除的分位放在首期");
assert.equal(split.laterPayment, 33.33, "后续期保持向下到分");

assert.throws(() => logic.calculate({ price: 1, terms: 0, totalFee: 0, opening: 0, months: [] }), /期数/);
console.log("All calculation checks passed.");
