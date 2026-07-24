# skill.md

```yaml
name: motion-language
description: Use this skill to design meaningful UI motion, transitions, micro-interactions, timing, easing, choreography, and motion constraints that reinforce hierarchy, feedback, space, and emotion.
```

# Motion Language Skill

## Purpose

把风格和交互转成有意义的动效语言，防止 LLM 为“高级感”添加无意义、干扰操作或难以实现的动效。

## When to Use

- 已有 style-concept、interaction-spec、design-tokens。
- 需要定义页面转场、弹层、微交互、加载、状态变化。
- 原型或前端实现前必须使用。

## Required Inputs

- `style-concept.md`
- `design-tokens.md`
- `interaction-spec.md`
- `page-map.md`
- 性能、设备、可访问性约束。

## Output Contract

必须输出 `output/interaction/motion-spec.md`：

1. 动效性格。
2. Motion token：时长、缓动、延迟。
3. 页面转场规则。
4. 组件微交互规则。
5. 加载、成功、错误、空状态动效。
6. 禁用动效条件。
7. 可访问性替代方案。
8. 需要原型验证的动效清单。

## Procedure

1. **定义动效目的**：每个动效必须服务反馈、层级、空间或情绪。
2. **匹配空间关系**：父子页、同级页、弹层、抽屉、局部刷新采用不同转场。
3. **控制时长**：微交互短，页面转场适中，阻断反馈明确。
4. **定义 easing**：用统一 token，禁止每处临时创造。
5. **考虑减少动态**：支持 reduced motion，避免眩晕和注意力干扰。
6. **对接组件状态**：让 hover、active、loading、success、error 都有可控反馈。
7. **标注实现风险**：复杂动效必须说明是否需要原型验证。

## Required Rules

- `motion-meaning-rule`
- `style-token-rule`
- `interaction-feedback-rule`
- `accessibility-baseline-rule`

## Quality Gate

- 每个动效都有明确意义。
- 时长和 easing token 化。
- 不阻碍主任务。
- 支持 reduced motion。
- 可被 prototype-spec 和 handoff-pack 引用。

## Failure Modes to Avoid

- 为炫技添加动效。
- 所有页面都用同一种转场。
- 动效太慢或打断操作。
- 无禁用条件和可访问性替代。