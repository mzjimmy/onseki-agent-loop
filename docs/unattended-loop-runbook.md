# ONSEKI 无人值守 Loop 操作手册

## 目标运行方式

日常不需要守着 Agent。系统每隔一段时间检查是否存在可信的 READY Gap：

```text
定时触发
→ 安全前置检查
→ 无 Gap 则 NO_CHANGE
→ 领取一个 Gap
→ 在 loop/* 隔离分支实施候选
→ 独立 Validator 验收
→ 保存状态卡
→ 停止
```

只有 `WAITING_HUMAN`、Validator 冲突、产品方向和发布决策才通知人。

## 当前准备状态

当前自动化保持关闭：

```json
"automation_enabled": false
```

而且还缺少两个前置条件：

- 当前目录不是 Git 仓库；
- 当前终端未发现 `cursor-agent`。

在这两个条件满足前，不应运行无人值守写入。

## 第一次设置

### 1. 建立版本基线

先人工检查当前文件，然后建立 Git 仓库并保存 `demo-v1` 基线。不要把音频素材、密钥、缓存和临时证据无选择地提交。

建议先补充 `.gitignore`，至少排除：

```text
.DS_Store
.env*
loop/evidence/*
loop/runs/*
```

完成后创建专用工作分支：

```text
loop/section-sync
```

无人值守脚本必须拒绝在 `main` 或 `master` 运行。

### 2. 安装并登录 Cursor CLI

按照 Cursor 官方 CLI 文档安装，然后检查：

```text
cursor-agent --version
cursor-agent status
```

可以使用已登录会话，也可以在调度环境中安全注入 `CURSOR_API_KEY`。不要把密钥写进仓库、脚本或日志。

### 3. 先进行只读试运行

在 Cursor 中执行：

```text
/loop-scope
```

或在终端先运行：

```text
node scripts/loop-headless.mjs --dry-run
```

它应该只显示：

- 将领取哪个 Gap；
- 当前分支与安全条件；
- 预算；
- 将传递给 Agent 的任务；
- 不修改任何文件。

### 4. 启用自动化

确认只读试运行正确后，将 `loop/policy.json` 中：

```json
"automation_enabled": true
```

保持以下配置为 `false`：

```json
"allow_network": false,
"allow_dependency_install": false,
"allow_secrets": false,
"allow_destructive_commands": false,
"allow_deploy": false
```

### 5. 手动执行第一轮

```text
node scripts/loop-headless.mjs --execute
```

执行结束后只查看：

```text
node scripts/status-card.mjs
```

如果状态是 `WAITING_HUMAN`，打开对应 Gap 和证据；否则不需要阅读完整 Agent 输出。

## 定时运行

第一周建议每天最多一次，而不是持续运行：

```text
每天凌晨或工作结束后
→ node scripts/loop-headless.mjs --execute
```

稳定十轮后，才考虑提高到每天三次。`loop/policy.json` 已将每日上限设为 3。

macOS 可以使用 `launchd`，服务器可以使用 cron 或 CI schedule。调度器只负责启动一轮；是否执行由 Loop Policy 决定。

不要使用无限 `while true`。一次进程只跑一个 Gap，然后退出，让下一次调度重新读取持久状态。

执行器会主动把 Cursor CLI 的默认安装目录 `~/.local/bin` 加入子进程
`PATH`，因此 launchd/cron 不需要依赖交互式 shell 的 `.zshrc`。

### macOS launchd 示例

仓库已经包含：

```text
ops/com.onseki.agent-loop.plist.example
```

确认手动执行成功后：

```text
cp ops/com.onseki.agent-loop.plist.example ~/Library/LaunchAgents/com.onseki.agent-loop.plist
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.onseki.agent-loop.plist
```

它会每天 02:00 尝试启动一轮。若没有 READY Gap、安全条件不满足或每日预算已耗尽，执行器会拒绝运行。

查看调度状态：

```text
launchctl print gui/$(id -u)/com.onseki.agent-loop
node scripts/status-card.mjs
```

停止自动运行：

```text
launchctl bootout gui/$(id -u) ~/Library/LaunchAgents/com.onseki.agent-loop.plist
```

如果项目目录或 Node/Cursor CLI 环境不同，需要先修改 plist 示例。不要在 plist 中写入 API Key。

## 人类怎样参与

正常情况下每天只看状态卡。

需要人工处理时：

1. 查看 `需要人工决策`；
2. 打开对应 Gap；
3. 只回答其中的单一决策；
4. 将 Gap 恢复为 READY 或归档；
5. 下一次调度会自动继续。

不要在人类决策期间让 Agent 猜测答案。

## 如何让 Loop 自己进化

每完成十轮，创建一个专门的 `loop-retrospective` Gap，只分析：

- 哪些失败重复出现；
- 哪些 Validator 产生误报；
- 哪些信息仍需要人读太久；
- 哪些 Gap 应继续缩小；
- 哪些失败可以变成自动测试。

允许自动实施：

- 新增回归测试；
- 改善证据索引；
- 缩小 Gap 模板；
- 调整低风险触发频率；
- 修复状态与日志工具。

必须人工批准：

- 降低 Acceptance；
- 扩大文件写入范围；
- 开启网络、依赖安装、密钥或部署；
- 增加每日预算；
- 改变产品方向。

## 恢复与停机

出现以下任一情况，立即把 `automation_enabled` 设为 `false`：

- Validator PASS 被人类连续推翻；
- Loop 修改了 Gap 范围外文件；
- 状态与日志校验失败；
- 同一 Gap 连续三次失败；
- 出现无法解释的网络、密钥或生产操作；
- Token 成本增加但验证状态跃迁没有增加。

候选代码留在 `loop/*` 分支，不自动合并，不自动发布。恢复时从 `last_verified_version` 建立新的隔离分支。
