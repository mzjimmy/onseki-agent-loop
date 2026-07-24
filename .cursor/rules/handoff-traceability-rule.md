# handoff-traceability-rule.md

# [handoff-traceability-rule.md](http://handoff-traceability-rule.md)

## Rule Intent

所有交付内容必须可追溯到产品目标、设计 token、组件状态、交互反馈和动效规则，避免开发依靠猜测实现。

## Applies To

- `handoff-pack`
- `prototype-spec`
- `component-state`
- `interaction-pattern`
- `motion-language`
- `design-system`

## Mandatory Behavior

1. 每个页面交付必须引用页面目标。
2. 每个组件交付必须引用 token 和状态矩阵。
3. 每个交互交付必须引用 interaction-spec。
4. 每个动效交付必须引用 motion-spec。
5. 每个验收标准必须可检查。
6. 未决问题必须保留，不得伪装成已确定结论。
7. 版本变更必须记录影响范围。

## Traceability Table

交付包必须包含：

- Decision：设计决策。
- Source：来源文件。
- Owner：责任 agent。
- Affected Files：影响产物。
- Acceptance：验收标准。
- Open Questions：未决问题。

## Quality Check

- 开发是否能知道每个状态如何表现。
- 动效是否有触发、时长、结束状态。
- token 是否完整。
- 异常路径是否有说明。
- 验收标准是否能测试。

## Failure Handling

交付不可追溯时：

1. 暂停 handoff。
2. 回流缺失的 source 文件。
3. 补充 traceability table。
4. 重新生成 handoff-checklist。