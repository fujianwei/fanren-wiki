# 凡人修仙模拟器｜完整像素美术提示词包 v3

> 这是覆盖完整事件、命运线幕次、每个选项结果、开场、阶段重心、结局和动作图标的完整制作清单。

## 数量核对

| 类别 | 数量 |
|---|---:|

| 基础/人生事件场景 | 96 |

| 基础/人生选项结果 | 231 |

| 命运线幕次场景 | 54 |

| 命运线选项结果 | 108 |

| 本心开场场景 | 4 |

| 年度重心场景 | 6 |

| 结局场景 | 6 |

| 动作图标 | 10 |

| **合计** | **515** |


## 文件拆分

| 文件 | 内容 |
|---|---|

| `01-base-events.md` | 96 个基础/人生事件场景与 231 个选项结果图 |

| `02-fate-threads.md` | 54 个命运线幕次场景与 108 个选项结果图 |

| `03-ui-scenes.md` / `batches/43-ui-scenes.md` | 4 个本心、6 个阶段重心、6 个结局场景 |

| `04-action-icons.md` / `batches/44-action-icons.md` | 10 个动作图标 |

| `manifest.jsonl` | 全部 515 条机器可读任务，含输出路径、来源事件、选项编号和完整提示词 |
| `05-batch-index.md` | 分批文件索引和每批图片数量 |

| `checklist.csv` | 逐图完成状态表 |


## 统一美术要求

专业级 16-bit / 32-bit JRPG 像素场景插画，仙侠游戏原画品质。由资深像素画师手工绘制：像素颗粒细密统一，清晰深色描边，每种材质 3 到 5 阶明暗，克制的 dithering，不用巨块像素，不做模糊放大。把中国水墨的山雾、宣纸质感、玉石、古木、青瓦、铜器、符箓和克制的旧金高光转译为精致像素画。画面成熟、克制、有电影感主光源；横向 16:9，母版 2048×1152。关键人物和关键物件必须放在中央 4:3 安全区，手机裁掉两侧后仍能看懂。底部 22% 保留较暗、较低细节的文字承托区。

禁止：可读文字、汉字招牌、英文、logo、水印、UI 边框、相框、字幕、摄影写实、3D 渲染、油画笔刷、Minecraft 方块、8-bit 粗像素、巨大马赛克、Q版、玩具感、低清放大、人物剪影糊在一起、过曝霓虹、彩虹色泛滥、遮挡主主体的镜头光晕、重复主角、解剖错误、血腥特写。


## 生成顺序

1. 先生成 4 张风格校准图：`events/array_legacy.png`、`fate/wanderer_debt-1.png`、`outcomes/events/merchant_ledger-a.png`、`ending/ascend.png`。
2. 统一检查人物比例、像素颗粒、底部文字安全区和手机中央裁切。
3. 再按境界分批生成 96 个事件主图及其结果图。
4. 然后生成 54 个命运线幕次及对应结果图。
5. 最后生成 16 个 UI 场景和 10 个动作图标。


## 输出目录

- `public/game/scenes/events/`

- `public/game/scenes/outcomes/events/`

- `public/game/scenes/fate/`

- `public/game/scenes/outcomes/fate/`

- `public/game/scenes/opening/`

- `public/game/scenes/focus/`

- `public/game/scenes/ending/`

- `public/game/actions/`
