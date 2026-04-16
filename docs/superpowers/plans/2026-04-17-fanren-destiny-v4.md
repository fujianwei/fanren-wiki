# 命运模拟 v4 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增向道之心（perseverance）和机遇值（fortune）两个维度，重构境界计算为逐级冲关概率模型，飞升条件改为向道之心驱动。

**Architecture:** perseverance 加入 DestinyScores（题目累积），fortune 在 DestinyQuiz 初始化时随机生成并传入 finish()；calcRealm 改为 calcRealmWithTrials 返回实际到达的境界和是否陨落；结果页雷达图加第5维度；URL 传参加 p=perseverance&ft=fortune。

**Tech Stack:** Next.js 16, TypeScript, Jest

---

## 文件结构

| 文件 | 操作 |
|------|------|
| `types/destiny.ts` | DestinyScores 加 perseverance |
| `lib/destiny.ts` | calcRealm 重构为 calcRealmWithTrials，calcOutcome 飞升条件更新 |
| `lib/__tests__/destiny.test.ts` | 更新所有涉及 DestinyScores 的测试，新增冲关测试 |
| `content/destiny/questions.json` | 32道动态题加 perseverance 加分 |
| `components/destiny/DestinyQuiz.tsx` | 初始分数加 perseverance:0，生成 fortune，finish() 传参 |
| `app/destiny/result/[id]/page.tsx` | 雷达图加向道之心，URL 解析 p= ft= |

---

## Task 1: 扩展 DestinyScores 类型

**Files:**
- 修改: `types/destiny.ts`

- [ ] **Step 1: 在 DestinyScores 接口加入 perseverance**

找到：
```typescript
export interface DestinyScores {
  courage: number;
  wisdom: number;
  loyalty: number;
  ambition: number;
}
```
替换为：
```typescript
export interface DestinyScores {
  courage: number;
  wisdom: number;
  loyalty: number;
  ambition: number;
  perseverance: number;
}
```

- [ ] **Step 2: 类型检查**

```bash
cd /Users/fujianwei/fanren-wiki && npx tsc --noEmit 2>&1 | head -30
```

Expected: 会有错误（其他地方用了 DestinyScores 但没有 perseverance），记录错误位置，下一步修复。

- [ ] **Step 3: 修复 lib/destiny.ts 的 INIT 相关**

lib/destiny.ts 中没有 INIT_SCORES，但 calcRealm/calcOutcome 的测试里有。先只改类型，后续任务统一修复。

- [ ] **Step 4: Commit**

```bash
cd /Users/fujianwei/fanren-wiki
git add types/destiny.ts
git commit -m "feat(v4): add perseverance to DestinyScores"
```

---

## Task 2: 重构境界计算为逐级冲关模型

**Files:**
- 修改: `lib/destiny.ts`
- 修改: `lib/__tests__/destiny.test.ts`

### 冲关成功率公式

| 冲关 | 基础 | perseverance加成 | fortune加成 | 最高（p=100,f=100） |
|------|------|-----------------|------------|-------------------|
| 炼气→筑基 | 70% | +p×0.2% | +f×0.1% | 100%（上限100%） |
| 筑基→结丹 | 35% | +p×0.3% | +f×0.15% | 80% |
| 结丹→元婴 | 15% | +p×0.4% | +f×0.2% | 75% |
| 元婴→化神 | 10% | +p×0.5% | +f×0.25% | 85% |

所有成功率上限 100%，下限 1%。

- [ ] **Step 1: 写失败测试**

在 `lib/__tests__/destiny.test.ts` 末尾追加：

```typescript
describe("calcRealmWithTrials", () => {
  const { calcRealmWithTrials } = require("../destiny");

  it("stays at lianqi when courage+perseverance < 40", () => {
    const scores = { courage: 10, wisdom: 0, loyalty: 0, ambition: 0, perseverance: 10 };
    const result = calcRealmWithTrials(scores, 50);
    expect(result.realm.slug).toBe("lianqi");
    expect(result.diedInTrials).toBe(false);
  });

  it("can reach zhuji when sum >= 40 and trial succeeds", () => {
    jest.spyOn(Math, "random").mockReturnValue(0); // always succeeds
    const scores = { courage: 20, wisdom: 0, loyalty: 0, ambition: 0, perseverance: 20 };
    const result = calcRealmWithTrials(scores, 50);
    expect(result.realm.slug).toBe("zhuji");
    expect(result.diedInTrials).toBe(false);
    jest.restoreAllMocks();
  });

  it("dies in trials when random > success rate", () => {
    jest.spyOn(Math, "random").mockReturnValue(0.99); // always fails
    const scores = { courage: 20, wisdom: 0, loyalty: 0, ambition: 0, perseverance: 20 };
    const result = calcRealmWithTrials(scores, 50);
    expect(result.diedInTrials).toBe(true);
    expect(result.realm.slug).toBe("lianqi"); // stays at previous realm
  });

  it("uses fortune to boost success rate", () => {
    // fortune=100 boosts zhuji trial rate to 70+0+10=80%
    // random=0.79 should succeed with fortune=100 but fail with fortune=0
    jest.spyOn(Math, "random").mockReturnValue(0.79);
    const scores = { courage: 20, wisdom: 0, loyalty: 0, ambition: 0, perseverance: 0 };
    const resultLow = calcRealmWithTrials(scores, 0);
    expect(resultLow.diedInTrials).toBe(true);
    const resultHigh = calcRealmWithTrials(scores, 100);
    expect(resultHigh.diedInTrials).toBe(false);
    jest.restoreAllMocks();
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

```bash
cd /Users/fujianwei/fanren-wiki && npx jest lib/__tests__/destiny.test.ts --no-coverage 2>&1 | tail -8
```

Expected: FAIL — `calcRealmWithTrials is not exported`

- [ ] **Step 3: 实现 calcRealmWithTrials**

在 `lib/destiny.ts` 中，保留原有 `calcRealm` 不变（向后兼容），新增：

```typescript
interface RealmTrialResult {
  realm: Realm;
  diedInTrials: boolean;
}

// 冲关成功率（上限100%，下限1%）
function trialRate(base: number, p: number, pCoef: number, f: number, fCoef: number): number {
  return Math.min(1, Math.max(0.01, (base + p * pCoef + f * fCoef) / 100));
}

export function calcRealmWithTrials(scores: DestinyScores, fortune: number): RealmTrialResult {
  const sum = scores.courage + scores.perseverance;
  // 确定可尝试的最高境界
  let targetSlug: RealmSlug;
  if (sum >= 90) targetSlug = "huashen";
  else if (sum >= 75) targetSlug = "yuanying";
  else if (sum >= 60) targetSlug = "jiedan";
  else if (sum >= 40) targetSlug = "zhuji";
  else targetSlug = "lianqi";

  const order: RealmSlug[] = ["lianqi", "zhuji", "jiedan", "yuanying", "huashen"];
  const targetIdx = order.indexOf(targetSlug);
  const p = scores.perseverance;
  const f = fortune;

  // 逐级冲关
  const rates: Record<string, [number, number, number, number]> = {
    "lianqi->zhuji":   [70, p, 0.2, f, 0.1],
    "zhuji->jiedan":   [35, p, 0.3, f, 0.15],
    "jiedan->yuanying":[15, p, 0.4, f, 0.2],
    "yuanying->huashen":[10, p, 0.5, f, 0.25],
  };

  let currentIdx = 0; // 从炼气期开始
  for (let i = 0; i < targetIdx; i++) {
    const key = `${order[i]}->${order[i + 1]}`;
    const [base, , pC, , fC] = rates[key];
    const rate = trialRate(base, p, pC, f, fC);
    if (Math.random() >= rate) {
      // 冲关失败，陨落
      return {
        realm: realms.find((r) => r.slug === order[i])!,
        diedInTrials: true,
      };
    }
    currentIdx = i + 1;
  }

  return {
    realm: realms.find((r) => r.slug === order[currentIdx])!,
    diedInTrials: false,
  };
}
```

- [ ] **Step 4: 运行测试确认通过**

```bash
cd /Users/fujianwei/fanren-wiki && npx jest lib/__tests__/destiny.test.ts --no-coverage 2>&1 | tail -10
```

Expected: PASS

- [ ] **Step 5: 更新 calcOutcome 的飞升条件**

找到 `calcOutcome` 中所有 `ambition >= 80` 对应飞升的判断：

```typescript
if (realmSlug === "huashen" && ambition >= 80) slug = "feisheng";
```

替换为（4个 case 都要改）：

```typescript
if (realmSlug === "huashen" && scores.perseverance >= 80) slug = "feisheng";
```

注意：`calcOutcome` 函数签名需要从 `(scores: DestinyScores, realmSlug: string, path: PathId)` 保持不变，`scores` 已包含 `perseverance`，直接读取即可。

- [ ] **Step 6: 类型检查**

```bash
cd /Users/fujianwei/fanren-wiki && npx tsc --noEmit 2>&1
```

- [ ] **Step 7: Commit**

```bash
git add lib/destiny.ts lib/__tests__/destiny.test.ts
git commit -m "feat(v4): add calcRealmWithTrials and update feisheng condition to perseverance"
```

---

## Task 3: 更新测试中的 DestinyScores 初始值

**Files:**
- 修改: `lib/__tests__/destiny.test.ts`

所有测试中的 `DestinyScores` 对象需要加入 `perseverance: 0`（或合适的值）。

- [ ] **Step 1: 找出所有需要更新的测试 scores 对象**

```bash
cd /Users/fujianwei/fanren-wiki && grep -n "courage:" lib/__tests__/destiny.test.ts | head -40
```

- [ ] **Step 2: 在每个 scores 对象中加入 perseverance**

对每个形如 `{ courage: X, wisdom: X, loyalty: X, ambition: X }` 的对象，加入 `perseverance: 0`（除非测试明确需要其他值）。

例如：
```typescript
// 改前
{ courage: 85, wisdom: 25, loyalty: 20, ambition: 40 }
// 改后
{ courage: 85, wisdom: 25, loyalty: 20, ambition: 40, perseverance: 0 }
```

- [ ] **Step 3: 运行所有测试确认通过**

```bash
cd /Users/fujianwei/fanren-wiki && npx jest --no-coverage 2>&1 | tail -8
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add lib/__tests__/destiny.test.ts
git commit -m "fix(v4): add perseverance:0 to all test DestinyScores objects"
```

---

## Task 4: 给题目加 perseverance 加分

**Files:**
- 修改: `content/destiny/questions.json`

**加分原则：** 为了修道放弃世俗 → perseverance+；遇到挫折不退缩 → perseverance+；沉迷权力/享乐/随遇而安 → perseverance 不加或减少。

**需要加分的选项（按设计文档 §6 各题版本）：**

以下列出每道题需要追加 perseverance 的选项（用 Edit 工具逐一追加，不要重写整个文件）：

**Q1：**
- "险峻壮阔的悬崖峰顶" → 加 `"perseverance": 10`（选择最艰难的环境）
- "云雾缭绕的深山洞府" → 加 `"perseverance": 8`（选择清修）

**Q2（default版本）：**
- "攻伐之道，以力破万法" → 加 `"perseverance": 5`
- "辅助炼丹，精研药理" → 加 `"perseverance": 8`（专研之道）
- "剑道修行，追求极致" → 加 `"perseverance": 10`（追求极致）

**QA6（slider，飞升边缘）：**
- 偏左（义无反顾飞升）→ 加 `"perseverance": 15`
- 居中 → 加 `"perseverance": 5`

**QAA2（slider，杀戮欲）：**
- 偏右（克制，战斗只是手段）→ 加 `"perseverance": 8`

**QAA3（至交被俘）：**
- "拒绝，以武力强行救人" → 加 `"perseverance": 10`（不退缩）

**QAA4（出卖门派的诱惑）：**
- "断然拒绝" → 加 `"perseverance": 12`
- "动摇了，最终还是拒绝" → 加 `"perseverance": 8`

**QAB3（ranking，门派立足）：**
- "自身的实力"排第1位 → perseverance+10（通过 rankScores 已有，不需要单独加）
- 注：ranking 题的 perseverance 加分通过 dimension 机制不好实现，跳过

**QB3（元婴老修士）：**
- "立刻答应，这是千载难逢的机遇"（default）→ 加 `"perseverance": 15`（放弃一切追求更高境界）
- "答应，但留了后手"（default）→ 加 `"perseverance": 8`

**QBA1（上古遗迹取舍）：**
- "天道古籍，悟道才是修仙的意义" → 加 `"perseverance": 12`
- "两件都研究透再决定" → 加 `"perseverance": 8`

**QBA2（孤独与天道，slider）：**
- 偏左（享受孤独）→ 加 `"perseverance": 15`
- 居中 → 加 `"perseverance": 5`

**QBA3（功法传承）：**
- "秘而不宣，此道只属于你" → 加 `"perseverance": 10`（坚守自己的道）

**QBA4（ranking，修仙境界）：**
- 跳过（ranking 题 perseverance 机制复杂）

**QF2（slider，面对死亡）：**
- 偏右（不甘心，仍想挣扎）→ 加 `"perseverance": 15`（向道之心不灭）
- 居中 → 加 `"perseverance": 5`

**QF3（留下什么）：**
- "一部你穷尽一生领悟的功法残卷" → 加 `"perseverance": 12`
- "一张记录了无数秘境位置的地图" → 加 `"perseverance": 8`

- [ ] **Step 1: 验证现有文件结构**

```bash
cd /Users/fujianwei/fanren-wiki && node -e "
const d = require('./content/destiny/questions.json');
['Q1','QB3','QBA1','QBA2','QF2','QF3'].forEach(id => {
  const q = d.find(x=>x.id===id);
  console.log(id, q ? (q.versions ? 'dynamic' : 'fixed') : 'MISSING');
});
"
```

- [ ] **Step 2: 用 Agent 批量更新 questions.json**

这步内容较多，读取文件后用 Write 工具写入完整新文件，在上述选项的 `scores` 对象中加入 `"perseverance": N`。

注意：
- 动态题的 perseverance 加分加在对应版本的 `options[].scores` 或 slider 的 `scoring.left/middle/right.scores` 中
- 固定题（QF2/QF3）直接改对应 scoring 或 options

- [ ] **Step 3: 验证 JSON 合法**

```bash
cd /Users/fujianwei/fanren-wiki && node -e "require('./content/destiny/questions.json'); console.log('OK')"
```

- [ ] **Step 4: Commit**

```bash
git add content/destiny/questions.json
git commit -m "feat(v4): add perseverance scores to relevant questions"
```

---

## Task 5: 更新 DestinyQuiz 组件

**Files:**
- 修改: `components/destiny/DestinyQuiz.tsx`

- [ ] **Step 1: 更新 INIT_SCORES 加入 perseverance**

找到：
```typescript
const INIT_SCORES: DestinyScores = { courage: 0, wisdom: 0, loyalty: 0, ambition: 0 };
```
替换为：
```typescript
const INIT_SCORES: DestinyScores = { courage: 0, wisdom: 0, loyalty: 0, ambition: 0, perseverance: 0 };
```

- [ ] **Step 2: 新增 fortune 状态**

找到：
```typescript
  const [branch, setBranch] = useState<"A" | "B" | null>(null);
```
在其后追加：
```typescript
  const [fortune] = useState<number>(() => Math.floor(Math.random() * 100) + 1);
```

（使用惰性初始化，确保每次游玩只生成一次，且不会因重渲染改变）

- [ ] **Step 3: 更新 finish 函数传入 fortune 和 perseverance**

找到：
```typescript
  function finish(finalScores: DestinyScores, finalVotes: MbtiVotes, finalPath: PathId) {
    const realm = calcRealm(finalScores);
    const lifespan = calcLifespan(realm.baseLifespan, finalScores.wisdom);
    const outcome = calcOutcome(finalScores, realm.slug, finalPath);
    const mbtiType = calcMbti(finalVotes);
    const id = `${realm.slug}-${outcome.slug}`;
    const { courage, wisdom, loyalty, ambition } = finalScores;
    router.push(`/destiny/result/${id}?mbti=${mbtiType}&lifespan=${lifespan}&c=${courage}&w=${wisdom}&l=${loyalty}&a=${ambition}`);
  }
```
替换为：
```typescript
  function finish(finalScores: DestinyScores, finalVotes: MbtiVotes, finalPath: PathId) {
    const { realm, diedInTrials } = calcRealmWithTrials(finalScores, fortune);
    const lifespan = calcLifespan(realm.baseLifespan, finalScores.wisdom);
    const effectiveOutcomeSlug = diedInTrials ? "tupo" : undefined;
    const outcome = effectiveOutcomeSlug
      ? { slug: "tupo" as const, name: "境界突破失败陨落", description: "", keywords: [], personalityNote: "" }
      : calcOutcome(finalScores, realm.slug, finalPath);
    const actualOutcome = effectiveOutcomeSlug
      ? (await import("@/content/destiny/outcomes.json")).default.find((o: {slug: string}) => o.slug === "tupo")!
      : calcOutcome(finalScores, realm.slug, finalPath);
    const mbtiType = calcMbti(finalVotes);
    const id = `${realm.slug}-${actualOutcome.slug}`;
    const { courage, wisdom, loyalty, ambition, perseverance } = finalScores;
    router.push(`/destiny/result/${id}?mbti=${mbtiType}&lifespan=${lifespan}&c=${courage}&w=${wisdom}&l=${loyalty}&a=${ambition}&p=${perseverance}&ft=${fortune}`);
  }
```

**注意：** 上面的 dynamic import 在 client component 里不够简洁。更好的方式是直接从已导入的 outcomesData 里找：

```typescript
  function finish(finalScores: DestinyScores, finalVotes: MbtiVotes, finalPath: PathId) {
    const { realm, diedInTrials } = calcRealmWithTrials(finalScores, fortune);
    const lifespan = calcLifespan(realm.baseLifespan, finalScores.wisdom);
    const outcomeSuffix = diedInTrials
      ? "tupo"
      : calcOutcome(finalScores, realm.slug, finalPath).slug;
    const mbtiType = calcMbti(finalVotes);
    const id = `${realm.slug}-${outcomeSuffix}`;
    const { courage, wisdom, loyalty, ambition, perseverance } = finalScores;
    router.push(`/destiny/result/${id}?mbti=${mbtiType}&lifespan=${lifespan}&c=${courage}&w=${wisdom}&l=${loyalty}&a=${ambition}&p=${perseverance}&ft=${fortune}`);
  }
```

需要在文件顶部 import calcRealmWithTrials：
```typescript
import { applyScores, calcRealmWithTrials, calcLifespan, calcOutcome, calcMbti, resolveQuestion } from "@/lib/destiny";
```

- [ ] **Step 4: 类型检查**

```bash
cd /Users/fujianwei/fanren-wiki && npx tsc --noEmit 2>&1
```

- [ ] **Step 5: 运行测试**

```bash
cd /Users/fujianwei/fanren-wiki && npx jest --no-coverage 2>&1 | tail -8
```

- [ ] **Step 6: Commit**

```bash
git add components/destiny/DestinyQuiz.tsx
git commit -m "feat(v4): DestinyQuiz uses calcRealmWithTrials and fortune"
```

---

## Task 6: 更新结果页雷达图

**Files:**
- 修改: `app/destiny/result/[id]/page.tsx`

- [ ] **Step 1: 更新 searchParams 解析加入 p 和 ft**

找到：
```typescript
  const { mbti = "INTJ", lifespan = "0", c = "50", w = "50", l = "50", a = "50" } = await searchParams;
  const radarScores = {
    courage: Math.min(100, Math.max(0, Number(c))),
    wisdom: Math.min(100, Math.max(0, Number(w))),
    loyalty: Math.min(100, Math.max(0, Number(l))),
    ambition: Math.min(100, Math.max(0, Number(a))),
  };
```
替换为：
```typescript
  const { mbti = "INTJ", lifespan = "0", c = "50", w = "50", l = "50", a = "50", p = "50" } = await searchParams;
  const radarScores = {
    courage: Math.min(100, Math.max(0, Number(c))),
    wisdom: Math.min(100, Math.max(0, Number(w))),
    loyalty: Math.min(100, Math.max(0, Number(l))),
    ambition: Math.min(100, Math.max(0, Number(a))),
    perseverance: Math.min(100, Math.max(0, Number(p))),
  };
```

（ft 不需要传入结果页，fortune 是内部值，不展示给用户）

- [ ] **Step 2: 更新 RadarChart 加入向道之心维度**

找到：
```typescript
          <RadarChart
            dimensions={[
              { label: "勇气", value: radarScores.courage },
              { label: "悟性", value: radarScores.wisdom },
              { label: "情义", value: radarScores.loyalty },
              { label: "野心", value: radarScores.ambition },
            ]}
            size={180}
          />
```
替换为：
```typescript
          <RadarChart
            dimensions={[
              { label: "勇气", value: radarScores.courage },
              { label: "悟性", value: radarScores.wisdom },
              { label: "情义", value: radarScores.loyalty },
              { label: "野心", value: radarScores.ambition },
              { label: "向道之心", value: radarScores.perseverance },
            ]}
            size={200}
          />
```

- [ ] **Step 3: 类型检查 + 构建验证**

```bash
cd /Users/fujianwei/fanren-wiki && npx tsc --noEmit 2>&1 && npm run build 2>&1 | tail -10
```

- [ ] **Step 4: Commit**

```bash
git add app/destiny/result/[id]/page.tsx
git commit -m "feat(v4): add perseverance dimension to radar chart"
```

---

## Task 7: 端到端验证

- [ ] **Step 1: 运行所有测试**

```bash
cd /Users/fujianwei/fanren-wiki && npx jest --no-coverage 2>&1 | tail -8
```

Expected: PASS

- [ ] **Step 2: 启动 dev server 验证**

```bash
cd /Users/fujianwei/fanren-wiki && npm run dev
```

访问 `http://localhost:3000/destiny`，完成一次游玩，确认：
- 结果页雷达图显示5个维度（含向道之心）
- 境界有可能因冲关失败而降低（多玩几次验证随机性）
- 飞升结局需要向道之心 ≥ 80 且化神期

- [ ] **Step 3: 直接访问新结局路由**

```bash
curl -s "http://localhost:3000/destiny/result/lianqi-tupo?mbti=INTJ&lifespan=85&c=20&w=20&l=20&a=20&p=10" -o /dev/null -w "%{http_code}"
```

Expected: 200

- [ ] **Step 4: Commit**

```bash
git add -A && git status
git commit -m "feat(v4): destiny v4 complete - perseverance, fortune, realm trials"
```
