# 命运模拟 v3 动态题目系统 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为32道内容题实现动态版本系统——每题根据上一题答案（prevAnswer）或累积分数（score）在运行时选择不同版本，题干和选项同时变化。

**Architecture:** 新增 `VersionCondition`/`QuestionVersion`/`DynamicQuestion` 类型；`lib/destiny.ts` 增加 `resolveQuestion` 函数；`questions.json` 中32道动态题改为 `versions` 数组结构（6道固定题不变）；`DestinyQuiz` 新增 `prevAnswer` 状态，每题渲染前调用 `resolveQuestion`。

**Tech Stack:** Next.js 16, TypeScript, Jest（已配置）

---

## 文件结构

| 文件 | 操作 | 说明 |
|------|------|------|
| `types/destiny.ts` | 修改 | 新增 VersionCondition、QuestionVersion、DynamicQuestion、ResolvedQuestionVersion 类型 |
| `lib/destiny.ts` | 修改 | 新增 resolveQuestion 函数 |
| `lib/__tests__/destiny.test.ts` | 修改 | 新增 resolveQuestion 测试 |
| `content/destiny/questions.json` | 修改 | 32道动态题改为 versions 结构，6道固定题不变 |
| `components/destiny/DestinyQuiz.tsx` | 修改 | 新增 prevAnswer 状态，渲染前调用 resolveQuestion |

---

## Task 1: 扩展类型定义

**Files:**
- 修改: `types/destiny.ts`

- [ ] **Step 1: 在 `types/destiny.ts` 末尾追加新类型**

用 Edit 工具，在文件末尾（`}` 之后）追加：

```typescript
// ===== v3: 动态题目系统类型 =====

export type VersionCondition =
  | { type: "prevAnswer"; value: string }
  | { type: "score"; dimension: keyof DestinyScores; gte: number }
  | { type: "score"; dimension: keyof DestinyScores; lt: number }
  | { type: "default" };

export interface SliderScoring {
  left: { scores: Partial<DestinyScores>; mbti?: Partial<Record<MbtiDimension, string>> };
  middle: { scores: Partial<DestinyScores>; mbti?: Partial<Record<MbtiDimension, string>> };
  right: { scores: Partial<DestinyScores>; mbti?: Partial<Record<MbtiDimension, string>> };
}

export interface QuestionVersion {
  condition: VersionCondition;
  text: string;
  // choice/image-choice 版本
  options?: ChoiceOption[];
  // slider 版本
  leftLabel?: string;
  rightLabel?: string;
  scoring?: SliderScoring;
  // ranking 版本（只换文字，dimension 顺序不变）
  rankingTexts?: string[];
}

export interface DynamicQuestion {
  id: string;
  type: "choice" | "image-choice" | "slider" | "ranking";
  timed?: number;
  versions: QuestionVersion[];
}

// resolveQuestion 返回的已解析版本（含题目元信息）
export interface ResolvedQuestionVersion extends QuestionVersion {
  id: string;
  type: "choice" | "image-choice" | "slider" | "ranking";
  timed?: number;
  // ranking 题：将 rankingTexts 合并回 options 结构
  rankScores?: [number, number, number, number];
  options?: ChoiceOption[];
}
```

- [ ] **Step 2: 类型检查**

```bash
cd /Users/fujianwei/fanren-wiki && npx tsc --noEmit 2>&1
```

Expected: 无错误

- [ ] **Step 3: Commit**

```bash
cd /Users/fujianwei/fanren-wiki
git add types/destiny.ts
git commit -m "feat(v3): add dynamic question version types"
```

---

## Task 2: 实现 resolveQuestion 函数

**Files:**
- 修改: `lib/destiny.ts`
- 修改: `lib/__tests__/destiny.test.ts`

- [ ] **Step 1: 写失败测试**

在 `lib/__tests__/destiny.test.ts` 末尾追加：

```typescript
import { resolveQuestion } from "../destiny";
import type { DynamicQuestion, DestinyScores } from "@/types/destiny";

describe("resolveQuestion", () => {
  const baseScores: DestinyScores = { courage: 0, wisdom: 0, loyalty: 0, ambition: 0 };

  const q: DynamicQuestion = {
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
    const scores = { ...baseScores, courage: 60 };
    expect(resolveQuestion(q, "选B", scores).text).toBe("高勇气版本");
  });

  it("returns default version when no condition matches", () => {
    expect(resolveQuestion(q, "选B", baseScores).text).toBe("默认版本");
  });

  it("returns default version when prevAnswer is null", () => {
    expect(resolveQuestion(q, null, baseScores).text).toBe("默认版本");
  });

  it("prevAnswer takes priority over score condition", () => {
    const scores = { ...baseScores, courage: 60 };
    expect(resolveQuestion(q, "选A", scores).text).toBe("prevAnswer版本");
  });

  it("supports lt score condition", () => {
    const qLt: DynamicQuestion = {
      id: "TEST2",
      type: "slider",
      versions: [
        {
          condition: { type: "score", dimension: "wisdom", lt: 30 },
          text: "低智慧版本",
          leftLabel: "left",
          rightLabel: "right",
          scoring: { left: { scores: {} }, middle: { scores: {} }, right: { scores: {} } },
        },
        {
          condition: { type: "default" },
          text: "默认版本",
          leftLabel: "left",
          rightLabel: "right",
          scoring: { left: { scores: {} }, middle: { scores: {} }, right: { scores: {} } },
        },
      ],
    };
    expect(resolveQuestion(qLt, null, { ...baseScores, wisdom: 20 }).text).toBe("低智慧版本");
    expect(resolveQuestion(qLt, null, { ...baseScores, wisdom: 40 }).text).toBe("默认版本");
  });

  it("merges id/type/timed/rankScores into resolved version", () => {
    const resolved = resolveQuestion(q, null, baseScores);
    expect(resolved.id).toBe("TEST");
    expect(resolved.type).toBe("choice");
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

```bash
cd /Users/fujianwei/fanren-wiki && npx jest lib/__tests__/destiny.test.ts --no-coverage 2>&1 | tail -8
```

Expected: FAIL — `resolveQuestion is not exported`

- [ ] **Step 3: 在 `lib/destiny.ts` 末尾追加 resolveQuestion**

```typescript
import type { DynamicQuestion, ResolvedQuestionVersion, RankingQuestion as RankingQ } from "@/types/destiny";

export function resolveQuestion(
  question: DynamicQuestion,
  prevAnswer: string | null,
  scores: DestinyScores
): ResolvedQuestionVersion {
  let matched: (typeof question.versions)[number] | undefined;

  for (const version of question.versions) {
    const cond = version.condition;
    if (cond.type === "prevAnswer" && prevAnswer === cond.value) {
      matched = version;
      break;
    }
    if (cond.type === "score") {
      const val = scores[cond.dimension];
      if ("gte" in cond && val >= cond.gte) { matched = version; break; }
      if ("lt" in cond && val < cond.lt) { matched = version; break; }
    }
    if (cond.type === "default") { matched = version; break; }
  }

  const v = matched ?? question.versions[question.versions.length - 1];

  // ranking 题：将 rankingTexts 合并回 options（维度顺序不变）
  // ranking 原始数据存在 questions.json 的固定 rankingOptions 字段
  return {
    ...v,
    id: question.id,
    type: question.type,
    timed: question.timed,
  } as ResolvedQuestionVersion;
}
```

注意：`lib/destiny.ts` 顶部已有 import，需要把 `DynamicQuestion, ResolvedQuestionVersion` 加入现有 import 行，而不是重复 import。现有 import 是：
```typescript
import type { DestinyScores, MbtiVotes, Realm, Outcome, RealmSlug, OutcomeSlug, PathId } from "@/types/destiny";
```
改为：
```typescript
import type { DestinyScores, MbtiVotes, Realm, Outcome, RealmSlug, OutcomeSlug, PathId, DynamicQuestion, ResolvedQuestionVersion } from "@/types/destiny";
```

- [ ] **Step 4: 运行测试确认通过**

```bash
cd /Users/fujianwei/fanren-wiki && npx jest lib/__tests__/destiny.test.ts --no-coverage 2>&1 | tail -10
```

Expected: PASS，所有测试绿色

- [ ] **Step 5: 类型检查**

```bash
cd /Users/fujianwei/fanren-wiki && npx tsc --noEmit 2>&1
```

Expected: 无错误

- [ ] **Step 6: Commit**

```bash
cd /Users/fujianwei/fanren-wiki
git add lib/destiny.ts lib/__tests__/destiny.test.ts
git commit -m "feat(v3): add resolveQuestion function with tests"
```

---

## Task 3: 迁移 questions.json（公共主干 Q1-Q4 + 分支A）

**Files:**
- 修改: `content/destiny/questions.json`

将32道动态题改为 versions 结构。6道固定题（Q5/QAX/QBX/QF1-3）保持原结构不变。

- [ ] **Step 1: 验证现有文件**

```bash
node -e "const d=require('./content/destiny/questions.json'); console.log(d.length)"
```

Expected: `38`

- [ ] **Step 2: 读取现有文件，写入完整新文件（含 Q1-QAX 的动态化 + Q5 固定）**

用 Write 工具写入 `/Users/fujianwei/fanren-wiki/content/destiny/questions.json`，内容为完整38道题的新结构（动态题用 versions，固定题保持原样）。

**Q1-Q4 动态化内容（按设计文档 §6.1）：**

Q1（只有 default，因为是第一题）：
```json
{
  "id": "Q1", "type": "image-choice",
  "versions": [{
    "condition": { "type": "default" },
    "text": "你是一名普通农家子弟，某日偶遇一位云游道人，他说你与修仙有缘，愿带你入门。你看了看四周的景色，心中最向往的是哪里？",
    "options": [
      { "text": "云雾缭绕的深山洞府", "scores": { "courage": 5, "ambition": 10 } },
      { "text": "热闹繁华的修仙坊市", "scores": { "courage": 10 }, "mbti": { "EI": "E" } },
      { "text": "宁静清幽的竹林小筑", "scores": { "wisdom": 10 }, "mbti": { "EI": "I" } },
      { "text": "险峻壮阔的悬崖峰顶", "scores": { "courage": 15, "ambition": 5 } }
    ]
  }]
}
```

Q2（4个版本：prevAnswer×3 + default）：
- prevAnswer="云雾缭绕的深山洞府"：题干"道人将你带入深山，问你想走哪条路："，选项同原版
- prevAnswer="热闹繁华的修仙坊市"：题干"在坊市见识了各路修士的风采，你决定主修："，选项加 EI→E/SN→S 变体
- prevAnswer="宁静清幽的竹林小筑"：题干"在竹林中静心数日，你领悟到自己的方向："，选项偏智慧/JP→J
- default：原版题干和选项

Q3（3个版本：score courage>=25 / score wisdom>=25 / default）：
- courage>=25：题干加"兄弟之间不分你我/法器是你的命"，偏右给 courage+5
- wisdom>=25：题干加"积累人情/保存实力"，偏右给 wisdom+15
- default：原版

Q4（3个版本：score courage>=25 / score wisdom>=25 / default）：
- courage>=25：题干"感到热血上涌"
- wisdom>=25：题干"迅速评估了形势"，先礼后兵给 wisdom+20
- default：原版

Q5 固定（保持原结构，有 branch 字段）

**QA1-QA3 动态化内容（按设计文档 §6.2）：**

QA1（timed:5，3个版本：score courage>=40 / score loyalty>=30 / default）

QA2（4个版本：prevAnswer="冲上前线，保护师门" / prevAnswer="继续冲，把敌方先锋打退！" / prevAnswer="先保护师弟师妹撤退" / default）

QA3（ranking，3个版本：score courage>=50 / score loyalty>=30 / default）
- ranking 题的 versions 需要同时包含 rankingTexts 和 options（options 的 scores 为空对象，实际得分由 DestinyQuiz 根据 rankScores 和 dimension 计算）
- 顶层保留 `"rankScores": [20, 10, 5, 0]`
- options 的 dimension 字段：版本A（courage>=50）顺序：courage/loyalty/ambition/wisdom；版本B（loyalty>=30）：loyalty/ambition/courage/wisdom；default：ambition/loyalty/courage/wisdom

QAX 固定（保持原结构，有 branch2 字段）

**注意：** ranking 题的 versions 中 options 只需 text 字段用于显示，dimension 字段用于 DestinyQuiz 的计分逻辑。scores 字段设为 `{}` 因为 ranking 计分由 rankScores 驱动。

- [ ] **Step 3: 验证 JSON 合法**

```bash
cd /Users/fujianwei/fanren-wiki && node -e "const d=require('./content/destiny/questions.json'); console.log('total:', d.length); const dyn=d.filter(q=>q.versions); console.log('dynamic:', dyn.length, dyn.map(q=>q.id).join(','))"
```

Expected: `total: 38`，dynamic 包含 Q1-Q4, QA1-QA3

- [ ] **Step 4: Commit**

```bash
git add content/destiny/questions.json
git commit -m "feat(v3): migrate Q1-Q4 and QA1-QA3 to dynamic versions"
```

---

## Task 4: 迁移 questions.json（分支A子路线 + 分支B）

**Files:**
- 修改: `content/destiny/questions.json`

继续在 Task 3 基础上迁移剩余动态题。

- [ ] **Step 1: 写入 QAA1-QAA4（A1征战，按设计文档 §6.3）**

QAA1（image-choice，3个版本：score courage>=60 / score wisdom>=40 / default）
- courage>=60：题干"你已经按捺不住"，先锋给 courage+20
- wisdom>=40：题干"冷静地分析了战场形势"，奇兵给 wisdom+15
- default：原版

QAA2（slider，3个版本：prevAnswer="先锋突破..." / score courage>=50 / default）
- prevAnswer 先锋：题干"连续冲阵，血与火中"，偏左 courage+20 loyalty-10
- courage>=50：题干"战场上你的杀戮欲"，原版加分
- default：题干"面对战局，你内心的状态"，偏左 courage+10 wisdom+5

QAA3（choice，3个版本：score loyalty>=50 / score ambition>=40 / default）
- loyalty>=50：题干"你毫不犹豫地"，答应给 loyalty+30 ambition-15
- ambition>=40：题干"你心中一紧"，答应给 loyalty+20 ambition-10
- default：原版

QAA4（choice，3个版本：score ambition>=50 / score loyalty>=50 / default）
- ambition>=50：题干"你心动了一瞬"，答应给 ambition+25 loyalty-25
- loyalty>=50：题干"你想起了同门的面孔"，拒绝给 loyalty+15
- default：原版

- [ ] **Step 2: 写入 QAB1-QAB4（A2权谋，按设计文档 §6.4）**

QAB1（choice，3个版本：score wisdom>=40 / score ambition>=40 / default）
QAB2（slider，3个版本：score ambition>=50 / score wisdom>=50 / default）
QAB3（ranking，3个版本：score ambition>=50 / score loyalty>=40 / default）
QAB4（choice，3个版本：score loyalty>=50 / score wisdom>=50 / default）

- [ ] **Step 3: 写入 QBX + QB1-QB3（分支B共干，按设计文档 §6.5）**

QBX 固定（保持原结构）

QB1（slider，3个版本：score loyalty>=30 / score wisdom>=30 / default）
QB2（ranking，3个版本：score ambition>=40 / score wisdom>=40 / default）
QB3（choice，3个版本：score ambition>=50 / score wisdom>=50 / default）

- [ ] **Step 4: 写入 QBA1-QBA4（B1求道，按设计文档 §6.6）**

QBA1（choice，3个版本：score wisdom>=50 / score ambition>=50 / default）
QBA2（slider，3个版本：prevAnswer含"古籍" / score wisdom>=50 / default）
- prevAnswer 匹配3个可能值："取古籍，功法终究是外物" / "天道古籍，悟道才是修仙的意义" / "取古籍，悟道才是正途"
- 由于 prevAnswer 只能精确匹配一个值，需要3个独立的 prevAnswer 版本，后面跟 score 版本和 default
QBA3（choice，3个版本：score loyalty>=40 / score ambition>=40 / default）
QBA4（ranking，3个版本：score wisdom>=60 / score ambition>=50 / default）

- [ ] **Step 5: 写入 QBB1-QBB4（B2江湖，按设计文档 §6.7）**

QBB1（image-choice，3个版本：score loyalty>=40 / score wisdom>=40 / default）
QBB2（choice，3个版本：score loyalty>=50 / score ambition>=40 / default）
QBB3（slider，3个版本：score loyalty>=50 / score wisdom>=40 / default）
QBB4（choice，3个版本：score loyalty>=50 / score ambition>=40 / default）

- [ ] **Step 6: 写入 QF1-QF3（固定收尾题，保持原结构）**

- [ ] **Step 7: 验证完整文件**

```bash
cd /Users/fujianwei/fanren-wiki && node -e "
const d = require('./content/destiny/questions.json');
const dyn = d.filter(q => q.versions);
const fixed = d.filter(q => !q.versions);
console.log('total:', d.length);
console.log('dynamic:', dyn.length, dyn.map(q=>q.id).join(','));
console.log('fixed:', fixed.length, fixed.map(q=>q.id).join(','));
const allHaveDefault = dyn.every(q => q.versions.some(v => v.condition.type === 'default'));
console.log('all have default:', allHaveDefault);
"
```

Expected:
- total: 38
- dynamic: 32（Q1-Q4, QA1-QA3, QAA1-4, QAB1-4, QB1-QB3, QBA1-4, QBB1-4）
- fixed: 6（Q5, QAX, QBX, QF1, QF2, QF3）
- all have default: true

- [ ] **Step 8: Commit**

```bash
git add content/destiny/questions.json
git commit -m "feat(v3): migrate all 32 dynamic questions to versions structure"
```

---

## Task 5: 更新 DestinyQuiz 支持动态版本

**Files:**
- 修改: `components/destiny/DestinyQuiz.tsx`

新增 `prevAnswer` 状态，在每题渲染前调用 `resolveQuestion`，将动态题解析为当前版本。

- [ ] **Step 1: 读取现有 DestinyQuiz.tsx，更新如下**

修改点：

**1. 新增 import**
在现有 import 中加入：
```typescript
import { resolveQuestion } from "@/lib/destiny";
import type { DynamicQuestion, ResolvedQuestionVersion } from "@/types/destiny";
```

**2. 新增 prevAnswer 状态**
在 `const [timerFired, setTimerFired] = useState(false);` 之后加：
```typescript
const [prevAnswer, setPrevAnswer] = useState<string | null>(null);
```

**3. 新增 resolvedQuestion 计算**
在 `const question = allQuestions.find((q) => q.id === currentId);` 之后加：
```typescript
// 动态题解析：有 versions 字段则调用 resolveQuestion，否则直接使用
const resolvedQuestion: ResolvedQuestionVersion | DestinyQuestion | undefined =
  question && "versions" in question
    ? resolveQuestion(question as DynamicQuestion, prevAnswer, scores)
    : question;
```

**4. 所有使用 `question` 渲染的地方改为 `resolvedQuestion`**
- `question?.type === "ranking"` → `resolvedQuestion?.type === "ranking"`
- `question as ChoiceQuestion` → `resolvedQuestion as ChoiceQuestion`
- `question as SliderQ` → `resolvedQuestion as SliderQ`
- `question as RankingQ` → `resolvedQuestion as RankingQ`
- `question.type === "choice"` → `resolvedQuestion?.type === "choice"`
- `if (!question) return null;` → `if (!resolvedQuestion) return null;`

**5. 在每次确认答案时记录 prevAnswer**

在 `handleChoiceConfirm` 中，`setSelectedChoice(option.text)` 之后加：
```typescript
setPrevAnswer(option.text);
```

在 `handleSliderConfirm` 开头加（记录滑动条的段位作为 prevAnswer）：
```typescript
const seg = sliderSegment(sliderValue);
const segLabel = seg === "left"
  ? (resolvedQuestion as ResolvedQuestionVersion).leftLabel ?? "left"
  : seg === "right"
  ? (resolvedQuestion as ResolvedQuestionVersion).rightLabel ?? "right"
  : "middle";
setPrevAnswer(segLabel);
```

在 `handleRankingConfirm` 开头加（记录第一名选项文字作为 prevAnswer）：
```typescript
const q = resolvedQuestion as RankingQ;
const firstOptIdx = Number(rankOrder[0]);
setPrevAnswer(q.options[firstOptIdx].text);
```

**6. 在切题时重置 prevAnswer（不需要，prevAnswer 是跨题的状态，保留上一题答案）**

实际上 prevAnswer 不需要在切题时重置，它始终保存上一题的答案。

**7. ranking 题的 options 来源**

ranking 题有 versions，每个版本的 options 包含 text 和 dimension（scores 为空）。`handleRankingConfirm` 需要从 `resolvedQuestion` 中读取 options，而不是原始 question。确认 `handleRankingConfirm` 中：
```typescript
const q = resolvedQuestion as RankingQ;
const rankScores = q.rankScores ?? [20, 10, 5, 0];
```
注意 rankScores 在动态题中存在于顶层（`question.rankScores`），需要从原始 question 读取：
```typescript
const originalQ = question as RankingQuestion;
const rankScores = originalQ.rankScores ?? [20, 10, 5, 0];
```

- [ ] **Step 2: 类型检查**

```bash
cd /Users/fujianwei/fanren-wiki && npx tsc --noEmit 2>&1
```

Expected: 无错误

- [ ] **Step 3: 运行所有测试**

```bash
cd /Users/fujianwei/fanren-wiki && npx jest --no-coverage 2>&1 | tail -8
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add components/destiny/DestinyQuiz.tsx
git commit -m "feat(v3): DestinyQuiz uses resolveQuestion for dynamic question versions"
```

---

## Task 6: 端到端验证

- [ ] **Step 1: 启动 dev server（如未运行）**

```bash
cd /Users/fujianwei/fanren-wiki && npm run dev
```

- [ ] **Step 2: 验证动态版本切换**

访问 `http://localhost:3000/destiny`：

1. **Q1 选"云雾缭绕的深山洞府"** → Q2 应显示"道人将你带入深山，问你想走哪条路："
2. **Q1 选"热闹繁华的修仙坊市"** → Q2 应显示"在坊市见识了各路修士的风采"
3. **Q1 选"宁静清幽的竹林小筑"** → Q2 应显示"在竹林中静心数日"
4. **Q1 选"险峻壮阔的悬崖峰顶"** → Q2 显示 default 版本"入门之后，师父让你选择主修方向"

- [ ] **Step 3: 验证分数触发**

重新开始，选择让勇气快速积累的选项（Q1选悬崖，Q2选攻伐）：
- Q3 应显示"慷慨借出，兄弟之间不分你我"版本（courage>=25）

- [ ] **Step 4: 验证完整流程**

走完4条路径各一次，确认：
- 每次看到的题目文字有差异
- 结局页正常显示
- 雷达图正常显示

- [ ] **Step 5: Commit**

```bash
git add -A && git status
git commit -m "feat(v3): dynamic question versioning complete"
```
