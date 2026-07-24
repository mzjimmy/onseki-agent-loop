# skill.md

```yaml
name: handoff-pack
description: Use this skill to package UI design decisions, interaction specs, motion specs, component states, tokens, acceptance criteria, version notes, and open issues for development handoff.
```

# Handoff Pack Skill

## Purpose

把设计决策、组件状态、交互动效和验收标准打包成开发可执行交付物，避免 LLM 输出“看起来完整但无法实现”的设计说明。

## When to Use

- 原型说明完成后。
- 准备交付开发、评审或归档。
- 需要建立版本记录、未决问题、验收标准和追溯链。

## Required Inputs

- `product-intent.md`
- `design-tokens.md`
- `pages/*.md`
- `interaction-spec.md`
- `component-states.md`
- `motion-spec.md`
- `prototype-brief.md`
- `usability-audit.md`
- `consistency-audit.md`

## Output Contract

必须输出 `output/prototype/handoff-checklist.md`：

1. 交付范围。
2. 页面清单。
3. 组件清单。
4. Token 引用。
5. 交互实现说明。
6. 动效实现说明。
7. 状态矩阵。
8. 验收标准。
9. 未决问题。
10. 版本记录。
11. 追溯表：设计决策 → 来源 → 影响文件。

## Procedure

1. **汇总范围**：只交付已通过 gate 的内容。
2. **列页面与组件**：明确每页、每组件、每状态。
3. **引用 token**：所有视觉和动效要求必须引用 design-tokens。
4. **写实现说明**：交互、动效、状态、响应式、错误恢复。
5. **写验收标准**：按用户任务和技术状态检查。
6. **保留未决问题**：不把不确定项包装成确定结论。
7. **建立版本记录**：说明日期、变更、影响范围。

## Required Rules

- `handoff-traceability-rule`
- `design-ssot-rule`
- `style-token-rule`
- `prototype-gate-rule`

## Quality Gate

- 开发不需要猜关键行为。
- 每个状态都有说明。
- 每个动效有时长、触发、结束状态。
- 未决问题清晰。
- 交付物可追溯到产品目标和 token。

## Failure Modes to Avoid

- 只交付静态页面。
- 没有状态矩阵。
- 动效说明模糊。
- 验收标准不可检查。