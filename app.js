(function () {
  "use strict";

  const DURATION = 48;
  const tracks = [
    { id: "keys", name: "FELT PIANO", cn: "毛毡钢琴", icon: "♮", color: "#f3ad44", clips: [[0, 12, "MOTIF A"], [12, 16, "BROKEN CHORDS"], [28, 12, "MOTIF A′"], [40, 8, "CODA"]] },
    { id: "strings", name: "CELLO + STRINGS", cn: "大提琴 / 弦乐", icon: "♩", color: "#55ccd6", clips: [[10, 10, "COUNTER LINE"], [20, 16, "SUSTAIN / SWELL"], [36, 8, "DESCENT"]] },
    { id: "bass", name: "ELECTRIC BASS", cn: "电贝斯", icon: "♬", color: "#b9f13f", clips: [[16, 16, "ROOT PULSE"], [32, 12, "WALK DOWN"]] },
    { id: "drums", name: "BRUSH DRUMS", cn: "鼓刷 / 打击乐", icon: "◉", color: "#ef6f55", clips: [[22, 14, "BRUSH GROOVE"], [36, 8, "HALF TIME"]] }
  ];
  const sections = [
    { start: 0, end: 12, name: "引子", chord: "Dm(add9)", register: "中低音区", density: 24, moment: "一个未说完的句子，停在空气里。", trace: "旋律没有急着落到根音，而是停在九度音上。悬置不是装饰，而是整首曲子的第一口呼吸。", next: "00:12", cue: "大提琴进入，与钢琴形成反向运动", note: "钢琴先给出动机，其他声部暂时留白。" },
    { start: 12, end: 22, name: "发展", chord: "Bbmaj7 / F", register: "中音区展开", density: 48, moment: "另一条线从背后出现，空间开始有了纵深。", trace: "大提琴不复制旋律，而以更长的时值逆向下行；两个声部的呼吸不同，却在和声节点相遇。", next: "00:22", cue: "低音与鼓刷建立脉搏", note: "注意大提琴：它不是伴奏，而是与旋律对话的第二叙述者。" },
    { start: 22, end: 36, name: "展开", chord: "Gm9 → A7sus4", register: "全音域", density: 82, moment: "节奏终于落地，但没有破坏原来的寂静。", trace: "贝斯只强调结构性重拍，鼓刷填补拍间空气。密度增加来自声部交错，而不是每件乐器都演奏更多。", next: "00:36", cue: "鼓组减半，弦乐向下收束", note: "高潮的秘密不是更响，而是四条时间线终于同时相遇。" },
    { start: 36, end: 48.1, name: "余韵", chord: "Dm6 / A", register: "向低音区回落", density: 35, moment: "乐队逐个离场，只留下无法被解释的余温。", trace: "结尾没有完整复现主题，只保留它的节奏轮廓。熟悉感来自记忆补全，也让作品保持开放。", next: "END", cue: "主题留下一个没有句号的尾音", note: "减法开始：鼓、贝斯、弦乐依次把空间还给钢琴。" }
  ];

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const state = { time: 0, playing: false, loop: false, muted: {}, solo: null, raf: 0, last: 0, uploaded: false, nextSchedule: 0 };
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

  function active(id, t) {
    const tr = tracks.find(x => x.id === id);
    return tr.clips.some(c => t >= c[0] && t < c[0] + c[1]) && !(state.solo ? state.solo !== id : state.muted[id]);
  }

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
      const when = now + (t - state.time), step = Math.floor(t * 2), chord = sections.find(s => t >= s.start && t < s.end);
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
    if (state.time >= DURATION - .05) state.time = 0;
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
    if (state.time >= DURATION) {
      if (state.loop) { seek(0); play(); } else { state.time = DURATION; pause(); }
    }
    update(); state.raf = requestAnimationFrame(tick);
  }

  function fmt(t) {
    const m = Math.floor(t / 60), s = Math.floor(t % 60), d = Math.floor((t % 1) * 10);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${d}`;
  }

  function sectionAt(t) { return sections.find(s => t >= s.start && t < s.end) || sections[sections.length - 1]; }

  function update() {
    $("#seek").value = state.time; $("#time-current").textContent = fmt(state.time);
    const laneWidth = Math.max(0, $("#track-stack").clientWidth - (innerWidth <= 720 ? 130 : 190));
    $("#playhead").style.transform = `translateX(${laneWidth * state.time / DURATION}px)`;
    $("#playhead span").textContent = fmt(state.time);
    const sec = sectionAt(state.time);
    $("#section-name").textContent = sec.name; $("#moment-copy").textContent = sec.moment; $("#chord").textContent = sec.chord;
    $("#register").textContent = sec.register; $("#density").textContent = `${sec.density}%`; $("#density-meter").style.width = `${sec.density}%`;
    $("#trace-copy").textContent = sec.trace; $("#next-time").textContent = sec.next; $("#next-copy").textContent = sec.cue;
    $("#conductor-note span").textContent = sec.note;
    tracks.forEach(tr => {
      const on = active(tr.id, state.time);
      $(`.musician[data-track="${tr.id}"]`).classList.toggle("is-active", on);
      $(`.track-row[data-track="${tr.id}"]`).classList.toggle("is-live", on);
    });
  }

  function seek(t) {
    const was = state.playing; if (was) pause();
    state.time = Math.max(0, Math.min(DURATION, t)); if (state.uploaded) upload.currentTime = state.time; update();
    if (was) play();
  }

  function refreshMix() {
    tracks.forEach(tr => {
      const muted = state.solo ? state.solo !== tr.id : !!state.muted[tr.id];
      const solo = state.solo === tr.id;
      const row = $(`.track-row[data-track="${tr.id}"]`), musician = $(`.musician[data-track="${tr.id}"]`);
      row.classList.toggle("is-muted", muted); row.classList.toggle("is-solo", solo);
      musician.classList.toggle("is-muted", muted); musician.classList.toggle("is-solo", solo);
      row.querySelector('[data-action="mute"]').classList.toggle("active", !!state.muted[tr.id]);
      row.querySelector('[data-action="solo"]').classList.toggle("active", solo);
    });
    if (state.playing && !state.uploaded) { stopAudio(); schedule(); }
  }

  function toggleMute(id) { if (state.solo) state.solo = null; state.muted[id] = !state.muted[id]; refreshMix(); }
  function toggleSolo(id) { state.solo = state.solo === id ? null : id; refreshMix(); }

  function init() {
    buildTimeline(); $("#time-total").textContent = fmt(DURATION); update();
    $("#play-btn").addEventListener("click", () => state.playing ? pause() : play());
    $("#back-btn").addEventListener("click", () => seek(state.time - 5));
    $("#forward-btn").addEventListener("click", () => seek(state.time + 5));
    $("#seek").addEventListener("input", e => seek(Number(e.target.value)));
    $("#loop-btn").addEventListener("click", e => { state.loop = !state.loop; e.currentTarget.classList.toggle("active", state.loop); });
    $("#import-btn").addEventListener("click", () => $("#audio-file").click());
    $("#audio-file").addEventListener("change", e => {
      const file = e.target.files[0]; if (!file) return;
      if (state.playing) pause(); upload.src = URL.createObjectURL(file); state.uploaded = true; state.time = 0;
      upload.onloadedmetadata = () => { $("#time-total").textContent = fmt(Math.min(upload.duration, DURATION)); };
      $(".stage-title h1").innerHTML = `${file.name.replace(/\.[^.]+$/, "")}<em>LOCAL AUDIO</em>`; update();
    });
    $$(".view-switch button").forEach(btn => btn.addEventListener("click", () => {
      $$(".view-switch button").forEach(b => b.classList.toggle("active", b === btn));
      $("#band-stage").classList.toggle("overhead", btn.dataset.view === "focus");
    }));
    document.addEventListener("keydown", e => {
      if (e.target.tagName === "INPUT") return;
      if (e.code === "Space") { e.preventDefault(); state.playing ? pause() : play(); }
      if (e.code === "ArrowLeft") seek(state.time - 5);
      if (e.code === "ArrowRight") seek(state.time + 5);
    });
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", init) : init();
})();
