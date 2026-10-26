# 凡人修仙模拟器｜完整像素美术提示词包 v3.1

> 共 515 条提示词，覆盖基础事件、每个选项结果、18 条命运线的全部幕次与选择、本心开场、年度重心、结局和动作图标。
> 本包是完整制作规格，不代表 515 张图片已经生成。当前线上仍使用 29 张场景占位图和 10 个动作占位图标。

## **一、数量核对**

| 类别 | 数量 |
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

## **二、视觉参考体系**

正式提示词参考以下成熟作品的高层设计方法，不复制任何具体角色、服装、建筑、地图、构图、UI、动画、字体、logo 或可识别资产：

| 参考作品 | 学习重点 | 本项目转化 |
|---|---|---|
| 《逸剑风云决》 | 武侠像素的场景组织、服饰、山门、古建与电影化镜头 | 中国仙侠人物身份、宗门空间和山水层次 |
| 《大侠立志传》 | 小尺寸事件和人物站位的可读性、像素 UI 效率 | 因果场景、执法堂、宗门议事和坊市交易 |
| 《八方旅人 II》 | 景深、前景遮挡、逆光与体积光 | 洞府、古墓、天门和边城的主次关系 |
| 《星之海》 | 清晰剪影、光效层次和动画式动势 | 法阵、灵脉、器灵、渡劫和乱星海 |
| 《风来之国》 | 生活细节、室内陈设和环境叙事 | 洞府、丹房、坊市和村落的真实生活痕迹 |
| 《星露谷物语》 | 日常空间、村落、天气和劳作场景的温度 | 故乡、家书、荒年、守灵和村井 |
| 《莫塔之子》 | 家庭、关系、牺牲和暗色情绪表达 | 师尊、同门、亲族、旧友和道侣场景 |
| 《夜勤人》 | 小道具、交易、货架和图标识别 | 账簿、灵石、丹药、材料与动作图标 |

完整参考矩阵、融合比例、原创边界和验收标准见：

- `REFERENCE-STYLE-GUIDE.md`

所有场景与图标提示词都已加入原创约束：

> Study only high-level design principles. Do not copy or closely imitate any character, costume, building, emblem, environment, map, UI, composition, animation, logo, typeface, or recognizable asset. Create an original Chinese xianxia pixel-art visual identity for Fanren Wiki.

## **三、统一美术标准**

- 专业级 16-bit / 32-bit JRPG 像素场景，不是 8-bit、Minecraft 或“高清图粗暴打码”。
- 细密统一的像素颗粒、清晰深色描边、每种材质 3 到 5 阶明暗、克制的 dithering。
- 中国水墨、宣纸、玉石、古木、青瓦、铜器、符箓与旧金高光转译为像素语言。
- 画面有前景、中景、远景和唯一明确的主光源。
- 人物必须有发髻/束发、交领、袖摆、腰带、动作和身份道具。
- 场景母版 2048×1152；关键人物与物件位于中央 4:3 安全区。
- 底部 22% 保留较暗、较低细节的 UI 文字承托区。
- 动作图标 1024×1024，缩小到 48×48 仍可辨认。

## **四、文件结构**

| 文件或目录 | 内容 |
|---|---|
| `batches/01-*.md` 到 `batches/25-*.md` | 96 个基础/人生事件主图与 231 个选项结果图，每批 4 个事件 |
| `batches/26-fate-*.md` 到 `batches/43-fate-*.md` | 每条命运线一个批次，每批 3 个幕次图 + 6 个选项结果图 |
| `batches/44-ui-scenes.md` | 4 个本心、6 个年度重心、6 个结局 |
| `batches/45-action-icons.md` | 10 个动作图标 |
| `03-ui-scenes.md` | UI 场景汇总版 |
| `04-action-icons.md` | 动作图标汇总版 |
| `05-batch-index.md` | 45 个批次索引与每批数量 |
| `manifest.jsonl` | 515 条机器可读任务，含输出路径、来源事件、选项编号与完整提示词 |
| `checklist.csv` | 515 行逐图完成状态表 |
| `REFERENCE-STYLE-GUIDE.md` | 优秀像素游戏研究、原创边界与验收标准 |

每个批次同时提供 Markdown 和 JSONL 两种格式。

## **五、推荐生成顺序**

### **阶段 1：风格校准**

先生成四张：

1. `public/game/scenes/events/array_legacy.png`
2. `public/game/scenes/fate/wanderer_debt-1.png`
3. `public/game/scenes/outcomes/events/merchant_ledger-a.png`
4. `public/game/scenes/ending/ascend.png`

四张放在一起检查：

- 像素密度是否一致。
- 人物是不是完整角色，而不是方块符号。
- 主光源和材质是否清楚。
- 手机中央 4:3 裁切后是否仍可读。
- 是否具有原创中国仙侠气质，而不是参考游戏仿制。

### **阶段 2：基础事件**

按照 `05-batch-index.md` 从 `01` 生成到 `25`。每个事件先生成主图，再把主图作为该事件结果图的参考图，保持人物、镜头、光源和色温连续。

### **阶段 3：命运线**

从 `26` 生成到 `43`。一条命运线一次完成 9 张：

- 三幕主图。
- 每一幕两个选择结果图。

### **阶段 4：UI 与图标**

- `44-ui-scenes.md`：本心、年度重心、结局。
- `45-action-icons.md`：10 个动作图标。

## **六、输出目录**

- `public/game/scenes/events/`
- `public/game/scenes/outcomes/events/`
- `public/game/scenes/fate/`
- `public/game/scenes/outcomes/fate/`
- `public/game/scenes/opening/`
- `public/game/scenes/focus/`
- `public/game/scenes/ending/`
- `public/game/actions/`

文件名与 `manifest.jsonl` 的 `output` 字段完全一致。

## **七、完成标准**

- 缩小到 390px 宽仍能一眼看出地点、人物和正在发生的事。
- 底部标题叠加后不遮挡脸部、手部、剑锋、药瓶或关键证物。
- 人物有明确动作和身份，不是几何方块。
- 背景不是平涂色块，至少存在三个空间层。
- 不需要文字解释也能理解情绪和关系。
- 与参考作品没有可辨识的资产复用。
- 全部图片的像素密度、描边、金色高光和色温保持统一。
