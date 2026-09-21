(function (root) {
  "use strict";

  const source = "https://www.tj.icbc.com.cn/ICBC/%E7%89%A1%E4%B8%B9%E5%8D%A1/%E8%B4%B4%E5%BF%83%E6%9C%8D%E5%8A%A1/%E4%BF%A1%E7%94%A8%E5%8D%A1%E6%B1%87%E6%80%BB%E5%88%86%E6%9C%9F.htm";
  const cases = [
    {
      id: "computer",
      name: "电脑购买 · 第2个月集中支出",
      short: "电脑",
      tag: "官网基准参数 + 模拟收支",
      price: 6000,
      terms: 12,
      totalFee: 432,
      opening: 5000,
      income: [2000, 1000, 2500, 2500, 2500, 2500, 2500, 2500, 2500, 2500, 2500, 2500],
      fixed: [1800, 1800, 1800, 1800, 1800, 1800, 1800, 1800, 1800, 1800, 1800, 1800],
      special: [0, 1800, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      provenance: "工行官网公开12期基准分期利率7.2%、近似折算年化利率（单利）13.03%；6,000元购买价、按期均摊及全部收支均为演示假设。尚需团队核对适用条款版本。",
      sourceUrl: source,
      feeType: "official-benchmark-illustration"
    },
    {
      id: "phone",
      name: "手机购买 · 第3个月收入减少",
      short: "手机",
      tag: "全部为模拟案例",
      price: 4800,
      terms: 6,
      totalFee: 180,
      opening: 3200,
      income: [2000, 2000, 1200, 2200, 2200, 2200],
      fixed: [1500, 1500, 1500, 1500, 1500, 1500],
      special: [0, 0, 1300, 0, 0, 0],
      provenance: "购买价、6期、180元费用及全部收支均为团队自设模拟数字，不对应任何银行或平台报价。",
      sourceUrl: "",
      feeType: "fully-simulated"
    },
    {
      id: "tablet",
      name: "平板购买 · 第5个月特殊支出",
      short: "平板",
      tag: "全部为模拟案例",
      price: 3600,
      terms: 9,
      totalFee: 180,
      opening: 1800,
      income: [1400, 1400, 1400, 1400, 1400, 1400, 1400, 1400, 1400],
      fixed: [1150, 1150, 1150, 1150, 1150, 1150, 1150, 1150, 1150],
      special: [0, 0, 0, 0, 1600, 0, 0, 0, 0],
      provenance: "购买价、9期、180元费用及全部收支均为团队自设模拟数字，不对应任何银行或平台报价。",
      sourceUrl: "",
      feeType: "fully-simulated"
    }
  ];

  root.FenqiCases = cases;
  if (typeof module !== "undefined" && module.exports) module.exports = cases;
})(typeof window !== "undefined" ? window : globalThis);
