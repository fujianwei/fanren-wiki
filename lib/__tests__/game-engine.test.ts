import {
  getSpiritRoot,
  calcXpGain,
  calcBreakthroughRate,
  calcHeartDemonRate,
  calcFateAscendRate,
  getRealmConfig,
} from "@/lib/game/engine";

describe("getSpiritRoot", () => {
  it("fortune=95 -> 天灵根", () => {
    const r = getSpiritRoot(95);
    expect(r.type).toBe("tianling");
    expect(r.cultivationMult).toBe(1.3);
  });
  it("fortune=85 -> 双灵根", () => {
    expect(getSpiritRoot(85).type).toBe("shuang");
  });
  it("fortune=60 -> 三灵根", () => {
    expect(getSpiritRoot(60).type).toBe("san");
  });
  it("fortune=30 -> 伪灵根", () => {
    expect(getSpiritRoot(30).type).toBe("wei");
  });
  it("fortune=91 -> 天灵根 (boundary)", () => {
    expect(getSpiritRoot(91).type).toBe("tianling");
  });
  it("fortune=81 -> 双灵根 (boundary)", () => {
    expect(getSpiritRoot(81).type).toBe("shuang");
  });
  it("fortune=51 -> 三灵根 (boundary)", () => {
    expect(getSpiritRoot(51).type).toBe("san");
  });
  it("fortune=1 -> 伪灵根 (boundary)", () => {
    expect(getSpiritRoot(1).type).toBe("wei");
  });
  it("fortune>100 -> 天灵根 (clamp to upper bound)", () => {
    expect(getSpiritRoot(999).type).toBe("tianling");
  });
  it("fortune<1 -> 伪灵根 (clamp to lower bound)", () => {
    expect(getSpiritRoot(-10).type).toBe("wei");
  });
});

describe("calcXpGain", () => {
  it("三灵根普通事件+10", () => {
    expect(calcXpGain(10, 1.0)).toBe(10);
  });
  it("天灵根普通事件+13", () => {
    expect(calcXpGain(10, 1.3)).toBe(13);
  });
  it("伪灵根普通事件+9", () => {
    expect(calcXpGain(10, 0.85)).toBe(9);
  });
  it("不超过100 cap", () => {
    // currentXp=95, gain=20 -> would be 115, but capped at 100, so actual gain=5
    const gain = calcXpGain(10, 1.3, 95);
    expect(gain).toBe(5);
  });
  it("已满修为gain=0", () => {
    expect(calcXpGain(10, 1.0, 100)).toBe(0);
  });
});

describe("calcBreakthroughRate", () => {
  it("炼气期修为100%基础30%", () => {
    const rate = calcBreakthroughRate({
      realmSlug: "lianqi",
      xp: 100,
      itemBonus: 0,
      lingshi: 0,
      rootIntact: false,
      rootDamageCount: 0,
      breakthroughExp: 0,
    });
    expect(rate).toBeCloseTo(0.30, 2);
  });
  it("修为90%基础×0.5=15%", () => {
    const rate = calcBreakthroughRate({
      realmSlug: "lianqi",
      xp: 90,
      itemBonus: 0,
      lingshi: 0,
      rootIntact: false,
      rootDamageCount: 0,
      breakthroughExp: 0,
    });
    expect(rate).toBeCloseTo(0.15, 2);
  });
  it("修为95%基础×0.7=21%", () => {
    const rate = calcBreakthroughRate({
      realmSlug: "lianqi",
      xp: 95,
      itemBonus: 0,
      lingshi: 0,
      rootIntact: false,
      rootDamageCount: 0,
      breakthroughExp: 0,
    });
    expect(rate).toBeCloseTo(0.21, 2);
  });
  it("物品加成+25%", () => {
    const base = calcBreakthroughRate({
      realmSlug: "lianqi", xp: 100, itemBonus: 0,
      lingshi: 0, rootIntact: false, rootDamageCount: 0, breakthroughExp: 0,
    });
    const withDan = calcBreakthroughRate({
      realmSlug: "lianqi", xp: 100, itemBonus: 0.25,
      lingshi: 0, rootIntact: false, rootDamageCount: 0, breakthroughExp: 0,
    });
    expect(withDan - base).toBeCloseTo(0.25, 2);
  });
  it("根基稳固+15%", () => {
    const base = calcBreakthroughRate({
      realmSlug: "lianqi", xp: 100, itemBonus: 0,
      lingshi: 0, rootIntact: false, rootDamageCount: 0, breakthroughExp: 0,
    });
    const intact = calcBreakthroughRate({
      realmSlug: "lianqi", xp: 100, itemBonus: 0,
      lingshi: 0, rootIntact: true, rootDamageCount: 0, breakthroughExp: 0,
    });
    expect(intact - base).toBeCloseTo(0.15, 2);
  });
  it("灵石500=+2%", () => {
    const base = calcBreakthroughRate({
      realmSlug: "lianqi", xp: 100, itemBonus: 0,
      lingshi: 0, rootIntact: false, rootDamageCount: 0, breakthroughExp: 0,
    });
    const with500 = calcBreakthroughRate({
      realmSlug: "lianqi", xp: 100, itemBonus: 0,
      lingshi: 500, rootIntact: false, rootDamageCount: 0, breakthroughExp: 0,
    });
    expect(with500 - base).toBeCloseTo(0.02, 2);
  });
  it("灵石上限+5%（2500灵石）", () => {
    const base = calcBreakthroughRate({
      realmSlug: "lianqi", xp: 100, itemBonus: 0,
      lingshi: 0, rootIntact: false, rootDamageCount: 0, breakthroughExp: 0,
    });
    const with2500 = calcBreakthroughRate({
      realmSlug: "lianqi", xp: 100, itemBonus: 0,
      lingshi: 2500, rootIntact: false, rootDamageCount: 0, breakthroughExp: 0,
    });
    expect(with2500 - base).toBeCloseTo(0.05, 2);
  });
  it("续命丹副作用每次-5%，2次=-10%", () => {
    const clean = calcBreakthroughRate({
      realmSlug: "lianqi", xp: 100, itemBonus: 0,
      lingshi: 0, rootIntact: false, rootDamageCount: 0, breakthroughExp: 0,
    });
    const damaged = calcBreakthroughRate({
      realmSlug: "lianqi", xp: 100, itemBonus: 0,
      lingshi: 0, rootIntact: false, rootDamageCount: 2, breakthroughExp: 0,
    });
    expect(clean - damaged).toBeCloseTo(0.10, 2);
  });
  it("经验值+15%（上限）", () => {
    const noExp = calcBreakthroughRate({
      realmSlug: "lianqi", xp: 100, itemBonus: 0,
      lingshi: 0, rootIntact: false, rootDamageCount: 0, breakthroughExp: 0,
    });
    const maxExp = calcBreakthroughRate({
      realmSlug: "lianqi", xp: 100, itemBonus: 0,
      lingshi: 0, rootIntact: false, rootDamageCount: 0, breakthroughExp: 15,
    });
    expect(maxExp - noExp).toBeCloseTo(0.15, 2);
  });
  it("最终成功率不超过0.99", () => {
    const rate = calcBreakthroughRate({
      realmSlug: "lianqi", xp: 100, itemBonus: 0.50,
      lingshi: 9000, rootIntact: true, rootDamageCount: 0, breakthroughExp: 15,
    });
    expect(rate).toBeLessThanOrEqual(0.99);
  });
  it("最终成功率不低于0.01", () => {
    const rate = calcBreakthroughRate({
      realmSlug: "jiedan", xp: 90, itemBonus: 0,
      lingshi: 0, rootIntact: false, rootDamageCount: 5, breakthroughExp: 0,
    });
    expect(rate).toBeGreaterThanOrEqual(0.01);
  });
  it("异常负数输入不会异常放大成功率", () => {
    const base = calcBreakthroughRate({
      realmSlug: "lianqi", xp: 100, itemBonus: 0,
      lingshi: 0, rootIntact: false, rootDamageCount: 0, breakthroughExp: 0,
    });
    const withInvalidNegatives = calcBreakthroughRate({
      realmSlug: "lianqi", xp: -100, itemBonus: 0,
      lingshi: -5000, rootIntact: false, rootDamageCount: -3, breakthroughExp: -20,
    });
    expect(withInvalidNegatives).toBeLessThanOrEqual(base);
    expect(withInvalidNegatives).toBeGreaterThanOrEqual(0.01);
  });
  it("NaN 输入会被安全处理并返回有效概率", () => {
    const rate = calcBreakthroughRate({
      realmSlug: "lianqi",
      xp: Number.NaN,
      itemBonus: Number.NaN,
      lingshi: Number.NaN,
      rootIntact: false,
      rootDamageCount: Number.NaN,
      breakthroughExp: Number.NaN,
    });
    expect(Number.isFinite(rate)).toBe(true);
    expect(rate).toBeGreaterThanOrEqual(0.01);
    expect(rate).toBeLessThanOrEqual(0.99);
  });
});

describe("calcHeartDemonRate", () => {
  it("差值≥50 -> 80%", () => {
    expect(calcHeartDemonRate(80, 20)).toBeCloseTo(0.80);
    expect(calcHeartDemonRate(50, 0)).toBeCloseTo(0.80);
  });
  it("差值20-49 -> 60%", () => {
    expect(calcHeartDemonRate(60, 30)).toBeCloseTo(0.60);
    expect(calcHeartDemonRate(20, 0)).toBeCloseTo(0.60);
  });
  it("差值0-19 -> 40%", () => {
    expect(calcHeartDemonRate(40, 30)).toBeCloseTo(0.40);
    expect(calcHeartDemonRate(0, 0)).toBeCloseTo(0.40);
  });
  it("差值-20到-1 -> 20%", () => {
    expect(calcHeartDemonRate(20, 30)).toBeCloseTo(0.20);
    expect(calcHeartDemonRate(0, 20)).toBeCloseTo(0.20);
  });
  it("差值≤-21 -> 5%", () => {
    expect(calcHeartDemonRate(0, 50)).toBeCloseTo(0.05);
    expect(calcHeartDemonRate(10, 80)).toBeCloseTo(0.05);
  });
});

describe("calcFateAscendRate", () => {
  it("天命0-20 -> 10%", () => {
    expect(calcFateAscendRate(0)).toBeCloseTo(0.10);
    expect(calcFateAscendRate(20)).toBeCloseTo(0.10);
  });
  it("天命21-40 -> 25%", () => {
    expect(calcFateAscendRate(21)).toBeCloseTo(0.25);
    expect(calcFateAscendRate(40)).toBeCloseTo(0.25);
  });
  it("天命41-60 -> 45%", () => {
    expect(calcFateAscendRate(50)).toBeCloseTo(0.45);
  });
  it("天命61-80 -> 65%", () => {
    expect(calcFateAscendRate(70)).toBeCloseTo(0.65);
  });
  it("天命81-100 -> 85%", () => {
    expect(calcFateAscendRate(90)).toBeCloseTo(0.85);
    expect(calcFateAscendRate(100)).toBeCloseTo(0.85);
  });
});

describe("getRealmConfig", () => {
  it("获取炼气期配置", () => {
    const config = getRealmConfig("lianqi");
    expect(config.slug).toBe("lianqi");
    expect(config.normalLifespan).toBe(100);
    expect(config.breakthroughRate).toBe(0.30);
  });
  it("获取结丹期配置", () => {
    const config = getRealmConfig("jiedan");
    expect(config.failDeathRate).toBe(0.90);
  });
  it("非法境界会抛出明确错误", () => {
    expect(() => getRealmConfig("invalid" as never)).toThrow("Unknown realm slug");
  });
});
