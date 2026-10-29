# 项目交接与继续开发说明

> 最后更新：2026-10-29。本文是切换对话或更换开发者时的首要入口。

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

必须继续保留：

- 出生页蓝色火焰 Canvas 动画。
- 现有出生文案。
- 水墨修仙视觉基调。
- `types/game.ts` 中已有的叙事类型。
- `content/game/fate-threads.json` 中 18 条命运线的运行逻辑。

## **二、当前美术状态**

### **已经进入运行时的占位美术**

| 类型 | 数量 | 位置 | 状态 |
|---|---:|---|---|
| 场景占位图 | 29 | `public/game/scenes/` | 已接入，质量不合格，仅作占位 |
| 动作图标 | 10 | `public/game/actions/` | 已接入，可临时使用 |

这批图由 `scripts/generate-pixel-art.py` 程序化生成。用户已明确表示它们不能作为最终美术，但要求暂时保留，避免线上页面缺图。

### **正式美术尚未生成**

完整成品的提示词已经制作并入库，但 515 张正式图片尚未生成。

| 正式资产 | 数量 |
|---|---:|
| 基础/人生事件主图 | 96 |
| 基础/人生选项结果图 | 231 |
| 命运线幕次主图 | 54 |
| 命运线选项结果图 | 108 |
| 本心开场 | 4 |
| 年度重心 | 6 |
| 结局 | 6 |
| 动作图标 | 10 |
| **合计** | **515** |

入口：

- `docs/image-prompts/full-pack-v3/00-README.md`
- `docs/image-prompts/full-pack-v3/REFERENCE-STYLE-GUIDE.md`：8 款优秀像素游戏的高层设计参考、原创边界与验收标准
- `docs/image-prompts/full-pack-v3/05-batch-index.md`
- `docs/image-prompts/full-pack-v3/batches/`：45 个可直接交给 GPT 的 Markdown 批次
- `docs/image-prompts/full-pack-v3/manifest.jsonl`
- `docs/image-prompts/full-pack-v3/checklist.csv`

## **三、当前运行时如何选图**

当前使用简化占位映射：

- `lib/game/scene-art.ts`
- 命运线按 `threadId` 取图。
- 基础事件按标题、描述和关键词归入 29 张通用场景。
- 每个选项按文本语义归入 10 个动作图标。
- 场景图片位于 `public/game/scenes/`。

这是一种兼容性回退，不是最终的逐事件、逐选项美术架构。

## **四、收到新图后的接入顺序**

1. 按 `full-pack-v3/manifest.jsonl` 的 `output` 路径保存新 PNG。
2. 保留当前 29 张占位图作为 fallback，不要直接删除。
3. 重构 `lib/game/scene-art.ts`：
   - 基础事件主图优先读取 `public/game/scenes/events/{eventId}.png`。
   - 命运线幕次优先读取 `public/game/scenes/fate/{threadId}-{stage}.png`。
   - 选项结果读取 `public/game/scenes/outcomes/events/{eventId}-{a|b|c|d}.png`。
   - 命运线结果读取 `public/game/scenes/outcomes/fate/{threadId}-{stage}-{a|b}.png`。
4. 扩展 `eventResult` 数据结构，使选项结算弹窗显示对应的结果图。
5. 添加图片存在性 fallback，避免部分图片未交付时产生 404。
6. 替换本心、年度重心、结局和动作图标路径。
7. 运行类型检查、Lint、测试、生产构建和桌面/移动端浏览器验收。
8. 用 `docs/image-prompts/full-pack-v3/checklist.csv` 逐张核对完成状态。

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
| 当前场景映射 | `lib/game/scene-art.ts` |
| 主游戏页面 | `app/game/play/page.tsx` |
| 结局页面 | `app/game/ending/page.tsx` |
| 场景组件 | `components/game/PixelScene.tsx` |
| HUD | `components/game/GameHud.tsx` |
| 命途抽屉 | `components/game/LifeDrawer.tsx` |
| 事件与选项卡片 | `components/game/EventCard.tsx` |
| 出生灵根页 | `components/game/SpiritRootGate.tsx` |

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

1. **515 张正式美术尚未生成**，当前线上仍是 39 张占位图。
2. 因此当前 UI 的图片好看程度不代表最终视觉质量。
3. 当前图片映射是关键词复用，不是逐事件、逐选项独立图。
4. 飞升率约 51.5%，仍高于原先“单一结局不超过 40%”的产品目标。
5. 部分基础事件缺少专属结果文案，仍使用通用兜底。
6. 乱星海目前是 4 个事件组成的短链，还不是完整大型区域。
7. 关系事件目前主要以四类初始关系存在，还没有大量专属分支。
8. 宗门、仇敌、丹药、阵法和条件事件已完成本轮兼容修复，后续改动必须通过 `content-integrity.test.ts`，避免再次出现内容字段被静默忽略。

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

> 先阅读 `docs/CONTINUATION.md`、`types/game.ts`、`lib/game/reducer.ts`、`lib/game/narrative.ts` 和 `lib/game/scene-art.ts`。当前线上仍使用 29 张占位场景和 10 个占位动作图标；正式 515 张美术尚未交付。下一步是接收新图并按 `docs/image-prompts/full-pack-v3/manifest.jsonl` 接入逐事件、逐选项图片。

这样即可从仓库状态继续，不依赖旧聊天记录。
