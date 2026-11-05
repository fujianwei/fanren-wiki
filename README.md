# 凡人修仙人生模拟

一个以“命格、阶段重心与长期因果”为核心的修仙人生模拟器。

## 核心体验

- 抽灵根，得一句待验证的命格谶语。
- 立下本心，决定这一世最初想追求什么。
- 每 5–80 年选择一个阶段重心，让时间真正流逝。
- 经历世情、宗门、亲族、冒险与命运线。
- 死亡后获得组合命盘，并留下一个带入下一世的执念。
- 每日天象会改变本日事件倾向，可随时进入“今日同命”。
- 出生后可立下命誓，死亡时揭示是否得偿。
- 命途图鉴记录已见、得偿、断裂与从未靠近的命运。
- 连续三世后，由“三生镜”照见你反复做出的选择。

灵根只决定起点、修炼效率与风格，不限制机缘、禁术、乱海与飞升。
冒险与平淡都能形成完整人生。

## 交接与美术生产

- 当前状态、未完成项和续接步骤：[`docs/CONTINUATION.md`](docs/CONTINUATION.md)
- **176 张完整美术总入口**：[`docs/image-prompts/full-pack-176/00-README.md`](docs/image-prompts/full-pack-176/00-README.md)
- **GPT 总任务提示词**：[`docs/image-prompts/full-pack-176/GPT-MASTER-PROMPT.md`](docs/image-prompts/full-pack-176/GPT-MASTER-PROMPT.md)
- **GPT 一键执行指令**：[`docs/image-prompts/full-pack-176/GPT-EXECUTE-COMMAND.md`](docs/image-prompts/full-pack-176/GPT-EXECUTE-COMMAND.md)
- 176 张分批索引：[`docs/image-prompts/full-pack-176/05-batch-index.md`](docs/image-prompts/full-pack-176/05-batch-index.md)
- 55 张快速上线包：[`docs/image-prompts/core-pack/00-README.md`](docs/image-prompts/core-pack/00-README.md)

> 176 张正式美术已经完成并接入运行逻辑：事件按事件 ID、命运线按三幕阶段、开场/重心/结局按对应类型读取 WebP。缺失专属图时会自动回退到由 GPT 新图映射的 29 张通用场景 WebP。

## 开发

```bash
npm ci
npm run dev
npm test -- --runInBand
npm run lint
npm run build
```

## 技术结构

- `lib/game/reducer.ts`：主状态机
- `lib/game/lifecycle.ts`：年龄、阶段、重心与结算
- `lib/game/event-pool.ts`：条件事件池与命运线抽取
- `lib/game/narrative.ts`：叙事轴、命运线、命盘与执念
- `lib/game/relations.ts`：关系生成与漂移
- `lib/game/mirror.ts`：三生镜
- `lib/game/simulation.ts`：1000 局平衡模拟
