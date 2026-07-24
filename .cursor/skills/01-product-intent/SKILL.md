# skill.md

```yaml
name: product-intent
description: Use this skill to clarify a UI project's product goal, target users, core tasks, constraints, risks, and measurable success criteria before any page, style, interaction, or motion work begins.
```

# Product Intent Skill

## Purpose

把模糊需求转成可执行的产品意图卡，作为所有后续 UI、交互、动效、文案、原型与交付判断的源头。该 skill 专门消除 LLM 在“未理解目标就开始设计”时产生的能力差。

## When to Use

- 新项目启动、需求不完整、页面目标不清晰时。
- 需要定义目标用户、主任务、成功指标、约束、风险和不可做范围时。
- 任意下游 skill 缺少产品目标依据时，必须回到本 skill。

## Required Inputs

- 项目一句话描述。
- 目标用户或使用者类型。
- 核心业务目标。
- 目标平台：Web / Mobile / Desktop / Embedded / Dashboard。
- 已知约束：品牌、技术、时间、合规、性能、内容、设备。
- 可选：竞品、参考图、现有页面、用户反馈、业务流程。

## Output Contract

必须输出 `output/strategy/product-intent.md`，包含：

1. 项目目标一句话。
2. 目标用户与使用情境。
3. 核心任务排序：P0 / P1 / P2。
4. 成功指标：行为指标、感知指标、业务指标。
5. 设计边界：必须做、可以做、明确不做。
6. 风险与假设：已确认 / 待确认 / 高风险。
7. 下游依赖：哪些内容交给 style、IA、flow、interaction、motion。

## Procedure

1. **压缩目标**：把原始需求压缩成“谁在什么场景下完成什么任务，为了获得什么结果”。
2. **识别主用户**：区分决策者、操作者、浏览者、管理员、异常处理者。
3. **拆解核心任务**：只保留影响用户完成目标的任务，按 P0 / P1 / P2 排序。
4. **定义成功指标**：每个 P0 任务至少有一个可观察指标，例如完成率、耗时、错误率、理解度、转化率。
5. **列出约束**：明确品牌、平台、技术、内容、合规、性能和时间边界。
6. **输出假设表**：所有不确定内容都要标为 assumption，禁止当作事实继续传递。
7. **建立下游接口**：把风格、信息架构、用户流程、设计系统需要继承的输入写清楚。

## Required Rules

- `design-ssot-rule`
- `content-hierarchy-rule`
- `prototype-gate-rule`
- `handoff-traceability-rule`

## Quality Gate

- 是否能用一句话说明产品意图。
- 是否明确谁是主用户。
- 是否明确 P0 任务。
- 是否有可检查的成功指标。
- 是否区分事实、假设、待确认问题。
- 是否给下游 skill 留出清晰输入。

## Failure Modes to Avoid

- 直接生成页面布局。
- 把“漂亮、现代、高级”当作目标。
- 把业务目标和用户任务混在一起。
- 没有成功指标就进入原型。
- 对未知信息自行脑补且不标注。