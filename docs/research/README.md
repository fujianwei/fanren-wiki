# 研究与产品决策资料

| 文件 | 内容 |
|---|---|
| `1in8b-official-20-report.md` | 正式网站 20 局人生采样的完整玩法分析 |
| `fanren-wiki-comparison-matrix.md` | 正式网站与 fanren-wiki 的逐项差异矩阵 |
| `fanren-wiki-专业改造方案.md` | 专业玩法与系统改造方案 |
| `fanren-wiki-玩法大改造实施蓝图.md` | 数据结构、状态机、事件与视觉改造蓝图 |
| `fanren-wiki-对话决策记录.md` | 产品目标、用户偏好与关键决策记录 |
| `1in8b-official-sampling/` | 20 局正式网站统一数据、原始证据、统计结果与构建脚本索引 |

采样数据边界：`1in8b-official-sampling` 只包含正式网站真实游玩数据，不包含公开复刻引擎或自建模拟器数据。

复现脚本：

```bash
python3 scripts/research/build_1in8b_official_samples.py
python3 scripts/research/analyze_1in8b_official_samples.py
```
