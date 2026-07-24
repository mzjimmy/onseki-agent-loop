# interaction-feedback-rule.md

# [interaction-feedback-rule.md](http://interaction-feedback-rule.md)

## Rule Intent

每个用户动作都必须有反馈，每个等待、失败、取消、完成状态都必须可见，避免界面让用户猜测系统是否响应。

## Applies To

- `user-flow`
- `interaction-pattern`
- `component-state`
- `motion-language`
- `microcopy-tone`
- `prototype-spec`

## Mandatory Behavior

1. 所有用户动作必须定义即时反馈。
2. 超过短暂等待的操作必须有 loading / progress / skeleton。
3. 成功必须有完成反馈，但不得过度打扰。
4. 失败必须说明原因和恢复路径。
5. 禁用状态必须说明原因或替代路径。
6. 危险操作必须有确认、撤销或明确后果说明。

## Feedback Types

- Visual：颜色、形态、状态变化。
- Textual：提示、错误、成功、说明。
- Motion：轻微动效、转场、进度反馈。
- Structural：页面跳转、弹层、局部刷新。
- Persistent：状态保存、历史记录、通知。

## Required State Coverage

- default
- hover
- active
- focus
- loading
- success
- error
- disabled
- empty
- permission denied
- conflict
- timeout

## Quality Check

- 用户动作后是否知道系统已接收。
- 等待时是否知道正在处理中。
- 失败时是否知道如何恢复。
- 完成后是否知道结果。
- 禁用时是否知道原因。

## Failure Handling

缺少反馈时：

1. 退回 `interaction-designer` 补交互。
2. 退回 `component-state-designer` 补状态。
3. 退回 `microcopy-editor` 补文案。
4. 必要时退回 `motion-director` 补动效反馈。