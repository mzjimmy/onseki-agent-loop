# cognitive-load-rule.md

# [cognitive-load-rule.md](http://cognitive-load-rule.md)

## Rule Intent

控制单页和单流程中的理解负担，避免用户同时面对过多概念、选择、路径、状态和动作。

## Applies To

- `product-intent`
- `information-architecture`
- `user-flow`
- `page-composition`
- `interaction-pattern`
- `microcopy-tone`
- `accessibility-usability`

## Mandatory Behavior

1. P0 流程必须尽量短且明确。
2. 一个页面不得同时承载多个互相竞争的任务。
3. 复杂表单必须分组、分步或渐进披露。
4. 高风险决策必须给出上下文说明。
5. 文案必须减少抽象词和模糊动作。
6. 异常状态不得堆叠多个解决方案让用户困惑。

## Load Reduction Methods

- Progressive disclosure：渐进披露。
- Chunking：分组信息。
- Prioritization：主次排序。
- Defaults：合理默认值。
- Inline guidance：就地提示。
- Recovery：清晰恢复路径。
- Confirmation：高风险操作确认。

## Quality Check

- 页面是否有过多同权重 CTA。
- 用户是否需要记住前一步信息。
- 表单是否一次要求过多输入。
- 错误是否同时抛出过多信息。
- 流程是否可以拆成更清楚的步骤。

## Failure Handling

认知负荷过高时：

1. 回退给 `information-architect` 拆页面。
2. 回退给 `flow-designer` 拆流程。
3. 回退给 `page-layout-designer` 简化层级。
4. 回退给 `microcopy-editor` 简化文案。