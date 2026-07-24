# skill.md

```yaml
name: page-composition
description: Use this skill to create page-level layout structures, visual hierarchy, content zones, CTA placement, and responsive priorities from product intent, page map, style concept, and user flows.
```

# Page Composition Skill

## Purpose

把页面职责、内容优先级和风格方向转成多页面骨架，保证每页主任务清晰、层级稳定、CTA 不互相竞争。

## When to Use

- 已有 page-map、user-flow、style-concept 后。
- 需要生成首页、列表页、详情页、表单页、空/错/加载页骨架。
- 设计系统生成前后均可使用，但必须引用当前 token 或待 token 项。

## Required Inputs

- `product-intent.md`
- `style-concept.md`
- `information-architecture.md`
- `page-map.md`
- `user-flow.md`
- 内容清单与组件候选。

## Output Contract

必须输出 `output/pages/*.md`：

1. 页面目标。
2. 用户进入该页的意图。
3. 内容区块顺序。
4. 视觉层级。
5. 主 CTA / 次 CTA / 危险操作。
6. 组件清单。
7. 空、错、加载、权限不足状态。
8. 桌面 / 平板 / 移动端优先级。

## Procedure

1. **确认页面主任务**：每页只保留一个主目标。
2. **建立内容分区**：按理解顺序排列，不按内部数据字段堆叠。
3. **定义视觉层级**：标题、摘要、主信息、辅助信息、操作、反馈。
4. **放置 CTA**：主 CTA 唯一且稳定；危险操作隔离。
5. **补状态页面**：每页至少考虑 loading、empty、error、permission。
6. **标注复用组件**：交给 design-system 和 component-state。
7. **设置响应式优先级**：写出移动端保留、折叠、隐藏、后置内容。

## Required Rules

- `content-hierarchy-rule`
- `page-consistency-rule`
- `cognitive-load-rule`
- `responsive-first-rule`

## Quality Gate

- 每页主任务明确。
- CTA 层级不冲突。
- 多页面共享布局节奏。
- 状态页面不缺失。
- 页面骨架能支撑后续交互和动效。

## Failure Modes to Avoid

- 页面像功能清单而非任务界面。
- 主 CTA 多个且同权重。
- 忽略空状态和错误状态。
- 移动端只做缩放。