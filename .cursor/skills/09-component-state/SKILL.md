# skill.md

```yaml
name: component-state
description: Use this skill to define complete UI component states including default, hover, active, focus, loading, disabled, empty, error, success, validation, permission, and skeleton states.
```

# Component State Skill

## Purpose

补全组件和页面的状态矩阵，避免 LLM 只生成默认态而遗漏加载、错误、空、成功、禁用、权限等真实产品状态。

## When to Use

- 已有 interaction-spec 和页面骨架。
- 需要准备原型、设计系统或开发交付。
- 表单、列表、数据面板、弹层、上传、搜索等状态复杂时。

## Required Inputs

- `interaction-spec.md`
- `design-tokens.md`
- `pages/*.md`
- 业务状态、权限、数据状态。
- 文案语气要求。

## Output Contract

必须输出 `output/interaction/component-states.md`：

1. 组件状态矩阵。
2. 页面状态矩阵。
3. 状态触发条件。
4. 视觉变化。
5. 交互变化。
6. 文案与反馈。
7. 动效需求。
8. 状态恢复路径。

## Procedure

1. **列出组件**：按钮、输入、选择器、卡片、表格、导航、弹层、Toast、上传等。
2. **覆盖基础状态**：default、hover、active、focus、disabled。
3. **覆盖业务状态**：loading、empty、error、success、permission、conflict。
4. **定义视觉变化**：必须引用 token。
5. **定义交互变化**：哪些动作可用、禁用、需要确认。
6. **定义文案**：交给 microcopy-tone 统一，但先写功能性占位。
7. **输出恢复路径**：错误后如何返回、重试、撤销、修复。

## Required Rules

- `interaction-feedback-rule`
- `style-token-rule`
- `accessibility-baseline-rule`
- `handoff-traceability-rule`

## Quality Gate

- 每个关键组件至少覆盖基础状态。
- 每个关键页面至少覆盖加载、空、错、权限。
- 状态变化引用 token。
- 错误状态有恢复路径。
- 输出能被 prototype-spec 直接使用。

## Failure Modes to Avoid

- 只有默认态。
- 错误提示没有解决方法。
- loading 状态阻塞过久且无反馈。
- 禁用状态没有说明原因。