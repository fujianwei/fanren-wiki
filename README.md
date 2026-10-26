# 凡人修仙人生模拟

一个以“命格、阶段重心与长期因果”为核心的修仙人生模拟器。

## 核心体验

- 抽灵根，得一句待验证的命格谶语。
- 立下本心，决定这一世最初想追求什么。
- 每 5–80 年选择一个阶段重心，让时间真正流逝。
- 经历世情、宗门、亲族、冒险与命运线。
- 死亡后获得组合命盘，并留下一个带入下一世的执念。
- 连续三世后，由“三生镜”照见你反复做出的选择。

灵根只决定起点、修炼效率与风格，不限制机缘、禁术、乱海与飞升。
冒险与平淡都能形成完整人生。

## 交接与美术生产

- 当前状态、未完成项和续接步骤：[`docs/CONTINUATION.md`](docs/CONTINUATION.md)
- 当前线上占位美术说明：[`docs/image-prompts/pixel-placeholder-replacement-checklist.md`](docs/image-prompts/pixel-placeholder-replacement-checklist.md)
- 515 张正式美术提示词总入口：[`docs/image-prompts/full-pack-v3/00-README.md`](docs/image-prompts/full-pack-v3/00-README.md)
- 分批生成索引：[`docs/image-prompts/full-pack-v3/05-batch-index.md`](docs/image-prompts/full-pack-v3/05-batch-index.md)

> 当前线上仍是 29 张场景占位图和 10 个动作占位图标。正式 515 张图片尚未生成。

## 开发

```bash
npm install
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
