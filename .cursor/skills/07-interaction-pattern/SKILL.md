# skill.md

```yaml
name: interaction-pattern
description: Use this skill to specify UI interaction patterns such as click, input, hover, drag, selection, filtering, modal, navigation, validation, and feedback behavior.
```

# Interaction Pattern Skill

## Purpose

把用户流程和页面骨架转成可实现、可验证的交互规范，避免 LLM 只描述“点击跳转”而遗漏前后状态、反馈和异常。

## When to Use

- 页面结构和用户流程已确定。
- 需要定义点击、输入、筛选、弹窗、表单、导航、拖拽等行为。
- 原型制作和开发交付前必须使用。

## Required Inputs

- `user-flow.md`
- `pages/*.md`
- `design-tokens.md`
- 业务规则和权限规则。
- 目标平台输入方式：鼠标、触控、键盘、手柄等。

## Output Contract

必须输出 `output/interaction/interaction-spec.md`：

1. 交互对象。
2. 触发条件。
3. 前置状态。
4. 用户动作。
5. 系统即时反馈。
6. 等待 / 成功 / 失败反馈。
7. 禁用条件。
8. 键盘与触控替代。
9. 影响的组件状态。
10. 需要 motion-language 设计的动效点。

## Procedure

1. **列出关键动作**：只围绕 P0/P1 流程。
2. **定义动作前后状态**：避免动作孤立描述。
3. **定义反馈等级**：轻反馈、确认反馈、阻断反馈、危险反馈。
4. **补异常处理**：校验失败、权限不足、网络失败、重复提交。
5. **处理输入方式**：鼠标、键盘、触控必须可达。
6. **输出交互表**：用表格让 component-state 和 prototype-spec 可直接引用。
7. **标注动效需求**：只提出意义，不直接设计最终曲线。

## Required Rules

- `interaction-feedback-rule`
- `accessibility-baseline-rule`
- `cognitive-load-rule`
- `motion-meaning-rule`

## Quality Gate

- 每个动作都有前置状态和后置状态。
- 每个等待、失败、完成状态可见。
- 键盘和触控不被遗漏。
- 交互不依赖用户猜测。
- 输出可直接转换成原型热点。

## Failure Modes to Avoid

- 只有“点击按钮，进入下一页”。
- 未说明加载和失败。
- 弹窗、提示、Toast 滥用。
- 危险操作无确认或撤销。