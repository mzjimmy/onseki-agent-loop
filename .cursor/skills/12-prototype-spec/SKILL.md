# skill.md

```yaml
name: prototype-spec
description: Use this skill to convert UI pages, flows, interactions, component states, and motion rules into a prototype-ready specification for validation.
```

# Prototype Spec Skill

## Purpose

把设计产物转成可制作、可点击、可验证的原型说明，确保原型验证关键任务，而不是展示静态页面。

## When to Use

- prototype-gate-rule 通过后。
- 需要制作 Figma / Framer / HTML / 其他原型。
- 需要明确页面连接、交互热点、状态和动效。

## Required Inputs

- `pages/*.md`
- `user-flow.md`
- `interaction-spec.md`
- `component-states.md`
- `motion-spec.md`
- `usability-audit.md`
- `consistency-audit.md`

## Output Contract

必须输出 `output/prototype/prototype-brief.md`：

1. 原型目标。
2. 验证任务。
3. 页面清单。
4. 页面连接关系。
5. 交互热点。
6. 需要实现的状态。
7. 动效备注。
8. 测试脚本。
9. 不进入原型的内容。
10. 验收标准。

## Procedure

1. **确认验证目标**：原型必须验证 P0 任务或高风险假设。
2. **选择范围**：避免把所有页面都做成高保真。
3. **连接路径**：按 user-flow 建立页面跳转和状态切换。
4. **标注热点**：按钮、输入、筛选、弹层、返回、错误恢复。
5. **加入状态**：至少覆盖 loading、empty、error、success、disabled。
6. **加入动效**：只加入 motion-spec 中必要动效。
7. **写测试脚本**：让用户测试时知道任务和观察指标。
8. **定义验收**：完成率、错误点、理解度、反馈问题。

## Required Rules

- `prototype-gate-rule`
- `interaction-feedback-rule`
- `motion-meaning-rule`
- `handoff-traceability-rule`

## Quality Gate

- 原型有明确验证目标。
- 页面连接覆盖主路径和关键异常路径。
- 交互热点不遗漏。
- 状态和动效可被制作。
- 验收标准清晰。

## Failure Modes to Avoid

- 原型只是静态展示。
- 高保真覆盖过大，验证重点分散。
- 忽略失败和恢复路径。
- 动效说明无法制作。