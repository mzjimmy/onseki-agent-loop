# skill.md

```yaml
name: information-architecture
description: Use this skill to structure UI pages, navigation, content hierarchy, entry points, exits, and cross-page relationships before layout and interaction design.
```

# Information Architecture Skill

## Purpose

把功能、内容和用户任务组织成清晰页面结构，避免 LLM 直接堆组件、跳过导航和层级关系。

## When to Use

- 需要定义页面数量、页面关系、导航结构。
- 页面内容多、功能多、路径不清晰。
- 下游 page-composition 或 user-flow 缺少结构依据。

## Required Inputs

- `product-intent.md`
- 核心任务列表。
- 功能清单与内容清单。
- 用户角色和权限。
- 业务流程或数据对象关系。
- 可选：现有站点地图、竞品结构、SEO 或路由要求。

## Output Contract

必须输出：

- `output/structure/information-architecture.md`
- `output/structure/page-map.md`

内容包括：

1. 页面清单。
2. 页面层级与父子关系。
3. 主导航、次导航、上下文导航。
4. 每页主任务、主信息、主 CTA。
5. 入口、出口、回退路径。
6. 跨页面依赖。
7. 不进入当前版本的页面。

## Procedure

1. **聚类任务与内容**：按用户目标而非内部部门或数据库结构分组。
2. **定义页面边界**：一个页面服务一个主任务；复杂任务拆成流程。
3. **建立页面地图**：明确首页、列表、详情、编辑、设置、异常页的关系。
4. **设置导航模型**：决定顶部、侧边、标签、面包屑、上下文入口。
5. **标注页面责任**：每页写清主任务、主信息、主 CTA、禁止承担的任务。
6. **传递给 flow**：把需要流程化的路径标注给 user-flow。
7. **传递给 layout**：把每页内容优先级传给 page-composition。

## Required Rules

- `content-hierarchy-rule`
- `page-consistency-rule`
- `cognitive-load-rule`
- `prototype-gate-rule`

## Quality Gate

- 用户能判断当前在哪、能去哪、下一步做什么。
- 页面边界不重叠。
- 每页只有一个主任务。
- 导航结构能覆盖主路径和回退路径。
- 页面地图能直接支撑用户流程和页面布局。

## Failure Modes to Avoid

- 把所有功能放进一个页面。
- 用组织架构替代用户路径。
- 忽略空、错、无权限、未登录等页面。
- 页面名称相似但职责不清。