export const DURATION = 48;

export const TRACKS = [
  { id: "keys", name: "FELT PIANO", cn: "毛毡钢琴", icon: "♮", color: "#f3ad44", clips: [[0, 12, "MOTIF A"], [12, 16, "BROKEN CHORDS"], [28, 12, "MOTIF A′"], [40, 8, "CODA"]] },
  { id: "strings", name: "CELLO + STRINGS", cn: "大提琴 / 弦乐", icon: "♩", color: "#55ccd6", clips: [[10, 10, "COUNTER LINE"], [20, 16, "SUSTAIN / SWELL"], [36, 8, "DESCENT"]] },
  { id: "bass", name: "ELECTRIC BASS", cn: "电贝斯", icon: "♬", color: "#b9f13f", clips: [[16, 16, "ROOT PULSE"], [32, 12, "WALK DOWN"]] },
  { id: "drums", name: "BRUSH DRUMS", cn: "鼓刷 / 打击乐", icon: "◉", color: "#ef6f55", clips: [[22, 14, "BRUSH GROOVE"], [36, 8, "HALF TIME"]] }
];

export const SECTIONS = [
  { start: 0, end: 12, name: "引子", chord: "Dm(add9)", register: "中低音区", density: 24, lead: "毛毡钢琴", principle: "悬置音：暂时不落在最稳定的音上，让句子像还在呼吸。", moment: "一个未说完的句子，停在空气里。", trace: "旋律没有急着落到根音，而是停在九度音上。悬置不是装饰，而是整首曲子的第一口呼吸。", next: "00:12", cue: "大提琴进入，与钢琴形成反向运动", note: "钢琴先给出动机，其他声部暂时留白。" },
  { start: 12, end: 22, name: "发展", chord: "Bbmaj7 / F", register: "中音区展开", density: 48, lead: "钢琴 / 大提琴", principle: "反向运动：两条旋律向相反方向移动，空间会自然拉开。", moment: "另一条线从背后出现，空间开始有了纵深。", trace: "大提琴不复制旋律，而以更长的时值逆向下行；两个声部的呼吸不同，却在和声节点相遇。", next: "00:22", cue: "低音与鼓刷建立脉搏", note: "注意大提琴：它不是伴奏，而是与旋律对话的第二叙述者。" },
  { start: 22, end: 36, name: "展开", chord: "Gm9 → A7sus4", register: "全音域", density: 82, lead: "全乐队", principle: "密度不是音量：声部在不同拍点交错，会让音乐变厚却不拥挤。", moment: "节奏终于落地，但没有破坏原来的寂静。", trace: "贝斯只强调结构性重拍，鼓刷填补拍间空气。密度增加来自声部交错，而不是每件乐器都演奏更多。", next: "00:36", cue: "鼓组减半，弦乐向下收束", note: "高潮的秘密不是更响，而是四条时间线终于同时相遇。" },
  { start: 36, end: 48.1, name: "余韵", chord: "Dm6 / A", register: "向低音区回落", density: 35, lead: "钢琴 / 弦乐", principle: "减法编排：让声部逐个离开，听者会用记忆补全剩下的空间。", moment: "乐队逐个离场，只留下无法被解释的余温。", trace: "结尾没有完整复现主题，只保留它的节奏轮廓。熟悉感来自记忆补全，也让作品保持开放。", next: "END", cue: "主题留下一个没有句号的尾音", note: "减法开始：鼓、贝斯、弦乐依次把空间还给钢琴。" }
];

export function clampTime(time, duration = DURATION) {
  return Math.max(0, Math.min(duration, Number.isFinite(time) ? time : 0));
}

export const DEMO_ANALYSIS = Object.freeze({ source: { kind: "preset", confidence: 1 }, sections: SECTIONS, tracks: TRACKS });

export function sectionAt(time, duration = DURATION, analysis = DEMO_ANALYSIS) {
  const clamped = clampTime(time, duration);
  return analysis.sections.find((section) => clamped >= section.start && clamped < section.end) ?? analysis.sections.at(-1);
}

export function deriveViewState(time, mix = {}, duration = DURATION, analysis = DEMO_ANALYSIS) {
  const playbackTime = clampTime(time, duration);
  const section = sectionAt(playbackTime, duration, analysis);
  const solo = mix.solo ?? null;
  const muted = mix.muted ?? {};
  const tracks = Object.fromEntries(analysis.tracks.map((track) => {
    const scheduled = track.clips.some(([start, duration]) => playbackTime >= start && playbackTime < start + duration);
    const isMuted = solo ? solo !== track.id : Boolean(muted[track.id]);
    return [track.id, {
      id: track.id,
      scheduled,
      muted: isMuted,
      solo: solo === track.id,
      active: scheduled && !isMuted
    }];
  }));

  return { time: playbackTime, section, tracks };
}
