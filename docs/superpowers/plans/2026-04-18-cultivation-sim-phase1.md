# 凡人修仙传·命运模拟 Phase 1 实现计划（核心游戏引擎）

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建命运模拟游戏的核心引擎：游戏状态、灵根开局、境界/寿命系统、UI 状态面板、基础事件循环骨架、道具数据、市场系统。

**Architecture:** 新建 `/app/game` 路由，独立于现有 `/destiny` 测试流程。游戏状态用 React Context + useReducer 管理，所有数值逻辑放在 `/lib/game/` 下纯函数中，UI 组件放在 `/components/game/`。内容数据（事件池、道具、境界）放在 `/content/game/` JSON 文件中。

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS v4, Jest 30 (单元测试)

---

## 文件结构总览

```
新建文件：
  types/game.ts                        # 所有游戏类型定义
  lib/game/engine.ts                   # 纯函数：灵根、境界、寿命、修为计算
  lib/game/items.ts                    # 纯函数：道具效果、市场逻辑
  lib/__tests__/game-engine.test.ts    # 引擎单元测试
  lib/__tests__/game-items.test.ts     # 道具单元测试
  content/game/realms.json             # 5个境界数据
  content/game/items.json              # 所有道具数据（丹药+阵法）
  content/game/events-lianqi.json      # 炼气期事件池（骨架，3个示例事件）
  app/game/page.tsx                    # 游戏入口页（开局流程）
  app/game/play/page.tsx               # 游戏主界面
  components/game/GameProvider.tsx     # Context + useReducer 状态管理
  components/game/StatusPanel.tsx      # UI 状态面板（修为/寿命/道具/状态）
  components/game/SpiritRootGate.tsx   # 开局灵根获取动画
  components/game/EventCard.tsx        # 事件展示+选项卡片
  components/game/MarketModal.tsx      # 市场弹窗

修改文件：
  components/Navbar.tsx                # 添加"修仙模拟"导航链接
```


---

## Task 1: 游戏类型定义

**Files:**
- Create: `types/game.ts`

- [ ] **Step 1: 写 types/game.ts**

```typescript
// types/game.ts

export type SpiritRootType = "tianling" | "shuang" | "san" | "wei";
export type RealmSlug = "lianqi" | "zhuji" | "jiedan" | "yuanying" | "huashen";
export type SectPath = "zhengdao" | "modao" | "sanxiu";
export type InjuryLevel = "none" | "light" | "heavy" | "dying";
export type ItemId =
  | "yangshang_dan" | "huixue_dan" | "juqi_dan" | "yanshou_dan"
  | "dixin_dan" | "xumingdan"
  | "zhujidan" | "juchengdan" | "butian_dan" | "jiuqu_dan" | "jiangyun_dan"
  | "juling_zhen" | "huti_zhen" | "tiangang_zhen";

export interface SpiritRoot {
  type: SpiritRootType;
  name: string;           // "天灵根" | "双灵根" | "三灵根" | "伪灵根"
  cultivationMult: number; // 修为倍率: 2.0 | 1.4 | 1.0 | 0.5
  fortuneRange: [number, number]; // fortune 值范围
}

export interface RealmConfig {
  slug: RealmSlug;
  name: string;
  normalLifespan: number;  // 正常寿命上限（年）
  limitLifespan: number;   // 极限寿命上限（年）
  // 事件寿命消耗（年）
  eventCost: { min: number; max: number };
  dungeonCost: { min: number; max: number };
  battleCost: { min: number; max: number };
  // 闭关寿命消耗（年）
  retreatCost: { short: number; mid: number; long: number };
  // 闭关修为增加（基准值，三灵根×1.0）
  retreatXp: { short: number; mid: number; long: number };
  // 冲关基础成功率（修为100%时）
  breakthroughRate: number; // 0-1
  // 冲关失败陨落概率
  failDeathRate: number;    // 0-1
  // 冲关消耗寿命
  breakthroughCost: number;
}

export interface ItemConfig {
  id: ItemId;
  name: string;
  category: "mechanism" | "breakthrough" | "array";
  description: string;
  buyPrice: number | null;   // null = 不可购买
  sellPrice: number | null;  // null = 不可出售
  effect: ItemEffect;
}

export type ItemEffect =
  | { type: "heal_injury" }                        // 养伤丹/回血丹
  | { type: "add_xp"; amount: number }             // 聚气丹
  | { type: "add_lifespan"; amount: number }       // 延寿丹
  | { type: "clear_emotion" }                      // 涤心丹
  | { type: "auto_save" }                          // 续命丹（濒死自动触发）
  | { type: "breakthrough_bonus"; realmFrom: RealmSlug; bonus: number } // 突破类丹药
  | { type: "heart_demon_bonus"; bonus: number }   // 九曲灵参丸
  | { type: "retreat_xp_bonus"; mult: number; breakthrough_bonus: number; dungeon_safe: boolean } // 阵法

export interface Inventory {
  [itemId: string]: number; // itemId -> 数量
}

// 情绪系统（仅影响结丹→元婴心魔关）
export interface EmotionState {
  positive: number; // 0-100，正面情绪总值
  negative: number; // 0-100，负面情绪总值
}

// 仇人池
export interface Enemy {
  id: string;
  name: string;
  realmSlug: RealmSlug;
  sourceEventId: string;
}

export interface GameState {
  // 开局
  fortune: number;           // 1-100，机遇值，全程不变
  spiritRoot: SpiritRoot;    // 灵根

  // 当前境界
  realmSlug: RealmSlug;
  xp: number;                // 修为进度 0-100（百分比）
  lifespan: number;          // 当前剩余寿命（年）
  lifespanMax: number;       // 当前寿命上限（年）

  // 资源
  lingshi: number;           // 灵石数量
  inventory: Inventory;      // 道具背包

  // 状态
  injury: InjuryLevel;
  sectPath: SectPath | null; // null = 尚未选择
  emotion: EmotionState;
  enemies: Enemy[];          // 仇人池

  // 隐藏字段
  fate: number;              // 天命值 0-100，初始50，飞升时揭晓
  rootIntact: boolean;       // 根基是否稳固
  rootDamageCount: number;   // 续命丹触发次数（每次-5%冲关）

  // 经验值（冲关失败积累）
  breakthroughExp: number;   // 0-15（%），每次失败+3，上限15

  // 游戏流程
  phase: "gate" | "playing" | "breakthrough" | "ended";
  endingType: "ascend" | "death_battle" | "death_heart" | "death_break" | "natural" | null;

  // 事件历史（用于因果链）
  eventHistory: string[];    // 已触发事件 id 列表
}

export type GameAction =
  | { type: "START_GAME"; spiritRoot: SpiritRoot; fortune: number }
  | { type: "CONSUME_LIFESPAN"; years: number }
  | { type: "ADD_XP"; points: number }
  | { type: "ADD_LINGSHI"; amount: number }
  | { type: "ADD_ITEM"; itemId: ItemId; count: number }
  | { type: "USE_ITEM"; itemId: ItemId }
  | { type: "SET_INJURY"; level: InjuryLevel }
  | { type: "ADD_EMOTION"; positive: number; negative: number }
  | { type: "ADD_ENEMY"; enemy: Enemy }
  | { type: "REMOVE_ENEMY"; enemyId: string }
  | { type: "RECORD_EVENT"; eventId: string }
  | { type: "ATTEMPT_BREAKTHROUGH" }
  | { type: "BREAKTHROUGH_SUCCESS" }
  | { type: "BREAKTHROUGH_FAIL" }
  | { type: "END_GAME"; endingType: GameState["endingType"] };

// 事件系统类型（骨架，Phase 2 扩展）
export interface GameEvent {
  id: string;
  realmSlug: RealmSlug;
  type: "passive" | "active";
  category: "normal" | "karma" | "dungeon" | "battle";
  title: string;
  description: string;
  options: EventOption[];
}

export interface EventOption {
  text: string;
  requires?: { itemId?: ItemId; lingshi?: number };
  effects: EventEffect[];
}

export type EventEffect =
  | { type: "lingshi"; amount: number }
  | { type: "item"; itemId: ItemId; count: number }
  | { type: "injury"; level: InjuryLevel }
  | { type: "emotion"; positive?: number; negative?: number }
  | { type: "fate"; amount: number }
  | { type: "add_enemy"; enemyId: string }
  | { type: "trigger_karma"; karmaId: string };
```

- [ ] **Step 2: 确认 TypeScript 编译通过**

```bash
npx tsc --noEmit 2>&1 | head -30
```

期望：无错误（或仅已有错误，不新增）

- [ ] **Step 3: Commit**

```bash
cd /Users/fujianwei/fanren-wiki
git add types/game.ts
git commit -m "feat(game): add core game type definitions"
```


---

## Task 2: 境界/灵根配置数据

**Files:**
- Create: `content/game/realms.json`
- Create: `content/game/spirit-roots.json`

- [ ] **Step 1: 写 content/game/realms.json**

```json
[
  {
    "slug": "lianqi",
    "name": "炼气期",
    "normalLifespan": 100,
    "limitLifespan": 150,
    "eventCost": { "min": 4, "max": 5 },
    "dungeonCost": { "min": 5, "max": 10 },
    "battleCost": { "min": 2, "max": 4 },
    "retreatCost": { "short": 3, "mid": 8, "long": 15 },
    "retreatXp": { "short": 5, "mid": 10, "long": 18 },
    "breakthroughRate": 0.70,
    "failDeathRate": 0.02,
    "breakthroughCost": 8
  },
  {
    "slug": "zhuji",
    "name": "筑基期",
    "normalLifespan": 200,
    "limitLifespan": 300,
    "eventCost": { "min": 5, "max": 8 },
    "dungeonCost": { "min": 15, "max": 25 },
    "battleCost": { "min": 4, "max": 6 },
    "retreatCost": { "short": 8, "mid": 20, "long": 40 },
    "retreatXp": { "short": 5, "mid": 10, "long": 18 },
    "breakthroughRate": 0.50,
    "failDeathRate": 0.05,
    "breakthroughCost": 25
  },
  {
    "slug": "jiedan",
    "name": "结丹期",
    "normalLifespan": 500,
    "limitLifespan": 800,
    "eventCost": { "min": 15, "max": 25 },
    "dungeonCost": { "min": 50, "max": 80 },
    "battleCost": { "min": 10, "max": 15 },
    "retreatCost": { "short": 20, "mid": 50, "long": 100 },
    "retreatXp": { "short": 5, "mid": 10, "long": 18 },
    "breakthroughRate": 0.20,
    "failDeathRate": 0.90,
    "breakthroughCost": 80
  },
  {
    "slug": "yuanying",
    "name": "元婴期",
    "normalLifespan": 1000,
    "limitLifespan": 1500,
    "eventCost": { "min": 40, "max": 60 },
    "dungeonCost": { "min": 100, "max": 150 },
    "battleCost": { "min": 20, "max": 30 },
    "retreatCost": { "short": 50, "mid": 120, "long": 250 },
    "retreatXp": { "short": 5, "mid": 10, "long": 18 },
    "breakthroughRate": 0.35,
    "failDeathRate": 0.50,
    "breakthroughCost": 200
  },
  {
    "slug": "huashen",
    "name": "化神期",
    "normalLifespan": 2000,
    "limitLifespan": 3000,
    "eventCost": { "min": 80, "max": 120 },
    "dungeonCost": { "min": 200, "max": 300 },
    "battleCost": { "min": 40, "max": 60 },
    "retreatCost": { "short": 100, "mid": 250, "long": 500 },
    "retreatXp": { "short": 5, "mid": 10, "long": 18 },
    "breakthroughRate": 0,
    "failDeathRate": 0,
    "breakthroughCost": 0
  }
]
```

- [ ] **Step 2: 写 content/game/spirit-roots.json**

```json
[
  {
    "type": "tianling",
    "name": "天灵根",
    "cultivationMult": 2.0,
    "fortuneRange": [91, 100]
  },
  {
    "type": "shuang",
    "name": "双灵根",
    "cultivationMult": 1.4,
    "fortuneRange": [81, 90]
  },
  {
    "type": "san",
    "name": "三灵根",
    "cultivationMult": 1.0,
    "fortuneRange": [51, 80]
  },
  {
    "type": "wei",
    "name": "伪灵根",
    "cultivationMult": 0.5,
    "fortuneRange": [1, 50]
  }
]
```

- [ ] **Step 3: Commit**

```bash
cd /Users/fujianwei/fanren-wiki
git add content/game/realms.json content/game/spirit-roots.json
git commit -m "feat(game): add realm and spirit root config data"
```


---

## Task 3: 道具配置数据

**Files:**
- Create: `content/game/items.json`

- [ ] **Step 1: 写 content/game/items.json**

```json
[
  {
    "id": "yangshang_dan",
    "name": "养伤丹",
    "category": "mechanism",
    "description": "消除任意等级受伤状态",
    "buyPrice": 150,
    "sellPrice": 135,
    "effect": { "type": "heal_injury" }
  },
  {
    "id": "huixue_dan",
    "name": "回血丹",
    "category": "mechanism",
    "description": "消除受伤状态（同养伤丹，价格更低）",
    "buyPrice": 50,
    "sellPrice": 45,
    "effect": { "type": "heal_injury" }
  },
  {
    "id": "juqi_dan",
    "name": "聚气丹",
    "category": "mechanism",
    "description": "当前境界修为+10点（受灵根倍率影响）",
    "buyPrice": 80,
    "sellPrice": 72,
    "effect": { "type": "add_xp", "amount": 10 }
  },
  {
    "id": "yanshou_dan",
    "name": "延寿丹",
    "category": "mechanism",
    "description": "寿命+50年，不超极限上限",
    "buyPrice": 200,
    "sellPrice": 180,
    "effect": { "type": "add_lifespan", "amount": 50 }
  },
  {
    "id": "dixin_dan",
    "name": "涤心丹",
    "category": "mechanism",
    "description": "消除一种负面情绪分数（负面情绪清零）",
    "buyPrice": 300,
    "sellPrice": 270,
    "effect": { "type": "clear_emotion" }
  },
  {
    "id": "xuming_dan",
    "name": "续命丹",
    "category": "mechanism",
    "description": "濒死自动触发保命，根基受损-5%冲关",
    "buyPrice": null,
    "sellPrice": 3000,
    "effect": { "type": "auto_save" }
  },
  {
    "id": "zhuji_dan",
    "name": "筑基丹",
    "category": "breakthrough",
    "description": "炼气→筑基冲关成功率+15%",
    "buyPrice": 500,
    "sellPrice": 450,
    "effect": { "type": "breakthrough_bonus", "realmFrom": "lianqi", "bonus": 0.15 }
  },
  {
    "id": "jucheng_dan",
    "name": "降尘丹",
    "category": "breakthrough",
    "description": "筑基→结丹冲关成功率+15%",
    "buyPrice": 800,
    "sellPrice": 720,
    "effect": { "type": "breakthrough_bonus", "realmFrom": "zhuji", "bonus": 0.15 }
  },
  {
    "id": "butian_dan",
    "name": "补天丹",
    "category": "breakthrough",
    "description": "结丹→元婴冲关成功率+15%（极稀有）",
    "buyPrice": 50000,
    "sellPrice": 45000,
    "effect": { "type": "breakthrough_bonus", "realmFrom": "jiedan", "bonus": 0.15 }
  },
  {
    "id": "jiuqu_dan",
    "name": "九曲灵参丸",
    "category": "breakthrough",
    "description": "结丹→元婴战胜心魔概率+20%（不可出售）",
    "buyPrice": null,
    "sellPrice": null,
    "effect": { "type": "heart_demon_bonus", "bonus": 0.20 }
  },
  {
    "id": "jiangyun_dan",
    "name": "绛云丹",
    "category": "breakthrough",
    "description": "元婴→化神冲关成功率+15%",
    "buyPrice": 2000,
    "sellPrice": 1800,
    "effect": { "type": "breakthrough_bonus", "realmFrom": "yuanying", "bonus": 0.15 }
  },
  {
    "id": "juling_zhen",
    "name": "聚灵阵",
    "category": "array",
    "description": "闭关修为+10%，副本降低轻伤概率",
    "buyPrice": 300,
    "sellPrice": 270,
    "effect": { "type": "retreat_xp_bonus", "mult": 0.10, "breakthrough_bonus": 0.08, "dungeon_safe": false }
  },
  {
    "id": "huti_zhen",
    "name": "护体阵",
    "category": "array",
    "description": "冲关+12%，副本抵挡一次致命伤",
    "buyPrice": 800,
    "sellPrice": 720,
    "effect": { "type": "retreat_xp_bonus", "mult": 0, "breakthrough_bonus": 0.12, "dungeon_safe": true }
  },
  {
    "id": "tiangang_zhen",
    "name": "天罡阵",
    "category": "array",
    "description": "冲关+20%，闭关+25%，副本大幅降低死亡（不可购买）",
    "buyPrice": null,
    "sellPrice": 5000,
    "effect": { "type": "retreat_xp_bonus", "mult": 0.25, "breakthrough_bonus": 0.20, "dungeon_safe": true }
  }
]
```

- [ ] **Step 2: Commit**

```bash
cd /Users/fujianwei/fanren-wiki
git add content/game/items.json
git commit -m "feat(game): add item config data (pills and arrays)"
```


---

## Task 4: 核心游戏引擎（纯函数）

**Files:**
- Create: `lib/game/engine.ts`
- Create: `lib/__tests__/game-engine.test.ts`

- [ ] **Step 1: 写失败测试 lib/__tests__/game-engine.test.ts**

```typescript
import {
  getSpiritRoot,
  calcXpGain,
  calcLifespanCost,
  calcBreakthroughRate,
  calcHeartDemonRate,
  calcFateAscendRate,
  getRealmConfig,
  isBreakthroughUnlocked,
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
  it("不超过100", () => {
    expect(calcXpGain(10, 2.0, 95)).toBe(5); // 95+20=115 -> capped at 100, gain=5
  });
});

describe("calcLifespanCost", () => {
  it("炼气期普通事件4-5年", () => {
    const cost = calcLifespanCost("lianqi", "event");
    expect(cost).toBeGreaterThanOrEqual(4);
    expect(cost).toBeLessThanOrEqual(5);
  });
  it("结丹期副本50-80年", () => {
    for (let i = 0; i < 20; i++) {
      const cost = calcLifespanCost("jiedan", "dungeon");
      expect(cost).toBeGreaterThanOrEqual(50);
      expect(cost).toBeLessThanOrEqual(80);
    }
  });
  it("魔道路线炼气期-30%", () => {
    const base = calcLifespanCost("lianqi", "event", false);
    const modao = calcLifespanCost("lianqi", "event", true);
    expect(modao).toBeLessThan(base);
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
  it("灵石500=+3%，上限+9%", () => {
    const base = calcBreakthroughRate({
      realmSlug: "lianqi", xp: 100, itemBonus: 0,
      lingshi: 0, rootIntact: false, rootDamageCount: 0, breakthroughExp: 0,
    });
    const with500 = calcBreakthroughRate({
      realmSlug: "lianqi", xp: 100, itemBonus: 0,
      lingshi: 500, rootIntact: false, rootDamageCount: 0, breakthroughExp: 0,
    });
    const with9000 = calcBreakthroughRate({
      realmSlug: "lianqi", xp: 100, itemBonus: 0,
      lingshi: 9000, rootIntact: false, rootDamageCount: 0, breakthroughExp: 0,
    });
    expect(with500 - base).toBeCloseTo(0.03, 2);
    expect(with9000 - base).toBeCloseTo(0.09, 2); // capped at +9%
  });
  it("续命丹副作用每次-5%", () => {
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
  it("经验值上限+15%", () => {
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
});

describe("calcHeartDemonRate", () => {
  it("差值≥50 -> 80%", () => {
    expect(calcHeartDemonRate(80, 20)).toBeCloseTo(0.80);
  });
  it("差值20-49 -> 60%", () => {
    expect(calcHeartDemonRate(60, 30)).toBeCloseTo(0.60);
  });
  it("差值0-19 -> 40%", () => {
    expect(calcHeartDemonRate(40, 30)).toBeCloseTo(0.40);
  });
  it("差值-20到-1 -> 20%", () => {
    expect(calcHeartDemonRate(20, 30)).toBeCloseTo(0.20);
  });
  it("差值≤-21 -> 5%", () => {
    expect(calcHeartDemonRate(0, 50)).toBeCloseTo(0.05);
  });
});

describe("calcFateAscendRate", () => {
  it("天命0-20 -> 10%", () => {
    expect(calcFateAscendRate(10)).toBeCloseTo(0.10);
  });
  it("天命21-40 -> 25%", () => {
    expect(calcFateAscendRate(30)).toBeCloseTo(0.25);
  });
  it("天命41-60 -> 45%", () => {
    expect(calcFateAscendRate(50)).toBeCloseTo(0.45);
  });
  it("天命61-80 -> 65%", () => {
    expect(calcFateAscendRate(70)).toBeCloseTo(0.65);
  });
  it("天命81-100 -> 85%", () => {
    expect(calcFateAscendRate(90)).toBeCloseTo(0.85);
  });
});
```

- [ ] **Step 2: 运行测试，确认全部失败**

```bash
cd /Users/fujianwei/fanren-wiki
npx jest lib/__tests__/game-engine.test.ts 2>&1 | tail -20
```

期望：所有测试 FAIL（模块找不到）

- [ ] **Step 3: 实现 lib/game/engine.ts**

```typescript
import realmsData from "@/content/game/realms.json";
import spiritRootsData from "@/content/game/spirit-roots.json";
import type { RealmSlug, SpiritRoot, RealmConfig } from "@/types/game";

const realms = realmsData as RealmConfig[];
const spiritRoots = spiritRootsData as SpiritRoot[];

export function getRealmConfig(slug: RealmSlug): RealmConfig {
  return realms.find((r) => r.slug === slug)!;
}

export function getSpiritRoot(fortune: number): SpiritRoot {
  return spiritRoots.find(
    (r) => fortune >= r.fortuneRange[0] && fortune <= r.fortuneRange[1]
  ) ?? spiritRoots[spiritRoots.length - 1];
}

// 修为增加：基础值 × 灵根倍率，结果叠加到当前xp，不超100
// 返回实际增加量（考虑上限）
export function calcXpGain(
  basePoints: number,
  cultivationMult: number,
  currentXp: number = 0
): number {
  const gained = Math.round(basePoints * cultivationMult);
  const capped = Math.min(100, currentXp + gained) - currentXp;
  return Math.max(0, capped);
}

// 寿命消耗：随机范围内取值，魔道路线按境界减少
export function calcLifespanCost(
  realmSlug: RealmSlug,
  eventType: "event" | "dungeon" | "battle" | "retreat_short" | "retreat_mid" | "retreat_long",
  isModao: boolean = false
): number {
  const realm = getRealmConfig(realmSlug);
  let min: number, max: number;

  if (eventType === "event") { min = realm.eventCost.min; max = realm.eventCost.max; }
  else if (eventType === "dungeon") { min = realm.dungeonCost.min; max = realm.dungeonCost.max; }
  else if (eventType === "battle") { min = realm.battleCost.min; max = realm.battleCost.max; }
  else if (eventType === "retreat_short") { min = max = realm.retreatCost.short; }
  else if (eventType === "retreat_mid") { min = max = realm.retreatCost.mid; }
  else { min = max = realm.retreatCost.long; }

  const base = min === max ? min : Math.floor(Math.random() * (max - min + 1)) + min;

  if (!isModao) return base;

  // 魔道路线寿命消耗减少
  const modaoReduction: Record<RealmSlug, number> = {
    lianqi: 0.30,
    zhuji: 0.25,
    jiedan: 0.20,
    yuanying: 0.10,
    huashen: 0.05,
  };
  return Math.round(base * (1 - modaoReduction[realmSlug]));
}

// 修为进度是否达到冲关资格（≥90%）
export function isBreakthroughUnlocked(xp: number): boolean {
  return xp >= 90;
}

// 修为进度对冲关成功率的倍率
function xpMultiplier(xp: number): number {
  if (xp >= 100) return 1.0;
  if (xp >= 99) return 0.85;
  if (xp >= 95) return 0.70;
  if (xp >= 90) return 0.50;
  return 0;
}

export interface BreakthroughParams {
  realmSlug: RealmSlug;
  xp: number;
  itemBonus: number;       // 道具加成总和（0-1）
  lingshi: number;         // 灵石数量
  rootIntact: boolean;     // 根基是否稳固
  rootDamageCount: number; // 续命丹触发次数
  breakthroughExp: number; // 经验值加成（0-15%）
}

export function calcBreakthroughRate(params: BreakthroughParams): number {
  const realm = getRealmConfig(params.realmSlug);
  const base = realm.breakthroughRate * xpMultiplier(params.xp);

  const lingshiBonus = Math.min(0.09, Math.floor(params.lingshi / 500) * 0.03);
  const rootBonus = params.rootIntact ? 0.10 : 0;
  const rootDamage = params.rootDamageCount * 0.05;
  const expBonus = Math.min(0.15, params.breakthroughExp / 100);

  const total = base + params.itemBonus + lingshiBonus + rootBonus - rootDamage + expBonus;
  return Math.min(0.99, Math.max(0.01, total));
}

// 心魔关：正负情绪差值 → 战胜心魔概率（仅结丹→元婴）
export function calcHeartDemonRate(positive: number, negative: number): number {
  const diff = positive - negative;
  if (diff >= 50) return 0.80;
  if (diff >= 20) return 0.60;
  if (diff >= 0) return 0.40;
  if (diff >= -20) return 0.20;
  return 0.05;
}

// 天命值 → 飞升成功率
export function calcFateAscendRate(fate: number): number {
  if (fate >= 81) return 0.85;
  if (fate >= 61) return 0.65;
  if (fate >= 41) return 0.45;
  if (fate >= 21) return 0.25;
  return 0.10;
}

// 闭关修为增加（基准值 × 灵根倍率，阵法加成）
export function calcRetreatXp(
  realmSlug: RealmSlug,
  duration: "short" | "mid" | "long",
  cultivationMult: number,
  arrayMult: number = 0  // 阵法额外倍率（如聚灵阵+0.10）
): number {
  const realm = getRealmConfig(realmSlug);
  const base = realm.retreatXp[duration];
  return Math.round(base * cultivationMult * (1 + arrayMult));
}
```

- [ ] **Step 4: 运行测试，确认全部通过**

```bash
cd /Users/fujianwei/fanren-wiki
npx jest lib/__tests__/game-engine.test.ts 2>&1 | tail -20
```

期望：所有测试 PASS

- [ ] **Step 5: Commit**

```bash
cd /Users/fujianwei/fanren-wiki
git add lib/game/engine.ts lib/__tests__/game-engine.test.ts
git commit -m "feat(game): add core engine pure functions with full test coverage"
```


---

## Task 5: 游戏状态管理（GameProvider）

**Files:**
- Create: `components/game/GameProvider.tsx`

- [ ] **Step 1: 写 components/game/GameProvider.tsx**

```tsx
"use client";

import React, { createContext, useContext, useReducer } from "react";
import type { GameState, GameAction, SpiritRoot, ItemId } from "@/types/game";
import { getRealmConfig, calcXpGain } from "@/lib/game/engine";
import itemsData from "@/content/game/items.json";

const REALM_ORDER = ["lianqi", "zhuji", "jiedan", "yuanying", "huashen"] as const;

function nextRealm(current: string): string | null {
  const idx = REALM_ORDER.indexOf(current as typeof REALM_ORDER[number]);
  return idx < REALM_ORDER.length - 1 ? REALM_ORDER[idx + 1] : null;
}

function createInitialState(spiritRoot: SpiritRoot, fortune: number): GameState {
  const realm = getRealmConfig("lianqi");
  return {
    fortune,
    spiritRoot,
    realmSlug: "lianqi",
    xp: 0,
    lifespan: realm.normalLifespan,
    lifespanMax: realm.normalLifespan,
    lingshi: 0,
    inventory: {},
    injury: "none",
    sectPath: null,
    emotion: { positive: 0, negative: 0 },
    enemies: [],
    fate: 50,
    rootIntact: true,
    rootDamageCount: 0,
    breakthroughExp: 0,
    phase: "playing",
    endingType: null,
    eventHistory: [],
  };
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_GAME":
      return createInitialState(action.spiritRoot, action.fortune);

    case "CONSUME_LIFESPAN": {
      const newLifespan = Math.max(0, state.lifespan - action.years);
      if (newLifespan === 0) {
        return { ...state, lifespan: 0, phase: "ended", endingType: "natural" };
      }
      return { ...state, lifespan: newLifespan };
    }

    case "ADD_XP": {
      const gained = calcXpGain(action.points, state.spiritRoot.cultivationMult, state.xp);
      return { ...state, xp: Math.min(100, state.xp + gained) };
    }

    case "ADD_LINGSHI":
      return { ...state, lingshi: Math.max(0, state.lingshi + action.amount) };

    case "ADD_ITEM": {
      const current = state.inventory[action.itemId] ?? 0;
      return {
        ...state,
        inventory: { ...state.inventory, [action.itemId]: current + action.count },
      };
    }

    case "USE_ITEM": {
      const count = state.inventory[action.itemId] ?? 0;
      if (count <= 0) return state;
      const item = (itemsData as any[]).find((i) => i.id === action.itemId);
      if (!item) return state;

      let next = {
        ...state,
        inventory: { ...state.inventory, [action.itemId]: count - 1 },
      };

      const effect = item.effect;
      if (effect.type === "heal_injury") {
        next = { ...next, injury: "none" };
      } else if (effect.type === "add_xp") {
        const gained = calcXpGain(effect.amount, state.spiritRoot.cultivationMult, state.xp);
        next = { ...next, xp: Math.min(100, state.xp + gained) };
      } else if (effect.type === "add_lifespan") {
        const realm = getRealmConfig(state.realmSlug);
        const newMax = Math.min(realm.limitLifespan, state.lifespanMax + effect.amount);
        const newLifespan = Math.min(newMax, state.lifespan + effect.amount);
        next = { ...next, lifespan: newLifespan, lifespanMax: newMax };
      } else if (effect.type === "clear_emotion") {
        next = { ...next, emotion: { ...state.emotion, negative: 0 } };
      }
      return next;
    }

    case "SET_INJURY": {
      if (action.level === "dying") {
        // 自动触发续命丹（如果有）
        const xuming = state.inventory["xuming_dan"] ?? 0;
        if (xuming > 0) {
          return {
            ...state,
            injury: "heavy",
            rootIntact: false,
            rootDamageCount: state.rootDamageCount + 1,
            inventory: { ...state.inventory, xuming_dan: xuming - 1 },
          };
        }
        return { ...state, phase: "ended", endingType: "death_battle" };
      }
      return { ...state, injury: action.level };
    }

    case "ADD_EMOTION": {
      const pos = Math.min(100, state.emotion.positive + (action.positive ?? 0));
      const neg = Math.min(100, state.emotion.negative + (action.negative ?? 0));
      return { ...state, emotion: { positive: pos, negative: neg } };
    }

    case "ADD_ENEMY":
      return { ...state, enemies: [...state.enemies, action.enemy] };

    case "REMOVE_ENEMY":
      return { ...state, enemies: state.enemies.filter((e) => e.id !== action.enemyId) };

    case "RECORD_EVENT":
      return { ...state, eventHistory: [...state.eventHistory, action.eventId] };

    case "ATTEMPT_BREAKTHROUGH":
      return { ...state, phase: "breakthrough" };

    case "BREAKTHROUGH_SUCCESS": {
      const next = nextRealm(state.realmSlug);
      if (!next) {
        // 化神期飞升
        return { ...state, phase: "ended", endingType: "ascend" };
      }
      const newRealm = getRealmConfig(next as typeof REALM_ORDER[number]);
      return {
        ...state,
        realmSlug: next as typeof REALM_ORDER[number],
        xp: 0,
        lifespanMax: newRealm.normalLifespan,
        lifespan: newRealm.normalLifespan,
        phase: "playing",
      };
    }

    case "BREAKTHROUGH_FAIL": {
      const exp = Math.min(15, state.breakthroughExp + 3);
      return { ...state, breakthroughExp: exp, phase: "playing" };
    }

    case "END_GAME":
      return { ...state, phase: "ended", endingType: action.endingType };

    default:
      return state;
  }
}

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  // 初始占位状态，START_GAME action 会替换
  const placeholder: GameState = {
    fortune: 50,
    spiritRoot: { type: "san", name: "三灵根", cultivationMult: 1.0, fortuneRange: [51, 80] },
    realmSlug: "lianqi",
    xp: 0,
    lifespan: 100,
    lifespanMax: 100,
    lingshi: 0,
    inventory: {},
    injury: "none",
    sectPath: null,
    emotion: { positive: 0, negative: 0 },
    enemies: [],
    fate: 50,
    rootIntact: true,
    rootDamageCount: 0,
    breakthroughExp: 0,
    phase: "gate",
    endingType: null,
    eventHistory: [],
  };

  const [state, dispatch] = useReducer(gameReducer, placeholder);
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
```

- [ ] **Step 2: 确认 TypeScript 编译通过**

```bash
cd /Users/fujianwei/fanren-wiki
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 3: Commit**

```bash
cd /Users/fujianwei/fanren-wiki
git add components/game/GameProvider.tsx
git commit -m "feat(game): add GameProvider with useReducer state management"
```


---

## Task 6: UI 状态面板组件

**Files:**
- Create: `components/game/StatusPanel.tsx`

- [ ] **Step 1: 写 components/game/StatusPanel.tsx**

```tsx
"use client";

import { useGame } from "./GameProvider";
import type { RealmSlug } from "@/types/game";

const REALM_NAMES: Record<RealmSlug, string> = {
  lianqi: "炼气期",
  zhuji: "筑基期",
  jiedan: "结丹期",
  yuanying: "元婴期",
  huashen: "化神期",
};

const INJURY_LABELS = {
  none: null,
  light: { label: "轻伤", desc: "修炼速度-20%，闭关-20%", color: "#f59e0b" },
  heavy: { label: "重伤", desc: "修炼速度-50%，无法进副本", color: "#ef4444" },
  dying: { label: "濒死", desc: "修炼速度-80%，无法主动行动", color: "#7f1d1d" },
};

export default function StatusPanel() {
  const { state } = useGame();
  const {
    realmSlug, xp, lifespan, lifespanMax, lingshi, inventory, injury, enemies,
    breakthroughExp, spiritRoot,
  } = state;

  const lifespanPct = lifespanMax > 0 ? (lifespan / lifespanMax) * 100 : 0;
  const lifespanLow = lifespanPct < 20;
  const canBreakthrough = xp >= 90;
  const injuryInfo = INJURY_LABELS[injury];

  // 机制类道具（平时展示）
  const mechanismItems = [
    { id: "yangshang_dan", name: "养伤丹" },
    { id: "huixue_dan", name: "回血丹" },
    { id: "juqi_dan", name: "聚气丹" },
    { id: "yanshou_dan", name: "延寿丹" },
    { id: "dixin_dan", name: "涤心丹" },
    { id: "xuming_dan", name: "续命丹" },
  ].filter((item) => (inventory[item.id] ?? 0) > 0);

  // 阵法
  const arrays = [
    { id: "juling_zhen", name: "聚灵阵" },
    { id: "huti_zhen", name: "护体阵" },
    { id: "tiangang_zhen", name: "天罡阵" },
  ].filter((item) => (inventory[item.id] ?? 0) > 0);

  return (
    <div
      className="rounded-xl p-4 text-sm"
      style={{ backgroundColor: "#111a16", border: "1px solid #1a2820" }}
    >
      {/* 境界 + 灵根 */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-serif font-bold" style={{ color: "#e8f0ec" }}>
          {REALM_NAMES[realmSlug]}
        </span>
        <span className="text-xs" style={{ color: "#6a8878" }}>
          {spiritRoot.name}
        </span>
      </div>

      {/* 修为条 */}
      <div className="mb-2">
        <div className="flex justify-between text-xs mb-1" style={{ color: "#6a8878" }}>
          <span>修为</span>
          <span style={{ color: canBreakthrough ? "#4ade9a" : "#6a8878" }}>
            {xp}%{canBreakthrough ? " · 可冲关" : ""}
          </span>
        </div>
        <div className="h-1.5 rounded-full" style={{ backgroundColor: "#1a2820" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${xp}%`,
              backgroundColor: xp >= 100 ? "#d4a843" : "#4ade9a",
              boxShadow: xp >= 90 ? "0 0 6px #4ade9a88" : "none",
            }}
          />
        </div>
      </div>

      {/* 寿命条 */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span style={{ color: "#6a8878" }}>寿命</span>
          <span style={{ color: lifespanLow ? "#ef4444" : "#6a8878" }}>
            {lifespan}/{lifespanMax}年
          </span>
        </div>
        <div className="h-1.5 rounded-full" style={{ backgroundColor: "#1a2820" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${lifespanPct}%`,
              backgroundColor: lifespanLow ? "#ef4444" : "#6fedb5",
              boxShadow: lifespanLow ? "0 0 6px #ef444488" : "none",
            }}
          />
        </div>
      </div>

      {/* 受伤状态（有伤才显示） */}
      {injuryInfo && (
        <div
          className="rounded-lg px-3 py-2 mb-3 text-xs"
          style={{ backgroundColor: "#1a0a0a", border: `1px solid ${injuryInfo.color}44` }}
        >
          <span style={{ color: injuryInfo.color }}>⚠ {injuryInfo.label}</span>
          <span className="ml-2" style={{ color: "#6a8878" }}>{injuryInfo.desc}</span>
        </div>
      )}

      {/* 仇人池 */}
      {enemies.length > 0 && (
        <div className="text-xs mb-3" style={{ color: "#ef4444" }}>
          仇人 ×{enemies.length}
        </div>
      )}

      {/* 经验值 */}
      {breakthroughExp > 0 && (
        <div className="text-xs mb-3" style={{ color: "#6a8878" }}>
          冲关经验 +{breakthroughExp}%
        </div>
      )}

      {/* 资源行 */}
      <div className="flex flex-wrap gap-2 text-xs" style={{ color: "#b8ccc2" }}>
        <span>灵石 ×{lingshi}</span>
        {mechanismItems.map((item) => (
          <span key={item.id}>
            {item.name} ×{inventory[item.id]}
          </span>
        ))}
        {arrays.map((item) => (
          <span key={item.id} style={{ color: "#d4a843" }}>
            {item.name}
          </span>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 确认 TypeScript 编译通过**

```bash
cd /Users/fujianwei/fanren-wiki
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
cd /Users/fujianwei/fanren-wiki
git add components/game/StatusPanel.tsx
git commit -m "feat(game): add StatusPanel UI component"
```


---

## Task 7: 开局灵根获取动画（SpiritRootGate）

**Files:**
- Create: `components/game/SpiritRootGate.tsx`

- [ ] **Step 1: 写 components/game/SpiritRootGate.tsx**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { getSpiritRoot } from "@/lib/game/engine";
import type { SpiritRoot } from "@/types/game";

interface Props {
  onComplete: (spiritRoot: SpiritRoot, fortune: number) => void;
}

const ROOT_COLORS: Record<string, string> = {
  tianling: "#d4a843",
  shuang: "#4ade9a",
  san: "#6fedb5",
  wei: "#4a6a58",
};

export default function SpiritRootGate({ onComplete }: Props) {
  const [phase, setPhase] = useState<"rolling" | "revealed">("rolling");
  const [fortune, setFortune] = useState(0);
  const [spiritRoot, setSpiritRoot] = useState<SpiritRoot | null>(null);
  const [displayFortune, setDisplayFortune] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    // 随机生成最终 fortune（1-100，循环直到 >95 的轮回效果用动画模拟）
    const finalFortune = Math.floor(Math.random() * 100) + 1;
    setFortune(finalFortune);

    // 滚动数字动画（2秒内快速变化，最后停在 finalFortune）
    let tick = 0;
    const totalTicks = 60; // ~2秒 @30fps
    intervalRef.current = setInterval(() => {
      tick++;
      if (tick >= totalTicks) {
        clearInterval(intervalRef.current!);
        setDisplayFortune(finalFortune);
        const root = getSpiritRoot(finalFortune);
        setSpiritRoot(root);
        setTimeout(() => setPhase("revealed"), 300);
      } else {
        // 随机显示数字，最后几帧收敛
        const noise = tick < totalTicks - 10
          ? Math.floor(Math.random() * 100) + 1
          : finalFortune;
        setDisplayFortune(noise);
      }
      frameRef.current = tick;
    }, 33);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const handleStart = () => {
    if (spiritRoot) onComplete(spiritRoot, fortune);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div
        className="w-full max-w-sm rounded-2xl p-8 text-center"
        style={{ backgroundColor: "#111a16", border: "1px solid #1a2820" }}
      >
        <p className="text-xs tracking-widest mb-6" style={{ color: "#6a8878" }}>
          轮回入场
        </p>

        {/* 机遇值滚动 */}
        <div className="mb-6">
          <div
            className="text-6xl font-bold font-serif mb-2 tabular-nums"
            style={{ color: phase === "revealed" && spiritRoot
              ? ROOT_COLORS[spiritRoot.type]
              : "#4ade9a"
            }}
          >
            {displayFortune}
          </div>
          <p className="text-xs" style={{ color: "#6a8878" }}>机遇值</p>
        </div>

        {/* 灵根结果 */}
        {phase === "revealed" && spiritRoot && (
          <div className="mb-8 animate-pulse">
            <div
              className="text-2xl font-serif font-bold mb-1"
              style={{ color: ROOT_COLORS[spiritRoot.type] }}
            >
              {spiritRoot.name}
            </div>
            <p className="text-xs" style={{ color: "#6a8878" }}>
              修炼速度 ×{spiritRoot.cultivationMult}
            </p>
          </div>
        )}

        {/* 开始按钮 */}
        {phase === "revealed" && (
          <button
            onClick={handleStart}
            className="btn-primary w-full py-3 rounded-full font-medium"
          >
            踏入炼气期
          </button>
        )}

        {phase === "rolling" && (
          <div className="text-xs" style={{ color: "#4a6a58" }}>
            天机推演中……
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/fujianwei/fanren-wiki
git add components/game/SpiritRootGate.tsx
git commit -m "feat(game): add SpiritRootGate opening animation"
```


---

## Task 8: 事件卡片 + 炼气期示例事件池

**Files:**
- Create: `components/game/EventCard.tsx`
- Create: `content/game/events-lianqi.json`

- [ ] **Step 1: 写 content/game/events-lianqi.json（3个示例事件，骨架）**

```json
[
  {
    "id": "lq_001",
    "realmSlug": "lianqi",
    "type": "passive",
    "category": "normal",
    "title": "山中偶遇受伤散修",
    "description": "修炼途中，你遇到一位受伤的散修倒在路边，他神情警惕，但身上似乎有颗品质不错的丹药。",
    "options": [
      {
        "text": "出手救治，以诚相待",
        "effects": [
          { "type": "fate", "amount": 3 },
          { "type": "lingshi", "amount": -20 }
        ]
      },
      {
        "text": "视而不见，继续赶路",
        "effects": []
      },
      {
        "text": "趁机索要丹药，以武力威胁",
        "effects": [
          { "type": "lingshi", "amount": 80 },
          { "type": "emotion", "positive": 0, "negative": 8 },
          { "type": "fate", "amount": -6 },
          { "type": "add_enemy", "enemyId": "enemy_lq_001" }
        ]
      }
    ]
  },
  {
    "id": "lq_002",
    "realmSlug": "lianqi",
    "type": "active",
    "category": "normal",
    "title": "宗门任务：采集灵草",
    "description": "宗门布告栏上有一则任务：前往后山采集三株灵草，报酬为100灵石。",
    "options": [
      {
        "text": "接取任务，前往后山",
        "effects": [
          { "type": "lingshi", "amount": 100 },
          { "type": "emotion", "positive": 6, "negative": 0 }
        ]
      },
      {
        "text": "暂时不接，继续修炼",
        "effects": []
      }
    ]
  },
  {
    "id": "lq_003",
    "realmSlug": "lianqi",
    "type": "passive",
    "category": "karma",
    "title": "昔日恩情回报",
    "description": "你曾救治过的散修找上门来，带来了一颗筑基丹作为报答，神情真诚。",
    "options": [
      {
        "text": "收下丹药，道谢",
        "effects": [
          { "type": "item", "itemId": "zhuji_dan", "count": 1 },
          { "type": "emotion", "positive": 5, "negative": 0 }
        ]
      }
    ]
  }
]
```

- [ ] **Step 2: 写 components/game/EventCard.tsx**

```tsx
"use client";

import type { GameEvent, EventOption } from "@/types/game";
import { useGame } from "./GameProvider";
import { calcLifespanCost } from "@/lib/game/engine";

interface Props {
  event: GameEvent;
  onChoose: (option: EventOption, optionIndex: number) => void;
}

export default function EventCard({ event, onChoose }: Props) {
  const { state } = useGame();
  const { realmSlug, lingshi, inventory } = state;

  function canAfford(option: EventOption): boolean {
    if (!option.requires) return true;
    if (option.requires.lingshi && lingshi < option.requires.lingshi) return false;
    if (option.requires.itemId && (inventory[option.requires.itemId] ?? 0) < 1) return false;
    return true;
  }

  return (
    <div
      className="rounded-xl p-6"
      style={{ backgroundColor: "#111a16", border: "1px solid #1a2820" }}
    >
      {/* 事件类型标签 */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: event.type === "passive" ? "#1a2820" : "#1a2820",
            color: event.type === "passive" ? "#6a8878" : "#4ade9a",
            border: `1px solid ${event.type === "passive" ? "#2a3828" : "#4ade9a44"}`,
          }}
        >
          {event.type === "passive" ? "遭遇" : "主动"}
        </span>
        <span className="text-xs" style={{ color: "#4a6a58" }}>
          {event.category === "karma" ? "因果" : event.category === "dungeon" ? "副本" : event.category === "battle" ? "战斗" : "普通"}
        </span>
      </div>

      {/* 标题 */}
      <h3 className="font-serif font-bold mb-3" style={{ color: "#e8f0ec" }}>
        {event.title}
      </h3>

      {/* 描述 */}
      <p className="text-sm leading-relaxed mb-5" style={{ color: "#b8ccc2" }}>
        {event.description}
      </p>

      {/* 选项 */}
      <div className="flex flex-col gap-2">
        {event.options.map((option, idx) => {
          const affordable = canAfford(option);
          return (
            <button
              key={idx}
              onClick={() => affordable && onChoose(option, idx)}
              disabled={!affordable}
              className="text-left px-4 py-3 rounded-lg text-sm transition-all"
              style={{
                backgroundColor: affordable ? "#1a2820" : "#0e1610",
                border: `1px solid ${affordable ? "#2a3828" : "#1a2820"}`,
                color: affordable ? "#e8f0ec" : "#4a6a58",
                cursor: affordable ? "pointer" : "not-allowed",
              }}
              onMouseEnter={(e) => {
                if (affordable) e.currentTarget.style.borderColor = "#4ade9a44";
              }}
              onMouseLeave={(e) => {
                if (affordable) e.currentTarget.style.borderColor = "#2a3828";
              }}
            >
              <span className="mr-2" style={{ color: "#4ade9a" }}>
                {String.fromCharCode(65 + idx)}.
              </span>
              {option.text}
              {option.requires?.lingshi && (
                <span className="ml-2 text-xs" style={{ color: "#6a8878" }}>
                  （需要 {option.requires.lingshi} 灵石）
                </span>
              )}
              {option.requires?.itemId && (
                <span className="ml-2 text-xs" style={{ color: "#6a8878" }}>
                  （需要道具）
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
cd /Users/fujianwei/fanren-wiki
git add content/game/events-lianqi.json components/game/EventCard.tsx
git commit -m "feat(game): add EventCard component and lianqi event pool skeleton"
```


---

## Task 9: 市场弹窗组件

**Files:**
- Create: `components/game/MarketModal.tsx`

- [ ] **Step 1: 写 components/game/MarketModal.tsx**

```tsx
"use client";

import { useState, useMemo } from "react";
import { useGame } from "./GameProvider";
import itemsData from "@/content/game/items.json";
import type { ItemId } from "@/types/game";

interface Props {
  onClose: () => void;
}

interface ItemData {
  id: string;
  name: string;
  category: string;
  description: string;
  buyPrice: number | null;
  sellPrice: number | null;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MarketModal({ onClose }: Props) {
  const { state, dispatch } = useGame();
  const { lingshi, inventory } = state;

  // 每次打开市场，随机展示3个可购买商品
  const shopItems = useMemo(() => {
    const buyable = (itemsData as ItemData[]).filter((i) => i.buyPrice !== null);
    return shuffle(buyable).slice(0, 3);
  }, []);

  const [tab, setTab] = useState<"buy" | "sell">("buy");
  const [message, setMessage] = useState<string | null>(null);

  function showMessage(msg: string) {
    setMessage(msg);
    setTimeout(() => setMessage(null), 2000);
  }

  function handleBuy(item: ItemData) {
    if (!item.buyPrice || lingshi < item.buyPrice) {
      showMessage("灵石不足");
      return;
    }
    dispatch({ type: "ADD_LINGSHI", amount: -item.buyPrice });
    dispatch({ type: "ADD_ITEM", itemId: item.id as ItemId, count: 1 });
    showMessage(`购得 ${item.name}`);
  }

  function handleSell(item: ItemData) {
    const count = inventory[item.id] ?? 0;
    if (count <= 0 || !item.sellPrice) return;
    dispatch({ type: "ADD_LINGSHI", amount: item.sellPrice });
    dispatch({ type: "USE_ITEM", itemId: item.id as ItemId }); // removes 1
    showMessage(`售出 ${item.name}，获得 ${item.sellPrice} 灵石`);
  }

  const sellableItems = (itemsData as ItemData[]).filter(
    (i) => i.sellPrice !== null && (inventory[i.id] ?? 0) > 0
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6"
        style={{ backgroundColor: "#111a16", border: "1px solid #1a2820" }}
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif font-bold" style={{ color: "#e8f0ec" }}>
            灵市
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-sm" style={{ color: "#4ade9a" }}>
              灵石 ×{lingshi}
            </span>
            <button
              onClick={onClose}
              className="text-xs"
              style={{ color: "#6a8878" }}
            >
              关闭
            </button>
          </div>
        </div>

        {/* Tab 切换 */}
        <div className="flex gap-2 mb-4">
          {(["buy", "sell"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-1.5 rounded-full text-xs transition-all"
              style={{
                backgroundColor: tab === t ? "#4ade9a" : "#1a2820",
                color: tab === t ? "#0a0e0d" : "#6a8878",
              }}
            >
              {t === "buy" ? "购买" : "出售"}
            </button>
          ))}
        </div>

        {/* 消息提示 */}
        {message && (
          <div
            className="text-xs text-center mb-3 py-2 rounded-lg"
            style={{ backgroundColor: "#1a2820", color: "#4ade9a" }}
          >
            {message}
          </div>
        )}

        {/* 购买列表 */}
        {tab === "buy" && (
          <div className="flex flex-col gap-2">
            {shopItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between px-3 py-2 rounded-lg"
                style={{ backgroundColor: "#1a2820", border: "1px solid #2a3828" }}
              >
                <div>
                  <div className="text-sm font-medium" style={{ color: "#e8f0ec" }}>
                    {item.name}
                  </div>
                  <div className="text-xs" style={{ color: "#6a8878" }}>
                    {item.description}
                  </div>
                </div>
                <button
                  onClick={() => handleBuy(item)}
                  disabled={!item.buyPrice || lingshi < item.buyPrice}
                  className="ml-3 px-3 py-1 rounded-full text-xs whitespace-nowrap"
                  style={{
                    backgroundColor: (!item.buyPrice || lingshi < item.buyPrice) ? "#1a2820" : "#4ade9a",
                    color: (!item.buyPrice || lingshi < item.buyPrice) ? "#4a6a58" : "#0a0e0d",
                    cursor: (!item.buyPrice || lingshi < item.buyPrice) ? "not-allowed" : "pointer",
                  }}
                >
                  {item.buyPrice} 灵石
                </button>
              </div>
            ))}
            <p className="text-xs text-center mt-2" style={{ color: "#4a6a58" }}>
              每次进入市场随机展示3件商品
            </p>
          </div>
        )}

        {/* 出售列表 */}
        {tab === "sell" && (
          <div className="flex flex-col gap-2">
            {sellableItems.length === 0 && (
              <p className="text-xs text-center py-4" style={{ color: "#4a6a58" }}>
                背包中没有可出售的道具
              </p>
            )}
            {sellableItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between px-3 py-2 rounded-lg"
                style={{ backgroundColor: "#1a2820", border: "1px solid #2a3828" }}
              >
                <div>
                  <div className="text-sm font-medium" style={{ color: "#e8f0ec" }}>
                    {item.name} ×{inventory[item.id]}
                  </div>
                </div>
                <button
                  onClick={() => handleSell(item)}
                  className="ml-3 px-3 py-1 rounded-full text-xs"
                  style={{ backgroundColor: "#1a2820", color: "#4ade9a", border: "1px solid #4ade9a44" }}
                >
                  售出 {item.sellPrice}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/fujianwei/fanren-wiki
git add components/game/MarketModal.tsx
git commit -m "feat(game): add MarketModal with buy/sell tabs"
```


---

## Task 10: 游戏主界面页面

**Files:**
- Create: `app/game/page.tsx`
- Create: `app/game/play/page.tsx`

- [ ] **Step 1: 写 app/game/page.tsx（开局入口）**

```tsx
"use client";

import { useState } from "react";
import { GameProvider, useGame } from "@/components/game/GameProvider";
import SpiritRootGate from "@/components/game/SpiritRootGate";
import type { SpiritRoot } from "@/types/game";
import { useRouter } from "next/navigation";

function GameEntry() {
  const { dispatch } = useGame();
  const router = useRouter();

  function handleGateComplete(spiritRoot: SpiritRoot, fortune: number) {
    dispatch({ type: "START_GAME", spiritRoot, fortune });
    router.push("/game/play");
  }

  return <SpiritRootGate onComplete={handleGateComplete} />;
}

export default function GamePage() {
  return (
    <GameProvider>
      <GameEntry />
    </GameProvider>
  );
}
```

- [ ] **Step 2: 写 app/game/play/page.tsx（主游戏界面骨架）**

```tsx
"use client";

import { useState, useEffect } from "react";
import { useGame } from "@/components/game/GameProvider";
import StatusPanel from "@/components/game/StatusPanel";
import EventCard from "@/components/game/EventCard";
import MarketModal from "@/components/game/MarketModal";
import { calcLifespanCost, calcXpGain, getRealmConfig } from "@/lib/game/engine";
import type { GameEvent, EventOption } from "@/types/game";
import eventsLianqi from "@/content/game/events-lianqi.json";
import { useRouter } from "next/navigation";

// 合并所有境界事件池（Phase 2 会扩展）
const ALL_EVENTS: GameEvent[] = eventsLianqi as GameEvent[];

function pickEvent(realmSlug: string, history: string[]): GameEvent | null {
  const pool = ALL_EVENTS.filter((e) => e.realmSlug === realmSlug);
  if (pool.length === 0) return null;
  // 优先未出现过的事件
  const unseen = pool.filter((e) => !history.includes(e.id));
  const candidates = unseen.length > 0 ? unseen : pool;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export default function GamePlayPage() {
  const { state, dispatch } = useGame();
  const router = useRouter();
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [showMarket, setShowMarket] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  // 如果还没开始游戏（直接访问 /game/play），跳回入口
  useEffect(() => {
    if (state.phase === "gate") {
      router.replace("/game");
    }
  }, [state.phase, router]);

  // 游戏结束跳转
  useEffect(() => {
    if (state.phase === "ended") {
      router.push(`/game/ending?type=${state.endingType}`);
    }
  }, [state.phase, state.endingType, router]);

  function addLog(msg: string) {
    setLog((prev) => [msg, ...prev].slice(0, 5));
  }

  function handleNextEvent() {
    const event = pickEvent(state.realmSlug, state.eventHistory);
    if (!event) {
      addLog("此境界已无更多事件，请冲关或闭关。");
      return;
    }
    // 消耗寿命
    const cost = calcLifespanCost(state.realmSlug, "event", state.sectPath === "modao");
    dispatch({ type: "CONSUME_LIFESPAN", years: cost });
    // 修为增加（普通事件+10基准）
    dispatch({ type: "ADD_XP", points: 10 });
    dispatch({ type: "RECORD_EVENT", eventId: event.id });
    setCurrentEvent(event);
    addLog(`消耗 ${cost} 年寿命，修为+${Math.round(10 * state.spiritRoot.cultivationMult)}`);
  }

  function handleEventChoice(option: EventOption) {
    // 应用事件效果
    for (const effect of option.effects) {
      if (effect.type === "lingshi") {
        dispatch({ type: "ADD_LINGSHI", amount: effect.amount });
      } else if (effect.type === "item") {
        dispatch({ type: "ADD_ITEM", itemId: effect.itemId, count: effect.count });
        addLog(`获得 ${effect.itemId} ×${effect.count}`);
      } else if (effect.type === "injury") {
        dispatch({ type: "SET_INJURY", level: effect.level });
        addLog(`受伤：${effect.level}`);
      } else if (effect.type === "emotion") {
        dispatch({ type: "ADD_EMOTION", positive: effect.positive ?? 0, negative: effect.negative ?? 0 });
      } else if (effect.type === "fate") {
        // fate 是隐藏字段，不显示日志
      }
    }
    setCurrentEvent(null);
  }

  function handleRetreat(duration: "short" | "mid" | "long") {
    const realm = getRealmConfig(state.realmSlug);
    const cost = realm.retreatCost[duration];
    const xpBase = realm.retreatXp[duration];
    dispatch({ type: "CONSUME_LIFESPAN", years: cost });
    dispatch({ type: "ADD_XP", points: xpBase });
    addLog(`闭关（${duration === "short" ? "短期" : duration === "mid" ? "中期" : "长期"}）：消耗 ${cost} 年，修为+${Math.round(xpBase * state.spiritRoot.cultivationMult)}`);
  }

  if (state.phase === "gate" || state.phase === "ended") return null;

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* 状态面板 */}
      <div className="mb-4">
        <StatusPanel />
      </div>

      {/* 当前事件 */}
      {currentEvent ? (
        <div className="mb-4">
          <EventCard event={currentEvent} onChoose={handleEventChoice} />
        </div>
      ) : (
        /* 主操作区 */
        <div
          className="rounded-xl p-4 mb-4"
          style={{ backgroundColor: "#111a16", border: "1px solid #1a2820" }}
        >
          <p className="text-xs mb-4 text-center" style={{ color: "#6a8878" }}>
            选择下一步行动
          </p>
          <div className="flex flex-col gap-2">
            {/* 经历事件 */}
            <button
              onClick={handleNextEvent}
              className="btn-primary py-2.5 rounded-lg text-sm"
            >
              经历事件
            </button>

            {/* 闭关 */}
            <div className="flex gap-2">
              {(["short", "mid", "long"] as const).map((d) => {
                const realm = getRealmConfig(state.realmSlug);
                const cost = realm.retreatCost[d];
                const label = d === "short" ? "短期" : d === "mid" ? "中期" : "长期";
                return (
                  <button
                    key={d}
                    onClick={() => handleRetreat(d)}
                    className="flex-1 py-2 rounded-lg text-xs btn-secondary"
                  >
                    闭关{label}
                    <span className="block" style={{ color: "#4a6a58" }}>{cost}年</span>
                  </button>
                );
              })}
            </div>

            {/* 市场 */}
            <button
              onClick={() => setShowMarket(true)}
              className="btn-secondary py-2.5 rounded-lg text-sm"
            >
              前往灵市
            </button>

            {/* 冲关（修为≥90才显示） */}
            {state.xp >= 90 && (
              <button
                onClick={() => dispatch({ type: "ATTEMPT_BREAKTHROUGH" })}
                className="py-2.5 rounded-lg text-sm font-medium"
                style={{
                  backgroundColor: "#1a2820",
                  border: "1px solid #d4a84344",
                  color: "#d4a843",
                }}
              >
                尝试冲关 → {state.realmSlug === "lianqi" ? "筑基期" :
                  state.realmSlug === "zhuji" ? "结丹期" :
                  state.realmSlug === "jiedan" ? "元婴期" :
                  state.realmSlug === "yuanying" ? "化神期" : "飞升"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* 操作日志 */}
      {log.length > 0 && (
        <div className="text-xs" style={{ color: "#4a6a58" }}>
          {log.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      )}

      {/* 市场弹窗 */}
      {showMarket && <MarketModal onClose={() => setShowMarket(false)} />}
    </div>
  );
}
```

- [ ] **Step 3: 确认 TypeScript 编译通过**

```bash
cd /Users/fujianwei/fanren-wiki
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 4: 启动开发服务器，手动测试**

```bash
cd /Users/fujianwei/fanren-wiki
npm run dev
```

访问 http://localhost:3000/game，验证：
1. 开局页面显示机遇值滚动动画
2. 灵根结果正确显示（天灵根/双灵根/三灵根/伪灵根）
3. 点击"踏入炼气期"进入主界面
4. 状态面板显示修为/寿命进度条
5. 点击"经历事件"触发事件卡片
6. 事件选项可点击，效果正确应用
7. 闭关三档可点击，修为/寿命变化正确
8. 市场弹窗打开，购买/出售功能正常
9. 修为≥90时显示"冲关"按钮

- [ ] **Step 5: Commit**

```bash
cd /Users/fujianwei/fanren-wiki
git add app/game/page.tsx app/game/play/page.tsx
git commit -m "feat(game): add game entry and main play page"
```


---

## Task 11: 导航栏更新 + 冲关结局页

**Files:**
- Modify: `components/Navbar.tsx`
- Create: `app/game/ending/page.tsx`

- [ ] **Step 1: 修改 components/Navbar.tsx，添加"修仙模拟"链接**

在现有导航链接列表中，在"踏入仙途"链接之后添加：

```tsx
<Link
  href="/game"
  className="font-medium transition-colors"
  style={{ color: "#6fedb5" }}
  onMouseEnter={e => (e.currentTarget.style.color = "#4ade9a")}
  onMouseLeave={e => (e.currentTarget.style.color = "#6fedb5")}
>
  修仙模拟
</Link>
```

完整修改后的导航链接区域（替换原有 `<div className="flex gap-6 text-sm">` 内容）：

```tsx
<div className="flex gap-6 text-sm" style={{ color: "#6a8878" }}>
  <span className="cursor-not-allowed opacity-50" title="敬请期待">人物百科</span>
  <span className="cursor-not-allowed opacity-50" title="敬请期待">地图势力</span>
  <span className="cursor-not-allowed opacity-50" title="敬请期待">剧情时间线</span>
  <Link
    href="/destiny"
    className="font-medium transition-colors"
    style={{ color: "#6fedb5" }}
    onMouseEnter={e => (e.currentTarget.style.color = "#4ade9a")}
    onMouseLeave={e => (e.currentTarget.style.color = "#6fedb5")}
  >
    踏入仙途
  </Link>
  <Link
    href="/game"
    className="font-medium transition-colors"
    style={{ color: "#d4a843" }}
    onMouseEnter={e => (e.currentTarget.style.color = "#e8c86a")}
    onMouseLeave={e => (e.currentTarget.style.color = "#d4a843")}
  >
    修仙模拟
  </Link>
</div>
```

- [ ] **Step 2: 写 app/game/ending/page.tsx**

```tsx
"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

const ENDING_TEXT: Record<string, { title: string; text: string; color: string }> = {
  ascend: {
    title: "飞升灵界",
    text: "踏破虚空，你终于飞升灵界。那一刻，天地为之颤抖，万道金光将你笼罩，修仙路上的一切悲欢离合，都化作了这一瞬的永恒。",
    color: "#d4a843",
  },
  natural: {
    title: "寿元耗尽，安然坐化",
    text: "你安然坐化，留下一缕残魂，融入天地之间。漫长的修仙岁月，每一个选择都已刻入天道，无悔无憾。",
    color: "#4ade9a",
  },
  death_battle: {
    title: "战斗陨落",
    text: "你倒在了修仙路上，鲜血染红了脚下的土地。修仙之路，从来都是以命相搏。",
    color: "#ef4444",
  },
  death_heart: {
    title: "心魔陨落",
    text: "心魔终究吞噬了你，你在自己的执念中永远沉沦。那些未曾放下的执念，成了困住你的囚笼。",
    color: "#ef4444",
  },
  death_break: {
    title: "冲关陨落",
    text: "天雷滚滚，你在渡劫中燃尽最后一丝神识，化为飞灰。渡劫之路，九死一生，你已无悔。",
    color: "#ef4444",
  },
  ascend_fail: {
    title: "飞升失败",
    text: "距离灵界只差一步，你却永远停在了这里。那道虚空之门在你眼前缓缓关闭，留下无尽遗憾。",
    color: "#6a8878",
  },
};

function EndingContent() {
  const params = useSearchParams();
  const endingType = params.get("type") ?? "natural";
  const ending = ENDING_TEXT[endingType] ?? ENDING_TEXT["natural"];
  const isDeath = endingType.startsWith("death");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div
        className={`w-full max-w-sm rounded-2xl p-8 text-center ${isDeath ? "card-death" : ""}`}
        style={{
          backgroundColor: "#111a16",
          border: `1px solid ${ending.color}44`,
        }}
      >
        <div
          className="text-4xl font-serif font-bold mb-4"
          style={{ color: ending.color }}
        >
          {ending.title}
        </div>
        <p
          className="text-sm leading-relaxed mb-8"
          style={{ color: "#b8ccc2" }}
        >
          {ending.text}
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/game"
            className="btn-primary py-3 rounded-full font-medium text-sm"
          >
            再入轮回
          </Link>
          <Link
            href="/"
            className="btn-secondary py-2.5 rounded-full text-sm"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function EndingPage() {
  return (
    <Suspense>
      <EndingContent />
    </Suspense>
  );
}
```

- [ ] **Step 3: 确认 TypeScript 编译通过**

```bash
cd /Users/fujianwei/fanren-wiki
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 4: 运行所有测试**

```bash
cd /Users/fujianwei/fanren-wiki
npx jest 2>&1 | tail -20
```

期望：所有测试通过（新增测试 + 原有测试）

- [ ] **Step 5: Commit**

```bash
cd /Users/fujianwei/fanren-wiki
git add components/Navbar.tsx app/game/ending/page.tsx
git commit -m "feat(game): add ending page and navbar game link"
```

---

## 自检清单（执行前）

- [ ] `types/game.ts` 所有类型已定义，无 TBD
- [ ] `lib/game/engine.ts` 所有函数有对应测试
- [ ] `content/game/` 所有 JSON 数据文件存在
- [ ] `components/game/` 所有组件 TypeScript 编译通过
- [ ] `app/game/` 路由可正常访问
- [ ] 市场购买/出售功能正常
- [ ] 冲关按钮在修为≥90时显示
- [ ] 寿命耗尽时自动结束游戏

## 不在此计划范围内（Phase 2+）

- 完整事件池（100-150个事件）
- 战斗系统（3回合决策）
- 因果链系统
- 宗门系统（正道/魔道/散修）
- 心魔关完整实现
- 冲关动效
- 飞升天命值揭晓动效

