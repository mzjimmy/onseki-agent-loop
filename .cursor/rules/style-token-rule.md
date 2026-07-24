# style-token-rule.md

# [style-token-rule.md](http://style-token-rule.md)

## Rule Intent

所有视觉、空间和动效决策必须 token 化，防止 LLM 在页面局部临时发明颜色、字体、间距、圆角、阴影和动效时间。

## Applies To

- `style-concept`
- `design-system`
- `page-composition`
- `interaction-pattern`
- `motion-language`
- `component-state`
- `handoff-pack`

## Token Scope

必须 token 化：

- Color：背景、文本、边框、品牌、状态、危险、成功、警告。
- Typography：字号、行高、字重、标题层级、正文层级。
- Spacing：页面边距、区块间距、组件内距、列表间距。
- Radius：卡片、按钮、输入框、弹层。
- Elevation：阴影、描边、浮层层级。
- Motion：时长、缓动、延迟、过渡强度。
- State：hover、active、focus、disabled、loading、error、success。

## Mandatory Behavior

1. 页面不得使用未定义的颜色、间距、圆角、阴影。
2. 动效不得使用未定义的时长和 easing。
3. 组件状态必须引用 token。
4. 如果需要新 token，必须由 `design-system-keeper` 添加。
5. 局部特例必须写明产品理由和影响范围。

## Naming Pattern

推荐语义命名：

- `color.action.primary.bg`
- `color.feedback.error.text`
- `space.layout.section`
- `type.heading.l1`
- `radius.component.card`
- `motion.duration.micro`
- `motion.easing.standard`

## Quality Check

- token 是否语义清晰。
- token 是否支撑多页面复用。
- token 是否覆盖状态。
- token 是否与风格概念一致。
- token 是否可交付给开发。

## Failure Handling

发现未 token 化设计：

1. 标记为 `non-tokenized decision`。
2. 回流给 `design-system-keeper`。
3. 更新 `design-tokens.md`。
4. 再更新受影响页面、交互、动效或状态文件。