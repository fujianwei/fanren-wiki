# 凡人修仙模拟器｜像素场景与动作图标生成规格 v2

> 本文件是 39 张游戏图片的完整生成说明。目标不是“看起来像像素”的低清占位图，而是专业 16-bit / 32-bit JRPG 游戏场景。
>
> **重制范围：当前 `public/game/scenes/` 下 29 张场景图与 `public/game/actions/` 下 10 张动作图全部重制。现有 39 张图暂时保留为占位符，新图按相同文件名覆盖，前端代码无需改动。**

## **一、生成总量**

| 类型 | 数量 | 尺寸 | 目录 |
|---|---:|---|---|
| 场景主图 | 29 | 2048×1152 PNG | `public/game/scenes/` |
| 动作图标 | 10 | 1024×1024 PNG | `public/game/actions/` |
| **合计** | **39** |  |  |


## **二、统一美术方向**

- **核心风格**：高完成度 16-bit / 32-bit JRPG 像素画，不是 8-bit、Minecraft 或粗糙放大像素。
- **世界观**：中国仙侠、山水、宗门、洞府、坊市、灵兽、法阵、飞升。
- **色彩**：墨绿、青黑、月白、旧金为基底；每条命运线有自己的识别色，但整套必须统一。
- **光照**：电影感但有明确主光源；避免整张图一片黑。
- **构图**：16:9 横幅，关键主体放在中央 4:3 安全区；底部 22% 保留较暗、较低细节的文字承托区。
- **人物**：人物是专业像素角色，不是几个矩形。要有服饰层次、发髻、袖摆、动作和明确剪影。
- **材质**：石、木、铜、布、水、雾、雷、灵光分别使用不同的像素纹理。
- **禁止**：可读文字、logo、水印、UI 边框、3D 渲染、摄影感、过曝霓虹、巨块像素、儿童玩具感、严重血腥。


### **统一场景提示词前缀**

```text
Professional high-resolution 16-bit / 32-bit JRPG pixel-art illustration for a Chinese xianxia cultivation life simulator. Handcrafted pixel clusters, crisp dark outlines, deliberate dithering, three-to-five value shading per material, rich environmental storytelling, cinematic atmospheric lighting. Translate Chinese ink-wash mist, paper texture, jade, old timber, stone, talismans, and restrained gold accents into polished pixel art. Elegant and mature, not childish. Single coherent scene. 16:9 landscape, intended master size 2048x1152. Keep all critical subjects inside the central 4:3 safe area because mobile will crop the sides. Keep the bottom 22 percent darker and lower-detail as breathing room for UI text. 
```


### **统一负面约束**

```text
Avoid: readable text, letters, logo, watermark, UI frame, border, speech caption, photorealistic rendering, painterly blur, 3D render, Minecraft blocks, 8-bit primitive shapes, giant square pixels, chibi proportions, cartoon toy look, low-resolution upscaling, muddy silhouettes, excessive neon, oversaturated rainbow palette, lens flare covering the subject, duplicated protagonist, anatomical errors, graphic gore.
```


## **三、建议生成顺序**

1. 先生成 `wanderer_debt`、`array_legacy`、`merchant_ledger`、`ascension_choice` 四张作为风格校准。
2. 四张放在同一画布检查：人物比例、像素密度、光源、材质、色温是否统一。
3. 确认后再批量生成剩余 25 张。
4. 场景全部完成后，再生成 10 个动作图标，保证图标和场景共享相同描边、像素密度和金色高光。


## **四、29 张场景逐一生成说明**


### **01. 雨夜旧恩**

- **文件名**：`wanderer_debt.png`
- **存放目录**：`public/game/scenes`
- **用途**：命运线：恩义与偿还｜lq_001、lq_003 等救助/报恩事件
- **中文画面说明**：雨后深夜的狭窄山道，一名重伤散修靠在岩壁边，主角带着伤药停在不远处。画面要有雨、血、旧玉和“救与不救”的压迫感。
- **色彩方向**：冷青黑、雨蓝、暗金、少量伤口红
- **画面核心**：两名人物关系、雨中伤势、半枚旧玉、伤药瓶

```text
Professional high-resolution 16-bit / 32-bit JRPG pixel-art illustration for a Chinese xianxia cultivation life simulator. Handcrafted pixel clusters, crisp dark outlines, deliberate dithering, three-to-five value shading per material, rich environmental storytelling, cinematic atmospheric lighting. Translate Chinese ink-wash mist, paper texture, jade, old timber, stone, talismans, and restrained gold accents into polished pixel art. Elegant and mature, not childish. Single coherent scene. 16:9 landscape, intended master size 2048x1152. Keep all critical subjects inside the central 4:3 safe area because mobile will crop the sides. Keep the bottom 22 percent darker and lower-detail as breathing room for UI text.  Scene: A rain-soaked mountain path at night in a Chinese cultivation world. A wounded wandering cultivator leans against a wet cliff, three sword cuts on his robe, one hand protecting a worn storage pouch. The protagonist, a young robed cultivator, stands a few steps away holding a half-used medicine bottle, hesitating between compassion and caution. A cracked half-jade pendant glints near the wounded man. Wet stone steps, twisted pines, distant temple lanterns, thin mist, rain streaks, subtle blood-red accents, warm medicine-bottle glow against cold blue-green night. Tell the story of debt and mercy without showing graphic gore. Palette direction: 冷青黑、雨蓝、暗金、少量伤口红. Critical visual focus: 两名人物关系、雨中伤势、半枚旧玉、伤药瓶. Avoid: readable text, letters, logo, watermark, UI frame, border, speech caption, photorealistic rendering, painterly blur, 3D render, Minecraft blocks, 8-bit primitive shapes, giant square pixels, chibi proportions, cartoon toy look, low-resolution upscaling, muddy silhouettes, excessive neon, oversaturated rainbow palette, lens flare covering the subject, duplicated protagonist, anatomical errors, graphic gore.
```


### **02. 山中有灵**

- **文件名**：`beast_bond.png`
- **存放目录**：`public/game/scenes`
- **用途**：命运线：灵兽与共生｜灵兽幼崽、兽潮相关事件
- **中文画面说明**：晨雾森林中，灰白灵兽幼崽被捕兽夹困住，主角伸手解救；远处树影里已有成年灵兽的眼睛。
- **色彩方向**：雾青、苔绿、暖琥珀眼睛、月白高光
- **画面核心**：灵兽幼崽、兽夹、伸出的手、树后发光的眼睛

```text
Professional high-resolution 16-bit / 32-bit JRPG pixel-art illustration for a Chinese xianxia cultivation life simulator. Handcrafted pixel clusters, crisp dark outlines, deliberate dithering, three-to-five value shading per material, rich environmental storytelling, cinematic atmospheric lighting. Translate Chinese ink-wash mist, paper texture, jade, old timber, stone, talismans, and restrained gold accents into polished pixel art. Elegant and mature, not childish. Single coherent scene. 16:9 landscape, intended master size 2048x1152. Keep all critical subjects inside the central 4:3 safe area because mobile will crop the sides. Keep the bottom 22 percent darker and lower-detail as breathing room for UI text.  Scene: A misty ancient mountain forest at dawn. A small grey-white spirit beast pup with a bleeding front paw is trapped in a rusted iron hunter trap among mossy roots. The protagonist crouches nearby, hand reaching toward the release mechanism, expression cautious and compassionate. Deep in the fog, several pairs of luminous amber eyes watch from between huge trees, suggesting a hidden adult spirit beast. Broken feathers, scattered spirit grass, paw prints in wet soil, soft jade-green dawn rays, drifting spores. The scene should feel intimate and alive, with a quiet warning that kindness has consequences. Palette direction: 雾青、苔绿、暖琥珀眼睛、月白高光. Critical visual focus: 灵兽幼崽、兽夹、伸出的手、树后发光的眼睛. Avoid: readable text, letters, logo, watermark, UI frame, border, speech caption, photorealistic rendering, painterly blur, 3D render, Minecraft blocks, 8-bit primitive shapes, giant square pixels, chibi proportions, cartoon toy look, low-resolution upscaling, muddy silhouettes, excessive neon, oversaturated rainbow palette, lens flare covering the subject, duplicated protagonist, anatomical errors, graphic gore.
```


### **03. 无主古墓**

- **文件名**：`ancient_tomb.png`
- **存放目录**：`public/game/scenes`
- **用途**：命运线：传承与代价｜古墓、遗迹、秘境、矿洞事件
- **中文画面说明**：山洪冲开的古墓入口，半张兽皮地图卡在门缝，墓门内飘出檀香与青绿色魂火。
- **色彩方向**：湿石灰、苔绿、魂火青、旧纸黄
- **画面核心**：古墓门、半张地图、魂火、互相提防的同行者

```text
Professional high-resolution 16-bit / 32-bit JRPG pixel-art illustration for a Chinese xianxia cultivation life simulator. Handcrafted pixel clusters, crisp dark outlines, deliberate dithering, three-to-five value shading per material, rich environmental storytelling, cinematic atmospheric lighting. Translate Chinese ink-wash mist, paper texture, jade, old timber, stone, talismans, and restrained gold accents into polished pixel art. Elegant and mature, not childish. Single coherent scene. 16:9 landscape, intended master size 2048x1152. Keep all critical subjects inside the central 4:3 safe area because mobile will crop the sides. Keep the bottom 22 percent darker and lower-detail as breathing room for UI text.  Scene: An unnamed ancient tomb exposed by a flash flood in a deep mountain ravine. Massive weathered stone doors are split open, half a beast-hide map wedged in the crack. Green soul-fire and pale incense smoke leak from the darkness. A young cultivator kneels beside the entrance, tracing a damaged map by the light of a paper lantern, while another robed figure watches from behind with a hand hidden in a sleeve. Broken guardian statues, wet cliffs, old talismans, scattered bones that are stylized rather than gruesome, cold teal light and aged stone textures. Palette direction: 湿石灰、苔绿、魂火青、旧纸黄. Critical visual focus: 古墓门、半张地图、魂火、互相提防的同行者. Avoid: readable text, letters, logo, watermark, UI frame, border, speech caption, photorealistic rendering, painterly blur, 3D render, Minecraft blocks, 8-bit primitive shapes, giant square pixels, chibi proportions, cartoon toy look, low-resolution upscaling, muddy silhouettes, excessive neon, oversaturated rainbow palette, lens flare covering the subject, duplicated protagonist, anatomical errors, graphic gore.
```


### **04. 山门清洗**

- **文件名**：`sect_purge.png`
- **存放目录**：`public/game/scenes`
- **用途**：命运线：势力与立场｜宗门内斗、站队、长老密信事件
- **中文画面说明**：封闭的宗门大殿，红蓝两派弟子分列，玉册名单和两封密信摆在中央，权力斗争一触即发。
- **色彩方向**：墨绿、宗红、冷蓝、玉白、暗金
- **画面核心**：两派站位、玉册名单、密信、被封住的山门

```text
Professional high-resolution 16-bit / 32-bit JRPG pixel-art illustration for a Chinese xianxia cultivation life simulator. Handcrafted pixel clusters, crisp dark outlines, deliberate dithering, three-to-five value shading per material, rich environmental storytelling, cinematic atmospheric lighting. Translate Chinese ink-wash mist, paper texture, jade, old timber, stone, talismans, and restrained gold accents into polished pixel art. Elegant and mature, not childish. Single coherent scene. 16:9 landscape, intended master size 2048x1152. Keep all critical subjects inside the central 4:3 safe area because mobile will crop the sides. Keep the bottom 22 percent darker and lower-detail as breathing room for UI text.  Scene: A tense sect hall during a political purge. The mountain gate is sealed behind the protagonist. Disciples and elders divide into two factions marked by muted red and blue banners. In the center, an open jade roster and two sealed letters rest on a low stone table. The protagonist stands between both sides, one hand over the roster, unable to remain neutral. Tall dark wooden pillars, hanging lanterns, cold shafts of light through smoke, ceremonial swords still sheathed, faint gold and blood-red accents. The mood is dangerous and restrained, not a chaotic battle. Palette direction: 墨绿、宗红、冷蓝、玉白、暗金. Critical visual focus: 两派站位、玉册名单、密信、被封住的山门. Avoid: readable text, letters, logo, watermark, UI frame, border, speech caption, photorealistic rendering, painterly blur, 3D render, Minecraft blocks, 8-bit primitive shapes, giant square pixels, chibi proportions, cartoon toy look, low-resolution upscaling, muddy silhouettes, excessive neon, oversaturated rainbow palette, lens flare covering the subject, duplicated protagonist, anatomical errors, graphic gore.
```


### **05. 故乡灯火**

- **文件名**：`mortal_kin.png`
- **存放目录**：`public/game/scenes`
- **用途**：命运线：仙凡与亲缘｜故乡、家书、亲族、凡人村落事件
- **中文画面说明**：修仙者站在山腰，远望凡俗故乡的一盏灯火；家书沾着灶灰，母亲的身影在窗后。
- **色彩方向**：夜蓝、墨黑、窗火金、炊烟灰
- **画面核心**：山腰背影、远处一盏窗火、沾灰家书、凡俗与仙途的距离

```text
Professional high-resolution 16-bit / 32-bit JRPG pixel-art illustration for a Chinese xianxia cultivation life simulator. Handcrafted pixel clusters, crisp dark outlines, deliberate dithering, three-to-five value shading per material, rich environmental storytelling, cinematic atmospheric lighting. Translate Chinese ink-wash mist, paper texture, jade, old timber, stone, talismans, and restrained gold accents into polished pixel art. Elegant and mature, not childish. Single coherent scene. 16:9 landscape, intended master size 2048x1152. Keep all critical subjects inside the central 4:3 safe area because mobile will crop the sides. Keep the bottom 22 percent darker and lower-detail as breathing room for UI text.  Scene: A distant mortal village at night, seen from a mountain path. One small farmhouse window glows warm amber among dark tiled roofs and terraced fields. Inside the window, the faint silhouette of an aging mother; outside, the protagonist cultivator stands alone on the ridge, holding a soot-stained family letter. The immense gap between the immortal path and mortal life is shown through scale: tiny village below, vast mountain silhouettes and cold stars above. Fireflies, chimney smoke, a wooden hairpin as a keepsake, restrained melancholy, no melodrama. Palette direction: 夜蓝、墨黑、窗火金、炊烟灰. Critical visual focus: 山腰背影、远处一盏窗火、沾灰家书、凡俗与仙途的距离. Avoid: readable text, letters, logo, watermark, UI frame, border, speech caption, photorealistic rendering, painterly blur, 3D render, Minecraft blocks, 8-bit primitive shapes, giant square pixels, chibi proportions, cartoon toy look, low-resolution upscaling, muddy silhouettes, excessive neon, oversaturated rainbow palette, lens flare covering the subject, duplicated protagonist, anatomical errors, graphic gore.
```


### **06. 黑市禁术**

- **文件名**：`demonic_bargain.png`
- **存放目录**：`public/game/scenes`
- **用途**：命运线：捷径与代价｜黑市禁书、心魔、魔气反噬事件
- **中文画面说明**：地下黑市最深处，无字黑册自动翻页，摊主没有脸，镜中的影子比主角先动。
- **色彩方向**：漆黑、血红、脏金、冷紫
- **画面核心**：无字黑册、红色禁印、无脸摊主、先动的镜中影子

```text
Professional high-resolution 16-bit / 32-bit JRPG pixel-art illustration for a Chinese xianxia cultivation life simulator. Handcrafted pixel clusters, crisp dark outlines, deliberate dithering, three-to-five value shading per material, rich environmental storytelling, cinematic atmospheric lighting. Translate Chinese ink-wash mist, paper texture, jade, old timber, stone, talismans, and restrained gold accents into polished pixel art. Elegant and mature, not childish. Single coherent scene. 16:9 landscape, intended master size 2048x1152. Keep all critical subjects inside the central 4:3 safe area because mobile will crop the sides. Keep the bottom 22 percent darker and lower-detail as breathing room for UI text.  Scene: The deepest alley of an underground black market, lit by crimson paper lanterns and sickly violet flames. A faceless hooded vendor offers an open black book with no cover text; a red forbidden sigil floats above its pages. The protagonist reaches toward it but hesitates. In a tarnished mirror behind them, the protagonist’s shadow blinks or moves a fraction earlier than the body. Wooden stalls, caged talismans, smoke, scattered bone dice, dark lacquer and tarnished gold, forbidden temptation rather than gore. Palette direction: 漆黑、血红、脏金、冷紫. Critical visual focus: 无字黑册、红色禁印、无脸摊主、先动的镜中影子. Avoid: readable text, letters, logo, watermark, UI frame, border, speech caption, photorealistic rendering, painterly blur, 3D render, Minecraft blocks, 8-bit primitive shapes, giant square pixels, chibi proportions, cartoon toy look, low-resolution upscaling, muddy silhouettes, excessive neon, oversaturated rainbow palette, lens flare covering the subject, duplicated protagonist, anatomical errors, graphic gore.
```


### **07. 夜半剑鸣**

- **文件名**：`sword_grave.png`
- **存放目录**：`public/game/scenes`
- **用途**：命运线：剑心与锋芒｜旧剑、剑冢、剑心试炼事件
- **中文画面说明**：月下剑冢，数百柄残剑插在岩地，一柄无名旧剑自行轻鸣，主角站在剑阵中央。
- **色彩方向**：月白、钢蓝、墨黑、少量冷金
- **画面核心**：中央旧剑、剑林纵深、月下独行者、剑鸣光环

```text
Professional high-resolution 16-bit / 32-bit JRPG pixel-art illustration for a Chinese xianxia cultivation life simulator. Handcrafted pixel clusters, crisp dark outlines, deliberate dithering, three-to-five value shading per material, rich environmental storytelling, cinematic atmospheric lighting. Translate Chinese ink-wash mist, paper texture, jade, old timber, stone, talismans, and restrained gold accents into polished pixel art. Elegant and mature, not childish. Single coherent scene. 16:9 landscape, intended master size 2048x1152. Keep all critical subjects inside the central 4:3 safe area because mobile will crop the sides. Keep the bottom 22 percent darker and lower-detail as breathing room for UI text.  Scene: A moonlit sword graveyard on a windswept mountain. Hundreds of broken swords are embedded in black rock, each with a different silhouette and oxidized metal tone. One simple unnamed ancient sword stands upright in the center, vibrating with a thin white-blue sword aura. The protagonist stands before it, robes pulled by wind, one hand hovering near the hilt. A huge pale moon, drifting cloud ribbons, faint ghostly sword shadows, condensation and sparks. The composition should express loneliness, discipline, and a blade choosing its bearer. Palette direction: 月白、钢蓝、墨黑、少量冷金. Critical visual focus: 中央旧剑、剑林纵深、月下独行者、剑鸣光环. Avoid: readable text, letters, logo, watermark, UI frame, border, speech caption, photorealistic rendering, painterly blur, 3D render, Minecraft blocks, 8-bit primitive shapes, giant square pixels, chibi proportions, cartoon toy look, low-resolution upscaling, muddy silhouettes, excessive neon, oversaturated rainbow palette, lens flare covering the subject, duplicated protagonist, anatomical errors, graphic gore.
```


### **08. 丹炉余烬**

- **文件名**：`pill_toxin.png`
- **存放目录**：`public/game/scenes`
- **用途**：命运线：捷径与医道｜炼丹失败、药毒、疫病、救人取舍事件
- **中文画面说明**：半塌的丹房内，铜炉裂开，绿红双色毒烟弥漫；一炉成丹与一叠药方前，主角必须决定救谁。
- **色彩方向**：炉火金、毒烟绿、铜锈、深夜墨黑
- **画面核心**：裂开的铜炉、一枚成丹、药方、帘后的病人

```text
Professional high-resolution 16-bit / 32-bit JRPG pixel-art illustration for a Chinese xianxia cultivation life simulator. Handcrafted pixel clusters, crisp dark outlines, deliberate dithering, three-to-five value shading per material, rich environmental storytelling, cinematic atmospheric lighting. Translate Chinese ink-wash mist, paper texture, jade, old timber, stone, talismans, and restrained gold accents into polished pixel art. Elegant and mature, not childish. Single coherent scene. 16:9 landscape, intended master size 2048x1152. Keep all critical subjects inside the central 4:3 safe area because mobile will crop the sides. Keep the bottom 22 percent darker and lower-detail as breathing room for UI text.  Scene: Inside a half-collapsed alchemy chamber, a bronze pill furnace has cracked open and leaks curling green and red smoke. On a stone workbench sit one perfect golden pill, a pile of unfinished prescriptions, and several empty medicine jars. The protagonist stands between the furnace and rows of sick disciples resting behind a curtain, sleeves tied back, face lit by flame. Herbs hang from beams, cauldron tools and jade spoons are scattered, smoke forms faint ghostly shapes. Tense medical-moral drama, warm fire against poisonous green shadows. Palette direction: 炉火金、毒烟绿、铜锈、深夜墨黑. Critical visual focus: 裂开的铜炉、一枚成丹、药方、帘后的病人. Avoid: readable text, letters, logo, watermark, UI frame, border, speech caption, photorealistic rendering, painterly blur, 3D render, Minecraft blocks, 8-bit primitive shapes, giant square pixels, chibi proportions, cartoon toy look, low-resolution upscaling, muddy silhouettes, excessive neon, oversaturated rainbow palette, lens flare covering the subject, duplicated protagonist, anatomical errors, graphic gore.
```


### **09. 残阵山河**

- **文件名**：`array_legacy.png`
- **存放目录**：`public/game/scenes`
- **用途**：命运线：阵法与守护｜护山大阵、残阵、灵脉防线事件
- **中文画面说明**：山腹巨阵亮起，阵纹如山河经脉铺满地面；主角站在阵心，远处敌宗攻山。
- **色彩方向**：阵纹青绿、山岩墨灰、敌火橙红、电光白
- **画面核心**：巨阵全景、阵心人物、缺损阵纹、远处攻山军势

```text
Professional high-resolution 16-bit / 32-bit JRPG pixel-art illustration for a Chinese xianxia cultivation life simulator. Handcrafted pixel clusters, crisp dark outlines, deliberate dithering, three-to-five value shading per material, rich environmental storytelling, cinematic atmospheric lighting. Translate Chinese ink-wash mist, paper texture, jade, old timber, stone, talismans, and restrained gold accents into polished pixel art. Elegant and mature, not childish. Single coherent scene. 16:9 landscape, intended master size 2048x1152. Keep all critical subjects inside the central 4:3 safe area because mobile will crop the sides. Keep the bottom 22 percent darker and lower-detail as breathing room for UI text.  Scene: A colossal ancient formation carved into the hollow interior of a sacred mountain. Glowing jade lines spread across the stone floor like rivers and meridians, with one third of the runes missing. The protagonist stands at the formation core, sleeves raised, channeling pale green energy into a damaged ring. Through the open cave mouth, an enemy sect army with lanterns and siege banners advances under storm clouds. Floating talisman stones, waterfalls, broken pillars, immense scale, heroic sacrifice, sharp contrast between turquoise formation light and distant fire. Palette direction: 阵纹青绿、山岩墨灰、敌火橙红、电光白. Critical visual focus: 巨阵全景、阵心人物、缺损阵纹、远处攻山军势. Avoid: readable text, letters, logo, watermark, UI frame, border, speech caption, photorealistic rendering, painterly blur, 3D render, Minecraft blocks, 8-bit primitive shapes, giant square pixels, chibi proportions, cartoon toy look, low-resolution upscaling, muddy silhouettes, excessive neon, oversaturated rainbow palette, lens flare covering the subject, duplicated protagonist, anatomical errors, graphic gore.
```


### **10. 同门旧怨**

- **文件名**：`rival_brother.png`
- **存放目录**：`public/game/scenes`
- **用途**：命运线：竞争与输赢｜试炼、旧怨、宿敌对决事件
- **中文画面说明**：黎明试炼台上，两名同门执剑相对，旧怨与克制同时写在两人的站姿里。
- **色彩方向**：晨曦金、青灰石、制服青蓝与暗红
- **画面核心**：对立的两人、交叉剑锋、旧护腕与断剑牌、黎明宗门台

```text
Professional high-resolution 16-bit / 32-bit JRPG pixel-art illustration for a Chinese xianxia cultivation life simulator. Handcrafted pixel clusters, crisp dark outlines, deliberate dithering, three-to-five value shading per material, rich environmental storytelling, cinematic atmospheric lighting. Translate Chinese ink-wash mist, paper texture, jade, old timber, stone, talismans, and restrained gold accents into polished pixel art. Elegant and mature, not childish. Single coherent scene. 16:9 landscape, intended master size 2048x1152. Keep all critical subjects inside the central 4:3 safe area because mobile will crop the sides. Keep the bottom 22 percent darker and lower-detail as breathing room for UI text.  Scene: A dawn sect trial platform high on a mountain. Two young cultivators in matching but differently accented sect uniforms face each other with swords drawn, not yet striking. One is controlled and cold; the other has a faint bitter smile. Their blades cross at a cautious distance, sparks only at the tips. Behind them: tiered temple roofs, prayer flags, stone lion statues, a pale sunrise breaking through cloud. Small details show a long shared history: matching old wrist guards and a broken practice sword token. Restrained rivalry, elegant tension, no gore. Palette direction: 晨曦金、青灰石、制服青蓝与暗红. Critical visual focus: 对立的两人、交叉剑锋、旧护腕与断剑牌、黎明宗门台. Avoid: readable text, letters, logo, watermark, UI frame, border, speech caption, photorealistic rendering, painterly blur, 3D render, Minecraft blocks, 8-bit primitive shapes, giant square pixels, chibi proportions, cartoon toy look, low-resolution upscaling, muddy silhouettes, excessive neon, oversaturated rainbow palette, lens flare covering the subject, duplicated protagonist, anatomical errors, graphic gore.
```


### **11. 师尊旧案**

- **文件名**：`master_secret.png`
- **存放目录**：`public/game/scenes`
- **用途**：命运线：师承与真相｜禁地残卷、师尊旧名、欺师救师事件
- **中文画面说明**：尘封典籍阁里，残卷露出师尊的旧名；师尊背对烛火，主角手中握着抄本。
- **色彩方向**：旧纸黄、烛火金、墨褐、冷蓝阴影
- **画面核心**：残卷上的旧名、主角抄本、背对的师尊、分隔两人的长影

```text
Professional high-resolution 16-bit / 32-bit JRPG pixel-art illustration for a Chinese xianxia cultivation life simulator. Handcrafted pixel clusters, crisp dark outlines, deliberate dithering, three-to-five value shading per material, rich environmental storytelling, cinematic atmospheric lighting. Translate Chinese ink-wash mist, paper texture, jade, old timber, stone, talismans, and restrained gold accents into polished pixel art. Elegant and mature, not childish. Single coherent scene. 16:9 landscape, intended master size 2048x1152. Keep all critical subjects inside the central 4:3 safe area because mobile will crop the sides. Keep the bottom 22 percent darker and lower-detail as breathing room for UI text.  Scene: A forbidden archive inside an old sect library, filled with towering shelves, sealed scroll tubes, and dust suspended in candlelight. The protagonist holds an open copied scroll revealing an old name connected to the master. In the background, the master stands with his back turned, one hand resting on a sword, face unseen. A single candle lights the scene; long shadows divide the two figures across the floor. Broken seal clay, faded photographs replaced by painted portraits, old ink and dark wood. Quiet betrayal, unresolved truth, emotional restraint. Palette direction: 旧纸黄、烛火金、墨褐、冷蓝阴影. Critical visual focus: 残卷上的旧名、主角抄本、背对的师尊、分隔两人的长影. Avoid: readable text, letters, logo, watermark, UI frame, border, speech caption, photorealistic rendering, painterly blur, 3D render, Minecraft blocks, 8-bit primitive shapes, giant square pixels, chibi proportions, cartoon toy look, low-resolution upscaling, muddy silhouettes, excessive neon, oversaturated rainbow palette, lens flare covering the subject, duplicated protagonist, anatomical errors, graphic gore.
```


### **12. 器中之魂**

- **文件名**：`lost_soul.png`
- **存放目录**：`public/game/scenes`
- **用途**：命运线：记忆与自我｜古镜、旧器、识海、器魂事件
- **中文画面说明**：荒宅铜镜中映出一名不属于主角的女子残魂，蓝色记忆丝线缠向主角手腕。
- **色彩方向**：铜青、记忆蓝、月白、残红
- **画面核心**：镜中女子、无倒影的主角、记忆碎片、缠腕蓝丝

```text
Professional high-resolution 16-bit / 32-bit JRPG pixel-art illustration for a Chinese xianxia cultivation life simulator. Handcrafted pixel clusters, crisp dark outlines, deliberate dithering, three-to-five value shading per material, rich environmental storytelling, cinematic atmospheric lighting. Translate Chinese ink-wash mist, paper texture, jade, old timber, stone, talismans, and restrained gold accents into polished pixel art. Elegant and mature, not childish. Single coherent scene. 16:9 landscape, intended master size 2048x1152. Keep all critical subjects inside the central 4:3 safe area because mobile will crop the sides. Keep the bottom 22 percent darker and lower-detail as breathing room for UI text.  Scene: A ruined mountain hall containing a large tarnished bronze mirror. The mirror reflects a translucent noblewoman spirit in ancient blue robes, but the protagonist standing in front of it casts no matching reflection. Fine blue memory threads curl from the mirror toward the protagonist’s wrist. Fragments of another life float in the air like broken stained-glass memories: a bridge, a farewell, a burning courtyard. Dust, torn curtains, cold moonlight, and eerie beauty rather than horror. The protagonist reaches out but keeps one hand over their own heart, questioning who controls the body. Palette direction: 铜青、记忆蓝、月白、残红. Critical visual focus: 镜中女子、无倒影的主角、记忆碎片、缠腕蓝丝. Avoid: readable text, letters, logo, watermark, UI frame, border, speech caption, photorealistic rendering, painterly blur, 3D render, Minecraft blocks, 8-bit primitive shapes, giant square pixels, chibi proportions, cartoon toy look, low-resolution upscaling, muddy silhouettes, excessive neon, oversaturated rainbow palette, lens flare covering the subject, duplicated protagonist, anatomical errors, graphic gore.
```


### **13. 坊市账簿**

- **文件名**：`merchant_ledger.png`
- **存放目录**：`public/game/scenes`
- **用途**：命运线：利益与人情｜商队、拍卖、旧账、坊市店铺事件
- **中文画面说明**：深夜坊市即将收摊，一本旧账翻到无人认领的灵石记录；主角站在最大铺面门前。
- **色彩方向**：夜市金、灯红、墨绿、灵石青光
- **画面核心**：摊开的旧账、灵石与秤、主街纵深、尽头的大铺面

```text
Professional high-resolution 16-bit / 32-bit JRPG pixel-art illustration for a Chinese xianxia cultivation life simulator. Handcrafted pixel clusters, crisp dark outlines, deliberate dithering, three-to-five value shading per material, rich environmental storytelling, cinematic atmospheric lighting. Translate Chinese ink-wash mist, paper texture, jade, old timber, stone, talismans, and restrained gold accents into polished pixel art. Elegant and mature, not childish. Single coherent scene. 16:9 landscape, intended master size 2048x1152. Keep all critical subjects inside the central 4:3 safe area because mobile will crop the sides. Keep the bottom 22 percent darker and lower-detail as breathing room for UI text.  Scene: A lively night market of the cultivation world just before closing. Lanterns in gold, jade, and faded red illuminate narrow streets; stalls sell herbs, talismans, spirit stones, and beast materials. In the foreground, an old merchant ledger lies open beside a scale and a bag of spirit stones. A highlighted entry records wealth entrusted by a dead rogue cultivator, with no listed heir. The protagonist stands before the biggest shop at the end of the street, weighing a coin. Rain-wet cobblestones, smoke from food stalls, merchants packing goods, rich warm gold against deep green night. Palette direction: 夜市金、灯红、墨绿、灵石青光. Critical visual focus: 摊开的旧账、灵石与秤、主街纵深、尽头的大铺面. Avoid: readable text, letters, logo, watermark, UI frame, border, speech caption, photorealistic rendering, painterly blur, 3D render, Minecraft blocks, 8-bit primitive shapes, giant square pixels, chibi proportions, cartoon toy look, low-resolution upscaling, muddy silhouettes, excessive neon, oversaturated rainbow palette, lens flare covering the subject, duplicated protagonist, anatomical errors, graphic gore.
```


### **14. 边地狼烟**

- **文件名**：`border_war.png`
- **存放目录**：`public/game/scenes`
- **用途**：命运线：战争与守护｜边城、兽潮、征召、守城事件
- **中文画面说明**：边城城门即将失守，兽潮和魔军压境；主角站在缺口前，身后是撤离的凡人。
- **色彩方向**：烽火橙、血红天空、铁灰城墙、护体青绿
- **画面核心**：城门缺口、主角孤身断后、撤离凡人、远处兽潮

```text
Professional high-resolution 16-bit / 32-bit JRPG pixel-art illustration for a Chinese xianxia cultivation life simulator. Handcrafted pixel clusters, crisp dark outlines, deliberate dithering, three-to-five value shading per material, rich environmental storytelling, cinematic atmospheric lighting. Translate Chinese ink-wash mist, paper texture, jade, old timber, stone, talismans, and restrained gold accents into polished pixel art. Elegant and mature, not childish. Single coherent scene. 16:9 landscape, intended master size 2048x1152. Keep all critical subjects inside the central 4:3 safe area because mobile will crop the sides. Keep the bottom 22 percent darker and lower-detail as breathing room for UI text.  Scene: A desperate battle at the border city gate under a red smoke-filled sky. The outer wall is breached; monstrous beasts and dark cultivators press through the gap while ordinary villagers flee toward the inner city. The protagonist stands alone in the center of the breach, robe torn, sword planted into the ground, a protective jade barrier flaring around them. Beacons burn, arrows and talismans streak through the air, soldiers hold the ramparts. Epic scale, clear silhouettes, dramatic orange fire against cold iron and black smoke. Inspiring sacrifice, no gratuitous gore. Palette direction: 烽火橙、血红天空、铁灰城墙、护体青绿. Critical visual focus: 城门缺口、主角孤身断后、撤离凡人、远处兽潮. Avoid: readable text, letters, logo, watermark, UI frame, border, speech caption, photorealistic rendering, painterly blur, 3D render, Minecraft blocks, 8-bit primitive shapes, giant square pixels, chibi proportions, cartoon toy look, low-resolution upscaling, muddy silhouettes, excessive neon, oversaturated rainbow palette, lens flare covering the subject, duplicated protagonist, anatomical errors, graphic gore.
```


### **15. 执法堂旧案**

- **文件名**：`false_accusation.png`
- **存放目录**：`public/game/scenes`
- **用途**：命运线：清白与代价｜执法堂、冤案、旧案重审事件
- **中文画面说明**：冷峻执法堂中，一枚伪造灵牌作为证物摆在中央，年轻弟子跪在堂下，主角站在证人席前。
- **色彩方向**：冷蓝灰、玉白、墨黑、少量旧案黄
- **画面核心**：中央证物灵牌、跪着的弟子、主角手中卷宗、审判高台

```text
Professional high-resolution 16-bit / 32-bit JRPG pixel-art illustration for a Chinese xianxia cultivation life simulator. Handcrafted pixel clusters, crisp dark outlines, deliberate dithering, three-to-five value shading per material, rich environmental storytelling, cinematic atmospheric lighting. Translate Chinese ink-wash mist, paper texture, jade, old timber, stone, talismans, and restrained gold accents into polished pixel art. Elegant and mature, not childish. Single coherent scene. 16:9 landscape, intended master size 2048x1152. Keep all critical subjects inside the central 4:3 safe area because mobile will crop the sides. Keep the bottom 22 percent darker and lower-detail as breathing room for UI text.  Scene: A severe sect law hall lit by cold blue light from high windows. An elder tribunal sits behind a long dark table; an accused young disciple kneels below with hands bound by a spiritual seal. In the center, a forged jade identity plaque lies beside the real one, the new carving marks clearly visible. The protagonist stands near the witness stand, holding the only file that can overturn the case, caught between truth and self-preservation. Incense smoke, carved judgment motifs, rows of silent disciples, cold gray-blue and desaturated jade, tense and dignified. Palette direction: 冷蓝灰、玉白、墨黑、少量旧案黄. Critical visual focus: 中央证物灵牌、跪着的弟子、主角手中卷宗、审判高台. Avoid: readable text, letters, logo, watermark, UI frame, border, speech caption, photorealistic rendering, painterly blur, 3D render, Minecraft blocks, 8-bit primitive shapes, giant square pixels, chibi proportions, cartoon toy look, low-resolution upscaling, muddy silhouettes, excessive neon, oversaturated rainbow palette, lens flare covering the subject, duplicated protagonist, anatomical errors, graphic gore.
```


### **16. 一条灵脉**

- **文件名**：`spirit_vein.png`
- **存放目录**：`public/game/scenes`
- **用途**：命运线：资源与众生｜灵脉、地脉、宗门索地、村落水源事件
- **中文画面说明**：地下灵脉像青色河流发光，上方是村庄第一口甜水井；宗门代表、村民和地脉意识形成三方冲突。
- **色彩方向**：灵脉青、湿土褐、井水蓝、宗门金
- **画面核心**：地下灵脉河、地面水井、三方人物、地脉裂纹

```text
Professional high-resolution 16-bit / 32-bit JRPG pixel-art illustration for a Chinese xianxia cultivation life simulator. Handcrafted pixel clusters, crisp dark outlines, deliberate dithering, three-to-five value shading per material, rich environmental storytelling, cinematic atmospheric lighting. Translate Chinese ink-wash mist, paper texture, jade, old timber, stone, talismans, and restrained gold accents into polished pixel art. Elegant and mature, not childish. Single coherent scene. 16:9 landscape, intended master size 2048x1152. Keep all critical subjects inside the central 4:3 safe area because mobile will crop the sides. Keep the bottom 22 percent darker and lower-detail as breathing room for UI text.  Scene: A cross-section view of a mountain spirit vein: below ground, a luminous turquoise river of energy flows through roots and rock; above, a small mortal village gathers around a newly dug sweet-water well. On opposite sides stand a sect envoy holding a land contract and village elders carrying simple farming tools. The protagonist stands at the edge of the glowing vein, palm pressed to stone, feeling the earth’s slow consciousness. Cracks, glowing mineral deposits, carved boundary markers, mist rising from the well. Theme of resource, responsibility, and shared consequence. Palette direction: 灵脉青、湿土褐、井水蓝、宗门金. Critical visual focus: 地下灵脉河、地面水井、三方人物、地脉裂纹. Avoid: readable text, letters, logo, watermark, UI frame, border, speech caption, photorealistic rendering, painterly blur, 3D render, Minecraft blocks, 8-bit primitive shapes, giant square pixels, chibi proportions, cartoon toy look, low-resolution upscaling, muddy silhouettes, excessive neon, oversaturated rainbow palette, lens flare covering the subject, duplicated protagonist, anatomical errors, graphic gore.
```


### **17. 器灵开价**

- **文件名**：`ancient_artifact.png`
- **存放目录**：`public/game/scenes`
- **用途**：命运线：力量与自我｜古鼎、器灵、记忆交易、人器一体事件
- **中文画面说明**：河底浮出的青铜古鼎立在岸边，鼎中现出孩童般器灵和漂浮的记忆光泡，向主角索取记忆。
- **色彩方向**：河夜蓝、铜锈绿、器灵紫、记忆珠光
- **画面核心**：青铜古鼎、孩童器灵、漂浮记忆泡、主角克制的动作

```text
Professional high-resolution 16-bit / 32-bit JRPG pixel-art illustration for a Chinese xianxia cultivation life simulator. Handcrafted pixel clusters, crisp dark outlines, deliberate dithering, three-to-five value shading per material, rich environmental storytelling, cinematic atmospheric lighting. Translate Chinese ink-wash mist, paper texture, jade, old timber, stone, talismans, and restrained gold accents into polished pixel art. Elegant and mature, not childish. Single coherent scene. 16:9 landscape, intended master size 2048x1152. Keep all critical subjects inside the central 4:3 safe area because mobile will crop the sides. Keep the bottom 22 percent darker and lower-detail as breathing room for UI text.  Scene: A dark ancient river at night. A damaged bronze cauldron has risen from the water and now rests on the bank, its surface covered in tiny tooth-like engravings and wet algae. Above the cauldron floats a childlike artifact spirit made of blue-violet light, innocent but unsettling. Memory bubbles hover around it: a tea cup, a friend’s face, a rainy doorway, all semi-transparent. The protagonist reaches toward the spirit but keeps one hand near a small preserved keepsake. Reflective water, reeds, ghostly river mist, intimate supernatural bargain rather than generic magic. Palette direction: 河夜蓝、铜锈绿、器灵紫、记忆珠光. Critical visual focus: 青铜古鼎、孩童器灵、漂浮记忆泡、主角克制的动作. Avoid: readable text, letters, logo, watermark, UI frame, border, speech caption, photorealistic rendering, painterly blur, 3D render, Minecraft blocks, 8-bit primitive shapes, giant square pixels, chibi proportions, cartoon toy look, low-resolution upscaling, muddy silhouettes, excessive neon, oversaturated rainbow palette, lens flare covering the subject, duplicated protagonist, anatomical errors, graphic gore.
```


### **18. 天门之前**

- **文件名**：`ascension_choice.png`
- **存放目录**：`public/game/scenes`
- **用途**：命运线：飞升与人间｜飞升、灵界召唤、旧人拦路、守山或离去事件
- **中文画面说明**：云海之上的巨大天门开启，门后是灵界神光，门下山门与旧人渺小可见，主角站在门槛前回望。
- **色彩方向**：天门金白、灵界紫、云海青、人间暖灯
- **画面核心**：巨大天门、门的另一侧灵界、回望的主角、渺小的人间

```text
Professional high-resolution 16-bit / 32-bit JRPG pixel-art illustration for a Chinese xianxia cultivation life simulator. Handcrafted pixel clusters, crisp dark outlines, deliberate dithering, three-to-five value shading per material, rich environmental storytelling, cinematic atmospheric lighting. Translate Chinese ink-wash mist, paper texture, jade, old timber, stone, talismans, and restrained gold accents into polished pixel art. Elegant and mature, not childish. Single coherent scene. 16:9 landscape, intended master size 2048x1152. Keep all critical subjects inside the central 4:3 safe area because mobile will crop the sides. Keep the bottom 22 percent darker and lower-detail as breathing room for UI text.  Scene: A colossal heavenly gate opening above a sea of clouds. Beyond the gate is a vast luminous spirit realm with impossible floating mountains and gold-white divine light; below it, tiny and distant, lie the sect gate, mortal village, and a few old companions waiting on a stone path. The protagonist stands on the threshold between both worlds, one foot forward, body turned halfway back. Flowing robes, glowing stairways made of talisman fragments, cloud currents, gold-violet and jade-white light. Epic, solemn, and emotionally torn between ascension and human bonds. Palette direction: 天门金白、灵界紫、云海青、人间暖灯. Critical visual focus: 巨大天门、门的另一侧灵界、回望的主角、渺小的人间. Avoid: readable text, letters, logo, watermark, UI frame, border, speech caption, photorealistic rendering, painterly blur, 3D render, Minecraft blocks, 8-bit primitive shapes, giant square pixels, chibi proportions, cartoon toy look, low-resolution upscaling, muddy silhouettes, excessive neon, oversaturated rainbow palette, lens flare covering the subject, duplicated protagonist, anatomical errors, graphic gore.
```


### **19. 人间坊市**

- **文件名**：`market.png`
- **存放目录**：`public/game/scenes`
- **用途**：通用：坊市、交易、护送、拍卖、药铺、黑市之外的生活事件
- **中文画面说明**：修仙坊市的傍晚，多层木楼、摊贩、灵草、符纸和灵石交易繁荣，但不过度奇幻。
- **色彩方向**：暖灯笼金、木褐、灵草绿、夜蓝
- **画面核心**：街市纵深、摊贩群像、灵草与符纸、拍卖台

```text
Professional high-resolution 16-bit / 32-bit JRPG pixel-art illustration for a Chinese xianxia cultivation life simulator. Handcrafted pixel clusters, crisp dark outlines, deliberate dithering, three-to-five value shading per material, rich environmental storytelling, cinematic atmospheric lighting. Translate Chinese ink-wash mist, paper texture, jade, old timber, stone, talismans, and restrained gold accents into polished pixel art. Elegant and mature, not childish. Single coherent scene. 16:9 landscape, intended master size 2048x1152. Keep all critical subjects inside the central 4:3 safe area because mobile will crop the sides. Keep the bottom 22 percent darker and lower-detail as breathing room for UI text.  Scene: A broad, believable cultivation-world market street at dusk. Multi-story dark wooden shops with curved eaves, food stalls, herb sellers, talisman booths, a beast-material merchant, and a small open auction platform. Cultivators of different ranks negotiate beside ordinary merchants. Lanterns glow warm gold; spirit stones shine pale jade. The camera is slightly low, showing street depth and lively human detail. No single hero pose; this is a living world backdrop. Rich environmental storytelling, readable shop signs replaced by abstract symbols rather than text. Palette direction: 暖灯笼金、木褐、灵草绿、夜蓝. Critical visual focus: 街市纵深、摊贩群像、灵草与符纸、拍卖台. Avoid: readable text, letters, logo, watermark, UI frame, border, speech caption, photorealistic rendering, painterly blur, 3D render, Minecraft blocks, 8-bit primitive shapes, giant square pixels, chibi proportions, cartoon toy look, low-resolution upscaling, muddy silhouettes, excessive neon, oversaturated rainbow palette, lens flare covering the subject, duplicated protagonist, anatomical errors, graphic gore.
```


### **20. 凡俗故乡**

- **文件名**：`village.png`
- **存放目录**：`public/game/scenes`
- **用途**：通用：凡人村落、乡亲、荒年、守灵、故土事件
- **中文画面说明**：山脚凡俗村落，茅屋、田埂、古井、祠堂与远山，黄昏里有人挑水，也有人望向仙山。
- **色彩方向**：田土褐、麦金、竹青、远山蓝
- **画面核心**：村口古井、祠堂、田埂、远处仙山

```text
Professional high-resolution 16-bit / 32-bit JRPG pixel-art illustration for a Chinese xianxia cultivation life simulator. Handcrafted pixel clusters, crisp dark outlines, deliberate dithering, three-to-five value shading per material, rich environmental storytelling, cinematic atmospheric lighting. Translate Chinese ink-wash mist, paper texture, jade, old timber, stone, talismans, and restrained gold accents into polished pixel art. Elegant and mature, not childish. Single coherent scene. 16:9 landscape, intended master size 2048x1152. Keep all critical subjects inside the central 4:3 safe area because mobile will crop the sides. Keep the bottom 22 percent darker and lower-detail as breathing room for UI text.  Scene: An ordinary mortal village at the foot of towering cultivation mountains, during late golden hour. Tiled-roof cottages, terraced fields, a stone well, drying grain, a small ancestral hall, and cooking smoke. Villagers carry water and firewood; one child points toward the distant immortal sect on the peaks. The protagonist is a small robed figure passing along the edge of the village, visibly belonging to neither world. Grounded rural detail, warm earth tones, soft mist, melancholy but not poor or miserable. Palette direction: 田土褐、麦金、竹青、远山蓝. Critical visual focus: 村口古井、祠堂、田埂、远处仙山. Avoid: readable text, letters, logo, watermark, UI frame, border, speech caption, photorealistic rendering, painterly blur, 3D render, Minecraft blocks, 8-bit primitive shapes, giant square pixels, chibi proportions, cartoon toy look, low-resolution upscaling, muddy silhouettes, excessive neon, oversaturated rainbow palette, lens flare covering the subject, duplicated protagonist, anatomical errors, graphic gore.
```


### **21. 旧人重逢**

- **文件名**：`bonds.png`
- **存放目录**：`public/game/scenes`
- **用途**：通用：师尊、同门、旧友、亲族、弟子、道侣互动
- **中文画面说明**：山中茶亭，两位修士隔着旧木桌对坐，热茶和一把旧伞暗示多年关系。
- **色彩方向**：茶褐、雨蓝、暖灯金、松针绿
- **画面核心**：对坐人物、热茶、旧伞、雨后的山谷

```text
Professional high-resolution 16-bit / 32-bit JRPG pixel-art illustration for a Chinese xianxia cultivation life simulator. Handcrafted pixel clusters, crisp dark outlines, deliberate dithering, three-to-five value shading per material, rich environmental storytelling, cinematic atmospheric lighting. Translate Chinese ink-wash mist, paper texture, jade, old timber, stone, talismans, and restrained gold accents into polished pixel art. Elegant and mature, not childish. Single coherent scene. 16:9 landscape, intended master size 2048x1152. Keep all critical subjects inside the central 4:3 safe area because mobile will crop the sides. Keep the bottom 22 percent darker and lower-detail as breathing room for UI text.  Scene: A quiet mountain tea pavilion after rain. Two cultivators sit across an old wooden table: one pouring tea, the other resting a hand on a worn umbrella that once belonged to their shared past. Steam rises from the cups, wet pine needles cling to the railing, and the valley beyond is washed in blue mist. Their robes are different now, showing how their paths diverged, but a matching old bracelet and repaired teacup reveal enduring bonds. Intimate character-focused composition, warm interior light against cool mountain air. Palette direction: 茶褐、雨蓝、暖灯金、松针绿. Critical visual focus: 对坐人物、热茶、旧伞、雨后的山谷. Avoid: readable text, letters, logo, watermark, UI frame, border, speech caption, photorealistic rendering, painterly blur, 3D render, Minecraft blocks, 8-bit primitive shapes, giant square pixels, chibi proportions, cartoon toy look, low-resolution upscaling, muddy silhouettes, excessive neon, oversaturated rainbow palette, lens flare covering the subject, duplicated protagonist, anatomical errors, graphic gore.
```


### **22. 生死斗法**

- **文件名**：`battle.png`
- **存放目录**：`public/game/scenes`
- **用途**：通用：战斗、妖兽袭击、劫道、挑战、魔修冲突
- **中文画面说明**：荒山战斗，主角与敌人或妖兽交锋，画面强调法术碰撞与动势，不强调血腥。
- **色彩方向**：护体青绿、敌术赤红、山岩灰、土尘金
- **画面核心**：主角防御姿态、来袭飞剑、侧翼妖兽、法术碰撞

```text
Professional high-resolution 16-bit / 32-bit JRPG pixel-art illustration for a Chinese xianxia cultivation life simulator. Handcrafted pixel clusters, crisp dark outlines, deliberate dithering, three-to-five value shading per material, rich environmental storytelling, cinematic atmospheric lighting. Translate Chinese ink-wash mist, paper texture, jade, old timber, stone, talismans, and restrained gold accents into polished pixel art. Elegant and mature, not childish. Single coherent scene. 16:9 landscape, intended master size 2048x1152. Keep all critical subjects inside the central 4:3 safe area because mobile will crop the sides. Keep the bottom 22 percent darker and lower-detail as breathing room for UI text.  Scene: A dynamic battle on a rocky wilderness ridge. The protagonist braces behind a curved jade energy barrier while an enemy cultivator’s dark-red flying sword strikes from above; a monstrous beast silhouette lunges from the side. Dust, sparks, broken stone, swirling talismans, and two contrasting spell colors: jade-green protection and crimson attack. Strong diagonal composition and readable silhouettes, faces partially shadowed, robes snapping in the wind. Cinematic action with clear protagonist/enemy separation, no gore, no motion blur that destroys pixel clarity. Palette direction: 护体青绿、敌术赤红、山岩灰、土尘金. Critical visual focus: 主角防御姿态、来袭飞剑、侧翼妖兽、法术碰撞. Avoid: readable text, letters, logo, watermark, UI frame, border, speech caption, photorealistic rendering, painterly blur, 3D render, Minecraft blocks, 8-bit primitive shapes, giant square pixels, chibi proportions, cartoon toy look, low-resolution upscaling, muddy silhouettes, excessive neon, oversaturated rainbow palette, lens flare covering the subject, duplicated protagonist, anatomical errors, graphic gore.
```


### **23. 洞府静修**

- **文件名**：`cave.png`
- **存放目录**：`public/game/scenes`
- **用途**：通用：闭关、修炼、吐纳、突破前夜、独处
- **中文画面说明**：安静洞府内部，石床、香炉、蒲团和洞外瀑布；主角盘膝吐纳，只有微弱灵光。
- **色彩方向**：岩灰绿、瀑布蓝、香火金、吐纳青
- **画面核心**：盘膝主角、石台香炉、洞外瀑布、丹田灵光

```text
Professional high-resolution 16-bit / 32-bit JRPG pixel-art illustration for a Chinese xianxia cultivation life simulator. Handcrafted pixel clusters, crisp dark outlines, deliberate dithering, three-to-five value shading per material, rich environmental storytelling, cinematic atmospheric lighting. Translate Chinese ink-wash mist, paper texture, jade, old timber, stone, talismans, and restrained gold accents into polished pixel art. Elegant and mature, not childish. Single coherent scene. 16:9 landscape, intended master size 2048x1152. Keep all critical subjects inside the central 4:3 safe area because mobile will crop the sides. Keep the bottom 22 percent darker and lower-detail as breathing room for UI text.  Scene: Interior of a serene cultivator cave at dawn. A stone meditation platform, a small bronze incense burner, worn cushions, stacked scrolls, and a simple water basin. At the cave mouth, a waterfall and distant green peaks are visible. The protagonist sits cross-legged in profile, faint jade qi gathering around the dantian and fingertips. Dust motes, thin incense smoke, mineral sparkles in the rock, calm horizontal balance. The image should feel quiet, disciplined, and breathable, with enough detail to read as a real lived-in place. Palette direction: 岩灰绿、瀑布蓝、香火金、吐纳青. Critical visual focus: 盘膝主角、石台香炉、洞外瀑布、丹田灵光. Avoid: readable text, letters, logo, watermark, UI frame, border, speech caption, photorealistic rendering, painterly blur, 3D render, Minecraft blocks, 8-bit primitive shapes, giant square pixels, chibi proportions, cartoon toy look, low-resolution upscaling, muddy silhouettes, excessive neon, oversaturated rainbow palette, lens flare covering the subject, duplicated protagonist, anatomical errors, graphic gore.
```


### **24. 乱星海外**

- **文件名**：`sea.png`
- **存放目录**：`public/game/scenes`
- **用途**：通用：乱星海、海图、出海、风暴、海外岛屿
- **中文画面说明**：星空下的乱星海，黑潮巨浪、古老海船、远处岛屿灯火与海底巨影，危险但诱人。
- **色彩方向**：深海蓝、海沫白、船灯金、星辰青
- **画面核心**：海船、巨浪、海图航线、水下巨大阴影、远岛灯火

```text
Professional high-resolution 16-bit / 32-bit JRPG pixel-art illustration for a Chinese xianxia cultivation life simulator. Handcrafted pixel clusters, crisp dark outlines, deliberate dithering, three-to-five value shading per material, rich environmental storytelling, cinematic atmospheric lighting. Translate Chinese ink-wash mist, paper texture, jade, old timber, stone, talismans, and restrained gold accents into polished pixel art. Elegant and mature, not childish. Single coherent scene. 16:9 landscape, intended master size 2048x1152. Keep all critical subjects inside the central 4:3 safe area because mobile will crop the sides. Keep the bottom 22 percent darker and lower-detail as breathing room for UI text.  Scene: The open sea of the Chaotic Star Sea at night. A small but sturdy cultivation-world ship rides a dark swell, lanterns tied to its mast. The water is deep teal and navy with pale sea foam; beneath the surface, a colossal shadow passes just beyond the ship. In the distance, a rocky island has faint gold lights and strange floating stones. A navigator in the boat holds a half-sea-chart glowing with route lines. Stars, sea mist, salt spray, and one warm light against a vast dangerous ocean. Adventure and isolation. Palette direction: 深海蓝、海沫白、船灯金、星辰青. Critical visual focus: 海船、巨浪、海图航线、水下巨大阴影、远岛灯火. Avoid: readable text, letters, logo, watermark, UI frame, border, speech caption, photorealistic rendering, painterly blur, 3D render, Minecraft blocks, 8-bit primitive shapes, giant square pixels, chibi proportions, cartoon toy look, low-resolution upscaling, muddy silhouettes, excessive neon, oversaturated rainbow palette, lens flare covering the subject, duplicated protagonist, anatomical errors, graphic gore.
```


### **25. 渡劫之夜**

- **文件名**：`tribulation.png`
- **存放目录**：`public/game/scenes`
- **用途**：通用：冲关、雷劫、突破失败、天劫试炼
- **中文画面说明**：孤峰上的渡劫场景，紫金劫云旋转，天雷落下，主角以法阵与剑意对抗。
- **色彩方向**：劫云紫、天雷金白、山岩黑、剑意冷蓝
- **画面核心**：螺旋劫云、落雷、主角与护阵、悬浮碎石

```text
Professional high-resolution 16-bit / 32-bit JRPG pixel-art illustration for a Chinese xianxia cultivation life simulator. Handcrafted pixel clusters, crisp dark outlines, deliberate dithering, three-to-five value shading per material, rich environmental storytelling, cinematic atmospheric lighting. Translate Chinese ink-wash mist, paper texture, jade, old timber, stone, talismans, and restrained gold accents into polished pixel art. Elegant and mature, not childish. Single coherent scene. 16:9 landscape, intended master size 2048x1152. Keep all critical subjects inside the central 4:3 safe area because mobile will crop the sides. Keep the bottom 22 percent darker and lower-detail as breathing room for UI text.  Scene: A lone cultivator standing on a black mountain peak beneath a spiral tribulation storm. Violet and gold thunderclouds churn overhead; a branching lightning bolt splits the sky and strikes a circular defensive formation around the protagonist. Broken stones float upward under reversed spiritual pressure, sword qi forms a white arc, robes and hair are pulled by violent wind. One nearby pine is scorched, the rest of the world plunged into deep indigo. Awe, danger, and focused determination. No giant monster, no text, no excessive lens flare. Palette direction: 劫云紫、天雷金白、山岩黑、剑意冷蓝. Critical visual focus: 螺旋劫云、落雷、主角与护阵、悬浮碎石. Avoid: readable text, letters, logo, watermark, UI frame, border, speech caption, photorealistic rendering, painterly blur, 3D render, Minecraft blocks, 8-bit primitive shapes, giant square pixels, chibi proportions, cartoon toy look, low-resolution upscaling, muddy silhouettes, excessive neon, oversaturated rainbow palette, lens flare covering the subject, duplicated protagonist, anatomical errors, graphic gore.
```


### **26. 宗门殿宇**

- **文件名**：`sect.png`
- **存放目录**：`public/game/scenes`
- **用途**：通用：宗门任务、长老议事、山门、弟子生活
- **中文画面说明**：建立在群山间的修仙宗门全景，层叠殿宇、长阶、白云和巡山弟子，秩序庄严。
- **色彩方向**：宗门青绿、屋瓦墨灰、玉灯青白、晨光金
- **画面核心**：层叠殿宇、长阶与山门、巡山弟子、高阁长老

```text
Professional high-resolution 16-bit / 32-bit JRPG pixel-art illustration for a Chinese xianxia cultivation life simulator. Handcrafted pixel clusters, crisp dark outlines, deliberate dithering, three-to-five value shading per material, rich environmental storytelling, cinematic atmospheric lighting. Translate Chinese ink-wash mist, paper texture, jade, old timber, stone, talismans, and restrained gold accents into polished pixel art. Elegant and mature, not childish. Single coherent scene. 16:9 landscape, intended master size 2048x1152. Keep all critical subjects inside the central 4:3 safe area because mobile will crop the sides. Keep the bottom 22 percent darker and lower-detail as breathing room for UI text.  Scene: A grand cultivation sect built across layered mountain terraces at dawn. Dark green tiled roofs, long stone stairways, guardian lion statues, prayer banners, and floating jade lanterns. Disciples in pale robes move along the paths while an elder watches from a high pavilion. Waterfalls fall between buildings and cloud seas part around the peaks. The composition should establish a whole believable institution with scale, hierarchy, and daily life, not just one dramatic palace. Elegant jade-green and weathered gold palette. Palette direction: 宗门青绿、屋瓦墨灰、玉灯青白、晨光金. Critical visual focus: 层叠殿宇、长阶与山门、巡山弟子、高阁长老. Avoid: readable text, letters, logo, watermark, UI frame, border, speech caption, photorealistic rendering, painterly blur, 3D render, Minecraft blocks, 8-bit primitive shapes, giant square pixels, chibi proportions, cartoon toy look, low-resolution upscaling, muddy silhouettes, excessive neon, oversaturated rainbow palette, lens flare covering the subject, duplicated protagonist, anatomical errors, graphic gore.
```


### **27. 上古遗迹**

- **文件名**：`ruins.png`
- **存放目录**：`public/game/scenes`
- **用途**：通用：秘境、古修遗迹、矿洞、残破道统
- **中文画面说明**：密林深处的上古遗迹入口，断裂石柱和漂浮符文环绕半开的石门，植被已经吞没建筑。
- **色彩方向**：古石灰、藤蔓绿、符文金、遗迹青
- **画面核心**：半开石门、断柱与藤蔓、漂浮符文、门内宝光

```text
Professional high-resolution 16-bit / 32-bit JRPG pixel-art illustration for a Chinese xianxia cultivation life simulator. Handcrafted pixel clusters, crisp dark outlines, deliberate dithering, three-to-five value shading per material, rich environmental storytelling, cinematic atmospheric lighting. Translate Chinese ink-wash mist, paper texture, jade, old timber, stone, talismans, and restrained gold accents into polished pixel art. Elegant and mature, not childish. Single coherent scene. 16:9 landscape, intended master size 2048x1152. Keep all critical subjects inside the central 4:3 safe area because mobile will crop the sides. Keep the bottom 22 percent darker and lower-detail as breathing room for UI text.  Scene: An ancient ruin entrance half-consumed by a deep forest. Broken pillars, toppled guardian statues, carved stone steps, and a partially opened gate are wrapped in vines and luminous moss. Abstract talisman runes float around the doorway, not forming readable language. A faint golden treasure glow leaks from inside, while the forest beyond is green and shadowy. The protagonist stands small at the entrance holding a lantern, with a companion silhouette farther back. Mystery, age, and caution; no obvious monster unless implied in the darkness. Palette direction: 古石灰、藤蔓绿、符文金、遗迹青. Critical visual focus: 半开石门、断柱与藤蔓、漂浮符文、门内宝光. Avoid: readable text, letters, logo, watermark, UI frame, border, speech caption, photorealistic rendering, painterly blur, 3D render, Minecraft blocks, 8-bit primitive shapes, giant square pixels, chibi proportions, cartoon toy look, low-resolution upscaling, muddy silhouettes, excessive neon, oversaturated rainbow palette, lens flare covering the subject, duplicated protagonist, anatomical errors, graphic gore.
```


### **28. 丹火药理**

- **文件名**：`medicine.png`
- **存放目录**：`public/game/scenes`
- **用途**：通用：炼丹、配药、疗伤、药铺、毒丹
- **中文画面说明**：温暖而专业的丹房，药柜、铜炉、药碾、药材和成丹，突出药理细节而非夸张魔法。
- **色彩方向**：丹火金、药草绿、木柜褐、蒸汽灰
- **画面核心**：铜炉丹火、药材药柜、研磨的手、竹帘后的病人

```text
Professional high-resolution 16-bit / 32-bit JRPG pixel-art illustration for a Chinese xianxia cultivation life simulator. Handcrafted pixel clusters, crisp dark outlines, deliberate dithering, three-to-five value shading per material, rich environmental storytelling, cinematic atmospheric lighting. Translate Chinese ink-wash mist, paper texture, jade, old timber, stone, talismans, and restrained gold accents into polished pixel art. Elegant and mature, not childish. Single coherent scene. 16:9 landscape, intended master size 2048x1152. Keep all critical subjects inside the central 4:3 safe area because mobile will crop the sides. Keep the bottom 22 percent darker and lower-detail as breathing room for UI text.  Scene: A warm, professional alchemy workshop used by a serious cultivator. Tall medicine cabinets with hundreds of small drawers, a bronze furnace with controlled golden flame, a stone mortar, jade spoons, drying herbs, labeled jars represented by abstract symbols, and a tray of freshly finished pills. Steam and fine medicinal smoke drift through shafts of window light. The protagonist’s hands grind herbs in the foreground while a patient rests behind a bamboo screen. Craft, care, and danger beneath a calm surface. Palette direction: 丹火金、药草绿、木柜褐、蒸汽灰. Critical visual focus: 铜炉丹火、药材药柜、研磨的手、竹帘后的病人. Avoid: readable text, letters, logo, watermark, UI frame, border, speech caption, photorealistic rendering, painterly blur, 3D render, Minecraft blocks, 8-bit primitive shapes, giant square pixels, chibi proportions, cartoon toy look, low-resolution upscaling, muddy silhouettes, excessive neon, oversaturated rainbow palette, lens flare covering the subject, duplicated protagonist, anatomical errors, graphic gore.
```


### **29. 山野独行**

- **文件名**：`wilderness.png`
- **存放目录**：`public/game/scenes`
- **用途**：通用：游历、探索、赶路、野外遭遇、独行
- **中文画面说明**：清晨群山中，一条几乎没有路的山脊，主角背剑独行，远方是层层云海和未知山口。
- **色彩方向**：晨光金、山脊青、云海白、远峰蓝
- **画面核心**：独行背影、山脊小路、云海层峰、远处未知山口

```text
Professional high-resolution 16-bit / 32-bit JRPG pixel-art illustration for a Chinese xianxia cultivation life simulator. Handcrafted pixel clusters, crisp dark outlines, deliberate dithering, three-to-five value shading per material, rich environmental storytelling, cinematic atmospheric lighting. Translate Chinese ink-wash mist, paper texture, jade, old timber, stone, talismans, and restrained gold accents into polished pixel art. Elegant and mature, not childish. Single coherent scene. 16:9 landscape, intended master size 2048x1152. Keep all critical subjects inside the central 4:3 safe area because mobile will crop the sides. Keep the bottom 22 percent darker and lower-detail as breathing room for UI text.  Scene: A young cultivator traveling alone along a narrow mountain ridge at sunrise. The path is barely visible through wind-bent grass and wet stones; a sword is wrapped across the back, a small travel pack at the waist. Layered peaks disappear into a sea of clouds, with a distant unknown pass glowing faintly gold. Birds cross the sky, mist spills down the slopes, and tiny roadside talismans mark an old route. Wide cinematic landscape with a strong lone-figure silhouette, feeling free, uncertain, and open-ended. Palette direction: 晨光金、山脊青、云海白、远峰蓝. Critical visual focus: 独行背影、山脊小路、云海层峰、远处未知山口. Avoid: readable text, letters, logo, watermark, UI frame, border, speech caption, photorealistic rendering, painterly blur, 3D render, Minecraft blocks, 8-bit primitive shapes, giant square pixels, chibi proportions, cartoon toy look, low-resolution upscaling, muddy silhouettes, excessive neon, oversaturated rainbow palette, lens flare covering the subject, duplicated protagonist, anatomical errors, graphic gore.
```


## **五、10 个动作图标**


### **统一图标提示词前缀**

```text
A premium pixel-art game UI action icon, square 1024x1024, one centered emblem only, strong readable silhouette at 48x48, crisp deliberate pixel clusters, three-to-five value shading, handcrafted 16-bit/32-bit JRPG icon quality, Chinese xianxia visual language, deep ink-green square background, subtle dark-gold inner rim, restrained highlights. No text, no label, no outer frame, no watermark.
```


### **统一图标负面约束**

```text
Avoid: readable text, letters, logo, watermark, UI frame, border, speech caption, photorealistic rendering, painterly blur, 3D render, Minecraft blocks, 8-bit primitive shapes, giant square pixels, chibi proportions, cartoon toy look, low-resolution upscaling, muddy silhouettes, excessive neon, oversaturated rainbow palette, lens flare covering the subject, duplicated protagonist, anatomical errors, graphic gore. Avoid: tiny unreadable symbol, multiple icons, uneven background, decorative border, pixel noise.
```


### **A01. 交谈**

- **文件名**：`talk.png`
- **存放目录**：`public/game/actions`
- **中文说明**：一个干净的对话气泡，里面有两道柔和灵力波纹，代表询问、答复和谈判。

```text
A premium pixel-art game UI action icon, square 1024x1024, one centered emblem only, strong readable silhouette at 48x48, crisp deliberate pixel clusters, three-to-five value shading, handcrafted 16-bit/32-bit JRPG icon quality, Chinese xianxia visual language, deep ink-green square background, subtle dark-gold inner rim, restrained highlights. No text, no label, no outer frame, no watermark. Icon subject: A single centered speech-bubble emblem with two soft qi ripples inside, meaning conversation, negotiation, and questioning. Keep the symbol large, centered, and readable after downscaling to 48x48. Avoid: readable text, letters, logo, watermark, UI frame, border, speech caption, photorealistic rendering, painterly blur, 3D render, Minecraft blocks, 8-bit primitive shapes, giant square pixels, chibi proportions, cartoon toy look, low-resolution upscaling, muddy silhouettes, excessive neon, oversaturated rainbow palette, lens flare covering the subject, duplicated protagonist, anatomical errors, graphic gore.
```


### **A02. 争斗**

- **文件名**：`fight.png`
- **存放目录**：`public/game/actions`
- **中文说明**：两柄交叉的修仙女剑，剑锋有青色和红色火花，轮廓明确，避免血腥。

```text
A premium pixel-art game UI action icon, square 1024x1024, one centered emblem only, strong readable silhouette at 48x48, crisp deliberate pixel clusters, three-to-five value shading, handcrafted 16-bit/32-bit JRPG icon quality, Chinese xianxia visual language, deep ink-green square background, subtle dark-gold inner rim, restrained highlights. No text, no label, no outer frame, no watermark. Icon subject: Two crossed Chinese cultivation swords with clean silhouettes and tiny jade-and-red sparks at the crossing point, meaning conflict and battle. Keep the symbol large, centered, and readable after downscaling to 48x48. Avoid: readable text, letters, logo, watermark, UI frame, border, speech caption, photorealistic rendering, painterly blur, 3D render, Minecraft blocks, 8-bit primitive shapes, giant square pixels, chibi proportions, cartoon toy look, low-resolution upscaling, muddy silhouettes, excessive neon, oversaturated rainbow palette, lens flare covering the subject, duplicated protagonist, anatomical errors, graphic gore.
```


### **A03. 远行**

- **文件名**：`travel.png`
- **存放目录**：`public/game/actions`
- **中文说明**：一枚古罗盘与两道云路足迹组合，方向明确，象征出海、游历和离开。

```text
A premium pixel-art game UI action icon, square 1024x1024, one centered emblem only, strong readable silhouette at 48x48, crisp deliberate pixel clusters, three-to-five value shading, handcrafted 16-bit/32-bit JRPG icon quality, Chinese xianxia visual language, deep ink-green square background, subtle dark-gold inner rim, restrained highlights. No text, no label, no outer frame, no watermark. Icon subject: An ancient compass fused with two cloud-path footprints and a small wind swirl, meaning travel, departure, and exploration. Keep the symbol large, centered, and readable after downscaling to 48x48. Avoid: readable text, letters, logo, watermark, UI frame, border, speech caption, photorealistic rendering, painterly blur, 3D render, Minecraft blocks, 8-bit primitive shapes, giant square pixels, chibi proportions, cartoon toy look, low-resolution upscaling, muddy silhouettes, excessive neon, oversaturated rainbow palette, lens flare covering the subject, duplicated protagonist, anatomical errors, graphic gore.
```


### **A04. 修行**

- **文件名**：`cultivate.png`
- **存放目录**：`public/game/actions`
- **中文说明**：盘膝打坐的小人影，丹田处有青绿灵光，外圈是一道简洁周天。

```text
A premium pixel-art game UI action icon, square 1024x1024, one centered emblem only, strong readable silhouette at 48x48, crisp deliberate pixel clusters, three-to-five value shading, handcrafted 16-bit/32-bit JRPG icon quality, Chinese xianxia visual language, deep ink-green square background, subtle dark-gold inner rim, restrained highlights. No text, no label, no outer frame, no watermark. Icon subject: A compact seated cultivator silhouette with a jade-green dantian glow and a single circular breathing meridian, meaning meditation and cultivation. Keep the symbol large, centered, and readable after downscaling to 48x48. Avoid: readable text, letters, logo, watermark, UI frame, border, speech caption, photorealistic rendering, painterly blur, 3D render, Minecraft blocks, 8-bit primitive shapes, giant square pixels, chibi proportions, cartoon toy look, low-resolution upscaling, muddy silhouettes, excessive neon, oversaturated rainbow palette, lens flare covering the subject, duplicated protagonist, anatomical errors, graphic gore.
```


### **A05. 交易**

- **文件名**：`trade.png`
- **存放目录**：`public/game/actions`
- **中文说明**：一只灵石钱袋与一枚带方孔的玉钱重叠，轮廓清楚，带一点金色高光。

```text
A premium pixel-art game UI action icon, square 1024x1024, one centered emblem only, strong readable silhouette at 48x48, crisp deliberate pixel clusters, three-to-five value shading, handcrafted 16-bit/32-bit JRPG icon quality, Chinese xianxia visual language, deep ink-green square background, subtle dark-gold inner rim, restrained highlights. No text, no label, no outer frame, no watermark. Icon subject: A spirit-stone pouch overlapping a square-holed jade coin, with a warm gold highlight, meaning trade, bargaining, and payment. Keep the symbol large, centered, and readable after downscaling to 48x48. Avoid: readable text, letters, logo, watermark, UI frame, border, speech caption, photorealistic rendering, painterly blur, 3D render, Minecraft blocks, 8-bit primitive shapes, giant square pixels, chibi proportions, cartoon toy look, low-resolution upscaling, muddy silhouettes, excessive neon, oversaturated rainbow palette, lens flare covering the subject, duplicated protagonist, anatomical errors, graphic gore.
```


### **A06. 结缘**

- **文件名**：`bond.png`
- **存放目录**：`public/game/actions`
- **中文说明**：两枚互相扣合的玉环，中间穿过一根细红线，象征人物关系和承诺。

```text
A premium pixel-art game UI action icon, square 1024x1024, one centered emblem only, strong readable silhouette at 48x48, crisp deliberate pixel clusters, three-to-five value shading, handcrafted 16-bit/32-bit JRPG icon quality, Chinese xianxia visual language, deep ink-green square background, subtle dark-gold inner rim, restrained highlights. No text, no label, no outer frame, no watermark. Icon subject: Two interlocking jade rings joined by a single fine red thread, meaning relationship, trust, companionship, and promise. Keep the symbol large, centered, and readable after downscaling to 48x48. Avoid: readable text, letters, logo, watermark, UI frame, border, speech caption, photorealistic rendering, painterly blur, 3D render, Minecraft blocks, 8-bit primitive shapes, giant square pixels, chibi proportions, cartoon toy look, low-resolution upscaling, muddy silhouettes, excessive neon, oversaturated rainbow palette, lens flare covering the subject, duplicated protagonist, anatomical errors, graphic gore.
```


### **A07. 疗愈**

- **文件名**：`heal.png`
- **存放目录**：`public/game/actions`
- **中文说明**：一只药葫芦与一片发光的灵草交叉，旁边有微弱治疗光环。

```text
A premium pixel-art game UI action icon, square 1024x1024, one centered emblem only, strong readable silhouette at 48x48, crisp deliberate pixel clusters, three-to-five value shading, handcrafted 16-bit/32-bit JRPG icon quality, Chinese xianxia visual language, deep ink-green square background, subtle dark-gold inner rim, restrained highlights. No text, no label, no outer frame, no watermark. Icon subject: A medicine gourd crossed with a glowing spirit leaf, surrounded by a subtle healing halo, meaning treatment, recovery, and life extension. Keep the symbol large, centered, and readable after downscaling to 48x48. Avoid: readable text, letters, logo, watermark, UI frame, border, speech caption, photorealistic rendering, painterly blur, 3D render, Minecraft blocks, 8-bit primitive shapes, giant square pixels, chibi proportions, cartoon toy look, low-resolution upscaling, muddy silhouettes, excessive neon, oversaturated rainbow palette, lens flare covering the subject, duplicated protagonist, anatomical errors, graphic gore.
```


### **A08. 涉险**

- **文件名**：`risk.png`
- **存放目录**：`public/game/actions`
- **中文说明**：一张裂开的黑色符箓，裂缝中冒出紫红火焰，形态危险但可辨认。

```text
A premium pixel-art game UI action icon, square 1024x1024, one centered emblem only, strong readable silhouette at 48x48, crisp deliberate pixel clusters, three-to-five value shading, handcrafted 16-bit/32-bit JRPG icon quality, Chinese xianxia visual language, deep ink-green square background, subtle dark-gold inner rim, restrained highlights. No text, no label, no outer frame, no watermark. Icon subject: A cracked black talisman with violet-red flame escaping from the fracture, meaning risk, forbidden power, gambling, and dangerous shortcuts. Keep the symbol large, centered, and readable after downscaling to 48x48. Avoid: readable text, letters, logo, watermark, UI frame, border, speech caption, photorealistic rendering, painterly blur, 3D render, Minecraft blocks, 8-bit primitive shapes, giant square pixels, chibi proportions, cartoon toy look, low-resolution upscaling, muddy silhouettes, excessive neon, oversaturated rainbow palette, lens flare covering the subject, duplicated protagonist, anatomical errors, graphic gore.
```


### **A09. 拒绝**

- **文件名**：`refuse.png`
- **存放目录**：`public/game/actions`
- **中文说明**：一扇合拢的石门与一只抬起的手掌印，表达止步、拒绝和闭门。

```text
A premium pixel-art game UI action icon, square 1024x1024, one centered emblem only, strong readable silhouette at 48x48, crisp deliberate pixel clusters, three-to-five value shading, handcrafted 16-bit/32-bit JRPG icon quality, Chinese xianxia visual language, deep ink-green square background, subtle dark-gold inner rim, restrained highlights. No text, no label, no outer frame, no watermark. Icon subject: A closed stone door with a raised palm seal carved into it, meaning refusal, silence, withdrawal, and not intervening. Keep the symbol large, centered, and readable after downscaling to 48x48. Avoid: readable text, letters, logo, watermark, UI frame, border, speech caption, photorealistic rendering, painterly blur, 3D render, Minecraft blocks, 8-bit primitive shapes, giant square pixels, chibi proportions, cartoon toy look, low-resolution upscaling, muddy silhouettes, excessive neon, oversaturated rainbow palette, lens flare covering the subject, duplicated protagonist, anatomical errors, graphic gore.
```


### **A10. 观察**

- **文件名**：`observe.png`
- **存放目录**：`public/game/actions`
- **中文说明**：一只水墨眼睛，瞳孔里有远山和一枚放大镜式灵石光环，代表审视和发现。

```text
A premium pixel-art game UI action icon, square 1024x1024, one centered emblem only, strong readable silhouette at 48x48, crisp deliberate pixel clusters, three-to-five value shading, handcrafted 16-bit/32-bit JRPG icon quality, Chinese xianxia visual language, deep ink-green square background, subtle dark-gold inner rim, restrained highlights. No text, no label, no outer frame, no watermark. Icon subject: A stylized ink-wash eye with distant mountains reflected in the pupil and a small spirit-stone lens ring, meaning observation, investigation, and discovery. Keep the symbol large, centered, and readable after downscaling to 48x48. Avoid: readable text, letters, logo, watermark, UI frame, border, speech caption, photorealistic rendering, painterly blur, 3D render, Minecraft blocks, 8-bit primitive shapes, giant square pixels, chibi proportions, cartoon toy look, low-resolution upscaling, muddy silhouettes, excessive neon, oversaturated rainbow palette, lens flare covering the subject, duplicated protagonist, anatomical errors, graphic gore.
```


## **六、交付与替换要求**

1. 场景图统一为 **2048×1152 PNG**，不要带边框、标题或水印。
2. 图标统一为 **1024×1024 PNG**，中心留 10% 安全边距。
3. 文件名必须与本文一致，直接覆盖 `public/game/scenes/` 与 `public/game/actions/` 下同名文件。
4. 手机端会裁成接近 4:3，因此人物和关键物件必须在中央 4:3 区域。
5. 如果模型生成的是 16:9，但关键物件贴边，应重新生成，不要用拉伸或补图解决。
6. 当前已有的程序化图片只作为占位，不得作为生成参考图；避免把粗糙色块风格继承进去。


## **七、快速验收标准**

- 缩小到 390px 宽仍能一眼看出场景在发生什么。
- 底部标题覆盖后，画面仍有清晰主体和光源。
- 不出现可读文字、水印、UI 边框。
- 人物不是几何方块，至少有衣摆、发髻、手部动作和明确姿态。
- 29 张图放在一起时，像素密度、描边和金色高光一致。
- 10 个图标缩成 48×48 后仍能区分。
