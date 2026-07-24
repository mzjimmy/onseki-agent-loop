# page-consistency-rule.md

# [page-consistency-rule.md](http://page-consistency-rule.md)

## Rule Intent

保证多页面共享同一套布局节奏、组件语义、导航逻辑、交互反馈、微文案和动效语言，避免 LLM 在不同页面输出不同产品。

## Applies To

- `information-architecture`
- `page-composition`
- `design-system`
- `interaction-pattern`
- `motion-language`
- `microcopy-tone`
- `consistency-audit`

## Mandatory Behavior

1. 同一组件在不同页面必须有同一视觉身份和交互行为。
2. 同一层级的信息必须使用同一视觉层级。
3. 同一动作必须有同一反馈模式。
4. 同一状态必须有同一文案结构。
5. 页面间差异必须由用户任务、权限、平台或内容差异解释。

## Consistency Dimensions

- Layout：栅格、边距、区块节奏、卡片密度。
- Component：按钮、输入、导航、列表、卡片、弹层。
- Interaction：点击、输入、选择、确认、取消、返回。
- Motion：方向、时长、缓动、反馈强度。
- Copy：动作词、错误语气、空状态结构。
- Responsive：折叠策略、导航替代、触控规则。

## Allowed Differences

允许差异，但必须说明理由：

- 页面主任务不同。
- 信息密度不同。
- 设备限制不同。
- 用户权限不同。
- 危险操作需要更强确认。
- 关键转场需要表达层级变化。

## Quality Check

- 同类页面是否使用同类结构。
- 同组件是否在不同页面表现一致。
- 同动作是否同反馈。
- 同状态是否同文案语气。
- 差异是否有产品理由。

## Failure Handling

发现不一致：

1. 由 `consistency-editor` 记录冲突。
2. 指向违反的 token / rule / page。
3. 选择真相源。
4. 回流给 owner agent 修复。