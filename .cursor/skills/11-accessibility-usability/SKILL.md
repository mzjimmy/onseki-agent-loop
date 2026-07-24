# skill.md

```yaml
name: accessibility-usability
description: Use this skill to audit UI accessibility, usability, cognitive load, readability, focus order, contrast, error prevention, recovery paths, and task completion barriers.
```

# Accessibility Usability Skill

## Purpose

审计 UI 是否可读、可达、可理解、可恢复，防止 LLM 只追求视觉表现而牺牲真实使用质量。

## When to Use

- 页面、交互、组件状态初步完成后。
- 原型门禁前。
- 用户任务复杂、表单多、数据密集、可访问性要求高时。

## Required Inputs

- `product-intent.md`
- `pages/*.md`
- `interaction-spec.md`
- `component-states.md`
- `motion-spec.md`
- `design-tokens.md`
- 目标用户和设备约束。

## Output Contract

必须输出：

- `output/audits/usability-audit.md`
- `output/audits/accessibility-audit.md`

内容包括：

1. 问题清单。
2. 严重等级：blocking / major / minor / suggestion。
3. 影响路径。
4. 证据或触发条件。
5. 修复建议。
6. 修复优先级。
7. 是否阻断 prototype gate。

## Procedure

1. **检查任务完成**：用户是否能找到入口、理解步骤、完成结果。
2. **检查可读性**：文字层级、密度、对比、说明是否足够。
3. **检查可达性**：键盘路径、焦点顺序、触控尺寸、替代文本。
4. **检查错误预防**：表单校验、危险操作、撤销、确认。
5. **检查认知负荷**：页面是否要求同时理解过多概念。
6. **检查动效影响**：是否干扰注意力或无 reduced motion。
7. **输出修复计划**：阻断问题必须进入上游修正。

## Required Rules

- `accessibility-baseline-rule`
- `cognitive-load-rule`
- `interaction-feedback-rule`
- `prototype-gate-rule`

## Quality Gate

- Blocking 问题必须明确阻断。
- 每个问题都有修复建议。
- 不用个人审美代替可用性判断。
- 能指出影响的页面、组件或流程。
- 修复建议不破坏产品意图。

## Failure Modes to Avoid

- 只给泛泛建议。
- 只检查颜色，不检查流程。
- 忽略键盘、焦点、触控。
- 把可访问性当作最后装饰。