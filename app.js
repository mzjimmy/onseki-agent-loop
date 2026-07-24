import { DURATION, TRACKS as tracks, SECTIONS as sections, deriveViewState } from "./player-state.mjs";

(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const state = { time: 0, duration: DURATION, playing: false, loop: false, muted: {}, solo: null, arrangement: "full", raf: 0, last: 0, uploaded: false, nextSchedule: 0 };
  let audioCtx = null, master = null, timers = [], upload = $("#uploaded-audio");

  function waveBars(seed) {
    let html = "";
    for (let i = 0; i < 54; i++) {
      const h = 18 + ((i * 17 + seed * 23) % 76);
      html += `<i style="--h:${h}%"></i>`;
    }
    return html;
  }

  function buildTimeline() {
    $("#ruler").innerHTML = Array.from({ length: 9 }, (_, i) => `<span>${String(i * 6).padStart(2, "0")}</span>`).join("");
    const stack = $("#track-stack");
    tracks.forEach((track, ti) => {
      const row = document.createElement("div");
      row.className = "track-row";
      row.setAttribute("role", "group");
      row.dataset.track = track.id;
      row.style.setProperty("--tc", track.color);
      row.innerHTML = `<div class="track-info">
        <span class="track-image" aria-hidden="true">${track.icon}</span>
        <span class="track-name"><b>${track.name}</b><span>${track.cn}</span></span>
        <span class="track-toggles"><button type="button" data-action="mute" aria-label="静音 ${track.cn}">M</button><button type="button" data-action="solo" aria-label="独奏 ${track.cn}">S</button></span>
      </div><div class="track-lane">${track.clips.map((c, ci) => `<div class="clip" data-label="${c[2]}" style="left:${c[0] / DURATION * 100}%;width:${c[1] / DURATION * 100}%"><span class="wave">${waveBars(ti * 5 + ci)}</span></div>`).join("")}</div>`;
      row.querySelector('[data-action="mute"]').addEventListener("click", () => toggleMute(track.id));
      row.querySelector('[data-action="solo"]').addEventListener("click", () => toggleSolo(track.id));
      stack.appendChild(row);
    });
  }

  function ensureAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    master = audioCtx.createGain();
    master.gain.value = .45;
    master.connect(audioCtx.destination);
  }

  function effectiveMix() {
    return state.arrangement === "plain" ? { ...state, solo: "keys" } : state;
  }
  function viewStateAt(time = state.time) { return deriveViewState(time, effectiveMix(), state.duration); }
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
    const now = audioCtx.currentTime, start = Math.max(state.time, state.nextSchedule), horizon = Math.min(DURATION, state.time + 2.2);
    for (let t = start; t < horizon; t += .5) {
      const when = now + (t - state.time), step = Math.floor(t * 2), chord = viewStateAt(t).section;
      const roots = chord.name === "发展" ? [58, 62, 65, 69] : chord.name === "展开" ? [55, 58, 62, 69] : [50, 53, 57, 64];
      tone(440 * 2 ** ((roots[step % roots.length] - 69) / 12), when, .34, "triangle", .075, "keys");
      if (step % 2 === 0) tone(440 * 2 ** ((roots[0] - 12 - 69) / 12), when, .42, "sine", .12, "bass");
      if (step % 4 === 0) tone(440 * 2 ** ((roots[1] - 69) / 12), when, 1.65, "sawtooth", .035, "strings");
      if (step % 2 === 0 && active("drums", t)) {
        const o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.type = "sine"; o.frequency.setValueAtTime(step % 4 === 0 ? 110 : 190, when); o.frequency.exponentialRampToValueAtTime(48, when + .12);
        g.gain.setValueAtTime(.08, when); g.gain.exponentialRampToValueAtTime(.0001, when + .13); o.connect(g); g.connect(master); o.start(when); o.stop(when + .14); timers.push(o);
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
    if (state.uploaded) { upload.currentTime = state.time; upload.play(); } else { ensureAudio(); audioCtx.resume(); schedule(); }
    state.raf = requestAnimationFrame(tick);
  }

  function pause() {
    state.playing = false; cancelAnimationFrame(state.raf); stopAudio(); document.body.classList.remove("is-playing");
    $("#play-btn span").textContent = "▶"; $("#play-btn").setAttribute("aria-label", "播放");
  }

  function tick(now) {
    if (!state.playing) return;
    if (state.uploaded) state.time = upload.currentTime; else state.time += (now - state.last) / 1000;
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
    const sec = view.section;
    document.documentElement.dataset.section = sec.name;
    $("#section-name").textContent = state.uploaded ? "未分析" : sec.name; $("#moment-copy").textContent = state.uploaded ? "正在播放你导入的音乐；分析结果尚未生成。" : sec.moment; $("#chord").textContent = state.uploaded ? "—" : sec.chord;
    $("#register").textContent = state.uploaded ? "—" : sec.register; $("#density").textContent = state.uploaded ? "—" : `${sec.density}%`; $("#density-meter").style.width = state.uploaded ? "0%" : `${sec.density}%`;
    $("#trace-copy").textContent = state.uploaded ? "系统不会把预设编排、乐器或和声结论套用到你的单文件音频。" : sec.trace; $("#next-time").textContent = state.uploaded ? "—" : sec.next; $("#next-copy").textContent = state.uploaded ? "可继续播放；上传分析将在后续版本中提供。" : sec.cue;
    $("#conductor-note span").textContent = state.uploaded ? "单文件音频正在播放，等待分析。" : sec.note;
    $("#player-status").textContent = `${state.playing ? "播放" : "暂停"} · ${state.uploaded ? "未分析音频" : sec.name}`;
    $("#lead-instrument").textContent = state.uploaded ? "未知" : sec.lead;
    $("#instrument-confidence").textContent = state.uploaded ? "尚未分析" : "预设数据 / 高";
    $("#principle-copy").textContent = state.uploaded ? "这项解释只适用于内置示例，不适用于尚未分析的导入音频。" : sec.principle;
    $("#principle-btn").disabled = state.uploaded;
    $("#unanalysed-notice").hidden = !state.uploaded;
    $("#analysis-source").textContent = state.uploaded ? "用户音频 · 尚未分析" : "示例预设 · 编曲数据";
    $("#honesty-note").textContent = state.uploaded ? "这首用户音频目前只同步播放时间；乐器、和弦与章节不会被伪装成检测结果。" : "示例曲目使用预设编排数据；它不是原作分轨。";
    $("#arrangement-btn").textContent = state.arrangement === "plain" ? "普通编排" : "完整编排";
    $("#arrangement-btn").classList.toggle("active", state.arrangement === "plain");
    tracks.forEach(tr => {
      const trackView = state.uploaded ? { muted: false, active: false } : view.tracks[tr.id], on = trackView.active;
      $(`.musician[data-track="${tr.id}"]`).classList.toggle("is-active", on);
      $(`.track-row[data-track="${tr.id}"]`).classList.toggle("is-live", on);
      $(`.musician[data-track="${tr.id}"]`).dataset.state = trackView.muted ? "muted" : on ? "active" : "rest";
      $(`.track-row[data-track="${tr.id}"]`).dataset.state = trackView.muted ? "muted" : on ? "active" : "rest";
      $(`.track-row[data-track="${tr.id}"]`).setAttribute("aria-label", `${tr.cn}：${trackView.muted ? "静音" : on ? "正在发声" : "留白"}`);
    });
  }

  function seek(t) {
    const was = state.playing; if (was) pause();
    state.time = Math.max(0, Math.min(state.duration, t)); if (state.uploaded) upload.currentTime = state.time; update();
    if (was) play();
  }

  function refreshMix() {
    tracks.forEach(tr => {
      const mix = effectiveMix(), muted = mix.solo ? mix.solo !== tr.id : !!mix.muted[tr.id];
      const solo = mix.solo === tr.id;
      const row = $(`.track-row[data-track="${tr.id}"]`), musician = $(`.musician[data-track="${tr.id}"]`);
      row.classList.toggle("is-muted", muted); row.classList.toggle("is-solo", solo);
      musician.classList.toggle("is-muted", muted); musician.classList.toggle("is-solo", solo);
      row.querySelector('[data-action="mute"]').classList.toggle("active", !!state.muted[tr.id]);
      row.querySelector('[data-action="solo"]').classList.toggle("active", solo);
    });
    update();
    if (state.playing && !state.uploaded) { stopAudio(); schedule(); }
  }

  function toggleMute(id) { if (state.uploaded) return; state.arrangement = "full"; if (state.solo) state.solo = null; state.muted[id] = !state.muted[id]; refreshMix(); }
  function toggleSolo(id) { if (state.uploaded) return; state.arrangement = "full"; state.solo = state.solo === id ? null : id; refreshMix(); }

  function init() {
    buildTimeline(); $("#time-total").textContent = fmt(DURATION); update();
    $("#play-btn").addEventListener("click", () => state.playing ? pause() : play());
    $("#back-btn").addEventListener("click", () => seek(state.time - 5));
    $("#forward-btn").addEventListener("click", () => seek(state.time + 5));
    $("#seek").addEventListener("input", e => seek(Number(e.target.value)));
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
      if (state.playing) pause(); upload.src = URL.createObjectURL(file); state.uploaded = true; state.time = 0;
      state.loop = false; state.arrangement = "full"; state.solo = null; state.muted = {};
      $$(".track-toggles button, #arrangement-btn").forEach(button => { button.disabled = true; });
      upload.onloadedmetadata = () => { state.duration = upload.duration; $("#time-total").textContent = fmt(state.duration); update(); };
      $(".stage-title h1").innerHTML = `${file.name.replace(/\.[^.]+$/, "")}<em>LOCAL AUDIO</em>`; update();
    });
    $$(".view-switch button").forEach(btn => btn.addEventListener("click", () => {
      $$(".view-switch button").forEach(b => b.classList.toggle("active", b === btn));
      document.body.dataset.listeningMode = btn.dataset.view;
      $("#band-stage").classList.toggle("overhead", btn.dataset.view === "detail");
    }));
    document.addEventListener("keydown", e => {
      if (e.target.tagName === "INPUT") return;
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
        pause,
        isPlaying: () => state.playing
      };
    }
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", init) : init();
})();
