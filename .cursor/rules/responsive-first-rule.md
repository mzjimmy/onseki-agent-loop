# responsive-first-rule.md

# [responsive-first-rule.md](http://responsive-first-rule.md)

## Rule Intent

响应式设计优先保护用户主任务，而不是机械缩放桌面布局。跨端必须保持风格一致、任务可达、操作可用。

## Applies To

- `page-composition`
- `interaction-pattern`
- `component-state`
- `responsive-adaptation`
- `accessibility-usability`

## Mandatory Behavior

1. 小屏优先保留 P0 任务。
2. 不得依赖 hover 作为唯一反馈。
3. 复杂表格、图表、筛选、导航必须提供小屏替代。
4. 触控目标必须可用。
5. 内容折叠必须遵守内容优先级。
6. 跨端差异必须写明原因。

## Adaptation Strategy

- 多列布局 → 单列或分组。
- 侧边导航 → 抽屉、底部导航或顶部菜单。
- 表格 → 卡片、摘要、横向滚动加冻结关键列。
- 筛选 → 底部弹层或分步筛选。
- 弹层 → 全屏页或底部面板。
- hover 提示 → 点击、长按或显性说明。
- 密集图表 → 摘要、关键指标、详情展开。

## Quality Check

- 移动端是否能完成 P0 任务。
- CTA 是否仍然可见。
- 复杂内容是否被合理折叠。
- 触控目标是否足够。
- 页面是否仍符合风格 token。

## Failure Handling

移动端不可用时：

1. 回退给 `responsive-designer`。
2. 必要时回退给 `information-architect` 重新拆页面。
3. 更新 page、interaction、state、prototype。