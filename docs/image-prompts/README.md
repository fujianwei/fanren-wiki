# 像素美术提示词

> 当前保留两套用途明确的方案：
> **176 张完整生产库**用于逐事件、命运三幕和完整 UI；
> **55 张 Core Pack** 用于快速上线并覆盖当前运行时。

## **正式入口**

### **176 张完整库**

- 完整制作说明：[full-pack-176/00-README.md](full-pack-176/00-README.md)
- GPT 总任务提示词：[full-pack-176/GPT-MASTER-PROMPT.md](full-pack-176/GPT-MASTER-PROMPT.md)
- 26 个批次索引：[full-pack-176/05-batch-index.md](full-pack-176/05-batch-index.md)
- 176 条机器任务：[full-pack-176/manifest.jsonl](full-pack-176/manifest.jsonl)
- 176 张输出路径：[full-pack-176/OUTPUT-PATHS.txt](full-pack-176/OUTPUT-PATHS.txt)
- 逐图完成清单：[full-pack-176/checklist.csv](full-pack-176/checklist.csv)
- 当前运行时复制映射：[full-pack-176/RUNTIME-PROMOTION-MAP.md](full-pack-176/RUNTIME-PROMOTION-MAP.md)

### **55 张 Core Pack**

- 首发制作说明：[core-pack/00-README.md](core-pack/00-README.md)
- 场景母图复用规则：[core-pack/SCENE-MAP.md](core-pack/SCENE-MAP.md)
- 3 个首发批次：[core-pack/05-batch-index.md](core-pack/05-batch-index.md)

## **两套方案的关系**

| 方案 | 数量 | 用途 |
|---|---:|---|
| 完整库 | 176 | 逐事件、命运三幕和完整 UI 的正式生产库 |
| 首发包 | 55 | 先用 29 张场景母图覆盖当前运行时，快速上线 |

55 张不是从 176 个文件路径中简单删除 121 条。完整库保留逐事件变化；首发包把相同语义聚合到 29 个运行时场景 ID。两者都保留，按阶段使用。
