# skill.md

```yaml
name: consistency-audit
description: Use this skill to audit consistency across pages, components, tokens, spacing, typography, microcopy, interaction feedback, responsive behavior, and motion language.
```

# Consistency Audit Skill

## Purpose

检查多页面、多 agent 产物是否仍然像同一个产品，防止 LLM 在不同页面、不同阶段产生风格、组件、文案和交互漂移。

## When to Use

- 页面、设计系统、交互、动效、文案初步完成后。
- 原型门禁前。
- 多个 agent 并行生成内容后。

## Required Inputs

- `style-concept.md`
- `design-tokens.md`
- `pages/*.md`
- `interaction-spec.md`
- `component-states.md`
- `motion-spec.md`
- `microcopy-guide.md`
- `responsive-spec.md`

## Output Contract

必须输出 `output/audits/consistency-audit.md`：

1. 冲突清单。
2. 冲突类型：视觉 / 组件 / 交互 / 动效 / 文案 / 响应式。
3. 严重等级。
4. 影响页面。
5. 违反的 rule 或 token。
6. 推荐统一方案。
7. 需要回流的上游文件。

## Procedure

1. **对照风格概念**：检查是否偏离关键词和反参考。
2. **对照 token**：检查颜色、字体、间距、圆角、阴影、动效时间。
3. **对照组件**：同组件是否外观和行为一致。
4. **对照交互反馈**：同动作是否同反馈。
5. **对照文案语气**：按钮、错误、空状态是否同一语气。
6. **对照响应式**：跨端适配是否逻辑一致。
7. **输出统一策略**：说明改哪个文件作为真相源。

## Required Rules

- `design-ssot-rule`
- `style-token-rule`
- `page-consistency-rule`
- `motion-meaning-rule`

## Quality Gate

- 每个冲突都有位置和修复方向。
- 修复以真相源为准，而非局部偏好。
- 不把必要差异误判为错误。
- 输出能推动上游文件修订。

## Failure Modes to Avoid

- 只说“不统一”但不定位。
- 用审美判断替代 rule。
- 发现冲突却不指定真相源。
- 把所有页面强行做得一模一样。