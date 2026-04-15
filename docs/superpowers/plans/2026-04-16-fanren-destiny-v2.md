# 命运模拟 v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将命运模拟从单层分支（A/B两路）扩展为二层分支（A1/A2/B1/B2四路），并新增9个结局（共16个），提升探索驱动的留存性。

**Architecture:** 在现有 v1 代码基础上最小改动：types 扩展新 slug 和 branch2 字段；questions.json/outcomes.json 追加数据；`calcOutcome` 改为接收 path 参数按路径判断；`DestinyQuiz` 增加 branch2 状态和二级分叉逻辑。

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Jest (已配置)

---

## 文件结构

| 文件 | 操作 | 说明 |
|------|------|------|
| `types/destiny.ts` | 修改 | 扩展 OutcomeSlug，ChoiceOption 加 branch2 字段，新增 PathId 类型 |
| `content/destiny/outcomes.json` | 修改 | 追加10个新结局 |
| `content/destiny/questions.json` | 修改 | 追加14道新题（QAX/QAA1-4/QAB1-4/QBX/QBA1-4/QBB1-4） |
| `lib/destiny.ts` | 修改 | calcOutcome 加 path 参数，按路径分支判断 |
| `lib/__tests__/destiny.test.ts` | 修改 | 新增路径相关测试 |
| `components/destiny/DestinyQuiz.tsx` | 修改 | buildSequence 支持四路径，branch2 状态，finish 传 path |

---

## Task 1: 扩展类型定义

**Files:**
- 修改: `types/destiny.ts`

- [ ] **Step 1: 更新 `types/destiny.ts`**

将以下内容完整替换原文件：

```typescript
export type RealmSlug = "lianqi" | "zhuji" | "jiedan" | "yuanying" | "huashen";
export type OutcomeSlug =
  | "caidan" | "feisheng" | "tupo" | "shouhu" | "yinshi" | "doufa" | "zuohua"
  | "moxiu" | "bawang" | "xinmo" | "beici" | "shuangxiu" | "zongshi"
  | "tiandi" | "niepan" | "fanchen" | "xianyou";
export type PathId = "A1" | "A2" | "B1" | "B2";
export type MbtiDimension = "EI" | "SN" | "TF" | "JP";

export interface DestinyScores {
  courage: number;
  wisdom: number;
  loyalty: number;
  ambition: number;
}

export interface MbtiVotes {
  E: number; I: number;
  S: number; N: number;
  T: number; F: number;
  J: number; P: number;
}

export interface ChoiceOption {
  text: string;
  scores: Partial<DestinyScores>;
  mbti?: Partial<Record<MbtiDimension, string>>;
  branch?: "A" | "B";
  branch2?: PathId;
}

export interface SliderQuestion {
  id: string;
  type: "slider";
  text: string;
  leftLabel: string;
  rightLabel: string;
  scoring: {
    left: { scores: Partial<DestinyScores>; mbti?: Partial<Record<MbtiDimension, string>> };
    middle: { scores: Partial<DestinyScores> };
    right: { scores: Partial<DestinyScores>; mbti?: Partial<Record<MbtiDimension, string>> };
  };
  timed?: false;
}

export interface RankingOption {
  text: string;
  dimension: keyof DestinyScores | "wisdom_sn";
  split?: boolean;
  splitDimensions?: (keyof DestinyScores)[];
}

export interface RankingQuestion {
  id: string;
  type: "ranking";
  text: string;
  options: RankingOption[];
  rankScores: [number, number, number, number];
  timed?: false;
}

export interface ChoiceQuestion {
  id: string;
  type: "choice" | "image-choice";
  text: string;
  options: ChoiceOption[];
  timed?: number;
}

export type DestinyQuestion = SliderQuestion | RankingQuestion | ChoiceQuestion;

export interface Realm {
  slug: RealmSlug;
  name: string;
  description: string;
  baseLifespan: number;
}

export interface Outcome {
  slug: OutcomeSlug;
  name: string;
  description: string;
  keywords: string[];
  personalityNote: string;
}

export interface DestinyResult {
  realm: Realm;
  outcome: Outcome;
  lifespan: number;
  scores: DestinyScores;
  mbtiType: string;
  resultId: string;
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
git commit -m "feat(v2): extend OutcomeSlug and add PathId, branch2 to types"
```

---

## Task 2: 追加新结局数据

**Files:**
- 修改: `content/destiny/outcomes.json`

- [ ] **Step 1: 在 outcomes.json 末尾（数组最后一项之后，`]` 之前）追加10个新结局**

```json
  ,
  {
    "slug": "moxiu",
    "name": "魔修",
    "description": "战场上的杀戮让你尝到了一种奇异的快感。那一天，你在修炼时走火入魔，灵台中涌出一股黑色的气流。你没有抗拒——那感觉太熟悉了，就像战场上的你。从此，你踏上了魔道，再也回不了头。",
    "keywords": ["走火入魔", "快感成瘾", "不归路", "魔道修士"],
    "personalityNote": "你的欲望和力量都超过了你的自制力。魔道不是堕落，对你而言，那才是真实的自己。"
  },
  {
    "slug": "bawang",
    "name": "制霸一方",
    "description": "你的名字让人闻风丧胆。你没有飞升，也不想飞升——这片土地上的一切都在你的掌控之中，这就够了。你建立了自己的王国，以绝对的武力维系秩序。只是，众矢之的的滋味，并不好受。",
    "keywords": ["铁腕统治", "孤家寡人", "众矢之的", "强权为尊"],
    "personalityNote": "你用力量换来了掌控，却也用力量换走了温度。站在最高处，你才发现四面都是敌人。"
  },
  {
    "slug": "xinmo",
    "name": "心魔陨落",
    "description": "渡劫那一刻，心魔现身了。它的面孔是你自己——那个被欲望和野心填满、早已忘记初心的你。你与它缠斗了七天七夜，最终，你分不清哪个才是真正的自己。劫云散去，什么都没有留下。",
    "keywords": ["执念成魔", "自我迷失", "心魔噬心", "欲望代价"],
    "personalityNote": "野心是你最大的驱动力，也是你最深的陷阱。当你忘记了为何而修，修仙本身就成了你的劫。"
  },
  {
    "slug": "beici",
    "name": "背刺陨落",
    "description": "那一剑来自你最信任的人。你的情义让你放松了警惕，而你的智慧不够，没能看穿那张温情的脸背后藏着的刀。你倒下的那一刻，心里只有一个念头：原来如此。",
    "keywords": ["信任代价", "防人之心", "温情背后", "死于背叛"],
    "personalityNote": "你给出了全部的信任，却没有留下足够的清醒。这不是你的错，但你为此付出了生命。"
  },
  {
    "slug": "shuangxiu",
    "name": "双修伴侣",
    "description": "有人与你并肩走过了最艰难的岁月。渡劫那天，你们同时踏入劫云，彼此以神魂相护。劫云散去，两道身影冲破苍穹。修仙路漫漫，但你不是一个人。",
    "keywords": ["并肩同行", "神魂相护", "共渡飞升", "情义与力量"],
    "personalityNote": "你证明了，情义和力量不是对立的。最深的羁绊，有时候反而是最强的修炼。"
  },
  {
    "slug": "zongshi",
    "name": "散修宗师",
    "description": "你从未加入任何宗门，却桃李满天下。你将毕生所悟整理成册，收下了一批又一批弟子。你没有飞升，但你的道，在一代又一代人身上延续。也许这，才是另一种永生。",
    "keywords": ["桃李天下", "自创一派", "道统传承", "另一种永生"],
    "personalityNote": "你的智慧让你看到了比长生更深远的东西——传承。你选择了留下，而不是飞升，因为你知道什么更重要。"
  },
  {
    "slug": "tiandi",
    "name": "化为天地",
    "description": "寿元将尽那日，你没有遗憾。你盘膝而坐，将神魂缓缓向外扩散，融入山川，融入云雾，融入每一缕风。你消失了，又无处不在。后来的修士说，这片山中有一种奇异的灵气，让人心静。那是你。",
    "keywords": ["神魂化虚", "天地同寿", "无处不在", "另一种永存"],
    "personalityNote": "你的智慧和情义让你选择了最罕见的归宿——不飞升，不坐化，而是融入这片你守护过的天地。"
  },
  {
    "slug": "niepan",
    "name": "涅槃重生",
    "description": "渡劫失败，神魂本该消散。但那一刻，你的执念太深——不是对长生的执念，而是对未竟之事的执念。神魂在虚空中漂荡了不知多久，最终凝聚成一个婴儿，降生在某个普通农家。这一世，你记得一切。",
    "keywords": ["神魂不散", "执念重生", "记忆留存", "重头再来"],
    "personalityNote": "你死过一次，却又回来了。带着上一世的记忆，这一次，你会做出不同的选择吗？"
  },
  {
    "slug": "fanchen",
    "name": "回归凡尘",
    "description": "修为在某一天停滞了，再也无法寸进。你在一个小镇住下来，开了一间药铺。街坊邻居不知道你曾是修士，只知道这个老大夫医术高明，脾气温和。你也渐渐忘了，曾经那么渴望长生。",
    "keywords": ["修为停滞", "归隐凡尘", "平凡温暖", "放下执念"],
    "personalityNote": "修仙是你走过的路，但凡尘才是你最终的归宿。也许从一开始，你就不是那种注定要飞升的人。"
  },
  {
    "slug": "xianyou",
    "name": "被仙人接引",
    "description": "那一天，你正在江湖某处的破庙里避雨，百无聊赖地打坐。忽然，庙外金光大盛，一位白衣老者从天而降，看了你一眼，说了一句话：「与其在这泥泞里挣扎，不如随我去。」你甚至来不及问他是谁，就已经被一股力量托起，穿破云层。破庙里只留下你的衣物，和一个目瞪口呆的流浪汉。",
    "keywords": ["天外来客", "无需渡劫", "被动飞升", "万古奇遇"],
    "personalityNote": "你没有刻意追求飞升，飞升却主动找上了你。有些人，天生就是被命运偏爱的。"
  }
```

- [ ] **Step 2: 验证 JSON 合法**

```bash
cd /Users/fujianwei/fanren-wiki && node -e "require('./content/destiny/outcomes.json'); console.log('OK')"
```

Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add content/destiny/outcomes.json
git commit -m "feat(v2): add 10 new outcome entries to outcomes.json"
```

---

## Task 3: 追加新题目数据（分支A）

**Files:**
- 修改: `content/destiny/questions.json`

在现有 questions.json 末尾（`QF3` 之后，`]` 之前）追加以下题目。

- [ ] **Step 1: 追加 QAX（A路分叉题）和 A1征战路线4题**

在 `QF3` 对象之后追加：

```json
  ,
  {
    "id": "QAX",
    "type": "choice",
    "text": "在门派中历练数年，你逐渐找到了自己的位置。师兄弟们都说，你是那种——",
    "options": [
      { "text": "冲锋在前的人，战场上才是你的归宿", "scores": { "courage": 10, "ambition": 5 }, "branch2": "A1" },
      { "text": "深谋远虑的人，棋局之中才见真章", "scores": { "wisdom": 10 }, "mbti": { "JP": "J" }, "branch2": "A2" }
    ]
  },
  {
    "id": "QAA1",
    "type": "image-choice",
    "text": "一场大战在即，你主动请缨担任——",
    "options": [
      { "text": "先锋突破，第一个冲入敌阵", "scores": { "courage": 15, "ambition": 5 } },
      { "text": "断后殿军，保证同伴安全撤退", "scores": { "loyalty": 15, "courage": 5 } },
      { "text": "奇兵绕后，出其不意断敌退路", "scores": { "wisdom": 10, "courage": 10 } }
    ]
  },
  {
    "id": "QAA2",
    "type": "slider",
    "text": "战场上你的杀戮欲——",
    "leftLabel": "极强，战斗是你最真实的状态",
    "rightLabel": "克制，战斗只是手段",
    "scoring": {
      "left":   { "scores": { "courage": 15, "loyalty": -15 } },
      "middle": { "scores": { "courage": 5, "wisdom": 5 } },
      "right":  { "scores": { "wisdom": 10, "loyalty": 5 } }
    }
  },
  {
    "id": "QAA3",
    "type": "choice",
    "text": "你的至交在战场上被敌方俘虏，敌方开出条件：用你的修为换他自由。你——",
    "options": [
      { "text": "答应，修为可以再练，朋友只有一个", "scores": { "loyalty": 25, "ambition": -10 } },
      { "text": "拒绝，以武力强行救人", "scores": { "courage": 20, "loyalty": 10 } },
      { "text": "假意答应，暗中布局", "scores": { "wisdom": 15, "courage": 10 } }
    ]
  },
  {
    "id": "QAA4",
    "type": "choice",
    "text": "你在战场上声名大噪，有人私下找你，说可以帮你走上更高的位置，但需要出卖门派的一个秘密。你——",
    "options": [
      { "text": "断然拒绝，当场击杀来人", "scores": { "courage": 10, "loyalty": 10 } },
      { "text": "假装答应，暗中报告掌门", "scores": { "wisdom": 15, "loyalty": 5 } },
      { "text": "动摇了，最终还是拒绝", "scores": { "wisdom": 5, "ambition": -5 } },
      { "text": "答应了，野心压过了一切", "scores": { "ambition": 20, "loyalty": -20 } }
    ]
  }
```

- [ ] **Step 2: 验证 JSON 合法**

```bash
cd /Users/fujianwei/fanren-wiki && node -e "require('./content/destiny/questions.json'); console.log('OK')"
```

Expected: `OK`

- [ ] **Step 3: 追加 A2权谋路线4题**

继续在文件末尾（`QAA4` 之后，`]` 之前）追加：

```json
  ,
  {
    "id": "QAB1",
    "type": "choice",
    "text": "掌门交给你一个任务：调查门内一名长老是否有异心。你的方式是——",
    "options": [
      { "text": "暗中监视，收集证据再说", "scores": { "wisdom": 15 }, "mbti": { "JP": "J" } },
      { "text": "直接找他摊牌，看他反应", "scores": { "courage": 10, "wisdom": 5 }, "mbti": { "EI": "E" } },
      { "text": "广布消息，让他自乱阵脚", "scores": { "ambition": 10, "wisdom": 10 } }
    ]
  },
  {
    "id": "QAB2",
    "type": "slider",
    "text": "你对门派内部的权力争斗，内心的态度是——",
    "leftLabel": "乐在其中，这正是磨砺自己的舞台",
    "rightLabel": "厌倦，只想专心修炼",
    "scoring": {
      "left":   { "scores": { "ambition": 15, "wisdom": 5 } },
      "middle": { "scores": { "wisdom": 10 } },
      "right":  { "scores": { "wisdom": 10, "ambition": -5 }, "mbti": { "EI": "I" } }
    }
  },
  {
    "id": "QAB3",
    "type": "ranking",
    "text": "在门派中立足，你最看重的是——（从高到低排序）",
    "options": [
      { "text": "掌门的信任", "dimension": "wisdom" },
      { "text": "同门的情义", "dimension": "loyalty" },
      { "text": "自身的实力", "dimension": "courage" },
      { "text": "手中的秘密", "dimension": "ambition" }
    ],
    "rankScores": [20, 10, 5, 0]
  },
  {
    "id": "QAB4",
    "type": "choice",
    "text": "你最信任的师兄，在你最脆弱的时候背叛了你，将你的弱点告知了敌人。你——",
    "options": [
      { "text": "心如死灰，从此不再信任任何人", "scores": { "wisdom": 15, "loyalty": -20 }, "mbti": { "TF": "T" } },
      { "text": "愤怒，但选择原谅，试图理解他的苦衷", "scores": { "loyalty": 10, "wisdom": 10 } },
      { "text": "冷静分析，把这次背叛变成自己的筹码", "scores": { "ambition": 15, "wisdom": 10 } }
    ]
  }
```

- [ ] **Step 4: 验证 JSON 合法**

```bash
cd /Users/fujianwei/fanren-wiki && node -e "require('./content/destiny/questions.json'); console.log('OK')"
```

Expected: `OK`

- [ ] **Step 5: Commit**

```bash
git add content/destiny/questions.json
git commit -m "feat(v2): add branch A questions (QAX, QAA1-4, QAB1-4)"
```

---

## Task 4: 追加新题目数据（分支B）

**Files:**
- 修改: `content/destiny/questions.json`

- [ ] **Step 1: 追加 QBX（B路分叉题）和 B1求道路线4题**

在文件末尾（`QAB4` 之后，`]` 之前）追加：

```json
  ,
  {
    "id": "QBX",
    "type": "image-choice",
    "text": "游历数年，你偶然站在一处山顶，俯瞰天地。心中忽然生出一个念头——",
    "options": [
      { "text": "我想弄清楚，天道究竟是什么", "scores": { "wisdom": 10 }, "mbti": { "SN": "N" }, "branch2": "B1" },
      { "text": "我想去更远的地方，见更多的人和事", "scores": { "loyalty": 10 }, "mbti": { "EI": "E" }, "branch2": "B2" }
    ]
  },
  {
    "id": "QBA1",
    "type": "choice",
    "text": "你在一处上古遗迹中发现了两件东西：一部残缺的无上功法，和一本记载天道奥义的古籍。你只能带走一件。你选——",
    "options": [
      { "text": "无上功法，修为才是根本", "scores": { "ambition": 15, "courage": 10 } },
      { "text": "天道古籍，悟道才是修仙的意义", "scores": { "wisdom": 20 }, "mbti": { "SN": "N" } },
      { "text": "两件都研究透，再决定带哪件", "scores": { "wisdom": 15 }, "mbti": { "JP": "J" } }
    ]
  },
  {
    "id": "QBA2",
    "type": "slider",
    "text": "闭关参悟天道时，你感受到了一种极致的孤独。对你而言，这种孤独——",
    "leftLabel": "是享受，孤独才能真正与天地同频",
    "rightLabel": "令你不安，你需要有人陪伴",
    "scoring": {
      "left":   { "scores": { "wisdom": 15 }, "mbti": { "EI": "I" } },
      "middle": { "scores": { "wisdom": 7, "loyalty": 5 } },
      "right":  { "scores": { "loyalty": 15 }, "mbti": { "EI": "E" } }
    }
  },
  {
    "id": "QBA3",
    "type": "choice",
    "text": "你悟出了一门独特的功法，有人愿以重宝换取，也有弟子愿拜你为师传承此道。你——",
    "options": [
      { "text": "收下弟子，将此道传承下去", "scores": { "loyalty": 15, "wisdom": 10 } },
      { "text": "秘而不宣，此道只属于你", "scores": { "ambition": 10, "wisdom": 10 }, "mbti": { "EI": "I" } },
      { "text": "换取重宝，用资源继续钻研", "scores": { "ambition": 15, "wisdom": 5 } }
    ]
  },
  {
    "id": "QBA4",
    "type": "ranking",
    "text": "在求道的路上，你认为真正的修仙境界是——（按你的理解从高到低排序）",
    "options": [
      { "text": "突破天地枷锁，飞升而去", "dimension": "ambition" },
      { "text": "与天地融为一体，永存于世", "dimension": "wisdom_sn" },
      { "text": "将道传于后人，薪火相传", "dimension": "loyalty" },
      { "text": "守护一方净土，无愧于心", "dimension": "courage" }
    ],
    "rankScores": [20, 10, 5, 0]
  }
```

- [ ] **Step 2: 验证 JSON 合法**

```bash
cd /Users/fujianwei/fanren-wiki && node -e "require('./content/destiny/questions.json'); console.log('OK')"
```

Expected: `OK`

- [ ] **Step 3: 追加 B2江湖路线4题**

继续在文件末尾（`QBA4` 之后，`]` 之前）追加：

```json
  ,
  {
    "id": "QBB1",
    "type": "image-choice",
    "text": "游历江湖，你结识了形形色色的人。你最愿意与哪类人为伍——",
    "options": [
      { "text": "快意恩仇的江湖侠客", "scores": { "courage": 10, "loyalty": 15 }, "mbti": { "EI": "E" } },
      { "text": "见多识广的行商旅人", "scores": { "wisdom": 10, "loyalty": 10 }, "mbti": { "SN": "S" } },
      { "text": "身世成谜的孤独剑客", "scores": { "wisdom": 15 }, "mbti": { "EI": "I" } },
      { "text": "落魄失意的没落修士", "scores": { "loyalty": 20 }, "mbti": { "TF": "F" } }
    ]
  },
  {
    "id": "QBB2",
    "type": "choice",
    "text": "江湖中你救下了一个被追杀的少年，他说自己身负一个足以改变修仙界格局的秘密。你——",
    "options": [
      { "text": "护送他到安全的地方，不过问秘密", "scores": { "loyalty": 20, "wisdom": 5 } },
      { "text": "答应保护他，但想知道秘密内容", "scores": { "ambition": 10, "wisdom": 10 } },
      { "text": "将他托付给附近宗门，自己继续上路", "scores": { "wisdom": 10 }, "mbti": { "JP": "J" } },
      { "text": "暗中调查他的身份再决定", "scores": { "wisdom": 15 }, "mbti": { "TF": "T" } }
    ]
  },
  {
    "id": "QBB3",
    "type": "slider",
    "text": "漂泊江湖多年，你内心深处对"归宿"的渴望——",
    "leftLabel": "很强烈，你渴望有个地方可以停下来",
    "rightLabel": "几乎没有，自由才是你的归宿",
    "scoring": {
      "left":   { "scores": { "loyalty": 15 }, "mbti": { "JP": "J" } },
      "middle": { "scores": { "loyalty": 7, "wisdom": 5 } },
      "right":  { "scores": { "ambition": 10, "wisdom": 10 }, "mbti": { "JP": "P" } }
    }
  },
  {
    "id": "QBB4",
    "type": "choice",
    "text": "多年江湖漂泊后，你最深的感悟是——",
    "options": [
      { "text": "人心险恶，不如独善其身", "scores": { "wisdom": 15, "loyalty": -10 }, "mbti": { "EI": "I" } },
      { "text": "世间虽苦，但值得留恋", "scores": { "loyalty": 15, "wisdom": 5 } },
      { "text": "强者为尊，弱肉强食是永恒的法则", "scores": { "courage": 15, "ambition": 10 } },
      { "text": "随遇而安，活在当下最重要", "scores": { "wisdom": 10 }, "mbti": { "JP": "P" } }
    ]
  }
```

- [ ] **Step 4: 验证 JSON 合法**

```bash
cd /Users/fujianwei/fanren-wiki && node -e "require('./content/destiny/questions.json'); console.log('OK')"
```

Expected: `OK`

- [ ] **Step 5: Commit**

```bash
git add content/destiny/questions.json
git commit -m "feat(v2): add branch B questions (QBX, QBA1-4, QBB1-4)"
```

---

## Task 5: 扩展 calcOutcome 支持路径判断

**Files:**
- 修改: `lib/destiny.ts`
- 修改: `lib/__tests__/destiny.test.ts`

- [ ] **Step 1: 写失败测试**

在 `lib/__tests__/destiny.test.ts` 末尾追加：

```typescript
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
```

- [ ] **Step 2: 运行测试确认失败**

```bash
cd /Users/fujianwei/fanren-wiki && npx jest lib/__tests__/destiny.test.ts --no-coverage 2>&1 | tail -10
```

Expected: FAIL — `calcOutcome` 不接受第3个参数

- [ ] **Step 3: 更新 `lib/destiny.ts`**

将 `calcOutcome` 函数完整替换为：

```typescript
export function calcOutcome(
  scores: DestinyScores,
  realmSlug: string,
  path: PathId = "A1"
): Outcome {
  const { wisdom, ambition, loyalty, courage } = scores;
  let slug: OutcomeSlug;

  // 彩蛋先判断（各路径通用）
  if (wisdom >= 85 && ambition >= 85 && Math.random() < 0.01) {
    slug = "caidan";
  } else {
    switch (path) {
      case "A1":
        if (realmSlug === "huashen" && ambition >= 80) slug = "feisheng";
        else if (courage >= 80 && wisdom < 30 && loyalty < 30) slug = "bawang";
        else if (courage >= 70 && loyalty < 30) slug = "moxiu";
        else if (loyalty >= 70) slug = "shouhu";
        else if (courage >= 70 && wisdom < 40) slug = "doufa";
        else if (ambition >= 80 && wisdom < 40) slug = "tupo";
        else slug = "zuohua";
        break;

      case "A2":
        if (realmSlug === "huashen" && ambition >= 80) slug = "feisheng";
        else if (loyalty >= 80 && courage >= 60) slug = "shuangxiu";
        else if (ambition >= 80 && loyalty < 25) slug = "xinmo";
        else if (loyalty >= 70 && wisdom < 35) slug = "beici";
        else if (wisdom >= 70 && ambition < 40 && courage >= 50) slug = "zongshi";
        else if (ambition >= 80 && wisdom < 40) slug = "tupo";
        else slug = "zuohua";
        break;

      case "B1": {
        const tupoCondition = ambition >= 80 && wisdom < 40;
        if (realmSlug === "huashen" && ambition >= 80) slug = "feisheng";
        else if (wisdom >= 85 && loyalty >= 70) slug = "tiandi";
        else if (tupoCondition && Math.random() < 0.05) slug = "niepan";
        else if (wisdom >= 70 && ambition < 40 && courage >= 50) slug = "zongshi";
        else if (wisdom >= 60 && ambition < 50) slug = "yinshi";
        else if (tupoCondition) slug = "tupo";
        else slug = "zuohua";
        break;
      }

      case "B2":
        if (Math.random() < 0.003) { slug = "xianyou"; break; }
        if (realmSlug === "huashen" && ambition >= 80) slug = "feisheng";
        else if (loyalty >= 70 && wisdom < 35) slug = "beici";
        else if (loyalty >= 70) slug = "shouhu";
        else if (courage < 30 && ambition < 30) slug = "fanchen";
        else if (ambition >= 80 && wisdom < 40) slug = "tupo";
        else slug = "zuohua";
        break;

      default:
        slug = "zuohua";
    }
  }

  return outcomes.find((o) => o.slug === slug)!;
}
```

同时在文件顶部 import 中加入 `PathId`：

```typescript
import type { DestinyScores, MbtiVotes, Realm, Outcome, RealmSlug, OutcomeSlug, PathId } from "@/types/destiny";
```

- [ ] **Step 4: 运行测试确认通过**

```bash
cd /Users/fujianwei/fanren-wiki && npx jest lib/__tests__/destiny.test.ts --no-coverage 2>&1 | tail -15
```

Expected: PASS，所有测试绿色

- [ ] **Step 5: 类型检查**

```bash
cd /Users/fujianwei/fanren-wiki && npx tsc --noEmit 2>&1
```

Expected: 无错误

- [ ] **Step 6: Commit**

```bash
git add lib/destiny.ts lib/__tests__/destiny.test.ts
git commit -m "feat(v2): calcOutcome supports path-based outcome priority"
```

---

## Task 6: 更新 DestinyQuiz 支持二层分支

**Files:**
- 修改: `components/destiny/DestinyQuiz.tsx`

- [ ] **Step 1: 完整替换 `components/destiny/DestinyQuiz.tsx`**

```tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/components/ProgressBar";
import SliderQuestion, { sliderSegment } from "@/components/destiny/SliderQuestion";
import RankingQuestion from "@/components/destiny/RankingQuestion";
import { applyScores, calcRealm, calcLifespan, calcOutcome, calcMbti } from "@/lib/destiny";
import questionsData from "@/content/destiny/questions.json";
import type {
  DestinyQuestion,
  ChoiceQuestion,
  SliderQuestion as SliderQ,
  RankingQuestion as RankingQ,
  DestinyScores,
  MbtiVotes,
  MbtiDimension,
  PathId,
} from "@/types/destiny";

const allQuestions = questionsData as DestinyQuestion[];

const INIT_SCORES: DestinyScores = { courage: 0, wisdom: 0, loyalty: 0, ambition: 0 };
const INIT_VOTES: MbtiVotes = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

function buildSequence(branch: "A" | "B", path: PathId | null): string[] {
  const trunk = ["Q1", "Q2", "Q3", "Q4", "Q5"];
  const finale = ["QF1", "QF2", "QF3"];

  if (branch === "A") {
    const shared = ["QA1", "QA2", "QA3", "QAX"];
    if (path === "A1") return [...trunk, ...shared, "QAA1", "QAA2", "QAA3", "QAA4", ...finale];
    if (path === "A2") return [...trunk, ...shared, "QAB1", "QAB2", "QAB3", "QAB4", ...finale];
    return [...trunk, ...shared, ...finale]; // 未分叉时的临时序列
  } else {
    const shared = ["QB1", "QB2", "QB3", "QBX"];
    if (path === "B1") return [...trunk, ...shared, "QBA1", "QBA2", "QBA3", "QBA4", ...finale];
    if (path === "B2") return [...trunk, ...shared, "QBB1", "QBB2", "QBB3", "QBB4", ...finale];
    return [...trunk, ...shared, ...finale];
  }
}

function applyMbtiVote(
  votes: MbtiVotes,
  mbti?: Partial<Record<MbtiDimension, string>>
): MbtiVotes {
  if (!mbti) return votes;
  const next = { ...votes };
  for (const dir of Object.values(mbti)) {
    if (dir in next) next[dir as keyof MbtiVotes] += 1;
  }
  return next;
}

export default function DestinyQuiz() {
  const router = useRouter();
  const [branch, setBranch] = useState<"A" | "B" | null>(null);
  const [path, setPath] = useState<PathId | null>(null);
  const [sequence, setSequence] = useState<string[]>(["Q1", "Q2", "Q3", "Q4", "Q5"]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scores, setScores] = useState<DestinyScores>(INIT_SCORES);
  const [votes, setVotes] = useState<MbtiVotes>(INIT_VOTES);

  const [sliderValue, setSliderValue] = useState(50);
  const [rankOrder, setRankOrder] = useState<string[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerFired, setTimerFired] = useState(false);

  const scoresRef = useRef(scores);
  const votesRef = useRef(votes);
  useEffect(() => { scoresRef.current = scores; }, [scores]);
  useEffect(() => { votesRef.current = votes; }, [votes]);

  const currentId = sequence[currentIdx];
  const question = allQuestions.find((q) => q.id === currentId);
  const total = branch && path ? buildSequence(branch, path).length : 16;

  useEffect(() => {
    setSliderValue(50);
    setSelectedChoice(null);
    setTimerFired(false);
    if (question?.type === "ranking") {
      const q = question as RankingQ;
      setRankOrder(q.options.map((_, i) => String(i)));
    }
  }, [currentId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const q = question as ChoiceQuestion | undefined;
    if (!q || !q.timed) { setTimeLeft(null); return; }
    setTimeLeft(q.timed);
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t === null || t <= 1) { clearInterval(interval); setTimerFired(true); return null; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!timerFired) return;
    const q = question as ChoiceQuestion | undefined;
    if (!q?.options?.length) return;
    const randomOpt = q.options[Math.floor(Math.random() * q.options.length)];
    handleChoiceConfirm(randomOpt, scoresRef.current, votesRef.current);
  }, [timerFired]); // eslint-disable-line react-hooks/exhaustive-deps

  function finish(finalScores: DestinyScores, finalVotes: MbtiVotes, finalPath: PathId) {
    const realm = calcRealm(finalScores);
    const lifespan = calcLifespan(realm.baseLifespan, finalScores.wisdom);
    const outcome = calcOutcome(finalScores, realm.slug, finalPath);
    const mbtiType = calcMbti(finalVotes);
    const id = `${realm.slug}-${outcome.slug}`;
    const { courage, wisdom, loyalty, ambition } = finalScores;
    router.push(`/destiny/result/${id}?mbti=${mbtiType}&lifespan=${lifespan}&c=${courage}&w=${wisdom}&l=${loyalty}&a=${ambition}`);
  }

  function handleChoiceConfirm(
    option: ChoiceQuestion["options"][number],
    currentScores: DestinyScores,
    currentVotes: MbtiVotes
  ) {
    if (selectedChoice) return;
    setSelectedChoice(option.text);

    const newScores = applyScores(currentScores, option.scores);
    const newVotes = applyMbtiVote(currentVotes, option.mbti);
    setScores(newScores);
    setVotes(newVotes);

    // 一级分支（Q5）
    if (option.branch) {
      const newBranch = option.branch;
      setBranch(newBranch);
      const tempSeq = buildSequence(newBranch, null);
      setSequence(tempSeq);
      setTimeout(() => {
        setCurrentIdx(tempSeq.indexOf(newBranch === "A" ? "QA1" : "QB1"));
        setSelectedChoice(null);
      }, 400);
      return;
    }

    // 二级分支（QAX / QBX）
    if (option.branch2) {
      const newPath = option.branch2;
      setPath(newPath);
      const parentBranch = newPath.startsWith("A") ? "A" : "B" as "A" | "B";
      const newSeq = buildSequence(parentBranch, newPath);
      setSequence(newSeq);
      const firstId = newPath === "A1" ? "QAA1" : newPath === "A2" ? "QAB1" : newPath === "B1" ? "QBA1" : "QBB1";
      setTimeout(() => {
        setCurrentIdx(newSeq.indexOf(firstId));
        setSelectedChoice(null);
      }, 400);
      return;
    }

    setTimeout(() => {
      const nextIdx = currentIdx + 1;
      if (nextIdx >= sequence.length) {
        finish(newScores, newVotes, path ?? "A1");
      } else {
        setCurrentIdx(nextIdx);
        setSelectedChoice(null);
      }
    }, 400);
  }

  function handleSliderConfirm() {
    const q = question as SliderQ;
    const seg = sliderSegment(sliderValue);
    const scoring = q.scoring[seg];
    const newScores = applyScores(scores, scoring.scores);
    const newVotes = applyMbtiVote(votes, (scoring as { scores: Partial<DestinyScores>; mbti?: Partial<Record<MbtiDimension, string>> }).mbti);
    setScores(newScores);
    setVotes(newVotes);
    const nextIdx = currentIdx + 1;
    if (nextIdx >= sequence.length) {
      finish(newScores, newVotes, path ?? "A1");
    } else {
      setCurrentIdx(nextIdx);
    }
  }

  function handleRankingConfirm() {
    const q = question as RankingQ;
    const rankScores = q.rankScores;
    let newScores = { ...scores };
    let newVotes = { ...votes };

    rankOrder.forEach((idxStr, rank) => {
      const optIdx = Number(idxStr);
      const opt = q.options[optIdx];
      const pts = rankScores[rank];
      if (pts === 0) return;

      if (opt.split && opt.splitDimensions) {
        const half = Math.round(pts / 2);
        for (const dim of opt.splitDimensions) {
          newScores = applyScores(newScores, { [dim]: half });
        }
      } else if (opt.dimension === "wisdom_sn") {
        newScores = applyScores(newScores, { wisdom: pts });
        newVotes = applyMbtiVote(newVotes, { SN: "N" });
      } else {
        newScores = applyScores(newScores, { [opt.dimension as keyof DestinyScores]: pts });
      }
    });

    setScores(newScores);
    setVotes(newVotes);
    const nextIdx = currentIdx + 1;
    if (nextIdx >= sequence.length) {
      finish(newScores, newVotes, path ?? "A1");
    } else {
      setCurrentIdx(nextIdx);
    }
  }

  if (!question) return null;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-8">
        <ProgressBar current={currentIdx + 1} total={total} />
      </div>

      {timeLeft !== null && (
        <div className="text-center mb-4">
          <span className={`text-2xl font-bold font-serif ${timeLeft <= 2 ? "text-red-500" : "text-bamboo-500"}`}>
            {timeLeft}
          </span>
          <span className="text-bamboo-400 text-sm ml-1">秒</span>
        </div>
      )}

      {(question.type === "choice" || question.type === "image-choice") && (() => {
        const q = question as ChoiceQuestion;
        return (
          <div className="bg-white rounded-2xl border border-bamboo-200 p-8 shadow-sm">
            <p className="text-bamboo-400 text-xs tracking-widest mb-4">情景 {currentIdx + 1}</p>
            <h2 className="text-bamboo-700 font-serif text-lg leading-relaxed mb-8">{q.text}</h2>
            <div className="flex flex-col gap-4">
              {q.options.map((opt, i) => {
                const isChosen = selectedChoice === opt.text;
                return (
                  <button
                    key={i}
                    onClick={() => handleChoiceConfirm(opt, scores, votes)}
                    disabled={!!selectedChoice}
                    className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200
                      ${isChosen
                        ? "border-bamboo-400 bg-bamboo-100 text-bamboo-700"
                        : selectedChoice
                        ? "border-bamboo-200 bg-bamboo-50 text-bamboo-400 opacity-50"
                        : "border-bamboo-200 bg-bamboo-50 text-bamboo-600 hover:border-bamboo-400 hover:bg-bamboo-100 cursor-pointer"
                      }`}
                  >
                    {opt.text}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}

      {question.type === "slider" && (
        <SliderQuestion
          text={(question as SliderQ).text}
          leftLabel={(question as SliderQ).leftLabel}
          rightLabel={(question as SliderQ).rightLabel}
          value={sliderValue}
          onChange={setSliderValue}
          onConfirm={handleSliderConfirm}
        />
      )}

      {question.type === "ranking" && (
        <RankingQuestion
          text={(question as RankingQ).text}
          options={(question as RankingQ).options.map((o, i) => ({ id: String(i), text: o.text }))}
          order={rankOrder}
          onOrderChange={setRankOrder}
          onConfirm={handleRankingConfirm}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: 类型检查**

```bash
cd /Users/fujianwei/fanren-wiki && npx tsc --noEmit 2>&1
```

Expected: 无错误

- [ ] **Step 3: 运行所有测试**

```bash
cd /Users/fujianwei/fanren-wiki && npx jest --no-coverage 2>&1 | tail -10
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add components/destiny/DestinyQuiz.tsx
git commit -m "feat(v2): DestinyQuiz supports 4-path branching with branch2"
```

---

## Task 7: 更新结果页支持新结局路由

**Files:**
- 修改: `app/destiny/result/[id]/page.tsx`

结果页的 `generateStaticParams` 需要包含新结局的组合。新结局 slug 有10个，各路径结局池已在设计文档中定义，但结果页是按需动态渲染（因为有 searchParams），所以只需确保 `notFound()` 不会误拦截合法的新结局。

- [ ] **Step 1: 更新 `OUTCOME_SLUGS` 数组**

在 `app/destiny/result/[id]/page.tsx` 中，将：

```typescript
const OUTCOME_SLUGS: OutcomeSlug[] = ["tupo", "shouhu", "yinshi", "doufa", "zuohua", "caidan"];
```

替换为：

```typescript
const OUTCOME_SLUGS: OutcomeSlug[] = [
  "tupo", "shouhu", "yinshi", "doufa", "zuohua", "caidan",
  "moxiu", "bawang", "xinmo", "beici", "shuangxiu", "zongshi",
  "tiandi", "niepan", "fanchen", "xianyou",
];
```

- [ ] **Step 2: 类型检查**

```bash
cd /Users/fujianwei/fanren-wiki && npx tsc --noEmit 2>&1
```

Expected: 无错误

- [ ] **Step 3: 构建验证**

```bash
cd /Users/fujianwei/fanren-wiki && npm run build 2>&1 | tail -20
```

Expected: 构建成功，无错误

- [ ] **Step 4: Commit**

```bash
git add app/destiny/result/[id]/page.tsx
git commit -m "feat(v2): update result page to include all 16 outcome slugs"
```

---

## Task 8: 端到端验证

- [ ] **Step 1: 启动开发服务器（如未运行）**

```bash
cd /Users/fujianwei/fanren-wiki && npm run dev
```

- [ ] **Step 2: 验证 A1 征战路径**

访问 `http://localhost:3000/destiny`：
1. Q1-Q5 正常显示
2. Q5 选"加入门派" → 进入 QA1（限时5秒）
3. QA1-QA3 完成后出现 QAX 分叉题
4. QAX 选"冲锋在前" → 进入 QAA1-QAA4
5. 完成后跳转结果页，确认 URL 含 `moxiu`/`bawang`/`shouhu`/`doufa`/`zuohua` 等 A1 结局之一

- [ ] **Step 3: 验证 A2 权谋路径**

重新访问 `/destiny`：
1. Q5 选"加入门派" → QAX 选"深谋远虑" → 进入 QAB1-QAB4
2. 完成后结局应为 A2 路径结局之一

- [ ] **Step 4: 验证 B1 求道路径**

重新访问 `/destiny`：
1. Q5 选"独自游历" → QBX 选"我想弄清楚天道" → 进入 QBA1-QBA4
2. 完成后结局应为 B1 路径结局之一

- [ ] **Step 5: 验证 B2 江湖路径**

重新访问 `/destiny`：
1. Q5 选"独自游历" → QBX 选"我想去更远的地方" → 进入 QBB1-QBB4
2. 完成后结局应为 B2 路径结局之一

- [ ] **Step 6: 直接访问新结局页面**

```bash
curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/destiny/result/lianqi-moxiu?mbti=INTJ&lifespan=85&c=75&w=25&l=20&a=40"
```

Expected: `200`

```bash
curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/destiny/result/jiedan-tiandi?mbti=INFP&lifespan=350&c=40&w=88&l=72&a=30"
```

Expected: `200`

- [ ] **Step 7: Commit（如有未提交改动）**

```bash
git add -A && git status
git commit -m "feat(v2): destiny v2 complete - 4-path branching, 16 outcomes"
```
