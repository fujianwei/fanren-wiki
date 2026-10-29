# 像素美术提示词

> 当前唯一保留的美术生产方案是 **55 张 Core Pack**。早期 515 张、176 张、81 张水墨方案、旧 39 张占位提示词及其压缩包均已移除。

## **正式入口**

- 55 张制作说明：[core-pack/00-README.md](core-pack/00-README.md)
- 场景母图复用规则：[core-pack/SCENE-MAP.md](core-pack/SCENE-MAP.md)
- 优秀像素游戏参考与原创边界：[core-pack/REFERENCE-STYLE-GUIDE.md](core-pack/REFERENCE-STYLE-GUIDE.md)
- 3 个生成批次：[core-pack/05-batch-index.md](core-pack/05-batch-index.md)
- 55 条机器可读任务：[core-pack/manifest.jsonl](core-pack/manifest.jsonl)
- 55 行完成清单：[core-pack/checklist.csv](core-pack/checklist.csv)
- 55 张输出路径：[core-pack/OUTPUT-PATHS.txt](core-pack/OUTPUT-PATHS.txt)

## **55 张构成**

| 类别 | 数量 |
|---|---:|
| 场景母图 | 29 |
| 本心开场 | 4 |
| 年度重心 | 6 |
| 结局 | 6 |
| 动作图标 | 10 |
| **合计** | **55** |

## **运行时说明**

线上暂时保留 29 张场景占位图和 10 个动作占位图标，避免页面缺图。它们不是正式美术。新 PNG 按 `core-pack/OUTPUT-PATHS.txt` 生成后，同名替换 `public/game/` 下的占位文件即可；本心、年度重心和结局图在完成对应页面接入后使用。
