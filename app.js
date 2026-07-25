import { DURATION, DEMO_ANALYSIS, deriveViewState } from "./player-state.mjs";
import { analyzeUploadedAudio, createLocalAnalysisProvider, createLoopbackAnalysisProvider } from "./analysis-engine.js";

(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const savedVolume = Number(localStorage.getItem("onseki-volume"));
  const state = { time: 0, duration: DURATION, playing: false, loop: false, muted: {}, solo: null, arrangement: "full", speed: 1, volume: Number.isFinite(savedVolume) ? Math.max(0, Math.min(1, savedVolume)) : .45, raf: 0, last: 0, uploaded: false, nextSchedule: 0, analysis: { phase: "demo", data: DEMO_ANALYSIS, reason: "" }, analysisRun: 0, file: null };
  let audioCtx = null, master = null, timers = [], upload = $("#uploaded-audio");

  function waveBars(seed) {
    let html = "";
    for (let i = 0; i < 54; i++) {
      const h = 18 + ((i * 17 + seed * 23) % 76);
      html += `<i style="--h:${h}%"></i>`;
    }
    return html;
  }

  function currentTracks() { return state.analysis.data?.tracks ?? DEMO_ANALYSIS.tracks; }
  function currentSections() { return state.analysis.data?.sections ?? DEMO_ANALYSIS.sections; }
  function hasAnalysis() { return state.analysis.phase === "demo" || state.analysis.phase === "analyzed"; }

  function updateAnalysisStatus(waiting, analysisReady) {
    const phase = state.analysis.phase;
    const visible = state.uploaded && phase !== "demo";
    const progress = Number.isFinite(state.analysis.progress) ? Math.round(state.analysis.progress * 100) : 0;
    const status = $("#analysis-status");
    status.hidden = !visible;
    status.dataset.phase = phase;
    $("#analysis-status-percent").textContent = waiting ? `${progress}%` : analysisReady ? "OK" : "NG";
    $("#analysis-progress-bar").style.width = `${analysisReady ? 100 : waiting ? progress : 100}%`;
    $("#analysis-status-retry").hidden = !["unavailable", "failed"].includes(phase);
    if (waiting) {
      $("#analysis-status-title").textContent = "正在本机分析";
      $("#analysis-status-copy").textContent = state.analysis.label || "正在识别乐器与章节…";
      $("#analysis-status-meta").textContent = "可继续播放；分析完成后会自动显示可信结果。";
    } else if (analysisReady) {
      $("#analysis-status-title").textContent = "分析完成";
      $("#analysis-status-copy").textContent = `已生成 ${state.analysis.data.sections.length} 个章节与 ${state.analysis.data.tracks.length} 条演奏线索。`;
      $("#analysis-status-meta").textContent = `本机处理完成 · 置信度 ${Math.round(state.analysis.data.source.confidence * 100)}%`;
    } else {
      $("#analysis-status-title").textContent = phase === "unavailable" ? "本机分析未启动" : "分析未完成";
      $("#analysis-status-copy").textContent = state.analysis.reason || "未获得可验证的分析结果。";
      $("#analysis-status-meta").textContent = "音频仍可正常播放；启动服务或检查文件后可重试。";
    }
  }

  function buildTimeline() {
    $("#ruler").innerHTML = Array.from({ length: 9 }, (_, i) => `<span>${String(Math.round(i * state.duration / 8)).padStart(2, "0")}</span>`).join("");
    $("#section-marks").innerHTML = currentSections().map((section) => `<span style="width:${(Math.min(section.end, state.duration) - section.start) / state.duration * 100}%">${section.name}</span>`).join("");
    const stack = $("#track-stack");
    stack.querySelectorAll(".track-row").forEach((row) => row.remove());
    currentTracks().forEach((track, ti) => {
      const row = document.createElement("div");
      row.className = "track-row";
      row.setAttribute("role", "group");
      row.dataset.track = track.id;
      row.style.setProperty("--tc", track.color);
      row.innerHTML = `<div class="track-info">
        <span class="track-image" aria-hidden="true">${track.icon}</span>
        <span class="track-name"><b>${track.name}</b><span>${track.cn}</span></span>
        <span class="track-toggles"><button type="button" data-action="mute" aria-label="静音 ${track.cn}">M</button><button type="button" data-action="solo" aria-label="独奏 ${track.cn}">S</button></span>
      </div><div class="track-lane">${track.clips.map((c, ci) => `<div class="clip" data-label="${c[2]}" style="left:${c[0] / state.duration * 100}%;width:${c[1] / state.duration * 100}%"><span class="wave">${waveBars(ti * 5 + ci)}</span></div>`).join("")}</div>`;
      row.querySelector('[data-action="mute"]').addEventListener("click", () => toggleMute(track.id));
      row.querySelector('[data-action="solo"]').addEventListener("click", () => toggleSolo(track.id));
      row.querySelectorAll("button").forEach((button) => { button.disabled = state.uploaded; });
      stack.appendChild(row);
    });
  }

  function ensureAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    master = audioCtx.createGain();
    master.gain.value = state.volume;
    master.connect(audioCtx.destination);
  }

  function effectiveMix() {
    return state.arrangement === "plain" ? { ...state, solo: "keys" } : state;
  }
  function viewStateAt(time = state.time) { return deriveViewState(time, effectiveMix(), state.duration, state.analysis.data ?? DEMO_ANALYSIS); }
  function active(id, t) { return viewStateAt(t).tracks[id].active; }

  function tone(freq, when, duration, type, gain, id) {
    if (!active(id, state.time + Math.max(0, when - audioCtx.currentTime))) return;
    const o = audioCtx.createOscillator(), g = audioCtx.createGain(), f = audioCtx.createBiquadFilter();
    o.type = type; o.frequency.value = freq; f.type = "lowpass"; f.frequency.value = id === "bass" ? 520 : 2300;
    g.gain.setValueAtTime(.0001, when); g.gain.exponentialRampToValueAtTime(gain, when + .025); g.gain.exponentialRampToValueAtTime(.0001, when + duration);
    o.connect(f); f.connect(g); g.connect(master); o.start(when); o.stop(when + duration + .02); timers.push(o);
  }

  function schedule() {
    if (state.uploaded) return;
    ensureAudio();
    const now = audioCtx.currentTime, start = Math.max(state.time, state.nextSchedule), horizon = Math.min(DURATION, state.time + 2.2 * state.speed);
    for (let t = start; t < horizon; t += .5) {
      const when = now + (t - state.time) / state.speed, step = Math.floor(t * 2), chord = viewStateAt(t).section;
      const roots = chord.name === "发展" ? [58, 62, 65, 69] : chord.name === "展开" ? [55, 58, 62, 69] : [50, 53, 57, 64];
      tone(440 * 2 ** ((roots[step % roots.length] - 69) / 12), when, .34 / state.speed, "triangle", .075, "keys");
      if (step % 2 === 0) tone(440 * 2 ** ((roots[0] - 12 - 69) / 12), when, .42 / state.speed, "sine", .12, "bass");
      if (step % 4 === 0) tone(440 * 2 ** ((roots[1] - 69) / 12), when, 1.65 / state.speed, "sawtooth", .035, "strings");
      if (step % 2 === 0 && active("drums", t)) {
        const o = audioCtx.createOscillator(), g = audioCtx.createGain();
        const hit = .13 / state.speed;
        o.type = "sine"; o.frequency.setValueAtTime(step % 4 === 0 ? 110 : 190, when); o.frequency.exponentialRampToValueAtTime(48, when + .12 / state.speed);
        g.gain.setValueAtTime(.08, when); g.gain.exponentialRampToValueAtTime(.0001, when + hit); o.connect(g); g.connect(master); o.start(when); o.stop(when + hit + .01); timers.push(o);
      }
    }
    state.nextSchedule = horizon;
  }

  function stopAudio() {
    timers.forEach(n => { try { n.stop(); } catch (_) {} }); timers = [];
    if (state.uploaded) upload.pause();
  }

  function play() {
    if (state.time >= state.duration - .05) state.time = 0;
    state.playing = true; state.last = performance.now(); state.nextSchedule = state.time; document.body.classList.add("is-playing");
    $("#play-btn span").textContent = "Ⅱ"; $("#play-btn").setAttribute("aria-label", "暂停");
    if (state.uploaded) { upload.currentTime = state.time; upload.playbackRate = state.speed; upload.volume = state.volume; upload.play(); } else { ensureAudio(); audioCtx.resume(); schedule(); }
    state.raf = requestAnimationFrame(tick);
  }

  function pause() {
    state.playing = false; cancelAnimationFrame(state.raf); stopAudio(); document.body.classList.remove("is-playing");
    $("#play-btn span").textContent = "▶"; $("#play-btn").setAttribute("aria-label", "播放");
  }

  function tick(now) {
    if (!state.playing) return;
    if (state.uploaded) state.time = upload.currentTime; else state.time += (now - state.last) / 1000 * state.speed;
    state.last = now;
    if (!state.uploaded && state.nextSchedule - state.time < .9) schedule();
    const currentSection = viewStateAt().section;
    if (state.loop && state.time >= currentSection.end) {
      seek(currentSection.start); play(); return;
    }
    if (state.time >= state.duration) {
      state.time = state.duration; pause();
    }
    update(); state.raf = requestAnimationFrame(tick);
  }

  function fmt(t) {
    const m = Math.floor(t / 60), s = Math.floor(t % 60), d = Math.floor((t % 1) * 10);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${d}`;
  }

  function update() {
    const view = viewStateAt();
    $("#seek").value = view.time; $("#seek").max = state.duration; $("#time-current").textContent = fmt(view.time);
    const laneWidth = Math.max(0, $("#track-stack").clientWidth - (innerWidth <= 720 ? 130 : 190));
    $("#playhead").style.transform = `translateX(${laneWidth * view.time / state.duration}px)`;
    $("#playhead span").textContent = fmt(view.time);
    const sec = view.section, analysisReady = hasAnalysis();
    document.documentElement.dataset.section = sec.name;
    $$("#section-marks span").forEach((mark, i) => mark.classList.toggle("is-current", analysisReady && currentSections()[i] === sec));
    const waiting = state.analysis.phase === "analyzing" || state.analysis.phase === "queued";
    const unavailable = state.uploaded && !analysisReady;
    const progressCopy = state.analysis.label ? `${state.analysis.label}${Number.isFinite(state.analysis.progress) ? ` ${Math.round(state.analysis.progress * 100)}%` : ""}` : "正在识别乐器与章节…";
    $("#section-name").textContent = analysisReady ? sec.name : waiting ? "分析中" : "未分析"; $("#moment-copy").textContent = analysisReady ? sec.moment : waiting ? `${progressCopy}；完成前不会显示推测结果。` : (state.analysis.reason || "正在播放你导入的音乐；分析结果尚未生成。"); $("#chord").textContent = analysisReady ? sec.chord : "—";
    $("#register").textContent = analysisReady ? sec.register : "—"; $("#density").textContent = analysisReady ? `${sec.density}%` : "—"; $("#density-meter").style.width = analysisReady ? `${sec.density}%` : "0%";
    $("#trace-copy").textContent = analysisReady ? sec.trace : waiting ? "分析完成后，系统才会展示带置信度的乐器、章节与和声解释。" : "系统不会把预设编排、乐器或和声结论套用到你的单文件音频。"; $("#next-time").textContent = analysisReady ? sec.next : "—"; $("#next-copy").textContent = analysisReady ? sec.cue : state.analysis.reason || "可继续播放；分析服务接入后会在此显示结果。";
    $("#conductor-note b").textContent = analysisReady ? `编曲观察 · ${sec.name}` : "编曲观察";
    $("#conductor-note span").textContent = analysisReady ? sec.note : waiting ? progressCopy : "单文件音频正在播放，等待可信分析。";
    $("#player-status").textContent = `${state.playing ? "播放" : "暂停"} · ${analysisReady ? sec.name : waiting ? "正在分析音频" : "未分析音频"}`;
    $("#previous-section-btn").disabled = !analysisReady || view.time <= 0;
    $("#next-section-btn").disabled = !analysisReady || view.time >= state.duration;
    $("#lead-instrument").textContent = analysisReady ? sec.lead : "未知";
    $("#instrument-confidence").textContent = state.analysis.phase === "demo" ? "预设数据 / 高" : state.analysis.phase === "analyzed" ? `AI 分析 / ${Math.round(state.analysis.data.source.confidence * 100)}%` : waiting ? "正在分析" : "尚未分析";
    $("#principle-copy").textContent = analysisReady ? sec.principle : "这项解释只适用于已验证的分析结果。";
    $("#principle-btn").disabled = !analysisReady;
    $("#unanalysed-notice").hidden = !unavailable;
    $("#unanalysed-copy").textContent = waiting ? `${progressCopy}；完成前不展示推测分轨。` : state.analysis.reason || "单文件音频尚未完成乐器与章节分析，因此不展示虚构分轨。";
    $("#analysis-retry-btn").hidden = !(state.uploaded && ["unavailable", "failed"].includes(state.analysis.phase));
    updateAnalysisStatus(waiting, analysisReady);
    $("#analysis-source").textContent = state.analysis.phase === "demo" ? "示例预设 · 编曲数据" : state.analysis.phase === "analyzed" ? `AI 分析 · 置信度 ${Math.round(state.analysis.data.source.confidence * 100)}%` : waiting ? "用户音频 · 正在分析" : "用户音频 · 尚未分析";
    $("#honesty-note").textContent = state.analysis.phase === "demo" ? "示例曲目使用预设编排数据；它不是原作分轨。" : state.analysis.phase === "analyzed" ? "AI 分析结果带有置信度；它不是原始分轨。音源分离完成前，M/S 控制保持禁用。" : "这首用户音频目前只同步播放时间；乐器、和弦与章节不会被伪装成检测结果。";
    $("#arrangement-btn").textContent = state.arrangement === "plain" ? "普通编排" : "完整编排";
    $("#arrangement-btn").classList.toggle("active", state.arrangement === "plain");
    currentTracks().forEach(tr => {
      const trackView = analysisReady ? view.tracks[tr.id] : { muted: false, active: false }, on = trackView.active;
      const musician = $(`.musician[data-track="${tr.id}"]`), row = $(`.track-row[data-track="${tr.id}"]`), trackState = trackView.muted ? "muted" : on ? "active" : "rest";
      musician?.classList.toggle("is-active", on); row?.classList.toggle("is-live", on);
      if (musician) { musician.dataset.state = trackState; musician.title = !analysisReady ? tr.cn : trackView.muted ? `${tr.cn} 已静音 · 点击恢复` : `${tr.cn} · 点击静音`; }
      if (row) { row.dataset.state = trackState; row.setAttribute("aria-label", `${tr.cn}：${trackView.muted ? "静音" : on ? "正在发声" : "留白"}`); }
    });
  }

  function seek(t) {
    const was = state.playing; if (was) pause();
    state.time = Math.max(0, Math.min(state.duration, t)); if (state.uploaded) upload.currentTime = state.time; update();
    if (was) play();
  }

  function seekSection(direction) {
    if (!hasAnalysis()) return;
    const current = viewStateAt().section;
    const sections = currentSections();
    const index = sections.indexOf(current);
    const targetIndex = direction < 0
      ? (state.time - current.start < .35 ? index - 1 : index)
      : index + 1;
    const target = sections[Math.max(0, Math.min(sections.length - 1, targetIndex))];
    seek(direction < 0 && targetIndex < 0 ? 0 : direction > 0 && index === sections.length - 1 ? state.duration : target.start);
  }

  function setSpeed(speed) {
    const next = Number(speed);
    if (!Number.isFinite(next) || next <= 0) return;
    const was = state.playing;
    if (was) pause();
    state.speed = next;
    upload.playbackRate = next;
    $("#playback-rate").value = String(next);
    update();
    if (was) play();
  }

  function setVolume(volume) {
    state.volume = Math.max(0, Math.min(1, Number(volume)));
    if (master) master.gain.value = state.volume;
    upload.volume = state.volume;
    $("#volume").value = String(state.volume);
    localStorage.setItem("onseki-volume", String(state.volume));
  }

  function refreshMix() {
    currentTracks().forEach(tr => {
      const mix = effectiveMix(), muted = mix.solo ? mix.solo !== tr.id : !!mix.muted[tr.id];
      const solo = mix.solo === tr.id;
      const row = $(`.track-row[data-track="${tr.id}"]`), musician = $(`.musician[data-track="${tr.id}"]`);
      row?.classList.toggle("is-muted", muted); row?.classList.toggle("is-solo", solo);
      musician?.classList.toggle("is-muted", muted); musician?.classList.toggle("is-solo", solo);
      row?.querySelector('[data-action="mute"]').classList.toggle("active", !!state.muted[tr.id]);
      row?.querySelector('[data-action="solo"]').classList.toggle("active", solo);
    });
    update();
    if (state.playing && !state.uploaded) { stopAudio(); schedule(); }
  }

  function toggleMute(id) { if (state.uploaded) return; state.arrangement = "full"; if (state.solo) state.solo = null; state.muted[id] = !state.muted[id]; refreshMix(); }
  function toggleSolo(id) { if (state.uploaded) return; state.arrangement = "full"; state.solo = state.solo === id ? null : id; refreshMix(); }

  function setListeningMode(mode) {
    $$(".view-switch button").forEach((button) => {
      const selected = button.dataset.view === mode;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    document.body.dataset.listeningMode = mode;
    $("#band-stage").classList.toggle("overhead", mode === "detail");
  }

  function selectAnalysisProvider() {
    const localAnalyzer = window.__ONSEKI_LOCAL_ANALYZE_AUDIO__ ?? window.__ONSEKI_ANALYZE_AUDIO__;
    return createLocalAnalysisProvider(localAnalyzer)
      ?? (location.port === "8765" ? createLoopbackAnalysisProvider(`${location.origin}/api/analyze`) : null);
  }

  function unavailableReason() {
    const onThisMachine = location.protocol === "file:" || ["localhost", "127.0.0.1"].includes(location.hostname);
    return onThisMachine
      ? "本地分析服务未连接：运行 .analysis-venv/bin/python analysis-runtime/server.py --static-root . ，然后从 http://127.0.0.1:8765 打开本页后重试。"
      : "尚未配置分析服务；不会用示例数据替代你的音频。";
  }

  async function runAnalysis() {
    if (!state.file) return;
    const run = ++state.analysisRun;
    state.analysis = { ...state.analysis, phase: "analyzing", progress: 0, label: "正在建立分析任务…" };
    update();
    const provider = selectAnalysisProvider();
    const result = provider
      ? await analyzeUploadedAudio(state.file, state.duration, provider, ({ progress, label }) => { if (run !== state.analysisRun) return; state.analysis = { ...state.analysis, phase: "analyzing", progress, label }; update(); })
      : { phase: "unavailable", reason: unavailableReason() };
    if (run !== state.analysisRun) return;
    state.analysis = { ...result, reason: result.reason || "" };
    if (result.phase === "analyzed") buildTimeline();
    update();
  }

  function init() {
    buildTimeline(); $("#time-total").textContent = fmt(DURATION); $("#volume").value = String(state.volume); setListeningMode("observe"); update();
    $("#play-btn").addEventListener("click", () => state.playing ? pause() : play());
    $("#back-btn").addEventListener("click", () => seek(state.time - 5));
    $("#forward-btn").addEventListener("click", () => seek(state.time + 5));
    $("#previous-section-btn").addEventListener("click", () => seekSection(-1));
    $("#next-section-btn").addEventListener("click", () => seekSection(1));
    $("#seek").addEventListener("input", e => seek(Number(e.target.value)));
    $("#playback-rate").addEventListener("change", e => setSpeed(e.target.value));
    $("#volume").addEventListener("input", e => setVolume(e.target.value));
    $("#loop-btn").addEventListener("click", e => { state.loop = !state.loop; e.currentTarget.classList.toggle("active", state.loop); });
    $("#arrangement-btn").addEventListener("click", () => { if (state.uploaded) return; state.arrangement = state.arrangement === "full" ? "plain" : "full"; refreshMix(); });
    $("#principle-btn").addEventListener("click", e => {
      const copy = $("#principle-copy"), expanded = copy.hidden;
      copy.hidden = !expanded; e.currentTarget.setAttribute("aria-expanded", String(expanded));
      e.currentTarget.textContent = expanded ? "收起原理" : "了解原理";
    });
    $("#import-btn").addEventListener("click", () => $("#audio-file").click());
    $("#audio-file").addEventListener("change", e => {
      const file = e.target.files[0]; if (!file) return;
      if (state.playing) pause(); state.analysisRun++;
      state.loop = false; state.arrangement = "full"; state.solo = null; state.muted = {};
      state.file = file; state.uploaded = true; state.time = 0;
      state.analysis = { phase: "queued", data: null, reason: "", progress: 0, label: "等待音频元数据…" };
      $$(".track-toggles button, #arrangement-btn").forEach(button => { button.disabled = true; });
      $(".stage-title h1").innerHTML = `${file.name.replace(/\.[^.]+$/, "")}<em>LOCAL AUDIO</em>`;

      // Wire handlers BEFORE setting src to avoid a race with loadedmetadata.
      if (upload.src.startsWith("blob:")) URL.revokeObjectURL(upload.src);
      const blobUrl = URL.createObjectURL(file);
      upload.onloadedmetadata = () => {
        if (!Number.isFinite(upload.duration) || upload.duration <= 0) {
          state.analysis = { phase: "failed", reason: `浏览器无法解码 ${file.name}；请尝试 WAV 或 MP3。`, progress: 1, label: "解码失败" };
          update(); return;
        }
        state.duration = upload.duration; $("#time-total").textContent = fmt(state.duration); buildTimeline(); update();
        runAnalysis();
      };
      upload.onerror = () => {
        if (upload.error) console.error("ONSEKI audio load error:", upload.error.code, upload.error.message);
        state.analysis = { phase: "unavailable", reason: `无法加载 ${file.name}：${upload.error?.message || "未知解码错误"}。请尝试 WAV 或 MP3 格式。`, progress: 1, label: "加载失败" };
        update();
      };
      upload.src = blobUrl;
      update();
    });
    $("#analysis-retry-btn").addEventListener("click", runAnalysis);
    $("#analysis-status-retry").addEventListener("click", runAnalysis);
    $$(".view-switch button").forEach((btn) => btn.addEventListener("click", () => setListeningMode(btn.dataset.view)));
    $$(".musician").forEach((musician) => {
      musician.addEventListener("click", () => toggleMute(musician.dataset.track));
      musician.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          toggleMute(musician.dataset.track);
        }
      });
    });
    document.addEventListener("keydown", e => {
      if (["INPUT", "SELECT", "TEXTAREA"].includes(e.target.tagName)) return;
      if (e.key === "Escape" && document.body.dataset.listeningMode === "immerse") { setListeningMode("observe"); return; }
      if (e.code === "Space") { e.preventDefault(); state.playing ? pause() : play(); }
      if (e.code === "ArrowLeft") seek(state.time - 5);
      if (e.code === "ArrowRight") seek(state.time + 5);
    });
    if (location.protocol === "file:" || location.hostname === "localhost" || location.hostname === "127.0.0.1") {
      window.__ONSEKI_TEST__ = {
        deriveViewState,
        getViewState: () => viewStateAt(),
        seek,
        toggleMute,
        toggleSolo,
        seekSection,
        setSpeed,
        setVolume,
        pause,
        isPlaying: () => state.playing,
        getPlayback: () => ({ time: state.time, speed: state.speed, volume: state.volume, analysisPhase: state.analysis.phase })
      };
    }
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", init) : init();
})();
