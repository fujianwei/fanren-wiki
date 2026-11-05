# 项目交接与继续开发说明

> 最后更新：2026-11-05。本文是切换对话或更换开发者时的首要入口。

## **一、当前仓库状态**

- 仓库：`https://github.com/fujianwei/fanren-wiki`
- 主分支：`main`
- 在线游戏：`https://fanren-wiki.vercel.app/game`
- 技术栈：Next.js 16、React 19、TypeScript、Tailwind CSS 4
- Vercel 已连接 GitHub `main`，推送后自动部署

当前已经完成的玩法并非旧版随机事件点击器，而是阶段制修仙人生模拟：

- 灵根只影响修炼效率，不锁死境界、禁术、乱海机缘或飞升。
- 每世抽取 18 条命运线中的 4 条。
- 玩家按阶段选择六种年度重心，时间会真实推进。
- 拥有师尊、同门、仇怨、亲族四类长期关系。
- 死亡后生成组合人生账本、墓志铭、执念和下一世回响。
- 三世后通过三生镜复盘重复选择。
- 相同种子重开时保留灵根、命格、命运线和关系，但允许走出不同结果。
- 每日天象按上海日期确定性变化，首页/出生页可进入“今日同命”。
- 死亡时显示未见命运线索，并持久化命途图鉴。
- 出生后可选择命誓，死亡时结算得偿、背弃或未竟。

必须继续保留：

- 出生页蓝色火焰 Canvas 动画。
- 现有出生文案。
- 水墨修仙视觉基调。
- `types/game.ts` 中已有的叙事类型。
- `content/game/fate-threads.json` 中 18 条命运线的运行逻辑。

## **二、当前美术状态**

### **正式美术已接入**

| 类型 | 数量 | 位置 | 状态 |
|---|---:|---|---|
| 基础/人生事件图 | 96 | `public/game/scenes/events/` | 已接入 WebP |
| 命运线三幕图 | 54 | `public/game/scenes/fate/` | 已接入 WebP |
| 本心开场 | 4 | `public/game/scenes/opening/` | 已接入 WebP |
| 年度重心 | 6 | `public/game/scenes/focus/` | 已接入 WebP |
| 结局 | 6 | `public/game/scenes/ending/` | 已接入 WebP |
| 动作图标 | 10 | `public/game/actions/` | 已接入 WebP |
| 通用回退场景 | 29 | `public/game/scenes/` | 专属图缺失时使用 PNG |

正式美术共 176 张，已经从约 498MB PNG 压缩为约 42MB WebP。通用回退场景仍保留，避免未来新增事件或图片异常时出现空白。

美术提示词保留两套用途明确的方案：

| 方案 | 资产 | 数量 |
|---|---|---:|
| 完整库 | 事件主图 | 96 |
| 完整库 | 命运线三幕主图 | 54 |
| 完整库 | 本心开场 | 4 |
| 完整库 | 年度重心 | 6 |
| 完整库 | 结局 | 6 |
| 完整库 | 动作图标 | 10 |
| **完整库合计** | | **176** |
| 首发包 | 场景母图 + UI + 动作图标 | 55 |

完整库入口：

- `docs/image-prompts/full-pack-176/00-README.md`
- `docs/image-prompts/full-pack-176/GPT-MASTER-PROMPT.md`
- `docs/image-prompts/full-pack-176/05-batch-index.md`
- `docs/image-prompts/full-pack-176/batches/`：26 个可逐批交给 GPT 的 Markdown 文件
- `docs/image-prompts/full-pack-176/manifest.jsonl`
- `docs/image-prompts/full-pack-176/checklist.csv`
- `docs/image-prompts/full-pack-176/OUTPUT-PATHS.txt`

55 张首发包入口：

- `docs/image-prompts/core-pack/00-README.md`
- `docs/image-prompts/core-pack/SCENE-MAP.md`
- `docs/image-prompts/core-pack/05-batch-index.md`
- `docs/image-prompts/core-pack/manifest.jsonl`

## **三、当前运行时如何选图**

图片解析统一由 `lib/game/scene-art.ts` 负责：

- 基础事件：`/game/scenes/events/{eventId}.webp`
- 命运线：`/game/scenes/fate/{threadId}-{stage}.webp`
- 本心：`/game/scenes/opening/{intentId}.webp`
- 年度重心：`/game/scenes/focus/{focusId}.webp`
- 结局：`/game/scenes/ending/{endingType}.webp`
- 动作选项：`/game/actions/{actionId}.webp`
- 专属图加载失败：自动回退到 `/game/scenes/{sceneId}.png`

`PixelScene` 与 `SceneBackground` 已移除无条件 `unoptimized`，Next.js 会按设备宽度生成优化图片。浏览器实测请求使用 `/_next/image`。

选项结果继续复用事件场景图，并叠加动作图标和状态层，不单独生成结果图。

## **四、更新美术时的接入顺序**

1. 按 `full-pack-176/manifest.jsonl` 生成或替换 1536×864 PNG。
2. 将事件、命运、开场、重心、结局和动作图转换为 WebP；当前生产质量为场景 q85、图标 q90。
3. 保持现有文件名与目录结构，不要改事件 ID、命运 threadId 或 stage。
4. 保留 29 张通用场景 PNG 作为回退。
5. 运行 TypeScript、Lint、测试、生产构建和桌面/移动端浏览器验收。
6. 用 `docs/image-prompts/full-pack-176/checklist.csv` 核对 176 张完成状态。

## **五、关键代码地图**

| 功能 | 文件 |
|---|---|
| 类型定义 | `types/game.ts` |
| 状态机 | `lib/game/reducer.ts` |
| 生命周期、年龄与阶段 | `lib/game/lifecycle.ts` |
| 条件事件池 | `lib/game/event-pool.ts` |
| 命运线与结局文本 | `lib/game/narrative.ts` |
| 确定性随机 | `lib/game/random.ts` |
| 关系生成与漂移 | `lib/game/relations.ts` |
| 物品效果单一数据源 | `lib/game/items.ts` |
| 境界、本心与关系标签 | `lib/game/labels.ts` |
| 内容结构校验 | `lib/__tests__/content-integrity.test.ts` |
| 三生镜 | `lib/game/mirror.ts` |
| 平衡模拟 | `lib/game/simulation.ts` |
| 每日天象与同命 | `lib/game/daily.ts` |
| 命誓生成与结算 | `lib/game/oaths.ts` |
| 命途图鉴与未见命运 | `lib/game/atlas.ts` |
| 当前场景映射 | `lib/game/scene-art.ts` |
| 主游戏页面 | `app/game/play/page.tsx` |
| 结局页面 | `app/game/ending/page.tsx` |
| 场景组件 | `components/game/PixelScene.tsx` |
| HUD | `components/game/GameHud.tsx` |
| 命途抽屉 | `components/game/LifeDrawer.tsx` |
| 事件与选项卡片 | `components/game/EventCard.tsx` |
| 出生灵根页 | `components/game/SpiritRootGate.tsx` |
| 命誓选择 | `components/game/LifeOathPanel.tsx` |
| 命途图鉴 | `app/game/atlas/page.tsx` |

## **六、内容规模**

| 内容 | 数量 |
|---|---:|
| 基础事件 | 96 |
| 基础事件选项 | 231 |
| 命运线 | 18 |
| 命运线幕次 | 54 |
| 命运线选项 | 108 |
| 命格谶语 | 8 |
| 叙事轴 | 8 |
| 结局族 | 6 |
| 玩家可见结局标题组合 | 48 |

## **七、验证命令**

```bash
npm ci
npx tsc --noEmit
npm run lint
npm test -- --runInBand
npm run build
```

Turbopack 在受限沙箱内可能无法创建 CSS 子进程；如果出现 `Operation not permitted`，构建命令需要在允许子进程的环境中执行。

## **八、已知问题**

1. 事件场景使用高清仙侠插画风，动作图标使用更传统的像素风，两者仍存在视觉风格差异。
2. 原始生成图片仍保留在 Git 历史中，当前部署只使用压缩后的 WebP。
3. 飞升率约 51.5%，仍高于原先“单一结局不超过 40%”的产品目标。
4. 部分基础事件缺少专属结果文案，仍使用通用兜底。
5. 乱星海目前是 4 个事件组成的短链，还不是完整大型区域。
6. 关系事件目前主要以四类初始关系存在，还没有大量专属分支。
7. 宗门、仇敌、丹药、阵法和条件事件已完成兼容修复，后续改动必须通过 `content-integrity.test.ts`，避免再次出现内容字段被静默忽略。

## **九、产品材料**

### **正式网站研究**

- `docs/research/1in8b-official-20-report.md`
- `docs/research/fanren-wiki-comparison-matrix.md`
- `docs/research/fanren-wiki-专业改造方案.md`
- `docs/research/fanren-wiki-玩法大改造实施蓝图.md`
- `docs/research/fanren-wiki-对话决策记录.md`

### **验收截图**

- `docs/acceptance/fanren-wiki-pixel-redesign.jpg`
- `docs/acceptance/fanren-wiki-pixel-mobile.png`

### **正式网站 20 局原始数据**

- `docs/research/1in8b-official-sampling/official-20.unified.json`
- `docs/research/1in8b-official-sampling/analysis-summary.json`
- `docs/research/1in8b-official-sampling/progress.json`
- `docs/research/1in8b-official-sampling/raw/`
- `docs/research/1in8b-official-sampling/original-six/`
- `scripts/research/build_1in8b_official_samples.py`
- `scripts/research/analyze_1in8b_official_samples.py`

## **十、新对话起手建议**

新对话中可直接要求：

> 先阅读 `docs/CONTINUATION.md`、`types/game.ts`、`lib/game/reducer.ts`、`lib/game/narrative.ts`、`lib/game/scene-art.ts` 和 `components/game/PixelScene.tsx`。176 张正式美术已经完成并接入，事件、命运三幕、开场、重心、结局和动作图标都按对应 ID 读取 WebP；缺失时回退到 29 张通用场景。后续修改不得破坏这条解析链。

这样即可从仓库状态继续，不依赖旧聊天记录。
