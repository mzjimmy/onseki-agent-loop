# motion-meaning-rule.md

# [motion-meaning-rule.md](http://motion-meaning-rule.md)

## Rule Intent

动效必须表达反馈、层级、空间关系或情绪调性，禁止无意义炫技、过度动画和阻碍操作的动效。

## Applies To

- `motion-language`
- `interaction-pattern`
- `component-state`
- `prototype-spec`
- `handoff-pack`

## Mandatory Behavior

1. 每个动效必须写明目的。
2. 动效必须引用 motion token。
3. 页面转场必须符合页面层级关系。
4. 微交互必须响应用户动作或状态变化。
5. 必须提供 reduced motion 替代。
6. 性能高风险动效必须标记并进入原型验证。

## Valid Motion Purposes

- Feedback：确认用户动作。
- Hierarchy：表达层级打开、关闭、提升、收起。
- Space：表达页面方向、父子关系、同级切换。
- Attention：引导用户注意关键变化。
- Emotion：强化风格气质，但不能压过任务。
- Continuity：保持状态变化连续性。

## Motion Token Requirements

- `motion.duration.micro`
- `motion.duration.component`
- `motion.duration.page`
- `motion.easing.standard`
- `motion.easing.emphasized`
- `motion.delay.sequence`
- `motion.reduced.alternative`

## Quality Check

- 动效目的是否明确。
- 是否过慢或过多。
- 是否影响主任务。
- 是否支持 reduced motion。
- 是否能被前端实现。

## Failure Handling

发现无意义动效：

1. 删除或降级。
2. 如果需要保留，必须补充目的和 token。
3. 复杂动效进入 prototype-spec 验证。
4. 交付时必须写明触发、时长、结束状态。