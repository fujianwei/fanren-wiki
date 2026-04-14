# 凡人修仙传 MBTI 人物匹配测试 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个凡人修仙传人界篇主题的 MBTI 人物匹配测试网站，用户完成 12 道修仙情景题后，匹配到最接近的人界人物，结果页可分享。

**Architecture:** Next.js 14 App Router，纯静态站点无后端。题目和人物数据存放在 JSON 文件中，测试状态用 React useState 管理，结果通过 URL 参数（/result/intj）传递，支持直接分享链接。

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Vercel 部署

---

## 文件结构总览

```
fanren-wiki/
├── app/
│   ├── layout.tsx              ← 全局布局，引入字体和全局样式
│   ├── page.tsx                ← 首页
│   ├── quiz/
│   │   └── page.tsx            ← 测试页（12题流程）
│   └── result/
│       └── [mbti]/
│           └── page.tsx        ← 结果页（动态路由）
├── components/
│   ├── Navbar.tsx              ← 顶部导航
│   ├── Footer.tsx              ← 底部版权
│   ├── QuizCard.tsx            ← 单题展示组件
│   ├── ProgressBar.tsx         ← 进度条组件
│   └── ShareButtons.tsx        ← 分享按钮组件
├── lib/
│   └── mbti.ts                 ← MBTI 计算逻辑（纯函数）
├── content/
│   └── quiz/
│       ├── questions.json      ← 12道题目数据
│       └── characters.json     ← 16个人物数据
├── types/
│   └── index.ts                ← TypeScript 类型定义
├── tailwind.config.ts          ← Tailwind 配置（含自定义竹林烟雨色）
└── package.json
```

---

## Task 1: 初始化 Next.js 项目

**Files:**
- Create: `fanren-wiki/` (项目根目录)
- Create: `tailwind.config.ts`
- Create: `types/index.ts`

- [ ] **Step 1: 创建 Next.js 项目**

在 `~/fanren-wiki` 目录中执行：

```bash
cd ~
npx create-next-app@latest fanren-wiki --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
cd fanren-wiki
```

遇到交互提示全部选默认（回车）。

- [ ] **Step 2: 验证项目启动**

```bash
cd ~/fanren-wiki
npm run dev
```

预期：终端显示 `Local: http://localhost:3000`，浏览器打开看到 Next.js 默认首页。确认后 Ctrl+C 停止。

- [ ] **Step 3: 配置 Tailwind 竹林烟雨主题色**

覆盖 `tailwind.config.ts`：

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bamboo: {
          50:  "#f2f5f0",
          100: "#e8ede4",
          200: "#d4e0cc",
          300: "#b8cdb0",
          400: "#7a9e72",
          500: "#5a7e52",
          600: "#3a5c32",
          700: "#2a4424",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Noto Serif SC", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 4: 创建类型定义文件**

创建 `types/index.ts`：

```typescript
export type MbtiDimension = "EI" | "SN" | "TF" | "JP";
export type MbtiType =
  | "INTJ" | "INTP" | "ENTJ" | "ENTP"
  | "INFJ" | "INFP" | "ENFJ" | "ENFP"
  | "ISTJ" | "ISFJ" | "ESTJ" | "ESFJ"
  | "ISTP" | "ISFP" | "ESTP" | "ESFP";

export interface Question {
  id: number;
  scenario: string;           // 情景描述
  optionA: string;            // 选项A文字
  optionB: string;            // 选项B文字
  dimension: MbtiDimension;   // 对应维度
  aDirection: string;         // A选项对应方向，如 "I"
  bDirection: string;         // B选项对应方向，如 "E"
}

export interface Character {
  mbti: MbtiType;
  name: string;
  title: string;              // 人物称号/身份，如"七玄门弟子"
  description: string;        // 2-3句简介
  traits: string[];           // 3-4个性格标签
  quote: string;              // 经典语录或事迹
}
```

- [ ] **Step 5: 提交**

```bash
cd ~/fanren-wiki
git add .
git commit -m "feat: init Next.js project with bamboo theme colors and types"
```

---

## Task 2: 创建题目和人物数据

**Files:**
- Create: `content/quiz/questions.json`
- Create: `content/quiz/characters.json`

- [ ] **Step 1: 创建目录**

```bash
mkdir -p ~/fanren-wiki/content/quiz
```

- [ ] **Step 2: 创建题目数据文件**

创建 `content/quiz/questions.json`（12道题，每维度3题）：

```json
[
  {
    "id": 1,
    "scenario": "门派举办一年一度的论道大会，各门各派弟子齐聚一堂。你会——",
    "optionA": "主动结识各方弟子，广交朋友，打听各处消息",
    "optionB": "找个僻静角落，静静观察，只与少数人深谈",
    "dimension": "EI",
    "aDirection": "E",
    "bDirection": "I"
  },
  {
    "id": 2,
    "scenario": "历经数月闭关，你终于突破瓶颈，境界大进。此时你最想——",
    "optionA": "立刻找师兄弟们分享喜悦，热闹庆祝一番",
    "optionB": "独自感悟新境界的变化，将喜悦藏在心底",
    "dimension": "EI",
    "aDirection": "E",
    "bDirection": "I"
  },
  {
    "id": 3,
    "scenario": "门派派你去一座陌生城池执行任务，你会——",
    "optionA": "四处打听，广泛接触当地人，快速摸清情况",
    "optionB": "先独自观察环境，理清头绪后再行动",
    "dimension": "EI",
    "aDirection": "E",
    "bDirection": "I"
  },
  {
    "id": 4,
    "scenario": "你在一处废弃洞府发现了一本残缺功法，你会——",
    "optionA": "结合已知功法推断残缺部分，举一反三",
    "optionB": "仔细研究现有内容，先把能用的部分吃透",
    "dimension": "SN",
    "aDirection": "N",
    "bDirection": "S"
  },
  {
    "id": 5,
    "scenario": "师父让你选择修炼方向，你倾向于——",
    "optionA": "选一条冷僻但潜力无限的道路，哪怕充满未知",
    "optionB": "选一条前人走过、有迹可循的稳妥路线",
    "dimension": "SN",
    "aDirection": "N",
    "bDirection": "S"
  },
  {
    "id": 6,
    "scenario": "遇到一道从未见过的阵法，你的第一反应是——",
    "optionA": "凭直觉感受阵法气机，尝试找到突破口",
    "optionB": "逐一检验每个阵眼，用已知知识逐步破解",
    "dimension": "SN",
    "aDirection": "N",
    "bDirection": "S"
  },
  {
    "id": 7,
    "scenario": "同门师弟因修炼走火入魔，你如何处置——",
    "optionA": "先稳住情绪，分析走火原因，给出最有效的救治方案",
    "optionB": "第一时间给予安慰，陪在他身边，让他感受到温暖",
    "dimension": "TF",
    "aDirection": "T",
    "bDirection": "F"
  },
  {
    "id": 8,
    "scenario": "两位同门发生争执，请你评理，你会——",
    "optionA": "据理分析，直接说出谁对谁错，不留情面",
    "optionB": "先照顾双方情绪，设法让两人都能接受结果",
    "dimension": "TF",
    "aDirection": "T",
    "bDirection": "F"
  },
  {
    "id": 9,
    "scenario": "你发现一件法宝，但它的前任主人是一位已逝的同门，你会——",
    "optionA": "法宝无主，物尽其用，收下便是",
    "optionB": "心中难以释怀，想为前任主人做些什么再取用",
    "dimension": "TF",
    "aDirection": "T",
    "bDirection": "F"
  },
  {
    "id": 10,
    "scenario": "你在乱星海独自历练，面对未知的危险，你会——",
    "optionA": "提前规划好路线和应对预案，按计划行事",
    "optionB": "随机应变，走到哪算哪，见机行事",
    "dimension": "JP",
    "aDirection": "J",
    "bDirection": "P"
  },
  {
    "id": 11,
    "scenario": "门派给你安排了一项为期半年的任务，你会——",
    "optionA": "立刻制定详细计划，分阶段推进，确保按时完成",
    "optionB": "大致了解任务目标，边做边调整，保持灵活",
    "dimension": "JP",
    "aDirection": "J",
    "bDirection": "P"
  },
  {
    "id": 12,
    "scenario": "你在修炼途中遇到一个岔路口，两条路都有可能通向目标，你会——",
    "optionA": "仔细权衡后选定一条，坚定走下去，不轻易回头",
    "optionB": "先探一条，若不对路立刻换另一条，保持选择余地",
    "dimension": "JP",
    "aDirection": "J",
    "bDirection": "P"
  }
]
```

- [ ] **Step 3: 创建人物数据文件**

创建 `content/quiz/characters.json`：

```json
[
  {
    "mbti": "INTJ",
    "name": "韩立",
    "title": "天南第一人",
    "description": "出身寒微的农家子弟，资质平平却凭借谨慎与坚韧走到修仙巅峰。他从不依赖运气，每一步都深思熟虑，将危险消弭于无形。",
    "traits": ["深谋远虑", "独立自主", "低调务实", "意志坚定"],
    "quote": "凡事预则立，不预则废。在修仙界，活得长才是硬道理。"
  },
  {
    "mbti": "INTP",
    "name": "墨大夫",
    "title": "炼药宗师",
    "description": "精通炼药之道，行事神秘莫测，对医术与毒术的研究近乎痴迷。他冷静克制，极少流露情感，却在关键时刻展现出令人叹服的智慧。",
    "traits": ["冷静睿智", "博学专研", "神秘内敛", "逻辑缜密"],
    "quote": "世间万物皆有其理，药与毒不过一线之隔，关键在于用之者的智慧。"
  },
  {
    "mbti": "ENTJ",
    "name": "厉飞雨",
    "title": "黄枫谷长老",
    "description": "性格刚烈，行事果断，天生具备领袖气质。他目标明确，从不拖泥带水，对敌人毫不留情，对同伴却肝胆相照。",
    "traits": ["果断刚烈", "领导力强", "目标明确", "重情重义"],
    "quote": "修仙之路，当仁不让。犹豫不决者，终将被时代淘汰。"
  },
  {
    "mbti": "ENTP",
    "name": "古道人",
    "title": "乱星海奇人",
    "description": "老谋深算，善于借势，行事飘忽不定，令人难以捉摸。他看似随性，实则每一步都暗藏深意，是真正的智者。",
    "traits": ["老谋深算", "善于谋略", "灵活善变", "洞察人心"],
    "quote": "棋局之妙，不在一子得失，而在全局运筹。"
  },
  {
    "mbti": "INFJ",
    "name": "南宫婉",
    "title": "黄枫谷弟子",
    "description": "温柔善良，重情重义，对身边之人怀有深厚的感情。她有着坚定的内心信念，愿意为守护重要之人付出一切。",
    "traits": ["温柔感性", "重情重义", "理想主义", "内心坚定"],
    "quote": "修仙不是为了长生，是为了守住那些值得守护的人。"
  },
  {
    "mbti": "INFP",
    "name": "李慕婉",
    "title": "天星阁弟子",
    "description": "外表高冷骄傲，内心却细腻敏感。她有着属于自己的坚持与原则，不轻易向世俗妥协，默默守护着内心深处的柔软。",
    "traits": ["高冷骄傲", "内心细腻", "坚守原则", "感情深沉"],
    "quote": "我不需要所有人理解，只要那一人懂得便足矣。"
  },
  {
    "mbti": "ENFJ",
    "name": "曹梦婷",
    "title": "七玄门弟子",
    "description": "活泼开朗，热情洋溢，天生就是人群的中心。她真心关怀身边每一个人，用温暖感染着周围的世界。",
    "traits": ["活泼热情", "关怀他人", "感染力强", "乐观开朗"],
    "quote": "修仙路上不能只顾自己，大家一起走，才走得更远。"
  },
  {
    "mbti": "ENFP",
    "name": "陈巧倩",
    "title": "黄枫谷弟子",
    "description": "聪慧灵动，善于交际，脑子转得极快。她表面大大咧咧，实则心思细腻，总能在复杂局势中找到最有利的位置。",
    "traits": ["聪慧灵动", "善于交际", "随机应变", "外柔内刚"],
    "quote": "人心比功法更难参透，但也更有趣。"
  },
  {
    "mbti": "ISTJ",
    "name": "陈巡",
    "title": "七玄门执事",
    "description": "做事严谨，一丝不苟，对门规戒律有着近乎执着的坚守。他忠诚可靠，是门派最值得信赖的执行者。",
    "traits": ["严谨守规", "忠诚可靠", "一丝不苟", "责任心强"],
    "quote": "规矩是门派的根基，没有规矩，再强的实力也是散沙。"
  },
  {
    "mbti": "ISFJ",
    "name": "钟灵",
    "title": "药园弟子",
    "description": "温顺体贴，默默付出，总是把他人的需求放在自己之前。她不求回报地守护着身边的人，是修仙界难得的温柔存在。",
    "traits": ["温顺体贴", "默默付出", "善解人意", "忠诚守护"],
    "quote": "能帮到别人，便是我修炼的意义所在。"
  },
  {
    "mbti": "ESTJ",
    "name": "马韩",
    "title": "七玄门长老",
    "description": "强势务实，雷厉风行，凡事讲究规则和效率。他管理门派事务铁腕有力，不容置疑，却也确保了门派的稳固运转。",
    "traits": ["强势务实", "雷厉风行", "重视规则", "执行力强"],
    "quote": "修仙界从来不讲情面，实力与规矩，缺一不可。"
  },
  {
    "mbti": "ESFJ",
    "name": "云霓",
    "title": "乱星海散修",
    "description": "热心肠，合群，重视人情往来。她广结善缘，在散修圈子里人缘极好，遇到困难总有人愿意伸出援手。",
    "traits": ["热心肠", "合群友善", "重视人情", "善于协调"],
    "quote": "独木不成林，修仙路上多个朋友，多条路。"
  },
  {
    "mbti": "ISTP",
    "name": "洛昆",
    "title": "乱星海散修",
    "description": "沉默寡言，不善言辞，却是实干派的典范。他独立解决问题，极少求助于人，用行动证明一切，是最可靠的并肩作战之人。",
    "traits": ["沉默实干", "独立自主", "冷静应变", "行动为先"],
    "quote": "说再多不如做一次，刀剑说话比嘴巴更有力。"
  },
  {
    "mbti": "ISFP",
    "name": "绿萼",
    "title": "药园弟子",
    "description": "安静温柔，心地善良，不争不抢。她享受平静的修炼生活，对自然草木有着特别的亲近感，是修仙界中难得的纯粹灵魂。",
    "traits": ["安静温柔", "心地善良", "随遇而安", "亲近自然"],
    "quote": "草木有灵，只要用心感受，世间处处皆是道。"
  },
  {
    "mbti": "ESTP",
    "name": "袁赋",
    "title": "乱星海散修",
    "description": "大胆冒险，行动力极强，天生就是为战斗而生的人。他享受刺激与挑战，在危机四伏的乱星海如鱼得水，越险越兴奋。",
    "traits": ["大胆冒险", "行动力强", "享受刺激", "随机应变"],
    "quote": "修仙就得敢拼敢闯，缩手缩脚的人永远到不了顶峰。"
  },
  {
    "mbti": "ESFP",
    "name": "苏若兰",
    "title": "七玄门弟子",
    "description": "开朗率真，活在当下，用热情感染周围的一切。她不喜欢复杂的算计，享受修仙路上每一个当下的美好，是门派里的一缕阳光。",
    "traits": ["开朗率真", "活在当下", "热情洋溢", "真诚坦率"],
    "quote": "想那么多做什么，开心修炼，认真活着，就够了。"
  }
]
```

- [ ] **Step 4: 提交**

```bash
cd ~/fanren-wiki
git add content/
git commit -m "feat: add quiz questions and character data"
```

---

## Task 3: 实现 MBTI 计算逻辑

**Files:**
- Create: `lib/mbti.ts`

- [ ] **Step 1: 创建计算函数文件**

创建 `lib/mbti.ts`：

```typescript
import type { MbtiType, Question } from "@/types";

export type Answers = Record<number, "A" | "B">;

/**
 * 根据答案计算 MBTI 类型
 * 每个维度取多数方向，平局时取第一个维度的默认值（I/N/T/J）
 */
export function calculateMbti(
  answers: Answers,
  questions: Question[]
): MbtiType {
  const scores: Record<string, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

  for (const question of questions) {
    const answer = answers[question.id];
    if (!answer) continue;
    const direction = answer === "A" ? question.aDirection : question.bDirection;
    scores[direction] = (scores[direction] || 0) + 1;
  }

  const ei = scores.E >= scores.I ? "E" : "I";
  const sn = scores.N >= scores.S ? "N" : "S";
  const tf = scores.T >= scores.F ? "T" : "F";
  const jp = scores.J >= scores.P ? "J" : "P";

  return `${ei}${sn}${tf}${jp}` as MbtiType;
}
```

- [ ] **Step 2: 验证逻辑正确性（手动检查）**

用以下心算验证：
- 全选 A（E/N/T/J 各3分）→ 应得 ENTJ
- 全选 B（I/S/F/P 各3分）→ 应得 ISFP
- 平局（E=I=1, 其余 N/T/J 多）→ 应得 INTJ（I 优先）

逻辑：`scores.E >= scores.I` 时取 E，否则取 I；`scores.N >= scores.S` 时取 N，否则取 S。平局时 E/N/T/J 胜出，符合设计。

- [ ] **Step 3: 提交**

```bash
cd ~/fanren-wiki
git add lib/mbti.ts
git commit -m "feat: add MBTI calculation logic"
```

---

## Task 4: 实现公共组件

**Files:**
- Create: `components/Navbar.tsx`
- Create: `components/Footer.tsx`
- Create: `components/ProgressBar.tsx`

- [ ] **Step 1: 创建 Navbar 组件**

创建 `components/Navbar.tsx`：

```tsx
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full bg-bamboo-200 border-b border-bamboo-300 px-6 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-bamboo-700 font-serif font-bold text-lg tracking-widest hover:text-bamboo-600">
          凡人修仙传·人界篇
        </Link>
        <div className="flex gap-6 text-sm text-bamboo-500">
          <span className="cursor-not-allowed opacity-50" title="敬请期待">人物百科</span>
          <span className="cursor-not-allowed opacity-50" title="敬请期待">地图势力</span>
          <span className="cursor-not-allowed opacity-50" title="敬请期待">剧情时间线</span>
          <Link href="/quiz" className="text-bamboo-600 font-medium hover:text-bamboo-700">人物测试</Link>
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: 创建 Footer 组件**

创建 `components/Footer.tsx`：

```tsx
export default function Footer() {
  return (
    <footer className="w-full bg-bamboo-100 border-t border-bamboo-200 py-6 mt-16">
      <div className="max-w-5xl mx-auto text-center text-bamboo-500 text-sm">
        <p>© 2026 凡人修仙传·人界篇 | 本站为粉丝创作，内容版权归原作者忘语所有</p>
        <p className="mt-1 text-xs opacity-70">非商业用途，仅供粉丝交流</p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: 创建 ProgressBar 组件**

创建 `components/ProgressBar.tsx`：

```tsx
interface ProgressBarProps {
  current: number;  // 当前题号（1-based）
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const percent = Math.round(((current - 1) / total) * 100);
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-bamboo-500 mb-1">
        <span>第 {current} 题</span>
        <span>共 {total} 题</span>
      </div>
      <div className="w-full bg-bamboo-200 rounded-full h-2">
        <div
          className="bg-bamboo-400 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 提交**

```bash
cd ~/fanren-wiki
git add components/
git commit -m "feat: add Navbar, Footer, ProgressBar components"
```

---

## Task 5: 实现全局布局

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: 更新全局样式**

覆盖 `app/globals.css`：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #f2f5f0;
  color: #3a5c32;
}
```

- [ ] **Step 2: 更新全局布局**

覆盖 `app/layout.tsx`：

```tsx
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "凡人修仙传·人界篇 | 你是哪位修仙人物？",
  description: "凡人修仙传人界篇主题网站，完成12道修仙情景题，测试你最像哪位人界人物。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

- [ ] **Step 3: 验证布局渲染**

```bash
cd ~/fanren-wiki
npm run dev
```

打开 http://localhost:3000，确认：
- 顶部导航栏显示"凡人修仙传·人界篇"和四个导航项
- 背景色为浅灰绿 `#f2f5f0`
- 底部版权信息可见

Ctrl+C 停止。

- [ ] **Step 4: 提交**

```bash
cd ~/fanren-wiki
git add app/layout.tsx app/globals.css
git commit -m "feat: add global layout with bamboo theme"
```

---

## Task 6: 实现首页

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: 实现首页**

覆盖 `app/page.tsx`：

```tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Hero 区域 */}
      <div className="flex flex-col md:flex-row gap-6 mb-16">
        {/* 左：网站介绍 */}
        <div className="flex-1 bg-bamboo-100 rounded-2xl p-8 border border-bamboo-200 flex flex-col justify-center">
          <p className="text-bamboo-400 text-sm tracking-widest mb-2">凡人修仙传 · 人界篇</p>
          <h1 className="text-3xl font-serif font-bold text-bamboo-700 tracking-wider mb-4">
            人界百科全书
          </h1>
          <p className="text-bamboo-600 text-sm leading-relaxed mb-6">
            从七玄门的懵懂少年，到天南大地的元婴老怪。<br />
            这里记录着人界篇的每一段传奇。
          </p>
          <Link
            href="/quiz"
            className="inline-block bg-bamboo-400 hover:bg-bamboo-500 text-white text-sm font-medium px-6 py-2.5 rounded-full transition-colors w-fit"
          >
            探索人界 →
          </Link>
        </div>

        {/* 右：测试入口 */}
        <div className="md:w-72 bg-bamboo-400 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4">
          <div className="text-4xl">✨</div>
          <h2 className="text-white font-serif font-bold text-xl tracking-wide">
            你是哪位<br />修仙人物？
          </h2>
          <p className="text-bamboo-100 text-xs leading-relaxed">
            12道修仙情景题<br />测出你的人界人物原型
          </p>
          <Link
            href="/quiz"
            className="bg-white text-bamboo-600 font-medium text-sm px-6 py-2.5 rounded-full hover:bg-bamboo-50 transition-colors"
          >
            立即测试
          </Link>
        </div>
      </div>

      {/* 功能预览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: "👤", title: "人物百科", desc: "韩立、南宫婉、墨大夫……人界篇所有主要人物档案" },
          { icon: "🗺️", title: "地图势力", desc: "七玄门、黄枫谷、乱星海……人界势力分布全览" },
          { icon: "📜", title: "剧情时间线", desc: "从凡人少年到元婴老怪，完整剧情脉络一览" },
        ].map((item) => (
          <div
            key={item.title}
            className="bg-bamboo-100 rounded-xl p-6 border border-bamboo-200 opacity-60"
          >
            <div className="text-2xl mb-3">{item.icon}</div>
            <h3 className="font-serif font-bold text-bamboo-700 mb-2">{item.title}</h3>
            <p className="text-bamboo-500 text-xs leading-relaxed">{item.desc}</p>
            <p className="text-bamboo-400 text-xs mt-3 font-medium">敬请期待</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 验证首页**

```bash
cd ~/fanren-wiki
npm run dev
```

打开 http://localhost:3000，确认：
- Hero 左侧显示标题和"探索人界"按钮
- Hero 右侧绿色卡片显示"你是哪位修仙人物？"和"立即测试"
- 下方三个预览卡片半透明显示"敬请期待"

Ctrl+C 停止。

- [ ] **Step 3: 提交**

```bash
cd ~/fanren-wiki
git add app/page.tsx
git commit -m "feat: implement homepage with hero and feature preview cards"
```

---

## Task 7: 实现测试页

**Files:**
- Create: `app/quiz/page.tsx`

- [ ] **Step 1: 实现测试页**

创建 `app/quiz/page.tsx`：

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/components/ProgressBar";
import { calculateMbti, type Answers } from "@/lib/mbti";
import questionsData from "@/content/quiz/questions.json";
import type { Question } from "@/types";

const questions = questionsData as Question[];

export default function QuizPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [selected, setSelected] = useState<"A" | "B" | null>(null);

  const question = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  function handleSelect(choice: "A" | "B") {
    if (selected) return; // 防止重复点击
    setSelected(choice);

    const newAnswers = { ...answers, [question.id]: choice };
    setAnswers(newAnswers);

    setTimeout(() => {
      if (isLast) {
        const mbti = calculateMbti(newAnswers, questions);
        router.push(`/result/${mbti.toLowerCase()}`);
      } else {
        setCurrentIndex((i) => i + 1);
        setSelected(null);
      }
    }, 400);
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-8">
        <ProgressBar current={currentIndex + 1} total={questions.length} />
      </div>

      <div className="bg-white rounded-2xl border border-bamboo-200 p-8 shadow-sm">
        <p className="text-bamboo-400 text-xs tracking-widest mb-4">情景 {currentIndex + 1}</p>
        <h2 className="text-bamboo-700 font-serif text-lg leading-relaxed mb-8">
          {question.scenario}
        </h2>

        <div className="flex flex-col gap-4">
          {(["A", "B"] as const).map((choice) => {
            const text = choice === "A" ? question.optionA : question.optionB;
            const isChosen = selected === choice;
            return (
              <button
                key={choice}
                onClick={() => handleSelect(choice)}
                disabled={!!selected}
                className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200
                  ${isChosen
                    ? "border-bamboo-400 bg-bamboo-100 text-bamboo-700"
                    : selected
                    ? "border-bamboo-200 bg-bamboo-50 text-bamboo-400 opacity-50"
                    : "border-bamboo-200 bg-bamboo-50 text-bamboo-600 hover:border-bamboo-400 hover:bg-bamboo-100 cursor-pointer"
                  }`}
              >
                <span className="font-bold text-bamboo-400 mr-3">{choice}.</span>
                {text}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 验证测试页**

```bash
cd ~/fanren-wiki
npm run dev
```

打开 http://localhost:3000/quiz，确认：
- 显示进度条"第 1 题 / 共 12 题"
- 情景文字和两个选项卡片正常显示
- 点击选项后该选项高亮，0.4秒后自动跳转下一题
- 第 12 题选完后跳转到 `/result/intj`（或对应类型）

Ctrl+C 停止。

- [ ] **Step 3: 提交**

```bash
cd ~/fanren-wiki
git add app/quiz/
git commit -m "feat: implement quiz page with 12-question flow"
```

---

## Task 8: 实现结果页和分享功能

**Files:**
- Create: `app/result/[mbti]/page.tsx`
- Create: `components/ShareButtons.tsx`

- [ ] **Step 1: 创建分享按钮组件**

创建 `components/ShareButtons.tsx`：

```tsx
"use client";

import { useState } from "react";

interface ShareButtonsProps {
  characterName: string;
  mbti: string;
  resultUrl: string;
}

export default function ShareButtons({ characterName, mbti, resultUrl }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = `我在凡人修仙传人界篇人物测试中，测出我最像「${characterName}」(${mbti})！你也来测测看 → ${resultUrl}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const weiboText = encodeURIComponent(
    `我在凡人修仙传人界篇人物测试中，测出我最像「${characterName}」(${mbti})！你也来测测看 → ${resultUrl}`
  );
  const weiboUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(resultUrl)}&title=${weiboText}`;

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <button
        onClick={handleCopy}
        className="flex-1 bg-bamboo-400 hover:bg-bamboo-500 text-white text-sm font-medium px-6 py-3 rounded-full transition-colors"
      >
        {copied ? "✓ 已复制！" : "📋 复制分享文字"}
      </button>
      <a
        href={weiboUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 bg-red-400 hover:bg-red-500 text-white text-sm font-medium px-6 py-3 rounded-full transition-colors text-center"
      >
        微博分享
      </a>
    </div>
  );
}
```

- [ ] **Step 2: 创建结果页**

创建 `app/result/[mbti]/page.tsx`：

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import ShareButtons from "@/components/ShareButtons";
import charactersData from "@/content/quiz/characters.json";
import type { Character, MbtiType } from "@/types";

const characters = charactersData as Character[];

interface Props {
  params: { mbti: string };
}

export function generateStaticParams() {
  return characters.map((c) => ({ mbti: c.mbti.toLowerCase() }));
}

export default function ResultPage({ params }: Props) {
  const mbtiUpper = params.mbti.toUpperCase() as MbtiType;
  const character = characters.find((c) => c.mbti === mbtiUpper);

  if (!character) notFound();

  const resultUrl = `https://fanren-wiki.vercel.app/result/${params.mbti}`;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="text-center mb-8">
        <p className="text-bamboo-400 text-sm tracking-widest mb-2">你的人界人物原型是</p>
        <h1 className="text-5xl font-serif font-bold text-bamboo-700 mb-2">{character.name}</h1>
        <p className="text-bamboo-500 text-sm">{character.title}</p>
      </div>

      <div className="bg-white rounded-2xl border border-bamboo-200 p-8 shadow-sm mb-6">
        {/* MBTI 标签 */}
        <div className="flex justify-center mb-6">
          <span className="bg-bamboo-400 text-white text-sm font-bold px-4 py-1.5 rounded-full tracking-widest">
            {character.mbti}
          </span>
        </div>

        {/* 性格特点 */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {character.traits.map((trait) => (
            <span
              key={trait}
              className="bg-bamboo-100 text-bamboo-600 text-xs px-3 py-1 rounded-full border border-bamboo-200"
            >
              {trait}
            </span>
          ))}
        </div>

        {/* 人物简介 */}
        <p className="text-bamboo-600 text-sm leading-relaxed text-center mb-6">
          {character.description}
        </p>

        {/* 经典语录 */}
        <div className="bg-bamboo-50 border-l-4 border-bamboo-300 rounded-r-lg px-5 py-4">
          <p className="text-bamboo-500 text-xs mb-1">经典语录</p>
          <p className="text-bamboo-700 text-sm font-serif leading-relaxed italic">
            「{character.quote}」
          </p>
        </div>
      </div>

      {/* 分享区域 */}
      <div className="bg-bamboo-100 rounded-2xl border border-bamboo-200 p-6 mb-6">
        <p className="text-bamboo-600 text-sm text-center mb-4">分享给朋友，看看他们是哪位人物 ✨</p>
        <ShareButtons
          characterName={character.name}
          mbti={character.mbti}
          resultUrl={resultUrl}
        />
      </div>

      {/* 重新测试 */}
      <div className="text-center">
        <Link
          href="/quiz"
          className="text-bamboo-500 text-sm hover:text-bamboo-700 underline underline-offset-4"
        >
          重新测试
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 验证结果页**

```bash
cd ~/fanren-wiki
npm run dev
```

打开 http://localhost:3000/result/intj，确认：
- 显示"韩立"，标题"天南第一人"
- MBTI 标签 `INTJ` 显示
- 四个性格标签显示
- 人物简介和经典语录显示
- 分享按钮可点击（复制文字按钮点击后显示"✓ 已复制！"）
- "重新测试"链接跳转到 /quiz

Ctrl+C 停止。

- [ ] **Step 4: 提交**

```bash
cd ~/fanren-wiki
git add app/result/ components/ShareButtons.tsx
git commit -m "feat: implement result page with share functionality"
```

---

## Task 9: 修复 JSON 导入配置并构建验证

**Files:**
- Modify: `tsconfig.json`
- Modify: `next.config.ts` 或 `next.config.mjs`

- [ ] **Step 1: 确认 tsconfig.json 支持 JSON 导入**

打开 `tsconfig.json`，确认 `compilerOptions` 中有：

```json
{
  "compilerOptions": {
    "resolveJsonModule": true
  }
}
```

如果没有，添加该行。

- [ ] **Step 2: 执行生产构建**

```bash
cd ~/fanren-wiki
npm run build
```

预期：构建成功，输出类似：
```
Route (app)                    Size
├ ○ /                          ...
├ ○ /quiz                      ...
└ ● /result/[mbti]             ...
  ├ /result/intj
  ├ /result/infj
  └ ... (16 routes)
```

如有报错，根据错误信息修复（常见问题：JSON 导入路径、类型不匹配）。

- [ ] **Step 3: 本地预览生产版本**

```bash
npm run start
```

打开 http://localhost:3000，走一遍完整流程：
1. 首页 → 点击"立即测试"
2. 完成 12 题（每题随意选）
3. 确认跳转到结果页，人物信息正确显示
4. 点击"复制分享文字"，确认复制成功

Ctrl+C 停止。

- [ ] **Step 4: 提交**

```bash
cd ~/fanren-wiki
git add tsconfig.json
git commit -m "chore: ensure JSON module resolution for content files"
```

---

## Task 10: 部署到 Vercel

**Files:** 无代码变更，操作 Vercel 控制台

- [ ] **Step 1: 推送代码到 GitHub**

```bash
cd ~/fanren-wiki
# 如果还没有远程仓库，先在 GitHub 创建一个名为 fanren-wiki 的仓库，然后：
git remote add origin https://github.com/<你的用户名>/fanren-wiki.git
git branch -M main
git push -u origin main
```

- [ ] **Step 2: 在 Vercel 导入项目**

1. 打开 https://vercel.com/new
2. 选择"Import Git Repository"，找到 `fanren-wiki`
3. Framework Preset 选 **Next.js**（自动检测）
4. 点击 **Deploy**

- [ ] **Step 3: 验证线上部署**

部署完成后（约 1-2 分钟），打开 Vercel 给出的域名（如 `fanren-wiki.vercel.app`），确认：
- 首页正常显示
- 完整测试流程可走通
- 结果页 16 个 MBTI 类型都可访问（随机测试几个 `/result/intj`、`/result/enfp` 等）

- [ ] **Step 4: 更新结果页分享链接域名**

将 `app/result/[mbti]/page.tsx` 中的：

```typescript
const resultUrl = `https://fanren-wiki.vercel.app/result/${params.mbti}`;
```

替换为 Vercel 实际分配的域名，然后：

```bash
git add app/result/[mbti]/page.tsx
git commit -m "chore: update share URL to production domain"
git push
```

---

## 自检：Spec 覆盖确认

| 设计文档需求 | 对应 Task |
|------------|---------|
| 12道修仙情景题 | Task 2 |
| 每维度3题，内部MBTI计算 | Task 2 + Task 3 |
| 16个人物对应表 | Task 2 |
| 竹林烟雨配色 | Task 1 + Task 5 |
| 首页 Hero 左右分栏 | Task 6 |
| 测试页进度条 + 选项卡片 | Task 7 |
| 结果页人物信息 + 语录 | Task 8 |
| 分享按钮（复制链接+微博） | Task 8 |
| 重新测试按钮 | Task 8 |
| 导航栏（其他功能 disabled）| Task 4 |
| Vercel 部署 | Task 10 |
