# skill.md

```yaml
name: design-system
description: Use this skill to define reusable UI tokens, component rules, spacing, typography, color, elevation, radius, motion primitives, and layout primitives for multi-page consistency.
```

# Design System Skill

## Purpose

把风格概念和页面骨架固化为可复用 token 与组件规则，防止 LLM 在不同页面临时发明样式。

## When to Use

- 已有 style-concept 和初步页面骨架。
- 需要统一颜色、字体、间距、圆角、阴影、组件、动效时间。
- 多页面出现样式漂移时。

## Required Inputs

- `style-concept.md`
- `visual-language.md`
- `page-map.md`
- `pages/*.md`
- 品牌约束和平台规范。
- 可访问性要求。

## Output Contract

必须输出 `output/style/design-tokens.md`：

1. Token 命名规则。
2. 色彩 token：背景、文本、边框、状态、品牌色。
3. 字体 token：字号、行高、字重、层级。
4. 间距 token：布局、组件、内容组。
5. 圆角、阴影、描边、透明度。
6. Motion token：时长、缓动、延迟。
7. 组件基础规则。
8. 禁止混用规则。

## Procedure

1. **读取风格概念**：确保 token 体现风格关键词。
2. **建立命名体系**：语义优先，例如 `color.action.primary.bg`。
3. **定义层级**：颜色、字体、空间必须覆盖主/次/弱/禁用/危险/成功/错误。
4. **映射组件**：按钮、输入框、卡片、列表、导航、弹层、提示、表格。
5. **加入状态 token**：hover、active、focus、disabled、loading、error。
6. **加入动效 token**：将 motion-language 的默认时长提前占位。
7. **输出禁止项**：禁止页面私有颜色、私有圆角、私有阴影。

## Required Rules

- `style-token-rule`
- `design-ssot-rule`
- `page-consistency-rule`
- `accessibility-baseline-rule`

## Quality Gate

- Token 可复用且语义清晰。
- 支持所有 P0 页面和状态。
- 可访问性底线未被破坏。
- 未出现页面私有样式。
- 能被 handoff-pack 直接引用。

## Failure Modes to Avoid

- 用具体颜色名替代语义 token。
- token 数量过多且无层级。
- 组件状态不完整。
- 设计系统和页面实际用法脱节。