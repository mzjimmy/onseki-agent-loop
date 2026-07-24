# ONSEKI Agent Loop Contract

> 版本：0.1  
> 状态：Draft / 可执行  
> 核心原则：Loop 的产出不是文字，而是一次有证据、可保留、可回滚的状态跃迁。

## goal

### 产品目标

把 ONSEKI 从氛围原型推进为一个可信的「实时音乐鉴赏与编曲观察工具」：

1. 用户播放音乐时，舞台、音轨、章节、和声、能量与解释保持同步。
2. 用户能通过静音、独奏、循环和前后对比，观察乐器在编曲中的作用。
3. 系统严格区分事实、模型推测、重新配器建议和未知。
4. 每次开发 Loop 只推进一个预先声明、可自动验证的 Gap。
5. 人类每天只需阅读状态摘要和真正需要决策的事项，不阅读过程报告。

### Loop 目标

每轮 Loop 必须完成下列结果之一：

- `VERIFIED`：Gap 已消除，证据通过独立验证；
- `REJECTED`：假设被证伪，记录可复用结论；
- `BLOCKED`：缺少外部条件或人类决策；
- `NO_CHANGE`：证据不足，不进行修改；
- `ROLLED_BACK`：变更失败，已恢复到已知安全状态。

不允许以“生成报告”“写了很多代码”“消耗了很多 Token”作为成功。

### 第一阶段成功标准

建立一个可公开演示的最小 Loop：

> 领取一个带验收标准的 UI/播放同步 Gap → 在隔离分支实现 → 自动构建 → 执行行为验证 → Validator 独立判定 → 更新状态卡 → 产出演示记录。

第一阶段选定的黄金任务：

> 当播放进入新章节时，章节名、编曲解释、DAW 播放头和舞台乐手活跃状态在允许误差内同步更新。

验收指标：

- 构建成功；
- JavaScript 无语法错误；
- 0 秒、12 秒、22 秒、36 秒四个边界状态符合规格；
- 播放头时间误差不超过 100ms；
- 静音/独奏同时影响音频状态、轨道状态和舞台角色状态；
- 键盘操作可用；
- 失败时不修改已发布版本；
- Validator 提供机器可读结论和最小证据索引。

## boundary

### Loop 可以自动做

- 读取规格、状态和历史日志；
- 采集只读运行证据；
- 创建或更新单个 Gap；
- 在隔离分支或临时工作区修改代码；
- 运行构建、测试、静态检查和本地行为验证；
- 生成候选截图或短演示；
- 回滚本轮候选变更；
- 更新状态文件和结构化日志；
- 提交候选变更供人类审阅。

### Loop 默认不能做

- 自己发明产品目标或改变页面职责；
- 在多个未决产品方向中随机选择一个并长期实现；
- 将模型推测描述为真实分轨、真实和弦或原作者意图；
- 未经批准修改生产环境、公开发布、删除用户数据或替换真实音频；
- 根据单次截图或单份报告宣布体验改善；
- 同一 Agent 同时实现并最终验收自己的工作；
- 在 Validator 不可用时将状态标为 `VERIFIED`；
- 因为“看起来合理”而跳过证据；
- 为保持 Loop 运转而制造新任务。

### 必须停下并请求人类决策

- 目标或验收标准存在两种以上合理解释；
- 变更会改变产品定位、信息架构或核心视觉语言；
- 需要使用有版权风险的音乐、图像或 3D 模型；
- 需要新增付费服务、密钥、账号或生产权限；
- Validator 连续三轮无法稳定复现结果；
- 同一 Gap 连续三轮未产生新证据；
- 变更可能影响真实用户数据、线上访问或公开发布。

### 资源预算

每个 Gap 默认：

- 最多 3 个实现尝试；
- 最多 2 个并行假设；
- 最长 45 分钟；
- 连续 2 次验证失败后必须重新检查 Contract；
- 无新证据时禁止仅靠增加 Token 继续运行。

## sop

### 0. 读取契约

读取：

- `AGENT_LOOP_CONTRACT.md`
- `loop/state.json`
- 当前 Gap
- 最近三条相关日志

若文件冲突，以 Contract 和人工确认的 Goal 为准。

### 1. 选择 Gap

Orchestrator 只能领取满足以下条件的 Gap：

- 引用一个已确认 Goal；
- 描述当前事实与期望状态；
- 有明确证据来源；
- 验收标准可执行；
- 风险和回滚方式已声明；
- 当前没有其他 Agent 持有写锁。

### 2. 建立基线

变更前记录：

- 当前版本或提交；
- 构建结果；
- 相关行为结果；
- 已知失败；
- 环境信息；
- 验证命令或验证步骤。

没有基线，不允许进入实现。

### 3. 形成可证伪假设

格式：

> 如果执行 X，指标 Y 应从 A 变为 B；若没有变化，则假设被证伪。

每轮优先验证最小假设，不同时重构无关模块。

### 4. 在隔离环境执行

- 创建候选分支或临时工作区；
- 只修改 Gap 声明的文件范围；
- 保留用户已有修改；
- 每个尝试生成独立 `attempt_id`；
- 失败尝试可以保留证据，但不得混入候选版本。

### 5. 执行验证

验证分三层：

1. **结构验证**：语法、构建、类型、文件完整性；
2. **行为验证**：播放、跳转、章节同步、静音/独奏、键盘操作；
3. **产品验证**：解释是否清楚、事实/推测是否区分、是否增强核心聆听行为。

结构和行为可自动决定；产品方向性判断默认需要人工或预先批准的视觉规格。

### 6. Validator 独立判定

Validator 只读取：

- Gap Contract；
- 基线；
- 候选产物；
- 验证证据。

Validator 不读取 Orchestrator 的“成功叙述”，也不修改候选代码。

输出只能是：

- `PASS`
- `FAIL`
- `INCONCLUSIVE`

### 7. 提交状态跃迁

只有 Validator `PASS` 才能：

```text
IMPLEMENTING → VALIDATING → VERIFIED
```

失败时：

```text
VALIDATING → REJECTED | BLOCKED | ROLLED_BACK
```

### 8. 压缩汇报

人类摘要最多包含：

```text
系统状态
本轮可信状态变化
需要人工决策
失败但有价值的结论
下一项候选动作
```

详细过程只写入日志，不主动展开。

# state+log

## state

`loop/state.json` 是当前事实的唯一入口，不保存长篇分析。

建议结构：

```json
{
  "schema_version": "0.1",
  "project": "onseki",
  "loop_status": "IDLE",
  "product_phase": "IMPLEMENTATION",
  "active_goal_id": "goal-realtime-arrangement-map",
  "active_gap_id": null,
  "active_attempt_id": null,
  "write_lock": null,
  "last_verified_version": "demo-v1",
  "health": {
    "build": "PASS",
    "player_sync": "UNKNOWN",
    "mix_controls": "UNKNOWN",
    "accessibility": "UNKNOWN"
  },
  "counters": {
    "verified_transitions": 0,
    "rejected_hypotheses": 0,
    "human_decisions_pending": 0
  },
  "updated_at": null
}
```

### Loop 状态

```text
IDLE
SCOPING
BASELINING
IMPLEMENTING
VALIDATING
WAITING_HUMAN
BLOCKED
ROLLING_BACK
COMPLETE
```

### Gap 状态

```text
DRAFT
READY
CLAIMED
IN_PROGRESS
CANDIDATE
VERIFIED
REJECTED
BLOCKED
ARCHIVED
```

## logs

日志采用 JSONL，一行一个事件，只追加、不改写：

```text
loop/logs/events.jsonl
```

事件结构：

```json
{
  "event_id": "evt-20260723-001",
  "timestamp": "ISO-8601",
  "run_id": "run-001",
  "actor": "orchestrator",
  "event_type": "GAP_CLAIMED",
  "goal_id": "goal-realtime-arrangement-map",
  "gap_id": "gap-section-sync",
  "attempt_id": "attempt-001",
  "from_state": "READY",
  "to_state": "CLAIMED",
  "evidence": [],
  "summary": "领取章节边界同步 Gap",
  "confidence": 1,
  "needs_human": false
}
```

### 必须记录的事件

- `RUN_STARTED`
- `BASELINE_CAPTURED`
- `GAP_CREATED`
- `GAP_CLAIMED`
- `HYPOTHESIS_PROPOSED`
- `CHANGE_APPLIED`
- `CHECK_EXECUTED`
- `VALIDATION_REQUESTED`
- `VALIDATION_PASSED`
- `VALIDATION_FAILED`
- `HUMAN_DECISION_REQUESTED`
- `ROLLBACK_COMPLETED`
- `STATE_TRANSITION`
- `RUN_FINISHED`

### 证据索引

证据保存到：

```text
loop/evidence/<run_id>/
```

允许类型：

- 构建输出摘要；
- 测试结果；
- 时间同步采样；
- 截图与短视频；
- 可访问性结果；
- 候选变更摘要；
- 人工决策记录。

日志只引用证据路径和哈希，不复制大段输出。

# orchestrator

Orchestrator 是调度器，不是最终裁判。

职责：

1. 读取 Goal、Boundary、State 和 Gap 队列；
2. 选择一个满足条件的 Gap；
3. 建立基线；
4. 选择最小可证伪假设；
5. 分配实现和只读检查；
6. 控制预算、写锁和回滚；
7. 将候选产物交给 Validator；
8. 根据 Validator 结果更新状态；
9. 生成人类状态卡。

Orchestrator 禁止：

- 修改验收标准来适配自己的实现；
- 删除失败证据；
- 把 `INCONCLUSIVE` 解释成通过；
- 因无任务而自动扩大产品范围；
- 绕过人类决策门。

每轮输出：

```json
{
  "selected_gap": "gap-section-sync",
  "why_now": "这是实时编曲地图的最小纵向闭环",
  "hypothesis": "统一使用同一播放时钟可消除四个视图的边界漂移",
  "allowed_files": ["app.js", "tests/*"],
  "checks": ["syntax", "build", "boundary-sync", "mute-solo"],
  "rollback": "恢复到 last_verified_version",
  "budget": {
    "attempts": 3,
    "minutes": 45
  }
}
```

# validator

Validator 必须与实现 Agent 分离，且默认只读。

职责：

1. 验证 Gap 是否引用已确认目标；
2. 验证基线是否存在；
3. 复现验收步骤；
4. 判断证据是否完整、可重复；
5. 检查是否引入 Contract 外变化；
6. 输出最小失败原因；
7. 对不确定结果返回 `INCONCLUSIVE`。

判定结构：

```json
{
  "verdict": "PASS",
  "gap_id": "gap-section-sync",
  "attempt_id": "attempt-002",
  "contract_hash": "sha256:...",
  "checks": [
    {"id": "build", "result": "PASS", "evidence": "evidence/build.txt"},
    {"id": "boundary-sync", "result": "PASS", "max_error_ms": 42},
    {"id": "mute-solo", "result": "PASS", "evidence": "evidence/mix.json"}
  ],
  "unexpected_changes": [],
  "confidence": 0.96,
  "reason": "所有强制验收项通过",
  "validated_at": "ISO-8601"
}
```

Validator 返回 `FAIL` 或 `INCONCLUSIVE` 时，必须指出最短复现路径，不能直接给出修复代码。

# instance

## 实例：章节同步 Loop

### Contract

```text
Goal:
用户在播放过程中能可靠看见“现在由谁演奏、音乐处于哪一段、为什么这样编排”。

Fact:
当前界面有共享时间变量，但没有自动化证据证明四个章节边界全部同步。

Gap:
章节、解释、轨道播放头和舞台乐手可能在边界处产生不一致。

Expected:
在 0s、12s、22s、36s 采样时，所有视图映射到同一章节，误差 ≤100ms。

Risk:
修改时钟可能影响暂停、拖动和导入音频。

Rollback:
保留上一已验证版本；候选失败不部署。
```

### 执行

```text
BASELINING
→ 记录四个时间点当前 DOM/状态
→ 建立失败用例
→ IMPLEMENTING
→ 提取唯一 playback clock 与 deriveViewState(time)
→ VALIDATING
→ 构建 + 边界采样 + 暂停/拖动回归
→ Validator PASS
→ VERIFIED
```

### 人类状态卡

```text
系统状态：HEALTHY
可信状态变化：章节同步 Gap 已验证
最大同步误差：42ms
回归：播放、暂停、拖动、静音/独奏均通过
需要人工决策：0
详细证据：按需展开
```

# trigger

Loop 支持四种触发方式，但触发只代表“检查是否有可执行 Gap”，不代表必须修改：

1. **手动触发**  
   人类批准 Goal、Gap 或产品方向后启动。适合高风险和产品决策。

2. **事件触发**  
   提交、测试失败、部署失败、运行异常或新证据出现时启动。

3. **定时触发**  
   每日或每周检查状态、压缩异常；无可信 Gap 时输出 `NO_CHANGE`。

4. **队列触发**  
   上一 Gap 被验证后领取下一个 `READY` Gap。仅适合已有清晰规格和 Validator 的实施阶段。

推荐初期使用：

```text
手动批准 Gap
→ 自动实施与验证
→ 人工决定是否合并/发布
```

# execution-validation

ONSEKI 的验证金字塔：

### L0 静态门

- JavaScript/TypeScript 语法；
- 构建；
- 文件引用；
- 无明显控制台错误；
- 状态与日志 Schema 合法。

### L1 状态门

- 时间 → 章节映射；
- 时间 → 活跃乐器映射；
- mute/solo 状态；
- pause/seek/loop 状态；
- 导入音频回退行为。

### L2 交互门

- 点击播放；
- 拖动时间线；
- 章节边界跳转；
- 静音/独奏；
- 键盘操作；
- 移动端基本可用。

### L3 体验门

- 10 秒内理解页面用途；
- 当前演奏者易于识别；
- 解释不会冒充事实；
- 用户能通过操作获得新的编曲理解；
- 信息密度没有遮蔽聆听。

L0–L2 可自动化；L3 需要预设规则、可比原型或人工验收。

# evolution-loop

Loop 自身也需要进化，但只能根据运行证据进化。

每累计 10 次 Run 或出现以下事件时复盘：

- 同类失败连续出现 3 次；
- Validator 误报或漏报；
- 人工频繁推翻 `PASS`；
- 日志体积增加但状态跃迁减少；
- 单个 Gap 平均尝试次数持续上升。

复盘指标：

```text
verified_transition_rate
human_override_rate
rollback_rate
validator_false_pass_rate
median_attempts_per_gap
median_human_reading_minutes
no_change_rate
```

允许进化：

- 增加更可靠的 Validator；
- 缩小 Gap；
- 调整触发频率；
- 改进证据压缩；
- 降低无效并行度；
- 将常见失败固化为回归测试。

禁止进化：

- 为提高完成率而降低验收标准；
- 让实现 Agent 修改 Validator 结果；
- 因 Token 预算未用完而增加任务；
- 根据一次成功自动扩大生产权限。

# demo-open-source

## 开源演示目标

让其他开发者在 10 分钟内看懂：

1. Loop 领取了什么 Gap；
2. 为什么这个 Gap 值得做；
3. Agent 修改了什么；
4. Validator 如何独立判断；
5. 失败时如何停止或回滚；
6. 人类最终只需要看什么。

## 仓库最小结构

```text
/
├── AGENT_LOOP_CONTRACT.md
├── loop/
│   ├── state.json
│   ├── schemas/
│   │   ├── state.schema.json
│   │   ├── event.schema.json
│   │   └── verdict.schema.json
│   ├── gaps/
│   │   └── gap-section-sync.md
│   ├── logs/
│   │   └── events.example.jsonl
│   ├── evidence/
│   │   └── example-run/
│   └── prompts/
│       ├── orchestrator.md
│       └── validator.md
├── scripts/
│   ├── loop-run
│   ├── validate
│   └── status-card
└── README.md
```

## 演示脚本

```text
1. 展示一个可复现的章节边界不同步问题；
2. 手动将 Gap 标为 READY；
3. 启动 Loop；
4. Orchestrator 建立基线并实施候选修复；
5. 第一次故意让 Validator 拒绝不完整证据；
6. 第二次补足行为测试并通过；
7. 展示 state.json 的状态跃迁；
8. 展示一张五行的人类状态卡；
9. 回放失败证据和回滚路径。
```

## 开源验收

- 不包含私钥、用户音频或受限素材；
- 示例可离线运行；
- 一条命令完成演示；
- 默认不写入生产系统；
- 所有状态变化可由日志重建；
- Validator 可单独运行；
- README 明确说明“Loop 不等于无限自治”；
- 附带一次成功 Run 和一次失败 Run；
- 许可证、贡献方式和安全边界清楚。

# roadmap

## M0：契约与状态骨架

- 确认本文档；
- 创建 State/Event/Verdict Schema；
- 创建黄金 Gap；
- 实现状态卡生成器。

## M1：单 Loop 演示

- 完成章节同步 Gap；
- 自动执行 L0–L2 验证；
- Validator 独立输出判定；
- 记录成功与失败 Run。

## M2：受控队列

- 增加 3–5 个明确 Gap；
- 加入写锁、预算和自动回滚；
- 无任务时可靠输出 `NO_CHANGE`。

## M3：开源演示

- 一条命令运行；
- 录制 3 分钟演示；
- 清理素材和隐私；
- 发布文档、示例证据与贡献指南。

## M4：真实音乐分析 Loop

仅在 Validator 能检查时间同步、分析置信度和推测标记之后，才接入真实音源分离、节拍、和弦及乐器识别。
