# design-ssot-rule.md

# [design-ssot-rule.md](http://design-ssot-rule.md)

## Rule Intent

建立 UI 项目的唯一设计真相源，防止多个 agent / skill 在不同阶段各自发明产品目标、风格、组件、动效和交互规则。

## Applies To

- 所有 agents
- 所有 skills
- 所有 output 文件
- 所有审计与交付产物

## Canonical Sources

- 产品目标：`output/strategy/product-intent.md`
- 页面结构：`output/structure/page-map.md`
- 风格方向：`output/style/style-concept.md`
- 视觉与动效 token：`output/style/design-tokens.md`
- 交互行为：`output/interaction/interaction-spec.md`
- 组件状态：`output/interaction/component-states.md`
- 动效语言：`output/interaction/motion-spec.md`

## Mandatory Behavior

1. 新增任何设计决策前，先检查是否已有真相源。
2. 如果真相源存在，必须引用，不得重写。
3. 如果真相源缺失，必须标注为 `assumption`，并回流给对应 agent。
4. 如果发现冲突，不能自行选择喜欢的版本，必须交给 `consistency-editor`。
5. 所有交付说明必须能追溯到上述真相源之一。

## Agent Responsibilities

- `product-brief-architect` 维护产品目标真相源。
- `visual-style-director` 维护风格真相源。
- `design-system-keeper` 维护 token 真相源。
- `interaction-designer` 维护交互真相源。
- `motion-director` 维护动效真相源。
- `consistency-editor` 判定冲突归属。

## Quality Check

- 是否存在多个互相矛盾的风格描述。
- 是否存在页面私有 token。
- 是否存在同一组件在不同页面表现不同。
- 是否存在动效规则未写入 motion-spec。
- 是否存在无法追溯的交付说明。

## Failure Handling

发现违反本 rule：

1. 暂停下游生成。
2. 标注冲突文件。
3. 指定应回流的 owner agent。
4. 更新真相源后再继续。