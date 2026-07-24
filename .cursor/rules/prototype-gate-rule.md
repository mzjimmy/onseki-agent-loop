# prototype-gate-rule.md

# [prototype-gate-rule.md](http://prototype-gate-rule.md)

## Rule Intent

未完成核心设计真相源和质量审计前，不得进入高保真原型或开发交付，防止 LLM 把不完整设计包装成最终方案。

## Applies To

- 所有 agents
- `prototype-spec`
- `handoff-pack`
- 审计流程

## Required Artifacts

进入 prototype 前必须完成：

1. `output/strategy/product-intent.md`
2. `output/style/style-concept.md`
3. `output/structure/information-architecture.md`
4. `output/structure/page-map.md`
5. `output/structure/user-flow.md`
6. `output/style/design-tokens.md`
7. `output/pages/*.md`
8. `output/interaction/interaction-spec.md`
9. `output/interaction/component-states.md`
10. `output/interaction/motion-spec.md`
11. `output/audits/consistency-audit.md`
12. `output/audits/usability-audit.md`
13. `output/audits/accessibility-audit.md`

## Gate Criteria

- P0 任务清楚。
- 页面结构完整。
- 交互反馈完整。
- 组件状态完整。
- 动效有意义且 token 化。
- 无 blocking 审计问题。
- 未决假设被标注。
- 原型目标明确。

## Mandatory Behavior

1. gate 未通过时，`prototype-spec-writer` 不得生成原型说明。
2. gate 未通过时，`handoff-producer` 不得生成最终交付。
3. blocking 问题必须回流上游修复。
4. major 问题必须记录风险和修复计划。
5. 所有 gate 判定必须可追溯。

## Failure Handling

若 gate 未通过：

1. 输出失败原因。
2. 指定责任 agent。
3. 指定需修复文件。
4. 修复后重新执行审计。