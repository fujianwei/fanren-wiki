# GPT 一键执行指令

> 直接把下面代码块中的整段内容发给支持读取网页的 GPT。它会先从 GitHub 读取任务契约，再开始阶段 0。

```text
你现在负责《凡人修仙模拟器》的 176 张正式像素美术生产。请先完整读取并严格执行以下 GitHub 文件，不要凭记忆猜测任务：

1. 总任务书：
https://raw.githubusercontent.com/fujianwei/fanren-wiki/main/docs/image-prompts/full-pack-176/GPT-MASTER-PROMPT.md

2. 176 条机器任务清单：
https://raw.githubusercontent.com/fujianwei/fanren-wiki/main/docs/image-prompts/full-pack-176/manifest.jsonl

3. 风格参考与原创边界：
https://raw.githubusercontent.com/fujianwei/fanren-wiki/main/docs/image-prompts/full-pack-176/REFERENCE-STYLE-GUIDE.md

4. 26 个批次索引：
https://raw.githubusercontent.com/fujianwei/fanren-wiki/main/docs/image-prompts/full-pack-176/05-batch-index.md

读取后请确认：总数 176 张；其中事件主图 96 张、命运三幕图 54 张、本心 4 张、年度重心 6 张、结局 6 张、动作图标 10 张。

本次只执行阶段 0，不要开始其他批次。只生成以下 4 张风格校准图：
1. public/game/scenes/fate/array_legacy-1.png
2. public/game/scenes/fate/wanderer_debt-1.png
3. public/game/scenes/focus/cultivate.png
4. public/game/scenes/ending/ascend.png

要求：
- 严格使用总任务书中的统一主角设定、像素密度、尺寸、原创边界和禁止项。
- 场景图为 1536×864，动作图标为 1024×1024。
- 不生成文字、汉字招牌、英文、logo、水印、UI 边框或字幕。
- 不复制任何参考游戏的具体角色、服装、建筑、地图、构图、图标或可识别资产。
- 每张图是独立成品，不拼联络表。

完成后请输出：
| 序号 | 文件名 | 输出路径 | 状态 |
并写明累计完成数 4/176。

生成完这 4 张后立刻停下来等我确认风格，不要继续阶段 1。
```
