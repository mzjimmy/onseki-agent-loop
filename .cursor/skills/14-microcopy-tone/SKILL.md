# skill.md

```yaml
name: microcopy-tone
description: Use this skill to define and normalize UI microcopy, button labels, hints, empty states, error messages, success messages, onboarding text, and action tone.
```

# Microcopy Tone Skill

## Purpose

统一 UI 微文案，使用户知道当前状态、下一步动作和错误恢复方式，避免 LLM 在不同页面生成语气不一、动作含糊的文案。

## When to Use

- 页面与组件状态已初步完成。
- 需要统一按钮、提示、表单、空状态、错误、成功、引导文案。
- 可用性审计发现理解障碍时。

## Required Inputs

- `product-intent.md`
- `style-concept.md`
- `pages/*.md`
- `component-states.md`
- `interaction-spec.md`
- 品牌语气约束。

## Output Contract

必须输出 `output/interaction/microcopy-guide.md`：

1. 语气原则。
2. 按钮命名规则。
3. 表单提示规则。
4. 空状态模板。
5. 错误状态模板。
6. 成功状态模板。
7. 危险操作确认文案。
8. 禁止使用词。
9. 多页面文案统一表。

## Procedure

1. **定义语气**：例如清晰、克制、帮助行动，不营销化。
2. **统一动作词**：提交、保存、继续、返回、重试、取消等保持一致。
3. **写状态模板**：空、错、成功、加载、无权限。
4. **补恢复信息**：错误文案必须告诉用户如何处理。
5. **减少歧义**：避免“确定”“完成”“处理一下”等含糊词。
6. **匹配情境**：危险操作要明确后果，成功提示要简短。
7. **交给一致性审计**：输出供 consistency-audit 检查。

## Required Rules

- `content-hierarchy-rule`
- `interaction-feedback-rule`
- `cognitive-load-rule`
- `page-consistency-rule`

## Quality Gate

- 文案帮助用户行动。
- 同类按钮使用同类动词。
- 错误状态有恢复方法。
- 语气和品牌一致。
- 不用口号替代说明。

## Failure Modes to Avoid

- 过度营销化。
- 按钮动词不统一。
- 错误提示责怪用户。
- 空状态只有“暂无数据”。