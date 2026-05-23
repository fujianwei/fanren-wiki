# 命运模拟 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有 MBTI 测试升级为"修仙命运模拟"游戏，用户完成20题后获得境界、寿元、结局和人界角色镜像。

**Architecture:** 新增 `/destiny` 路由（入口页）和 `/destiny/result/[id]` 路由（结果页），复用现有 `/quiz` 路由不变。计分逻辑放在 `lib/destiny.ts`，题目数据放在 `content/destiny/`，结果页为服务端组件+静态生成（31个合法组合）。

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, `@dnd-kit/core` (拖拽排序)

---

## Task 1: 安装依赖

**Files:**
- 修改: `package.json`（npm install 自动更新）

- [ ] **Step 1: 安装拖拽库**

```bash
cd /Users/fujianwei/fanren-wiki
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

Expected: `package.json` 中出现 `@dnd-kit/core`、`@dnd-kit/sortable`、`@dnd-kit/utilities`

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add @dnd-kit for drag-and-drop ranking questions"
```

---

## Task 2: 类型定义

**Files:**
- 创建: `types/destiny.ts`

- [ ] **Step 1: 写测试（验证类型可编译）**

```bash
# 暂无运行时测试，类型正确性由 tsc 验证
# 写完 types/destiny.ts 后运行：
npx tsc --noEmit
```

- [ ] **Step 2: 创建 `types/destiny.ts`**

```typescript
// types/destiny.ts

export type RealmSlug = "lianqi" | "zhuji" | "jiedan" | "yuanying" | "huashen";
export type OutcomeSlug = "caidan" | "feisheng" | "tupo" | "shouhu" | "yinshi" | "doufa" | "zuohua";
export type MbtiDimension = "EI" | "SN" | "TF" | "JP";

export interface DestinyScores {
  courage: number;    // 勇气 0-100
  wisdom: number;     // 智慧 0-100
  loyalty: number;    // 情义 0-100
  ambition: number;   // 野心 0-100
}

export interface MbtiVotes {
  E: number; I: number;
  S: number; N: number;
  T: number; F: number;
  J: number; P: number;
}

// 普通选项的单个选项
export interface ChoiceOption {
  text: string;
  scores: Partial<DestinyScores>;
  mbti?: Partial<Record<MbtiDimension, string>>;
  branch?: "A" | "B"; // 仅 Q5 使用，触发分支
}

// 滑动条题
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

// 排序拖拽题
export interface RankingOption {
  text: string;
  dimension: keyof DestinyScores | "wisdom_sn"; // wisdom_sn 表示给智慧+SN→N
  split?: boolean; // true 时加分平分给两个维度（QB2 联合选项）
  splitDimensions?: (keyof DestinyScores)[];
}

export interface RankingQuestion {
  id: string;
  type: "ranking";
  text: string;
  options: RankingOption[];
  rankScores: [number, number, number, number]; // [第1位, 第2位, 第3位, 第4位]
  timed?: false;
}

// 普通选项题（含图片场景选择、限时题）
export interface ChoiceQuestion {
  id: string;
  type: "choice" | "image-choice";
  text: string;
  options: ChoiceOption[];
  timed?: number; // 秒数，有值则为限时题
}

export type DestinyQuestion = SliderQuestion | RankingQuestion | ChoiceQuestion;

export interface Realm {
  slug: RealmSlug;
  name: string;
  description: string;
  baseLifespan: number; // 基础寿元
}

export interface Outcome {
  slug: OutcomeSlug;
  name: string;
  description: string; // 约100字故事性描述
  keywords: string[]; // 3-4个性格关键词
  personalityNote: string; // 50字性格简述
}

export interface DestinyResult {
  realm: Realm;
  outcome: Outcome;
  lifespan: number;
  scores: DestinyScores;
  mbtiType: string; // e.g. "INTJ"
  resultId: string; // e.g. "huashen-feisheng"
}
```

- [ ] **Step 3: 验证类型编译**

```bash
cd /Users/fujianwei/fanren-wiki && npx tsc --noEmit
```

Expected: 无错误输出

- [ ] **Step 4: Commit**

```bash
git add types/destiny.ts
git commit -m "feat: add destiny type definitions"
```

---

## Task 3: 数据文件 — realms.json 和 outcomes.json

**Files:**
- 创建: `content/destiny/realms.json`
- 创建: `content/destiny/outcomes.json`

- [ ] **Step 1: 创建 `content/destiny/realms.json`**

```json
[
  {
    "slug": "lianqi",
    "name": "炼气期",
    "description": "修仙之路的起点，灵气初入体内，感受到天地法则的第一缕气息。",
    "baseLifespan": 100
  },
  {
    "slug": "zhuji",
    "name": "筑基期",
    "description": "根基已成，修为渐稳，踏上了真正的修仙之途。",
    "baseLifespan": 200
  },
  {
    "slug": "jiedan",
    "name": "结丹期",
    "description": "金丹凝聚，脱离凡俗，寿元大增，已是一方强者。",
    "baseLifespan": 400
  },
  {
    "slug": "yuanying",
    "name": "元婴期",
    "description": "元婴出窍，神通广大，俯瞰芸芸众生，名动一方。",
    "baseLifespan": 1000
  },
  {
    "slug": "huashen",
    "name": "化神期",
    "description": "神魂化虚，与天地同寿，距离飞升仙界仅一步之遥。",
    "baseLifespan": 2500
  }
]
```

- [ ] **Step 2: 创建 `content/destiny/outcomes.json`**

```json
[
  {
    "slug": "caidan",
    "name": "天降机缘·飞升",
    "description": "某日独坐冥想，天地灵气忽然涌动，万古奇缘降临。你并未刻意渡劫，却在浑然不觉间，以低于常规要求的境界渡过劫难。天道垂青，万古奇闻。以你之身，破天而去。",
    "keywords": ["天道宠儿", "机缘非凡", "智慧极致", "野心滔天"],
    "personalityNote": "极致的智慧与野心在你身上完美融合，连天道都为你让路。这样的人，万古难出一个。"
  },
  {
    "slug": "feisheng",
    "name": "飞升",
    "description": "历经无数磨难，你终于站在了渡劫的边缘。雷劫轰落，你义无反顾地迎上去。劫云散尽，一道身影冲破苍穹，消失在仙界的方向。漫长的修仙路，你走到了终点。",
    "keywords": ["意志如铁", "野心勃勃", "突破枷锁", "登临绝顶"],
    "personalityNote": "极致的野心驱使你突破一切枷锁，无论代价几何，你都要抵达那个最高处。"
  },
  {
    "slug": "tupo",
    "name": "境界突破失败陨落",
    "description": "你感受到了突破的契机，却没有等到万全之时便贸然冲关。渡劫雷劫的第三道轰下，你的神魂已经支撑不住。最后一刻，你心中没有悔恨，只有不甘。",
    "keywords": ["勇猛无畏", "贸然冲关", "死于渡劫", "壮志未酬"],
    "personalityNote": "你的勇气超越了你的智慧，在最关键的时刻选择了最冒险的路。这是英雄的死法，也是莽夫的结局。"
  },
  {
    "slug": "shouhu",
    "name": "守护他人牺牲",
    "description": "危急关头，你挡在了同伴身前。那一刻你没有犹豫，重情义的人，从来不会计算代价。你的名字，被那些你守护过的人，铭记了很久很久。",
    "keywords": ["重情重义", "舍命护人", "侠义之心", "情义无价"],
    "personalityNote": "对你而言，守护身边的人比自己的修为更重要。这份情义，是你一生中最闪亮的东西。"
  },
  {
    "slug": "yinshi",
    "name": "隐世",
    "description": "看破了名利场的喧嚣，你选择了一处幽静之地，从此不问世事。岁月悠长，你在山水间参悟天道，逍遥自在。那些曾经的纷争，如今不过是一场过眼云烟。",
    "keywords": ["看破名利", "逍遥自在", "智慧通透", "淡泊宁静"],
    "personalityNote": "智慧让你看透了一切，你选择了最难得的平静。不是消极，而是真正的通透。"
  },
  {
    "slug": "doufa",
    "name": "斗法陨落",
    "description": "你死在了一场激烈的斗法之中。对手比你强，但你没有退缩，战至最后一刻。旁观者说，你死得很壮烈。只是壮烈，终究不是胜利。",
    "keywords": ["莽撞战死", "勇猛有余", "谋略不足", "战死沙场"],
    "personalityNote": "你的勇气无人能及，但战场上光有勇气是不够的。你用生命证明了这一点。"
  },
  {
    "slug": "zuohua",
    "name": "自然坐化",
    "description": "寿元将尽的那一天，你盘膝而坐，回望漫长的修仙岁月。有遗憾，有满足，有说不清的百味杂陈。最终，你平静地闭上了眼睛，化为一缕青烟，消散于天地之间。",
    "keywords": ["平凡修士", "寿终正寝", "岁月悠长", "随遇而安"],
    "personalityNote": "你走完了属于自己的路，不惊天动地，却也踏实完整。平凡，有时候也是一种圆满。"
  }
]
```

- [ ] **Step 3: Commit**

```bash
git add content/destiny/realms.json content/destiny/outcomes.json
git commit -m "feat: add destiny realms and outcomes data"
```

---

## Task 4: 数据文件 — questions.json

**Files:**
- 创建: `content/destiny/questions.json`

- [ ] **Step 1: 创建 `content/destiny/questions.json`**

完整的20道题，按设计文档精确转录。注意：
- `choice`/`image-choice` 题的 `options` 中，`scores` 键名用英文：`courage`/`wisdom`/`loyalty`/`ambition`
- `mbti` 字段格式：`{ "EI": "E" }` 表示给 E 计一票
- Q5 的选项带 `branch` 字段触发分支
- 分支A题 id 前缀 `QA`，分支B题前缀 `QB`，汇合题前缀 `QF`

```json
[
  {
    "id": "Q1",
    "type": "image-choice",
    "text": "你是一名普通农家子弟，某日偶遇一位云游道人，他说你与修仙有缘，愿带你入门。你看了看四周的景色，心中最向往的是哪里？",
    "options": [
      { "text": "云雾缭绕的深山洞府", "scores": { "courage": 5, "ambition": 10 } },
      { "text": "热闹繁华的修仙坊市", "scores": { "courage": 10 }, "mbti": { "EI": "E" } },
      { "text": "宁静清幽的竹林小筑", "scores": { "wisdom": 10 }, "mbti": { "EI": "I" } },
      { "text": "险峻壮阔的悬崖峰顶", "scores": { "courage": 15, "ambition": 5 } }
    ]
  },
  {
    "id": "Q2",
    "type": "choice",
    "text": "入门之后，师父让你选择主修方向：",
    "options": [
      { "text": "攻伐之道，以力破万法", "scores": { "courage": 15, "ambition": 10 } },
      { "text": "辅助炼丹，精研药理", "scores": { "wisdom": 15 }, "mbti": { "SN": "N" } },
      { "text": "阵法机关，以智御敌", "scores": { "wisdom": 10, "courage": 5 }, "mbti": { "SN": "N" } },
      { "text": "剑道修行，追求极致", "scores": { "courage": 10, "ambition": 15 } }
    ]
  },
  {
    "id": "Q3",
    "type": "slider",
    "text": "同门师兄弟向你借一件你珍视的法器，你内心的倾向是？",
    "leftLabel": "慷慨借出",
    "rightLabel": "婉言拒绝",
    "scoring": {
      "left":   { "scores": { "loyalty": 15 }, "mbti": { "TF": "F" } },
      "middle": { "scores": { "loyalty": 7, "wisdom": 7 } },
      "right":  { "scores": { "wisdom": 12 }, "mbti": { "TF": "T" } }
    }
  },
  {
    "id": "Q4",
    "type": "image-choice",
    "text": "外出历练时，你遭遇了一名比你强大的修士，对方似乎并无善意。你环顾四周，选择了——",
    "options": [
      { "text": "正面迎战，以命搏命", "scores": { "courage": 20 }, "mbti": { "JP": "P" } },
      { "text": "先礼后兵，试探对方意图", "scores": { "wisdom": 15 }, "mbti": { "EI": "E" } },
      { "text": "悄然隐匿，静待时机", "scores": { "wisdom": 10, "courage": -5 }, "mbti": { "JP": "J" } },
      { "text": "拔腿就跑，留得青山在", "scores": { "wisdom": 5, "courage": -10 } }
    ]
  },
  {
    "id": "Q5",
    "type": "choice",
    "text": "修炼数年后，你面临一个抉择：",
    "options": [
      { "text": "加入一个强大门派，在纷争中磨砺自己", "scores": { "ambition": 15, "courage": 10 }, "branch": "A" },
      { "text": "独自游历，在江湖中寻找属于自己的机缘", "scores": { "wisdom": 15 }, "mbti": { "JP": "P" }, "branch": "B" }
    ]
  },
  {
    "id": "QA1",
    "type": "choice",
    "text": "【紧急！】门派突遭敌袭，师父命你立刻做出选择：",
    "timed": 5,
    "options": [
      { "text": "冲上前线，保护师门", "scores": { "courage": 20, "loyalty": 15 } },
      { "text": "先保护师弟师妹撤退", "scores": { "loyalty": 20, "wisdom": 10 } }
    ]
  },
  {
    "id": "QA2",
    "type": "slider",
    "text": "战斗中你击败了一名敌方弟子，对方已无力抵抗。你会——",
    "leftLabel": "赶尽杀绝",
    "rightLabel": "手下留情",
    "scoring": {
      "left":   { "scores": { "courage": 10, "loyalty": -10 }, "mbti": { "TF": "T" } },
      "middle": { "scores": { "wisdom": 5 } },
      "right":  { "scores": { "loyalty": 15 }, "mbti": { "TF": "F" } }
    }
  },
  {
    "id": "QA3",
    "type": "ranking",
    "text": "请将以下目标按你的优先级从高到低排序：",
    "options": [
      { "text": "突破境界，追求长生", "dimension": "ambition" },
      { "text": "守护挚友，不离不弃", "dimension": "loyalty" },
      { "text": "名扬天下，威震四方", "dimension": "courage" },
      { "text": "寻找真相，探索天道", "dimension": "wisdom" }
    ],
    "rankScores": [20, 10, 5, 0]
  },
  {
    "id": "QA4",
    "type": "choice",
    "text": "一场惨烈的战斗中，你的至交好友为救你而陨落。此后你——",
    "options": [
      { "text": "化悲痛为力量，誓要变得更强", "scores": { "ambition": 20, "courage": 15 } },
      { "text": "深陷自责，开始反思自己的行事方式", "scores": { "wisdom": 15, "loyalty": 10 } },
      { "text": "发誓为好友复仇，走上了一条更危险的路", "scores": { "courage": 20, "ambition": 10, "loyalty": -5 } }
    ]
  },
  {
    "id": "QA5",
    "type": "image-choice",
    "text": "机缘巧合，你得到了一件传说中的法宝。你选择——",
    "options": [
      { "text": "立刻钻研，将其威力发挥到极致", "scores": { "ambition": 15, "wisdom": 10 } },
      { "text": "秘而不宣，低调行事", "scores": { "wisdom": 20 }, "mbti": { "EI": "I" } },
      { "text": "与同伴分享这个秘密", "scores": { "loyalty": 15 }, "mbti": { "EI": "E" } }
    ]
  },
  {
    "id": "QA6",
    "type": "slider",
    "text": "你站在渡劫的边缘，前方是未知的灵界，身后是你守护了数百年的人和事。你内心的天平——",
    "leftLabel": "义无反顾飞升",
    "rightLabel": "放弃飞升留下",
    "scoring": {
      "left":   { "scores": { "ambition": 20 }, "mbti": { "JP": "P" } },
      "middle": { "scores": { "ambition": 10, "loyalty": 10 } },
      "right":  { "scores": { "loyalty": 20, "ambition": -10 }, "mbti": { "JP": "J" } }
    }
  },
  {
    "id": "QB1",
    "type": "slider",
    "text": "游历途中，你逐渐形成了自己的处世风格：",
    "leftLabel": "广结善缘，八面玲珑",
    "rightLabel": "独来独往，深藏不露",
    "scoring": {
      "left":   { "scores": { "loyalty": 15 }, "mbti": { "EI": "E", "SN": "S" } },
      "middle": { "scores": { "wisdom": 10 } },
      "right":  { "scores": { "wisdom": 15, "ambition": 5 }, "mbti": { "EI": "I" } }
    }
  },
  {
    "id": "QB2",
    "type": "ranking",
    "text": "你发现了一处隐秘的灵脉，同时有三方势力也盯上了这里。请排列你会优先考虑的行动：",
    "options": [
      { "text": "独吞灵脉，快速提升实力", "dimension": "ambition" },
      { "text": "联合最弱一方，共同对抗其他两方", "dimension": "wisdom", "split": true, "splitDimensions": ["wisdom", "loyalty"] },
      { "text": "静观其变，坐收渔翁之利", "dimension": "wisdom" },
      { "text": "主动放弃，避免卷入纷争", "dimension": "wisdom" }
    ],
    "rankScores": [20, 10, 5, 0]
  },
  {
    "id": "QB3",
    "type": "choice",
    "text": "一位隐居的元婴老修士愿意收你为徒，但条件是你必须放弃现有的一切重新修炼。你——",
    "options": [
      { "text": "毫不犹豫答应，这是千载难逢的机遇", "scores": { "ambition": 20 }, "mbti": { "JP": "P" } },
      { "text": "仔细权衡后答应，但留了一手后路", "scores": { "wisdom": 20 }, "mbti": { "JP": "J" } },
      { "text": "婉言谢绝，你不愿受人束缚", "scores": { "wisdom": 10, "ambition": 10 }, "mbti": { "EI": "I" } }
    ]
  },
  {
    "id": "QB4",
    "type": "slider",
    "text": "你无意中得知了一个足以颠覆某大势力的秘密。你会——",
    "leftLabel": "利用秘密为自己谋利",
    "rightLabel": "将秘密永远埋藏",
    "scoring": {
      "left":   { "scores": { "ambition": 15, "wisdom": 5 }, "mbti": { "TF": "T" } },
      "middle": { "scores": { "wisdom": 10 } },
      "right":  { "scores": { "wisdom": 15, "loyalty": 10 }, "mbti": { "TF": "F" } }
    }
  },
  {
    "id": "QB5",
    "type": "image-choice",
    "text": "游历多年后，你站在一个岔路口，三条路摆在面前：",
    "options": [
      { "text": "通往一座古老宗门的山道，隐约有钟声传来", "scores": { "loyalty": 15, "ambition": 10 } },
      { "text": "蜿蜒入深山的小径，据说尽头有一处上古遗迹", "scores": { "wisdom": 20 }, "mbti": { "SN": "N" } },
      { "text": "通往繁华城池的官道，那里机遇与危险并存", "scores": { "courage": 10, "ambition": 15 }, "mbti": { "EI": "E" } }
    ]
  },
  {
    "id": "QB6",
    "type": "choice",
    "text": "经历了漫长的游历，你对修仙之道有了自己的理解：",
    "options": [
      { "text": "修仙是为了超脱，不被任何枷锁束缚", "scores": { "ambition": 20 }, "mbti": { "SN": "N" } },
      { "text": "修仙是为了守护，让身边的人不再受苦", "scores": { "loyalty": 20 }, "mbti": { "TF": "F" } },
      { "text": "修仙是为了求知，探索天地间的一切奥秘", "scores": { "wisdom": 20 }, "mbti": { "SN": "N" } },
      { "text": "修仙是为了活着，活得比任何人都长", "scores": { "ambition": 15, "courage": 10 } }
    ]
  },
  {
    "id": "QF1",
    "type": "ranking",
    "text": "站在人生的某个节点，回望来时的路，请将以下事物按对你的重要程度排序：",
    "options": [
      { "text": "修为与境界的突破", "dimension": "ambition" },
      { "text": "与挚友共度的岁月", "dimension": "loyalty" },
      { "text": "在乱世中的生存智慧", "dimension": "wisdom" },
      { "text": "对天道的探索与感悟", "dimension": "wisdom_sn" }
    ],
    "rankScores": [20, 10, 5, 0]
  },
  {
    "id": "QF2",
    "type": "slider",
    "text": "当你感受到自己寿元将尽，或大限将至，你的内心——",
    "leftLabel": "坦然接受，无怨无悔",
    "rightLabel": "不甘心，仍想挣扎",
    "scoring": {
      "left":   { "scores": { "wisdom": 10, "loyalty": 5 } },
      "middle": { "scores": { "wisdom": 5, "ambition": 5 } },
      "right":  { "scores": { "ambition": 15, "courage": 10 } }
    }
  },
  {
    "id": "QF3",
    "type": "choice",
    "text": "如果可以留下一样东西给后来者，你会选择：",
    "options": [
      { "text": "一部你穷尽一生领悟的功法残卷", "scores": { "wisdom": 15 }, "mbti": { "SN": "N" } },
      { "text": "一封写给挚友的信", "scores": { "loyalty": 20 }, "mbti": { "TF": "F" } },
      { "text": "一张记录了无数秘境位置的地图", "scores": { "ambition": 10, "wisdom": 10 } },
      { "text": "什么都不留，一切随风而去", "scores": { "wisdom": 5 }, "mbti": { "JP": "P" } }
    ]
  }
]
```

- [ ] **Step 2: Commit**

```bash
git add content/destiny/questions.json
git commit -m "feat: add destiny questions data (20 questions with branching)"
```

---

## Task 5: 计分逻辑 lib/destiny.ts

**Files:**
- 创建: `lib/destiny.ts`

- [ ] **Step 1: 写失败测试**

创建 `lib/__tests__/destiny.test.ts`：

```typescript
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
    // 100 * (0.8 + 50/250) = 100 * 1.0 = 100
    expect(calcLifespan(100, 50)).toBe(100);
  });
  it("calculates correctly for huashen with wisdom=0", () => {
    // 2500 * (0.8 + 0) = 2000
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
```

- [ ] **Step 2: 运行测试确认失败**

```bash
cd /Users/fujianwei/fanren-wiki && npx jest lib/__tests__/destiny.test.ts --no-coverage 2>&1 | tail -20
```

Expected: FAIL — `Cannot find module '../destiny'`

- [ ] **Step 3: 实现 `lib/destiny.ts`**

```typescript
// lib/destiny.ts
import realmsData from "@/content/destiny/realms.json";
import outcomesData from "@/content/destiny/outcomes.json";
import type { DestinyScores, MbtiVotes, Realm, Outcome, RealmSlug, OutcomeSlug } from "@/types/destiny";

const realms = realmsData as Realm[];
const outcomes = outcomesData as Outcome[];

/** 根据勇气+野心之和确定境界 */
export function calcRealm(scores: DestinyScores): Realm {
  const sum = scores.courage + scores.ambition;
  let slug: RealmSlug;
  if (sum >= 90) slug = "huashen";
  else if (sum >= 75) slug = "yuanying";
  else if (sum >= 60) slug = "jiedan";
  else if (sum >= 40) slug = "zhuji";
  else slug = "lianqi";
  return realms.find((r) => r.slug === slug)!;
}

/** 计算寿元：基础寿元 × (0.8 + 智慧/250)，取整 */
export function calcLifespan(baseLifespan: number, wisdom: number): number {
  return Math.round(baseLifespan * (0.8 + wisdom / 250));
}

/** 按优先级判断结局 */
export function calcOutcome(scores: DestinyScores, realmSlug: string): Outcome {
  const { wisdom, ambition, loyalty, courage } = scores;
  let slug: OutcomeSlug;

  // 优先级1：彩蛋（1%概率）
  if (wisdom >= 85 && ambition >= 85 && Math.random() < 0.01) {
    slug = "caidan";
  }
  // 优先级2：飞升（仅化神期 + 野心>=80）
  else if (realmSlug === "huashen" && ambition >= 80) {
    slug = "feisheng";
  }
  // 优先级3：境界突破失败陨落
  else if (ambition >= 80 && wisdom < 40) {
    slug = "tupo";
  }
  // 优先级4：守护他人牺牲
  else if (loyalty >= 70) {
    slug = "shouhu";
  }
  // 优先级5：隐世
  else if (wisdom >= 60 && ambition < 50) {
    slug = "yinshi";
  }
  // 优先级6：斗法陨落
  else if (courage >= 70 && wisdom < 40) {
    slug = "doufa";
  }
  // 优先级7：自然坐化
  else {
    slug = "zuohua";
  }

  return outcomes.find((o) => o.slug === slug)!;
}

/** MBTI 投票结果 → 类型字符串，平票取 I/N/F/P */
export function calcMbti(votes: MbtiVotes): string {
  const ei = votes.E > votes.I ? "E" : "I";
  const sn = votes.N > votes.S ? "N" : "S";
  const tf = votes.T > votes.F ? "T" : "F";
  const jp = votes.J > votes.P ? "J" : "P";
  return `${ei}${sn}${tf}${jp}`;
}

/** 将单题得分累加到 scores（clamp 到 0-100）*/
export function applyScores(
  current: DestinyScores,
  delta: Partial<DestinyScores>
): DestinyScores {
  const result = { ...current };
  for (const key of Object.keys(delta) as (keyof DestinyScores)[]) {
    result[key] = Math.max(0, Math.min(100, result[key] + (delta[key] ?? 0)));
  }
  return result;
}
```

- [ ] **Step 4: 运行测试确认通过**

```bash
cd /Users/fujianwei/fanren-wiki && npx jest lib/__tests__/destiny.test.ts --no-coverage 2>&1 | tail -20
```

Expected: PASS, all tests green

- [ ] **Step 5: 类型检查**

```bash
cd /Users/fujianwei/fanren-wiki && npx tsc --noEmit
```

Expected: 无错误

- [ ] **Step 6: Commit**

```bash
git add lib/destiny.ts lib/__tests__/destiny.test.ts
git commit -m "feat: add destiny scoring logic with tests"
```

---

## Task 6: SliderQuestion 组件

**Files:**
- 创建: `components/destiny/SliderQuestion.tsx`

- [ ] **Step 1: 创建组件**

```tsx
// components/destiny/SliderQuestion.tsx
"use client";

interface Props {
  text: string;
  leftLabel: string;
  rightLabel: string;
  value: number; // 0-100
  onChange: (value: number) => void;
  disabled?: boolean;
}

/** 将 0-100 映射到三段：left(0-33) / middle(34-66) / right(67-100) */
export function sliderSegment(value: number): "left" | "middle" | "right" {
  if (value <= 33) return "left";
  if (value <= 66) return "middle";
  return "right";
}

export default function SliderQuestion({ text, leftLabel, rightLabel, value, onChange, disabled }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-bamboo-200 p-8 shadow-sm">
      <p className="text-bamboo-400 text-xs tracking-widest mb-4">程度选择</p>
      <h2 className="text-bamboo-700 font-serif text-lg leading-relaxed mb-8">{text}</h2>

      <div className="flex justify-between text-bamboo-500 text-sm mb-3">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-bamboo-400 cursor-pointer disabled:opacity-50"
      />

      <div className="mt-4 text-center">
        <button
          disabled={disabled}
          onClick={() => {/* confirm handled by parent */}}
          className="bg-bamboo-400 text-white px-8 py-2.5 rounded-full text-sm hover:bg-bamboo-500 transition-colors disabled:opacity-50"
        >
          确认
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/destiny/SliderQuestion.tsx
git commit -m "feat: add SliderQuestion component"
```

---

## Task 7: RankingQuestion 组件

**Files:**
- 创建: `components/destiny/RankingQuestion.tsx`

- [ ] **Step 1: 创建组件**

```tsx
// components/destiny/RankingQuestion.tsx
"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface RankOption {
  id: string;
  text: string;
}

interface Props {
  text: string;
  options: RankOption[];
  order: string[]; // option ids in current order
  onOrderChange: (newOrder: string[]) => void;
  onConfirm: () => void;
  disabled?: boolean;
}

function SortableItem({ id, text, rank }: { id: string; text: string; rank: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-3 p-4 rounded-xl border-2 bg-bamboo-50 border-bamboo-200 cursor-grab select-none
        ${isDragging ? "opacity-50 border-bamboo-400 shadow-lg" : "hover:border-bamboo-300"}`}
    >
      <span className="w-6 h-6 rounded-full bg-bamboo-400 text-white text-xs flex items-center justify-center font-bold shrink-0">
        {rank}
      </span>
      <span className="text-bamboo-700 text-sm">{text}</span>
    </div>
  );
}

export default function RankingQuestion({ text, options, order, onOrderChange, onConfirm, disabled }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = order.indexOf(String(active.id));
      const newIndex = order.indexOf(String(over.id));
      onOrderChange(arrayMove(order, oldIndex, newIndex));
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-bamboo-200 p-8 shadow-sm">
      <p className="text-bamboo-400 text-xs tracking-widest mb-4">拖拽排序</p>
      <h2 className="text-bamboo-700 font-serif text-lg leading-relaxed mb-6">{text}</h2>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3 mb-6">
            {order.map((id, idx) => {
              const opt = options.find((o) => o.id === id)!;
              return <SortableItem key={id} id={id} text={opt.text} rank={idx + 1} />;
            })}
          </div>
        </SortableContext>
      </DndContext>

      <div className="text-center">
        <button
          disabled={disabled}
          onClick={onConfirm}
          className="bg-bamboo-400 text-white px-8 py-2.5 rounded-full text-sm hover:bg-bamboo-500 transition-colors disabled:opacity-50"
        >
          确认排序
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/destiny/RankingQuestion.tsx
git commit -m "feat: add RankingQuestion drag-and-drop component"
```

---

## Task 8: RadarChart 组件（纯 SVG，无外部依赖）

**Files:**
- 创建: `components/destiny/RadarChart.tsx`

- [ ] **Step 1: 创建组件**

```tsx
// components/destiny/RadarChart.tsx
// 纯 SVG 雷达图，无外部依赖

interface Dimension {
  label: string;
  value: number; // 0-100
}

interface Props {
  dimensions: Dimension[];
  size?: number;
}

export default function RadarChart({ dimensions, size = 200 }: Props) {
  const center = size / 2;
  const radius = size * 0.38;
  const n = dimensions.length;

  function angleOf(i: number) {
    return (Math.PI * 2 * i) / n - Math.PI / 2;
  }

  function pointAt(i: number, r: number) {
    const a = angleOf(i);
    return { x: center + r * Math.cos(a), y: center + r * Math.sin(a) };
  }

  // 网格线（3层）
  const gridLevels = [0.33, 0.66, 1.0];

  const dataPoints = dimensions.map((d, i) => pointAt(i, (d.value / 100) * radius));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* 网格 */}
      {gridLevels.map((level, li) => {
        const pts = Array.from({ length: n }, (_, i) => pointAt(i, radius * level));
        const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";
        return <path key={li} d={path} fill="none" stroke="#d4e0cc" strokeWidth="1" />;
      })}

      {/* 轴线 */}
      {Array.from({ length: n }, (_, i) => {
        const p = pointAt(i, radius);
        return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#d4e0cc" strokeWidth="1" />;
      })}

      {/* 数据面积 */}
      <path d={dataPath} fill="#7a9e72" fillOpacity="0.3" stroke="#5a7e52" strokeWidth="2" />

      {/* 数据点 */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#5a7e52" />
      ))}

      {/* 标签 */}
      {dimensions.map((d, i) => {
        const p = pointAt(i, radius + 18);
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="11"
            fill="#3a5c32"
            fontFamily="serif"
          >
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/destiny/RadarChart.tsx
git commit -m "feat: add SVG RadarChart component for destiny result"
```

---

## Task 9: DestinyQuiz 主体组件

**Files:**
- 创建: `components/destiny/DestinyQuiz.tsx`

这是整个测验的核心 client 组件，管理：题目序列（含分支）、各题型交互状态、得分累积、完成后跳转。

- [ ] **Step 1: 创建 `components/destiny/DestinyQuiz.tsx`**

```tsx
// components/destiny/DestinyQuiz.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
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
} from "@/types/destiny";

const allQuestions = questionsData as DestinyQuestion[];

const INIT_SCORES: DestinyScores = { courage: 0, wisdom: 0, loyalty: 0, ambition: 0 };
const INIT_VOTES: MbtiVotes = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

/** 根据分支决定题目序列 */
function buildSequence(branch: "A" | "B" | null): string[] {
  const trunk = ["Q1", "Q2", "Q3", "Q4", "Q5"];
  const branchA = ["QA1", "QA2", "QA3", "QA4", "QA5", "QA6"];
  const branchB = ["QB1", "QB2", "QB3", "QB4", "QB5", "QB6"];
  const finale = ["QF1", "QF2", "QF3"];
  if (branch === "A") return [...trunk, ...branchA, ...finale];
  if (branch === "B") return [...trunk, ...branchB, ...finale];
  return trunk; // 未触发分支时仅主干（不应发生）
}

function applyMbtiVote(votes: MbtiVotes, mbti?: Partial<Record<string, string>>): MbtiVotes {
  if (!mbti) return votes;
  const next = { ...votes };
  for (const [dim, dir] of Object.entries(mbti)) {
    if (dir in next) next[dir as keyof MbtiVotes] += 1;
  }
  return next;
}

export default function DestinyQuiz() {
  const router = useRouter();
  const [branch, setBranch] = useState<"A" | "B" | null>(null);
  const [sequence, setSequence] = useState<string[]>(["Q1", "Q2", "Q3", "Q4", "Q5"]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scores, setScores] = useState<DestinyScores>(INIT_SCORES);
  const [votes, setVotes] = useState<MbtiVotes>(INIT_VOTES);

  // 各题型的临时状态
  const [sliderValue, setSliderValue] = useState(50);
  const [rankOrder, setRankOrder] = useState<string[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  // 限时题倒计时
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const currentId = sequence[currentIdx];
  const question = allQuestions.find((q) => q.id === currentId)!;
  const total = branch ? buildSequence(branch).length : 14; // 估算总题数用于进度条

  // 初始化当前题的临时状态
  useEffect(() => {
    setSliderValue(50);
    setSelectedChoice(null);
    if (question?.type === "ranking") {
      const q = question as RankingQ;
      setRankOrder(q.options.map((_, i) => String(i)));
    }
  }, [currentId]);

  // 限时题倒计时
  useEffect(() => {
    const q = question as ChoiceQuestion;
    if (q?.timed) {
      setTimeLeft(q.timed);
      const interval = setInterval(() => {
        setTimeLeft((t) => {
          if (t === null || t <= 1) {
            clearInterval(interval);
            // 超时：随机选一项
            const opts = (question as ChoiceQuestion).options;
            const randomIdx = Math.floor(Math.random() * opts.length);
            handleChoiceConfirm(opts[randomIdx]);
            return null;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setTimeLeft(null);
    }
  }, [currentId]);

  function advance() {
    setCurrentIdx((i) => i + 1);
  }

  function finish(finalScores: DestinyScores, finalVotes: MbtiVotes) {
    const realm = calcRealm(finalScores);
    const lifespan = calcLifespan(realm.baseLifespan, finalScores.wisdom);
    const outcome = calcOutcome(finalScores, realm.slug);
    const mbtiType = calcMbti(finalVotes);
    const id = `${realm.slug}-${outcome.slug}`;
    router.push(`/destiny/result/${id}?mbti=${mbtiType.toLowerCase()}&lifespan=${lifespan}`);
  }

  function handleChoiceConfirm(option: ChoiceQuestion["options"][number]) {
    if (selectedChoice) return;
    setSelectedChoice(option.text);

    const newScores = applyScores(scores, option.scores);
    const newVotes = applyMbtiVote(votes, option.mbti);
    setScores(newScores);
    setVotes(newVotes);

    // 分支触发
    if (option.branch) {
      const newBranch = option.branch;
      setBranch(newBranch);
      const newSeq = buildSequence(newBranch);
      setSequence(newSeq);
      setTimeout(() => {
        setCurrentIdx(5); // 跳到分支第一题（index 5）
        setSelectedChoice(null);
      }, 400);
      return;
    }

    setTimeout(() => {
      if (currentIdx + 1 >= sequence.length) {
        finish(newScores, newVotes);
      } else {
        advance();
        setSelectedChoice(null);
      }
    }, 400);
  }

  function handleSliderConfirm() {
    const q = question as SliderQ;
    const seg = sliderSegment(sliderValue);
    const scoring = q.scoring[seg];
    const newScores = applyScores(scores, scoring.scores);
    const newVotes = applyMbtiVote(votes, scoring.mbti);
    setScores(newScores);
    setVotes(newVotes);

    if (currentIdx + 1 >= sequence.length) {
      finish(newScores, newVotes);
    } else {
      advance();
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
        const half = Math.floor(pts / 2);
        for (const dim of opt.splitDimensions) {
          newScores = applyScores(newScores, { [dim]: half });
        }
      } else if (opt.dimension === "wisdom_sn") {
        newScores = applyScores(newScores, { wisdom: pts });
        newVotes = applyMbtiVote(newVotes, { SN: "N" });
      } else {
        newScores = applyScores(newScores, { [opt.dimension]: pts });
      }
    });

    setScores(newScores);
    setVotes(newVotes);

    if (currentIdx + 1 >= sequence.length) {
      finish(newScores, newVotes);
    } else {
      advance();
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
                    onClick={() => handleChoiceConfirm(opt)}
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
          disabled={false}
        />
      )}
      {question.type === "slider" && (
        <div className="mt-4 text-center">
          <button
            onClick={handleSliderConfirm}
            className="bg-bamboo-400 text-white px-8 py-2.5 rounded-full text-sm hover:bg-bamboo-500 transition-colors"
          >
            确认
          </button>
        </div>
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
cd /Users/fujianwei/fanren-wiki && npx tsc --noEmit
```

Expected: 无错误

- [ ] **Step 3: Commit**

```bash
git add components/destiny/DestinyQuiz.tsx
git commit -m "feat: add DestinyQuiz client component with branching and all question types"
```

---

## Task 10: /destiny 入口页

**Files:**
- 创建: `app/destiny/page.tsx`

- [ ] **Step 1: 创建入口页**

```tsx
// app/destiny/page.tsx
import DestinyQuiz from "@/components/destiny/DestinyQuiz";

export default function DestinyPage() {
  return <DestinyQuiz />;
}
```

- [ ] **Step 2: 验证页面可访问**

```bash
cd /Users/fujianwei/fanren-wiki && npm run dev &
# 等待启动后访问 http://localhost:3000/destiny
# 确认页面加载，第一题显示正常
```

- [ ] **Step 3: Commit**

```bash
git add app/destiny/page.tsx
git commit -m "feat: add /destiny entry page"
```

---

## Task 11: /destiny/result/[id] 结果页

**Files:**
- 创建: `app/destiny/result/[id]/page.tsx`

结果页为服务端组件，从 URL 解析 `realmSlug-outcomeSlug`，从 query string 读取 `mbti` 和 `lifespan`，静态生成31个合法组合。

- [ ] **Step 1: 创建结果页**

```tsx
// app/destiny/result/[id]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import ShareButtons from "@/components/ShareButtons";
import RadarChart from "@/components/destiny/RadarChart";
import realmsData from "@/content/destiny/realms.json";
import outcomesData from "@/content/destiny/outcomes.json";
import charactersData from "@/content/quiz/characters.json";
import type { Realm, Outcome, RealmSlug, OutcomeSlug } from "@/types/destiny";
import type { Character, MbtiType } from "@/types";

const realms = realmsData as Realm[];
const outcomes = outcomesData as Outcome[];
const characters = charactersData as Character[];

// 31个合法组合
const VALID_COMBOS: { realmSlug: RealmSlug; outcomeSlug: OutcomeSlug }[] = [
  { realmSlug: "huashen", outcomeSlug: "feisheng" },
  ...["lianqi", "zhuji", "jiedan", "yuanying", "huashen"].flatMap((r) =>
    ["tupo", "shouhu", "yinshi", "doufa", "zuohua", "caidan"].map((o) => ({
      realmSlug: r as RealmSlug,
      outcomeSlug: o as OutcomeSlug,
    }))
  ),
];

export function generateStaticParams() {
  return VALID_COMBOS.map(({ realmSlug, outcomeSlug }) => ({
    id: `${realmSlug}-${outcomeSlug}`,
  }));
}

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mbti?: string; lifespan?: string }>;
}

export default async function DestinyResultPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { mbti = "intj", lifespan = "0" } = await searchParams;

  // 解析 id
  const parts = id.split("-");
  if (parts.length < 2) notFound();
  const outcomeSlug = parts[parts.length - 1] as OutcomeSlug;
  const realmSlug = parts.slice(0, -1).join("-") as RealmSlug;

  const realm = realms.find((r) => r.slug === realmSlug);
  const outcome = outcomes.find((o) => o.slug === outcomeSlug);
  if (!realm || !outcome) notFound();

  const mbtiUpper = mbti.toUpperCase() as MbtiType;
  const character = characters.find((c) => c.mbti === mbtiUpper) ?? characters[0];

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fanren-wiki.vercel.app";
  const resultUrl = `${baseUrl}/destiny/result/${id}?mbti=${mbti}&lifespan=${lifespan}`;

  const isCaidan = outcomeSlug === "caidan";

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">

      {/* 第一层：修仙人生 */}
      <div className="bg-white rounded-2xl border border-bamboo-200 p-8 shadow-sm mb-6">
        <p className="text-bamboo-400 text-xs tracking-widest mb-2 text-center">你的修仙人生</p>
        <h1 className="text-4xl font-serif font-bold text-bamboo-700 text-center mb-1">{realm.name}</h1>
        <p className="text-bamboo-500 text-sm text-center mb-4">{realm.description}</p>
        <p className="text-center text-bamboo-600 mb-6">
          你活了 <span className="font-bold text-bamboo-700 text-xl">{lifespan}</span> 岁
        </p>
        <div className="flex justify-center mb-4">
          <span className={`text-white text-sm font-bold px-4 py-1.5 rounded-full tracking-widest
            ${isCaidan ? "bg-yellow-500" : "bg-bamboo-400"}`}>
            {outcome.name}
          </span>
        </div>
        <p className="text-bamboo-600 text-sm leading-relaxed text-center">
          {outcome.description}
        </p>
      </div>

      {/* 第二层：性格分析 */}
      <div className="bg-white rounded-2xl border border-bamboo-200 p-8 shadow-sm mb-6">
        <p className="text-bamboo-400 text-xs tracking-widest mb-4 text-center">你的性格分析</p>
        <div className="flex justify-center mb-4">
          <RadarChart
            dimensions={[
              { label: "勇气", value: 50 },
              { label: "智慧", value: 50 },
              { label: "情义", value: 50 },
              { label: "野心", value: 50 },
            ]}
            size={180}
          />
        </div>
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {outcome.keywords.map((kw) => (
            <span key={kw} className="bg-bamboo-100 text-bamboo-600 text-xs px-3 py-1 rounded-full border border-bamboo-200">
              {kw}
            </span>
          ))}
        </div>
        <p className="text-bamboo-600 text-sm leading-relaxed text-center">{outcome.personalityNote}</p>
      </div>

      {/* 第三层：命运镜像 */}
      <div className="bg-white rounded-2xl border border-bamboo-200 p-8 shadow-sm mb-6">
        <p className="text-bamboo-400 text-xs tracking-widest mb-4 text-center">你的命运镜像</p>
        <p className="text-bamboo-500 text-sm text-center mb-2">你与</p>
        <h2 className="text-3xl font-serif font-bold text-bamboo-700 text-center mb-1">{character.name}</h2>
        <p className="text-bamboo-500 text-xs text-center mb-4">{character.title} · {character.mbti}</p>
        <p className="text-bamboo-600 text-sm leading-relaxed text-center mb-4">
          {character.description}
        </p>
        <div className="bg-bamboo-50 border-l-4 border-bamboo-300 rounded-r-lg px-5 py-4">
          <p className="text-bamboo-500 text-xs mb-1">若你身处人界</p>
          <p className="text-bamboo-700 text-sm font-serif leading-relaxed italic">
            「{character.quote}」
          </p>
        </div>
      </div>

      {/* 底部操作 */}
      <div className="bg-bamboo-100 rounded-2xl border border-bamboo-200 p-6 mb-6">
        <p className="text-bamboo-600 text-sm text-center mb-4">分享你的修仙命运 ✨</p>
        <ShareButtons characterName={character.name} mbti={character.mbti} resultUrl={resultUrl} />
      </div>

      <div className="text-center">
        <Link href="/destiny" className="text-bamboo-500 text-sm hover:text-bamboo-700 underline underline-offset-4">
          重新测试
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 类型检查**

```bash
cd /Users/fujianwei/fanren-wiki && npx tsc --noEmit
```

Expected: 无错误

- [ ] **Step 3: Commit**

```bash
git add app/destiny/result/[id]/page.tsx
git commit -m "feat: add destiny result page with 31 static routes"
```

---

## Task 12: 端到端手动验证

- [ ] **Step 1: 启动开发服务器**

```bash
cd /Users/fujianwei/fanren-wiki && npm run dev
```

- [ ] **Step 2: 验证完整流程**

访问 `http://localhost:3000/destiny`，完成以下检查：

1. Q1 图片场景选择 → 选项可点击，进入 Q2
2. Q3 滑动条 → 拖动后点击确认，进入 Q4
3. Q5 选择分支A → 进入 QA1（限时题），确认5秒倒计时显示
4. QA3 排序拖拽 → 拖动排序后点击确认排序
5. 完成全部题目 → 自动跳转至 `/destiny/result/[id]?mbti=...&lifespan=...`
6. 结果页三层内容完整显示（境界+寿元+结局+雷达图+角色镜像）
7. 分享按钮可复制链接

- [ ] **Step 3: 验证分支B流程**

重新访问 `/destiny`，Q5 选择分支B，确认进入 QB1-QB6，最终跳转结果页

- [ ] **Step 4: 验证直接访问结果页**

访问 `http://localhost:3000/destiny/result/huashen-feisheng?mbti=intj&lifespan=2100`
确认页面正常渲染，不报404

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: destiny simulation complete - all routes and components working"
```

---


## 文件结构

```
content/destiny/
  questions.json       ← 20道题（含分支逻辑、滑动条三段加分、排序递减加分）
  characters.json      ← 沿用 content/quiz/characters.json（16个角色）
  outcomes.json        ← 7种结局的故事文案
  realms.json          ← 5个境界的描述文案

lib/
  destiny.ts           ← 计分、境界、寿元、结局、MBTI计算逻辑

types/
  destiny.ts           ← DestinyQuestion、Realm、Outcome、DestinyResult 类型

app/
  destiny/
    page.tsx           ← 入口页（服务端组件，静态）
  destiny/result/[id]/
    page.tsx           ← 结果页（服务端组件，generateStaticParams 生成31个组合）

components/
  destiny/
    DestinyQuiz.tsx    ← 测验主体（client组件，管理全部状态）
    SliderQuestion.tsx ← 滑动条题型
    RankingQuestion.tsx← 排序拖拽题型（依赖 @dnd-kit/core）
    TimedQuestion.tsx  ← 限时题（普通选项+倒计时）
    RadarChart.tsx     ← 四维度雷达图（SVG，无外部依赖）
```

---
