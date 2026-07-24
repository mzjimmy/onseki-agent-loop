# skill.md

```yaml
name: user-flow
description: Use this skill to design task flows, decision points, state transitions, recovery paths, and edge cases across multiple UI pages.
```

# User Flow Skill

## Purpose

把页面地图转成用户可执行路径，确保每个动作都有反馈、每个失败都有恢复方式，降低 LLM 遗漏异常路径的风险。

## When to Use

- 已有页面地图，需要设计用户从入口到完成的路径。
- 需要明确点击、输入、选择、确认、取消、失败、重试。
- 交互设计前必须使用。

## Required Inputs

- `product-intent.md`
- `information-architecture.md`
- `page-map.md`
- 业务规则、权限规则、异常场景。
- 目标平台与设备。

## Output Contract

必须输出 `output/structure/user-flow.md`：

1. P0 / P1 流程清单。
2. 每条流程的入口、步骤、判断点、反馈、完成状态。
3. 异常路径：失败、取消、超时、无数据、无权限、冲突。
4. 回退与恢复路径。
5. 页面跳转表。
6. 下游交互与组件状态需求。

## Procedure

1. **选择主任务**：优先设计 P0，不平均分配注意力。
2. **写主路径**：入口 → 操作 → 系统反馈 → 用户下一步 → 完成。
3. **补判断点**：权限、数据状态、校验、冲突、网络、用户取消。
4. **补恢复路径**：每个失败状态必须有返回、重试、保存草稿或联系支持。
5. **定义反馈**：每步明确即时反馈、等待反馈、完成反馈。
6. **传递状态需求**：把每个状态交给 component-state 和 interaction-pattern。
7. **检查负荷**：复杂流程拆步骤，必要时渐进披露。

## Required Rules

- `interaction-feedback-rule`
- `cognitive-load-rule`
- `accessibility-baseline-rule`
- `prototype-gate-rule`

## Quality Gate

- 每个用户动作都有系统反馈。
- 每个失败都有恢复路径。
- 主流程和异常流程均可被原型验证。
- 未把业务规则隐藏在模糊描述里。
- 输出能直接喂给 interaction-pattern。

## Failure Modes to Avoid

- 只画理想路径。
- 忽略取消、返回、保存、超时、重复提交。
- 动作后没有反馈。
- 页面跳转和状态变化混淆。