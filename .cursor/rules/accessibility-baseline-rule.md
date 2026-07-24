# accessibility-baseline-rule.md

# [accessibility-baseline-rule.md](http://accessibility-baseline-rule.md)

## Rule Intent

确保 UI 默认满足可读、可达、可理解、可操作和可恢复的底线，防止视觉和动效牺牲真实使用质量。

## Applies To

- 所有页面、组件、交互、动效、文案、原型和交付产物。

## Mandatory Behavior

1. 文本必须可读，层级清晰。
2. 关键文本和背景必须有足够对比。
3. 所有关键交互必须可键盘访问。
4. 焦点顺序必须符合页面阅读和操作顺序。
5. 触控目标必须足够大。
6. 表单错误必须说明原因和修复方式。
7. 动效必须支持 reduced motion。
8. 不能只依赖颜色表达状态。

## Baseline Checks

- Contrast：文本、按钮、状态提示。
- Focus：键盘可见焦点、焦点顺序。
- Touch：按钮、列表项、图标操作区。
- Readability：字号、行高、密度。
- Form：标签、提示、校验、错误恢复。
- Motion：减少动态、避免眩晕。
- Semantics：状态不只靠颜色。

## Agent Responsibilities

- `design-system-keeper` 将底线写入 token。
- `interaction-designer` 保证输入路径可达。
- `component-state-designer` 保证状态可见。
- `motion-director` 保证 reduced motion。
- `usability-auditor` 最终审计并阻断问题。

## Quality Check

- 键盘能否完成 P0 任务。
- 错误是否可理解且可恢复。
- 小屏触控是否可用。
- 状态是否不只依赖颜色。
- 动效是否可关闭或替代。

## Failure Handling

违反本 rule 的 blocking 问题必须阻断 prototype gate，修复后重新审计。