# 全站视觉升级设计文档

> 精致水墨 · 夜墨深色 · 翠玉绿主调 · 全程沉浸

---

## 目标

将整站从"低饱和度浅绿灰"风格升级为"精致水墨夜墨"风格：深色背景、柔和渐变光晕、全程粒子、纹饰装饰、微交互发光效果。覆盖全站所有页面和组件。

---

## 技术方案

- **零新依赖**：纯 CSS 变量 + `radial-gradient` + Canvas 粒子 + SVG 纹饰
- **实现方式**：方案 A — CSS 渐变 + Tailwind 扩展
- **兼容性**：保留现有 bamboo-* 色板作为别名（避免破坏 MBTI 测试页），逐步替换

---

## 一、色彩体系

### 新 CSS 变量（在 `globals.css` 中定义）

```css
/* 背景层 */
--ink-950: #0a0e0d    /* body 背景底色 */
--ink-900: #111a16    /* 卡片背景 */
--ink-800: #1a2820    /* 卡片边框、分隔线 */

/* 翠玉绿（主色，~80% 用量） */
--jade-400: #4ade9a   /* 主交互色、发光翠绿 */
--jade-300: #6fedb5   /* hover、高亮 */
--jade-200: #a8f5d4   /* 浅绿文字 */
--jade-100: #d4faea   /* 极浅绿、次要文字 */
--jade-500: #22c47a   /* 深翠绿、按钮 pressed */

/* 金色（点睛，~15% 用量） */
--gold-dim: #c8a85a   /* 淡金（结丹期） */
--gold-400: #d4a843   /* 中金（元婴期、飞升） */
--gold-bright: #e8c86a /* 亮金（化神期、强发光） */
--gold-200: #f5e4a8   /* 浅金文字 */

/* 陨落红 */
--death-600: #7f1d1d  /* 深红背景 */
--death-500: #b91c1c  /* 中红边框 */
--death-400: #ef4444  /* 亮红发光 */
--death-200: #fca5a5  /* 浅红文字 */

/* 雾白（正文层） */
--mist-100: #e8f0ec   /* 主要正文 */
--mist-200: #b8ccc2   /* 次要文字 */
--mist-400: #6a8878   /* 禁用、placeholder、标签 */
```

### Tailwind 主题扩展

在 `globals.css` 的 `@theme inline` 块中新增上述变量，同时保留 bamboo-* 别名映射到对应新色值，确保旧代码不报错。

---

## 二、全局背景

### Body 背景（`globals.css`）

```css
body {
  background-color: var(--ink-950);
  background-image:
    radial-gradient(ellipse 80% 60% at 15% 20%, rgba(74,222,154,0.10) 0%, transparent 60%),
    radial-gradient(ellipse 60% 50% at 85% 80%, rgba(212,168,67,0.07) 0%, transparent 55%),
    radial-gradient(ellipse 50% 70% at 50% 50%, rgba(34,196,122,0.05) 0%, transparent 70%);
  color: var(--mist-100);
}
```

三层光晕：左上翠绿、右下金色、中心深翠绿，叠加形成柔和流动感。

---

## 三、全局粒子背景组件

### 新文件：`components/ParticleBackground.tsx`

- `"use client"` 组件，挂载在 `app/layout.tsx` 的 `<body>` 最底层
- `position: fixed; inset: 0; pointer-events: none; z-index: 0`
- 80 个粒子：88% 翠绿（hue≈152）、12% 金色（hue≈42）
- 每个粒子带径向渐变光晕（半径 × 5）
- 速度：`speedX ∈ [-0.25, 0.25]`，`speedY ∈ [-0.45, -0.1]`（向上飘）
- opacity 在 `[0.05, 0.75]` 之间呼吸式变化
- `ReincarnationGate.tsx` 中的粒子 Canvas 移除，复用全局粒子

### layout.tsx 改动

```tsx
<body className="min-h-screen flex flex-col">
  <ParticleBackground />
  <Navbar />
  <main className="flex-1 relative z-10">{children}</main>
  <Footer />
</body>
```

---

## 四、导航栏（`Navbar.tsx`）

- 背景：`rgba(10,14,13,0.85)` + `backdrop-filter: blur(12px)`
- 底部边框：`border-bottom: 1px solid var(--ink-800)`
- 品牌名：翠绿→金色渐变文字（`linear-gradient(90deg, var(--jade-300), var(--gold-300))`）
- 导航链接：mist-400，hover 变 jade-300
- `position: sticky; top: 0; z-index: 50`

---

## 五、页脚（`Footer.tsx`）

- 背景：`var(--ink-950)`
- 顶部边框：`1px solid var(--ink-800)`
- 文字：mist-400
- 保持简洁，无装饰

---

## 六、通用卡片样式

所有 `.card` 类卡片（答题卡、结果卡等）：

```css
background: var(--ink-900);
border: 1px solid var(--ink-800);
border-radius: 16px;
/* 渐变发光描边（伪元素实现） */
::before {
  border: 1px solid transparent;
  background: linear-gradient(135deg, rgba(74,222,154,0.15), transparent 50%, rgba(212,168,67,0.08)) border-box;
  mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
}
```

### 水墨角落纹饰

每张卡片左上、右下各一个 SVG 角落纹饰（两条 L 形曲线 + 圆点），opacity 0.15，颜色 jade-400。

### 纹饰分隔线

```html
<div class="divider">
  <div class="divider-line" />   <!-- 渐变细线 -->
  <div class="divider-diamond" /> <!-- 旋转45°小方块，jade-400，带发光 -->
  <div class="divider-line" />
</div>
```

---

## 七、按钮系统

### 主按钮（踏入修仙之路 / 确认 / 确认排序）

```css
background: linear-gradient(135deg, var(--jade-500), var(--jade-400));
color: var(--ink-950);
border-radius: 100px;
box-shadow: 0 0 24px rgba(74,222,154,0.3), 0 4px 12px rgba(0,0,0,0.4);
/* hover: box-shadow 增强 + translateY(-1px) */
```

### 次要按钮（再入轮回 / 重新测试）

```css
background: transparent;
border: 1px solid rgba(74,222,154,0.35);
color: var(--jade-300);
border-radius: 100px;
/* hover: border-color 加深 + 轻发光 */
```

### 陨落结局专属按钮（重新测试）

- 背景：深红渐变
- 边框：带 SVG 裂纹纹路叠加（`clip-path` 不规则边缘 + 伪元素裂纹线条）
- 发光：红色 `box-shadow`
- 具体实现：按钮用相对定位，`::before` 绘制3-4条不规则裂纹线（SVG data URI 或 CSS border + transform），`::after` 做红色辉光

---

## 八、进度条（`ProgressBar.tsx`）

- 轨道：`var(--ink-800)`，高度 `3px`
- 填充：`linear-gradient(90deg, var(--jade-500), var(--jade-400))`
- 发光：`box-shadow: 0 0 8px rgba(74,222,154,0.5)`
- 文字标签：mist-400，字号 11px

---

## 九、答题卡片（`DestinyQuiz.tsx`）

- 卡片改为通用深墨卡片样式
- 题号标签：mist-400，字号 10px，letter-spacing 0.3em
- 题目文字：mist-100，serif 字体
- 限时倒计时：
  - `> 2秒`：jade-400
  - `≤ 2秒`：从 jade-400 渐变到 death-400（CSS transition）

### 选项按钮

```
默认：border ink-800, bg rgba(26,40,32,0.6), color mist-200
hover：border jade-500, bg rgba(74,222,154,0.08), color jade-200
       box-shadow: 0 0 16px rgba(74,222,154,0.12)
选中：border jade-400, bg rgba(74,222,154,0.12), color jade-100
      box-shadow: 0 0 20px rgba(74,222,154,0.18)
禁用（其他选项）：opacity 0.35
```

---

## 十、滑块题（`SliderQuestion.tsx`）

- 卡片同通用深墨样式
- `<input type="range">` 自定义样式：
  - 轨道：ink-800 背景，jade-400 填充（用 CSS 渐变模拟）
  - Thumb：jade-400 圆形，带发光 box-shadow
- 左右标签：mist-400

---

## 十一、排序题（`RankingQuestion.tsx`）

- 卡片同通用深墨样式
- 拖拽项：`bg ink-900, border ink-800`
- 序号圆圈：jade-400 背景，ink-950 文字
- 拖拽中状态：`border jade-400, box-shadow 0 0 16px rgba(74,222,154,0.25), opacity 0.7`
- hover：`border jade-500`

---

## 十二、雷达图（`RadarChart.tsx`）

- 网格线：`var(--ink-800)`
- 轴线：`var(--ink-800)`
- 数据面积：fill `rgba(74,222,154,0.2)`，stroke `var(--jade-400)`，strokeWidth 2
- 数据点：fill `var(--jade-400)`，r=4，带发光 `filter: drop-shadow(0 0 4px rgba(74,222,154,0.6))`
- 标签文字：mist-100，fontSize 11

---

## 十三、结果页（`app/destiny/result/[id]/page.tsx`）

### 境界名称颜色（按境界）

| 境界 | 颜色 | 发光强度 |
|------|------|---------|
| 炼气期 | jade-300 渐变 | 弱 |
| 筑基期 | jade-200 渐变 | 弱 |
| 结丹期 | gold-dim (`#c8a85a`) 渐变 | 中 |
| 元婴期 | gold-400 (`#d4a843`) 渐变 | 强 |
| 化神期 | gold-bright (`#e8c86a`) 渐变 | 最强，加 filter drop-shadow |

### 结局徽章颜色（按结局类型）

| 结局类型 | 徽章样式 |
|---------|---------|
| 飞升（feisheng） | 金色边框 + 金色文字 + 金色发光 |
| 陨落类（tupo/doufa/xinmo/beici/moxiu/bawang） | 红色边框 + 红色文字 + 红色发光 + SVG 裂纹纹路叠加 |
| 其余结局 | 翠绿边框 + 翠绿文字 + 翠绿发光 |

**陨落类结局判断**：`outcomeSlug` 属于 `["tupo", "doufa", "xinmo", "beici", "moxiu", "bawang"]`

### 陨落结果卡片额外效果

- 卡片 `::before` 渐变描边改为红色：`rgba(239,68,68,0.25)` → transparent
- 卡片背景叠加裂纹纹理：SVG `<pattern>` 生成3-4条不规则斜线，opacity 0.06，作为 `background-image`
- 结局徽章：红色渐变背景，SVG 裂纹线条绝对定位叠加在徽章上方

### 关键词标签

- 飞升/金色结局：金色标签（gold-200 文字，gold-400 边框）
- 陨落结局：红色标签（death-200 文字，death-500 边框）
- 其余：翠绿标签（jade-200 文字，jade-400 边框）

---

## 十四、轮回入场（`ReincarnationGate.tsx`）

- 移除自有 Canvas 粒子（复用全局 ParticleBackground）
- 旋转光环：三层圆环颜色改为 jade-400/jade-300/jade-500，带发光 box-shadow
- 中心脉冲点：jade-400，带发光
- "经历轮回转世中..." 文字：jade-300，animate-pulse
- 灵根展示圆圈（四种灵根）：

| 灵根 | 圆圈颜色 | 发光 |
|------|---------|------|
| 天灵根 | gold-400 边框，gold-300 文字 | 金色强发光 |
| 双灵根 | jade-400 边框，jade-300 文字 | 翠绿发光 |
| 三灵根 | jade-400/40% 边框，jade-400/50% 文字 | 弱发光 |
| 伪灵根 | jade-400/20% 边框，jade-400/30% 文字 | 无发光 |

---

## 十五、分享按钮（`ShareButtons.tsx`）

- 复制按钮：改为翠绿主按钮样式
- 微博按钮：保留红色，但改为深红 `#b91c1c` 背景，圆角胶囊样式

---

## 实现顺序

1. `globals.css` — 色彩变量 + body 背景（基础，其他组件依赖）
2. `components/ParticleBackground.tsx` — 新建全局粒子组件
3. `app/layout.tsx` — 注入粒子组件，main 加 z-index
4. `components/Navbar.tsx` — 毛玻璃导航
5. `components/Footer.tsx` — 暗色页脚
6. `components/ProgressBar.tsx` — 细线进度条
7. `components/destiny/ReincarnationGate.tsx` — 移除自有粒子，更新光环和灵根样式
8. `components/destiny/DestinyQuiz.tsx` — 答题卡片 + 选项按钮
9. `components/destiny/SliderQuestion.tsx` — 滑块题样式
10. `components/destiny/RankingQuestion.tsx` — 排序题样式
11. `components/destiny/RadarChart.tsx` — 雷达图配色
12. `app/destiny/result/[id]/page.tsx` — 结果页（境界色、结局色、陨落裂纹）
13. `components/ShareButtons.tsx` — 分享按钮
