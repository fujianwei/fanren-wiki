import {
  getSpiritRoot,
  calcXpGain,
  calcLifespanCost,
  calcBreakthroughRate,
  calcHeartDemonRate,
  calcFateAscendRate,
  getRealmConfig,
  isBreakthroughUnlocked,
  calcRetreatXp,
} from "@/lib/game/engine";

describe("getSpiritRoot", () => {
  it("fortune=95 -> 天灵根", () => {
    const r = getSpiritRoot(95);
    expect(r.type).toBe("tianling");
    expect(r.cultivationMult).toBe(2.0);
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
});

describe("calcXpGain", () => {
  it("三灵根普通事件+10", () => {
    expect(calcXpGain(10, 1.0)).toBe(10);
  });
  it("天灵根普通事件+20", () => {
    expect(calcXpGain(10, 2.0)).toBe(20);
  });
  it("伪灵根普通事件+5", () => {
    expect(calcXpGain(10, 0.5)).toBe(5);
  });
  it("不超过100 cap", () => {
    // currentXp=95, gain=20 -> would be 115, but capped at 100, so actual gain=5
    const gain = calcXpGain(10, 2.0, 95);
    expect(gain).toBe(5);
  });
  it("已满修为gain=0", () => {
    expect(calcXpGain(10, 1.0, 100)).toBe(0);
  });
});

describe("calcLifespanCost", () => {
  it("炼气期普通事件4-5年范围内", () => {
    for (let i = 0; i < 50; i++) {
      const cost = calcLifespanCost("lianqi", "event");
      expect(cost).toBeGreaterThanOrEqual(4);
      expect(cost).toBeLessThanOrEqual(5);
    }
  });
  it("结丹期副本50-80年", () => {
    for (let i = 0; i < 20; i++) {
      const cost = calcLifespanCost("jiedan", "dungeon");
      expect(cost).toBeGreaterThanOrEqual(50);
      expect(cost).toBeLessThanOrEqual(80);
    }
  });
  it("炼气期闭关短期固定3年", () => {
    expect(calcLifespanCost("lianqi", "retreat_short")).toBe(3);
  });
  it("魔道路线炼气期事件消耗-30%", () => {
    // base is 4-5, modao reduces by 30%
    // so modao cost should be <= base * 0.7
    const baseMin = 4, baseMax = 5;
    for (let i = 0; i < 50; i++) {
      const modaoCost = calcLifespanCost("lianqi", "event", true);
      expect(modaoCost).toBeLessThanOrEqual(Math.ceil(baseMax * 0.7));
      expect(modaoCost).toBeGreaterThanOrEqual(Math.floor(baseMin * 0.7));
    }
  });
  it("魔道路线化神期事件消耗-5%", () => {
    for (let i = 0; i < 20; i++) {
      const base = calcLifespanCost("huashen", "event", false);
      const modao = calcLifespanCost("huashen", "event", true);
      // modao should be ~5% less, allow for rounding
      expect(modao).toBeLessThanOrEqual(base);
    }
  });
});

describe("isBreakthroughUnlocked", () => {
  it("修为<90不可冲关", () => {
    expect(isBreakthroughUnlocked(89)).toBe(false);
  });
  it("修为=90可冲关", () => {
    expect(isBreakthroughUnlocked(90)).toBe(true);
  });
  it("修为=100可冲关", () => {
    expect(isBreakthroughUnlocked(100)).toBe(true);
  });
  it("修为=0不可冲关", () => {
    expect(isBreakthroughUnlocked(0)).toBe(false);
  });
});

describe("calcBreakthroughRate", () => {
  it("炼气期修为100%基础70%", () => {
    const rate = calcBreakthroughRate({
      realmSlug: "lianqi",
      xp: 100,
      itemBonus: 0,
      lingshi: 0,
      rootIntact: false,
      rootDamageCount: 0,
      breakthroughExp: 0,
    });
    expect(rate).toBeCloseTo(0.70, 2);
  });
  it("修为90%基础×0.5=35%", () => {
    const rate = calcBreakthroughRate({
      realmSlug: "lianqi",
      xp: 90,
      itemBonus: 0,
      lingshi: 0,
      rootIntact: false,
      rootDamageCount: 0,
      breakthroughExp: 0,
    });
    expect(rate).toBeCloseTo(0.35, 2);
  });
  it("修为95%基础×0.7=49%", () => {
    const rate = calcBreakthroughRate({
      realmSlug: "lianqi",
      xp: 95,
      itemBonus: 0,
      lingshi: 0,
      rootIntact: false,
      rootDamageCount: 0,
      breakthroughExp: 0,
    });
    expect(rate).toBeCloseTo(0.49, 2);
  });
  it("筑基丹+15%", () => {
    const base = calcBreakthroughRate({
      realmSlug: "lianqi", xp: 100, itemBonus: 0,
      lingshi: 0, rootIntact: false, rootDamageCount: 0, breakthroughExp: 0,
    });
    const withDan = calcBreakthroughRate({
      realmSlug: "lianqi", xp: 100, itemBonus: 0.15,
      lingshi: 0, rootIntact: false, rootDamageCount: 0, breakthroughExp: 0,
    });
    expect(withDan - base).toBeCloseTo(0.15, 2);
  });
  it("根基稳固+10%", () => {
    const base = calcBreakthroughRate({
      realmSlug: "lianqi", xp: 100, itemBonus: 0,
      lingshi: 0, rootIntact: false, rootDamageCount: 0, breakthroughExp: 0,
    });
    const intact = calcBreakthroughRate({
      realmSlug: "lianqi", xp: 100, itemBonus: 0,
      lingshi: 0, rootIntact: true, rootDamageCount: 0, breakthroughExp: 0,
    });
    expect(intact - base).toBeCloseTo(0.10, 2);
  });
  it("灵石500=+3%", () => {
    const base = calcBreakthroughRate({
      realmSlug: "lianqi", xp: 100, itemBonus: 0,
      lingshi: 0, rootIntact: false, rootDamageCount: 0, breakthroughExp: 0,
    });
    const with500 = calcBreakthroughRate({
      realmSlug: "lianqi", xp: 100, itemBonus: 0,
      lingshi: 500, rootIntact: false, rootDamageCount: 0, breakthroughExp: 0,
    });
    expect(with500 - base).toBeCloseTo(0.03, 2);
  });
  it("灵石上限+9%（9000灵石）", () => {
    const base = calcBreakthroughRate({
      realmSlug: "lianqi", xp: 100, itemBonus: 0,
      lingshi: 0, rootIntact: false, rootDamageCount: 0, breakthroughExp: 0,
    });
    const with9000 = calcBreakthroughRate({
      realmSlug: "lianqi", xp: 100, itemBonus: 0,
      lingshi: 9000, rootIntact: false, rootDamageCount: 0, breakthroughExp: 0,
    });
    expect(with9000 - base).toBeCloseTo(0.09, 2);
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

describe("calcRetreatXp", () => {
  it("炼气期短期三灵根+5", () => {
    expect(calcRetreatXp("lianqi", "short", 1.0)).toBe(5);
  });
  it("炼气期长期天灵根+36", () => {
    expect(calcRetreatXp("lianqi", "long", 2.0)).toBe(36);
  });
  it("炼气期短期伪灵根+2.5->round to 3 or 2", () => {
    const result = calcRetreatXp("lianqi", "short", 0.5);
    expect(result).toBe(Math.round(5 * 0.5));
  });
  it("聚灵阵+10%", () => {
    const base = calcRetreatXp("lianqi", "short", 1.0, 0);
    const withArray = calcRetreatXp("lianqi", "short", 1.0, 0.10);
    expect(withArray).toBe(Math.round(5 * 1.0 * 1.10));
  });
});

describe("getRealmConfig", () => {
  it("获取炼气期配置", () => {
    const config = getRealmConfig("lianqi");
    expect(config.slug).toBe("lianqi");
    expect(config.normalLifespan).toBe(100);
    expect(config.breakthroughRate).toBe(0.70);
  });
  it("获取结丹期配置", () => {
    const config = getRealmConfig("jiedan");
    expect(config.failDeathRate).toBe(0.90);
  });
});
