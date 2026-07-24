# ONSEKI 音迹

一个把 DAW 多轨时间线、3D 虚拟乐队与编曲解释结合起来的实时音乐播放器原型。

项目同时包含一套证据驱动的 Agent Loop：Agent 每轮只处理一个有验收契约的 Gap，由独立 Validator 判断结果，并把状态变化压缩成人类可快速阅读的状态卡。

## Demo

[打开在线演示](https://onseki-band-studio.junlinli66.chatgpt.site)

## 本地运行

这是一个无依赖的静态网页：

```bash
python3 -m http.server 4173
```

然后访问 `http://localhost:4173`。

### 本地分析（不上传音频）

首次使用需安装本地运行环境，然后启动 loopback 服务：

```bash
/opt/homebrew/opt/python@3.11/bin/python3.11 -m venv .analysis-venv
.analysis-venv/bin/pip install -r analysis-runtime/requirements.txt
.analysis-venv/bin/python analysis-runtime/server.py --static-root .
```

访问 `http://127.0.0.1:8765`。音频仅在本机临时文件中处理，分析完成即删除；线上静态 demo 不会尝试上传或调用该服务。

## Agent Loop

```bash
node scripts/validate-loop.mjs
node scripts/status-card.mjs
node scripts/loop-headless.mjs --dry-run
```

自动化默认关闭。启用无人值守运行前，请阅读：

- `AGENT_LOOP_CONTRACT.md`
- `docs/agent-loop-experience.md`
- `docs/unattended-loop-runbook.md`

无人值守模式不会自动部署、读取密钥、安装依赖或执行破坏性命令。

## 仓库内容

- `index.html`、`styles.css`、`app.js`：播放器原型
- `.cursor/`：Cursor Agents、Rules、Commands 与 Skills
- `loop/`：状态、Gap、日志、Schema 与判定
- `scripts/`：验证、状态卡与 Headless 执行器
- `docs/`：经验和运行手册

音乐、乐谱、书籍及本地参考资料不包含在公开仓库中。

## License

MIT
