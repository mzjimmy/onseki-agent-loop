# gap-section-sync

```yaml
id: gap-section-sync
status: RETIRED
goal_id: goal-realtime-arrangement-map
priority: P0
risk: medium
owner: null
attempt_limit: 3
time_budget_minutes: 45
```

## Goal

用户播放音乐时，章节名、编曲解释、DAW 播放头和舞台乐手状态必须来自同一播放时钟，并在章节边界保持同步。

> Retired on 2026-07-24: the user approved the broader MVP interaction scope. Its
> acceptance is preserved and incorporated into `gap-mvp-core-experience.md` so a
> single independent validation can assess the candidate without splitting a
> tightly coupled UI change across contracts.

## Fact

当前 Demo 共享 `state.time`，但尚无自动化证据证明：

- 0s、12s、22s、36s 四个边界映射正确；
- 暂停、拖动、循环和导入音频不会产生不同步；
- 静音/独奏同时改变轨道状态、舞台角色状态和音频调度状态。

当前事实状态为 `UNKNOWN`，不是失败结论。

## Gap

产品的核心价值是“看见音乐正在被演奏”。如果不同区域在边界处表达不同状态，用户会得到错误的编曲理解。

## Hypothesis

如果把所有视觉状态收敛为纯函数 `deriveViewState(playbackTime, mixState)`，并让音频、时间线与舞台只消费这份派生状态，那么四个章节边界和混音控制可以稳定复现。

若自动采样仍出现超过 100ms 的差异，则该假设被证伪。

## Scope

允许修改：

- `app.js`
- `index.html`（仅为测试钩子或无障碍状态）
- `loop/evidence/<run_id>/`
- 与本 Gap 直接相关的测试文件

禁止修改：

- 产品视觉语言；
- 章节内容、和弦和编曲解释文案；
- 轨道数量与乐器定义；
- 已发布站点；
- 其他产品功能。

## Acceptance

所有强制项必须通过：

1. `node --check app.js` 通过；
2. 0.000s 映射为“引子”；
3. 12.000s 映射为“发展”；
4. 22.000s 映射为“展开”；
5. 36.000s 映射为“余韵”；
6. 播放头与当前播放时间最大误差 ≤100ms；
7. 暂停后状态在 250ms 观察窗内不继续推进；
8. seek 到边界后，章节、解释、轨道与舞台在同一渲染帧更新；
9. mute 同时影响目标轨道和对应乐手；
10. solo 使非目标轨道及乐手进入静音视觉状态；
11. Space、ArrowLeft、ArrowRight 不发生回归；
12. 未满足任何强制项时，Validator 不得返回 `PASS`。

## Baseline required

实施前必须保存：

- 当前版本标识；
- 语法检查输出；
- 四个边界采样；
- mute/solo DOM 状态采样；
- 当前已知控制台错误。

## Validation

Validator 最少执行：

- 静态语法检查；
- 边界映射单元测试；
- 播放/暂停/seek 行为测试；
- mute/solo 状态测试；
- Contract 外文件变更检查。

## Rollback

候选失败时恢复本轮允许文件到 `last_verified_version` 对应状态；保留日志和失败证据。不得部署失败候选。

## Human decision gate

以下情况转为 `WAITING_HUMAN`：

- 需要改变章节边界；
- 需要改变产品文案或视觉；
- 浏览器计时环境无法稳定达到 100ms；
- 第三次尝试仍未通过；
- Validator 与复现证据冲突。

