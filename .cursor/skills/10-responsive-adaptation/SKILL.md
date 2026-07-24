# skill.md

```yaml
name: responsive-adaptation
description: Use this skill to adapt UI layouts and interactions across desktop, tablet, and mobile while preserving task priority, usability, accessibility, and visual consistency.
```

# Responsive Adaptation Skill

## Purpose

把页面设计转成跨端适配规则，保证移动端不是桌面端缩小版，而是重新保护主任务和关键操作。

## When to Use

- 已有页面骨架、组件状态、交互规范。
- 项目需要桌面、平板、移动端或不同窗口尺寸。
- 复杂表格、导航、表单、筛选、图表需要适配时。

## Required Inputs

- `pages/*.md`
- `interaction-spec.md`
- `component-states.md`
- `design-tokens.md`
- 目标设备与断点。
- 内容优先级。

## Output Contract

必须输出 `output/interaction/responsive-spec.md`：

1. 断点定义。
2. 各页面布局变化。
3. 导航适配。
4. 组件重排、折叠、替代。
5. 表格、图表、表单、弹层适配。
6. 触控区域和手势替代。
7. 移动端保留 / 后置 / 隐藏内容清单。

## Procedure

1. **重申主任务**：小屏优先保留 P0 任务。
2. **定义断点**：按内容断点而非固定设备幻想。
3. **重排布局**：多列转单列，侧栏转抽屉或底部导航。
4. **替换交互**：hover 不可作为唯一反馈；右键、拖拽需替代。
5. **处理复杂组件**：表格可卡片化，筛选可底部弹层，图表可摘要化。
6. **检查触控和可读性**：触控目标、间距、字体、焦点顺序。
7. **输出适配表**：每页写明桌面、平板、移动差异。

## Required Rules

- `responsive-first-rule`
- `content-hierarchy-rule`
- `accessibility-baseline-rule`
- `page-consistency-rule`

## Quality Gate

- 移动端仍能完成 P0 任务。
- 不依赖 hover。
- 触控目标可用。
- 内容优先级清晰。
- 跨端风格一致但布局不过度僵化。

## Failure Modes to Avoid

- 只写“适配移动端”。
- 缩小桌面布局。
- 表格在移动端横向失控。
- 关键 CTA 在小屏消失。