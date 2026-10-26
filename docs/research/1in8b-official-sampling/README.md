# 1in8b 正式网站采样集

## 数据边界

- `sourceMode` 只能取 `official-site`。
- 本目录只收录在 `https://1in8b.life/zh-hans/s/d-TTO-90-F-r-k5` 打开、实际游玩并走完的正式站点人生。
- 任何公开复刻引擎、静态解析器、离线模拟器或自建状态机生成的数据，均不得写入 `official-20.unified.json`，也不得计入 20 局进度。
- 每局必须保留正式站点生成的分享链接（`shareUrl`）、采集时间与原始证据文件（`rawFile`）。

## 统一字段

| 字段 | 说明 |
|---|---|
| `identity` | 姓名、死亡年龄、年份跨度、身份纪录 |
| `birth` | 出生证、出生文案、家境/宗教/父母/同秒出生者 |
| `choices` | 每年重心与重大抉择；保存实际站点选择的文本 |
| `events` | 完整人生纪录，含年龄、事件类型、文本、值得记住标记 |
| `annualFocus` | 最终年度重心、成年后时间分配；幼年死亡明确记录为不适用 |
| `attributes` | 健康、幸福、知识、人际关系 |
| `relationships` | 家庭、伴侣、子女、朋友、同住者 |
| `achievements.rememberedMoments` | 难忘时刻/成就/关键事件 |
| `death` | 年龄、死因、地区、死亡纪录原文 |
| `lifeSummary` | 学历、职业、财产、最幸福年份、回首与总结 |
| `texture` | 四轴人生纹理、纹理名称、命名说明 |
| `completeness` | 必填字段检查；幼年死亡允许纹理与年度重心为空，但必须标记原因 |

## 正式 20 局进度

以 `progress.json` 为准。当前原始证据在 `raw/`；构建脚本为
`scripts/research/build_1in8b_official_samples.py`；分析脚本为 `scripts/research/analyze_1in8b_official_samples.py`。

## 原始证据原则

- 不修改正式站点 JSON。
- 结构化转换只做字段归一化，不补写或臆造未观察到的选择、事件与关系。
- 站点文案与结构化摘录冲突时，以原始 `raw/*.json` 与页面原文为准，并在报告中标注。
