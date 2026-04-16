import {
  calcRealm,
  calcLifespan,
  calcOutcome,
  calcMbti,
  applyScores,
} from "../destiny";
import type { DestinyScores, MbtiVotes } from "@/types/destiny";

describe("calcRealm", () => {
  it("returns lianqi when courage+ambition < 40", () => {
    expect(calcRealm({ courage: 10, ambition: 20, wisdom: 50, loyalty: 50 }).slug).toBe("lianqi");
  });
  it("returns zhuji when courage+ambition = 40", () => {
    expect(calcRealm({ courage: 20, ambition: 20, wisdom: 0, loyalty: 0 }).slug).toBe("zhuji");
  });
  it("returns jiedan when courage+ambition = 60", () => {
    expect(calcRealm({ courage: 30, ambition: 30, wisdom: 0, loyalty: 0 }).slug).toBe("jiedan");
  });
  it("returns yuanying when courage+ambition = 75", () => {
    expect(calcRealm({ courage: 40, ambition: 35, wisdom: 0, loyalty: 0 }).slug).toBe("yuanying");
  });
  it("returns huashen when courage+ambition >= 90", () => {
    expect(calcRealm({ courage: 50, ambition: 40, wisdom: 0, loyalty: 0 }).slug).toBe("huashen");
  });
});

describe("calcLifespan", () => {
  it("calculates correctly for lianqi with wisdom=50", () => {
    expect(calcLifespan(100, 50)).toBe(100);
  });
  it("calculates correctly for huashen with wisdom=0", () => {
    expect(calcLifespan(2500, 0)).toBe(2000);
  });
});

describe("calcOutcome", () => {
  it("returns caidan for wisdom>=85 && ambition>=85 (mocked random)", () => {
    const spy = jest.spyOn(Math, "random").mockReturnValue(0.005);
    const scores: DestinyScores = { courage: 50, wisdom: 90, loyalty: 50, ambition: 90 };
    expect(calcOutcome(scores, "huashen").slug).toBe("caidan");
    spy.mockRestore();
  });
  it("returns feisheng for huashen + ambition>=80 (no caidan)", () => {
    const spy = jest.spyOn(Math, "random").mockReturnValue(0.5);
    const scores: DestinyScores = { courage: 50, wisdom: 50, loyalty: 50, ambition: 85 };
    expect(calcOutcome(scores, "huashen").slug).toBe("feisheng");
    spy.mockRestore();
  });
  it("returns tupo for ambition>=80 && wisdom<40", () => {
    const spy = jest.spyOn(Math, "random").mockReturnValue(0.5);
    const scores: DestinyScores = { courage: 50, wisdom: 30, loyalty: 50, ambition: 85 };
    expect(calcOutcome(scores, "lianqi").slug).toBe("tupo");
    spy.mockRestore();
  });
  it("returns shouhu for loyalty>=70", () => {
    const spy = jest.spyOn(Math, "random").mockReturnValue(0.5);
    const scores: DestinyScores = { courage: 30, wisdom: 50, loyalty: 75, ambition: 30 };
    expect(calcOutcome(scores, "lianqi").slug).toBe("shouhu");
    spy.mockRestore();
  });
  it("returns yinshi for wisdom>=60 && ambition<50 (B1 path)", () => {
    const spy = jest.spyOn(Math, "random").mockReturnValue(0.5);
    const scores: DestinyScores = { courage: 30, wisdom: 65, loyalty: 30, ambition: 40 };
    expect(calcOutcome(scores, "lianqi", "B1").slug).toBe("yinshi");
    spy.mockRestore();
  });
  it("returns doufa for courage>=70 && wisdom<40", () => {
    const spy = jest.spyOn(Math, "random").mockReturnValue(0.5);
    const scores: DestinyScores = { courage: 75, wisdom: 30, loyalty: 30, ambition: 30 };
    expect(calcOutcome(scores, "lianqi").slug).toBe("doufa");
    spy.mockRestore();
  });
  it("returns zuohua for all other cases", () => {
    const spy = jest.spyOn(Math, "random").mockReturnValue(0.5);
    const scores: DestinyScores = { courage: 30, wisdom: 30, loyalty: 30, ambition: 30 };
    expect(calcOutcome(scores, "lianqi").slug).toBe("zuohua");
    spy.mockRestore();
  });
});

describe("calcOutcome with path", () => {
  beforeEach(() => jest.spyOn(Math, "random").mockReturnValue(0.5));
  afterEach(() => jest.restoreAllMocks());

  // A1 路径
  it("A1: returns bawang for courage>=80 wisdom<30 loyalty<30", () => {
    expect(calcOutcome({ courage: 85, wisdom: 25, loyalty: 20, ambition: 40 }, "lianqi", "A1").slug).toBe("bawang");
  });
  it("A1: returns moxiu for courage>=70 loyalty<30 (bawang not met)", () => {
    expect(calcOutcome({ courage: 72, wisdom: 50, loyalty: 20, ambition: 40 }, "lianqi", "A1").slug).toBe("moxiu");
  });
  it("A1: returns shouhu for loyalty>=70", () => {
    expect(calcOutcome({ courage: 40, wisdom: 50, loyalty: 75, ambition: 30 }, "lianqi", "A1").slug).toBe("shouhu");
  });

  // A2 路径
  it("A2: returns shuangxiu for loyalty>=80 courage>=60", () => {
    expect(calcOutcome({ courage: 65, wisdom: 50, loyalty: 82, ambition: 40 }, "lianqi", "A2").slug).toBe("shuangxiu");
  });
  it("A2: returns xinmo for ambition>=80 loyalty<25", () => {
    expect(calcOutcome({ courage: 40, wisdom: 50, loyalty: 20, ambition: 85 }, "lianqi", "A2").slug).toBe("xinmo");
  });
  it("A2: returns beici for loyalty>=70 wisdom<35", () => {
    expect(calcOutcome({ courage: 40, wisdom: 30, loyalty: 72, ambition: 40 }, "lianqi", "A2").slug).toBe("beici");
  });
  it("A2: returns zongshi for wisdom>=70 ambition<40 courage>=50", () => {
    expect(calcOutcome({ courage: 55, wisdom: 72, loyalty: 40, ambition: 35 }, "lianqi", "A2").slug).toBe("zongshi");
  });

  // B1 路径
  it("B1: returns tiandi for wisdom>=85 loyalty>=70", () => {
    expect(calcOutcome({ courage: 40, wisdom: 88, loyalty: 72, ambition: 40 }, "lianqi", "B1").slug).toBe("tiandi");
  });
  it("B1: returns zongshi for wisdom>=70 ambition<40 courage>=50", () => {
    expect(calcOutcome({ courage: 55, wisdom: 72, loyalty: 40, ambition: 35 }, "lianqi", "B1").slug).toBe("zongshi");
  });
  it("B1: returns yinshi for wisdom>=60 ambition<50", () => {
    expect(calcOutcome({ courage: 30, wisdom: 65, loyalty: 30, ambition: 40 }, "lianqi", "B1").slug).toBe("yinshi");
  });

  // B2 路径
  it("B2: returns beici for loyalty>=70 wisdom<35 (before shouhu)", () => {
    expect(calcOutcome({ courage: 40, wisdom: 30, loyalty: 72, ambition: 40 }, "lianqi", "B2").slug).toBe("beici");
  });
  it("B2: returns shouhu for loyalty>=70 wisdom>=35", () => {
    expect(calcOutcome({ courage: 40, wisdom: 40, loyalty: 72, ambition: 40 }, "lianqi", "B2").slug).toBe("shouhu");
  });
  it("B2: returns fanchen for courage<30 ambition<30", () => {
    expect(calcOutcome({ courage: 25, wisdom: 50, loyalty: 40, ambition: 25 }, "lianqi", "B2").slug).toBe("fanchen");
  });

  // niepan 彩蛋 (5%)
  it("B1: returns niepan when random<0.05 and tupo conditions met", () => {
    jest.spyOn(Math, "random").mockReturnValue(0.03);
    expect(calcOutcome({ courage: 40, wisdom: 30, loyalty: 40, ambition: 85 }, "lianqi", "B1").slug).toBe("niepan");
  });

  // xianyou 彩蛋 (0.3%)
  it("B2: returns xianyou when random<0.003", () => {
    jest.spyOn(Math, "random").mockReturnValue(0.001);
    expect(calcOutcome({ courage: 40, wisdom: 50, loyalty: 40, ambition: 40 }, "lianqi", "B2").slug).toBe("xianyou");
  });
});

describe("calcMbti", () => {
  it("returns INFP for default tie-breaking (all zeros)", () => {
    const votes: MbtiVotes = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    expect(calcMbti(votes)).toBe("INFP");
  });
  it("returns ENFP when E/N/F/P each have more votes", () => {
    const votes: MbtiVotes = { E: 3, I: 1, S: 1, N: 3, T: 1, F: 3, J: 1, P: 3 };
    expect(calcMbti(votes)).toBe("ENFP");
  });
});

describe("resolveQuestion", () => {
  const { resolveQuestion } = require("../destiny");

  const baseScores = { courage: 0, wisdom: 0, loyalty: 0, ambition: 0 };

  const q = {
    id: "TEST",
    type: "choice",
    versions: [
      {
        condition: { type: "prevAnswer", value: "选A" },
        text: "prevAnswer版本",
        options: [{ text: "opt1", scores: { courage: 10 } }],
      },
      {
        condition: { type: "score", dimension: "courage", gte: 50 },
        text: "高勇气版本",
        options: [{ text: "opt2", scores: { wisdom: 10 } }],
      },
      {
        condition: { type: "default" },
        text: "默认版本",
        options: [{ text: "opt3", scores: {} }],
      },
    ],
  };

  it("returns prevAnswer version when prevAnswer matches", () => {
    expect(resolveQuestion(q, "选A", baseScores).text).toBe("prevAnswer版本");
  });

  it("returns score version when score condition met and no prevAnswer match", () => {
    expect(resolveQuestion(q, "选B", { ...baseScores, courage: 60 }).text).toBe("高勇气版本");
  });

  it("returns default version when no condition matches", () => {
    expect(resolveQuestion(q, "选B", baseScores).text).toBe("默认版本");
  });

  it("returns default version when prevAnswer is null", () => {
    expect(resolveQuestion(q, null, baseScores).text).toBe("默认版本");
  });

  it("prevAnswer takes priority over score condition", () => {
    expect(resolveQuestion(q, "选A", { ...baseScores, courage: 60 }).text).toBe("prevAnswer版本");
  });

  it("supports lt score condition", () => {
    const qLt = {
      id: "TEST2", type: "slider",
      versions: [
        { condition: { type: "score", dimension: "wisdom", lt: 30 }, text: "低智慧版本", leftLabel: "l", rightLabel: "r", scoring: { left: { scores: {} }, middle: { scores: {} }, right: { scores: {} } } },
        { condition: { type: "default" }, text: "默认版本", leftLabel: "l", rightLabel: "r", scoring: { left: { scores: {} }, middle: { scores: {} }, right: { scores: {} } } },
      ],
    };
    expect(resolveQuestion(qLt, null, { ...baseScores, wisdom: 20 }).text).toBe("低智慧版本");
    expect(resolveQuestion(qLt, null, { ...baseScores, wisdom: 40 }).text).toBe("默认版本");
  });

  it("merges id and type into resolved version", () => {
    const resolved = resolveQuestion(q, null, baseScores);
    expect(resolved.id).toBe("TEST");
    expect(resolved.type).toBe("choice");
  });
});

describe("calcRealmWithTrials", () => {
  const { calcRealmWithTrials } = require("../destiny");

  it("stays at lianqi when courage+perseverance < 40", () => {
    const scores = { courage: 10, wisdom: 0, loyalty: 0, ambition: 0, perseverance: 10 };
    const result = calcRealmWithTrials(scores, 50);
    expect(result.realm.slug).toBe("lianqi");
    expect(result.diedInTrials).toBe(false);
  });

  it("can reach zhuji when sum >= 40 and trial succeeds", () => {
    jest.spyOn(Math, "random").mockReturnValue(0);
    const scores = { courage: 20, wisdom: 0, loyalty: 0, ambition: 0, perseverance: 20 };
    const result = calcRealmWithTrials(scores, 50);
    expect(result.realm.slug).toBe("zhuji");
    expect(result.diedInTrials).toBe(false);
    jest.restoreAllMocks();
  });

  it("dies in trials when random > success rate", () => {
    jest.spyOn(Math, "random").mockReturnValue(0.99);
    const scores = { courage: 20, wisdom: 0, loyalty: 0, ambition: 0, perseverance: 20 };
    const result = calcRealmWithTrials(scores, 50);
    expect(result.diedInTrials).toBe(true);
    expect(result.realm.slug).toBe("lianqi");
    jest.restoreAllMocks();
  });

  it("uses fortune to boost success rate", () => {
    jest.spyOn(Math, "random").mockReturnValue(0.79);
    const scores = { courage: 20, wisdom: 0, loyalty: 0, ambition: 0, perseverance: 0 };
    const resultLow = calcRealmWithTrials(scores, 0);
    expect(resultLow.diedInTrials).toBe(true);
    const resultHigh = calcRealmWithTrials(scores, 100);
    expect(resultHigh.diedInTrials).toBe(false);
    jest.restoreAllMocks();
  });
});
