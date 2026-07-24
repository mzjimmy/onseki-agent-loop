# skill.md

```yaml
name: style-concept
description: Use this skill to define a coherent UI visual style concept, mood, visual principles, references, anti-references, and constraints that can control multi-page consistency.
```

# Style Concept Skill

## Purpose

把主观风格偏好转成可复用、可约束、可审计的视觉方向，避免 LLM 在多页面生成中风格漂移。

## When to Use

- 已有 `product-intent.md`，需要确定视觉气质、情绪温度、参考系时。
- 多页面需要统一风格方向。
- 设计系统尚未建立 token 前，需要先确定风格原则。

## Required Inputs

- `output/strategy/product-intent.md`
- 品牌材料：Logo、颜色、字体、调性说明。
- 参考图 / 竞品 / 行业样式。
- 用户使用场景和设备环境。
- 约束：品牌禁区、行业合规、可访问性、性能。

## Output Contract

必须输出 `output/style/style-concept.md` 与 `output/style/visual-language.md`：

1. 风格一句话。
2. 3–5 个视觉关键词。
3. 情绪温度：冷静 / 可信 / 活跃 / 科技 / 人性化等。
4. 参考系与反参考系。
5. 色彩方向、字体方向、空间密度、圆角、阴影、图标风格。
6. 多页面统一原则。
7. 需要 design-system 继续 token 化的条目。

## Procedure

1. **读取产品意图**：风格必须服务主用户和 P0 任务。
2. **提炼关键词**：每个关键词必须附带设计含义，例如“精准 = 高对齐、低装饰、清晰数字层级”。
3. **建立风格边界**：写出反参考系，明确不采用什么。
4. **映射视觉变量**：把关键词转成颜色、字体、间距、图形、密度、动效性格。
5. **定义跨页面规则**：同一层级、同一状态、同一 CTA 在页面间保持一致。
6. **交给 design-system**：输出待 token 化清单，不直接生成最终 token。

## Required Rules

- `design-ssot-rule`
- `style-token-rule`
- `page-consistency-rule`
- `accessibility-baseline-rule`

## Quality Gate

- 每个风格关键词都有可执行解释。
- 有参考系，也有反参考系。
- 风格能约束多个页面，不只是单张视觉稿。
- 没有与产品意图冲突的装饰。
- 已明确哪些内容需要 token 化。

## Failure Modes to Avoid

- 只写“现代、简洁、高级”。
- 过度依赖参考图而忽略用户任务。
- 为追求视觉冲击牺牲可读性。
- 在不同页面随意改变圆角、阴影、颜色和密度。