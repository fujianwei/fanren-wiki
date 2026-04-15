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
  it("returns yinshi for wisdom>=60 && ambition<50", () => {
    const spy = jest.spyOn(Math, "random").mockReturnValue(0.5);
    const scores: DestinyScores = { courage: 30, wisdom: 65, loyalty: 30, ambition: 40 };
    expect(calcOutcome(scores, "lianqi").slug).toBe("yinshi");
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

describe("calcMbti", () => {
  it("returns INTJ for default tie-breaking (all zeros)", () => {
    const votes: MbtiVotes = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    expect(calcMbti(votes)).toBe("INTJ");
  });
  it("returns ENFP when E/N/F/P each have more votes", () => {
    const votes: MbtiVotes = { E: 3, I: 1, S: 1, N: 3, T: 1, F: 3, J: 1, P: 3 };
    expect(calcMbti(votes)).toBe("ENFP");
  });
});
