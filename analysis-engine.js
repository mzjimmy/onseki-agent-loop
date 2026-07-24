const REQUIRED_SECTION_FIELDS = [
  "start", "end", "name", "chord", "register", "density", "lead", "principle",
  "moment", "trace", "next", "cue", "note"
];

const REQUIRED_TRACK_FIELDS = ["id", "name", "cn", "icon", "color", "clips"];

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidClip(clip, duration) {
  return Array.isArray(clip)
    && clip.length === 3
    && Number.isFinite(clip[0])
    && Number.isFinite(clip[1])
    && clip[0] >= 0
    && clip[1] > 0
    && clip[0] + clip[1] <= duration
    && isNonEmptyString(clip[2]);
}

/**
 * Accept only a complete, provenance-bearing analysis result. Rejecting partial
 * or unlabeled data here keeps the UI from turning model guesses into facts.
 */
export function normalizeAnalysisResult(payload, duration) {
  if (!payload || payload.source?.kind !== "ai" || !Number.isFinite(payload.source.confidence)) return null;
  if (payload.source.confidence < 0 || payload.source.confidence > 1) return null;
  if (!Array.isArray(payload.sections) || !Array.isArray(payload.tracks) || !payload.sections.length || !payload.tracks.length) return null;

  const sections = payload.sections.map((section) => ({ ...section }));
  const tracks = payload.tracks.map((track) => ({ ...track, clips: [...track.clips] }));
  const validSections = sections.every((section, index) => {
    const previousEnd = index === 0 ? 0 : sections[index - 1].end;
    return REQUIRED_SECTION_FIELDS.every((field) => field in section)
      && Number.isFinite(section.start)
      && Number.isFinite(section.end)
      && section.start === previousEnd
      && section.end > section.start
      && section.end <= duration
      && isNonEmptyString(section.name)
      && isNonEmptyString(section.chord)
      && isNonEmptyString(section.register)
      && isNonEmptyString(section.lead)
      && isNonEmptyString(section.principle)
      && isNonEmptyString(section.moment)
      && isNonEmptyString(section.trace)
      && isNonEmptyString(section.next)
      && isNonEmptyString(section.cue)
      && isNonEmptyString(section.note)
      && Number.isFinite(section.density)
      && section.density >= 0
      && section.density <= 100;
  }) && sections.at(-1).end >= duration - 0.1;
  const seenTrackIds = new Set();
  const validTracks = tracks.every((track) => {
    const unique = isNonEmptyString(track.id) && !seenTrackIds.has(track.id);
    seenTrackIds.add(track.id);
    return unique
      && REQUIRED_TRACK_FIELDS.every((field) => field in track)
      && ["name", "cn", "icon", "color"].every((field) => isNonEmptyString(track[field]))
      && Array.isArray(track.clips)
      && track.clips.every((clip) => isValidClip(clip, duration));
  });

  return validSections && validTracks
    ? { source: { kind: "ai", confidence: payload.source.confidence }, sections, tracks }
    : null;
}

/**
 * The production provider is deliberately absent in this static demo. A host
 * application may supply one that uploads audio to its own analysis service.
 */
export function createLocalAnalysisProvider(analyzeLocally) {
  if (typeof analyzeLocally !== "function") return null;
  return async ({ file, duration, reportProgress }) => {
    reportProgress({ progress: .08, label: "正在准备本地分析…" });
    const result = await analyzeLocally({ file, duration, reportProgress });
    reportProgress({ progress: .92, label: "正在校验分析结果…" });
    return result;
  };
}

export function createLoopbackAnalysisProvider(endpoint) {
  if (typeof endpoint !== "string") return null;
  let url;
  try { url = new URL(endpoint); } catch (_) { return null; }
  if (!["127.0.0.1", "localhost"].includes(url.hostname)) return null;
  return async ({ file, duration, reportProgress }) => {
    reportProgress({ progress: .12, label: "正在发送到本机分析服务…" });
    let response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: { "content-type": file.type || "application/octet-stream", "x-onseki-filename": file.name || "audio.wav", "x-onseki-duration": String(duration) },
        body: file
      });
    } catch (_) {
      const error = new Error("本地分析服务未启动或无法连接。");
      error.code = "LOCAL_UNAVAILABLE";
      throw error;
    }
    if (!response.ok) {
      const error = new Error(`本地分析服务返回 ${response.status}。`);
      error.code = response.status === 503 ? "LOCAL_UNAVAILABLE" : "LOCAL_ANALYSIS_FAILED";
      throw error;
    }
    reportProgress({ progress: .88, label: "正在接收本地分析结果…" });
    return response.json();
  };
}

export async function analyzeUploadedAudio(file, duration, provider, onProgress = () => {}) {
  if (typeof provider !== "function") {
    return { phase: "unavailable", reason: "尚未配置分析服务；不会用示例数据替代你的音频。" };
  }
  try {
    const reportProgress = ({ progress, label }) => {
      if (Number.isFinite(progress) && progress >= 0 && progress <= 1 && isNonEmptyString(label)) onProgress({ progress, label });
    };
    reportProgress({ progress: .02, label: "正在建立分析任务…" });
    const result = normalizeAnalysisResult(await provider({ file, duration, reportProgress }), duration);
    return result
      ? { phase: "analyzed", data: result, progress: 1, label: "分析完成" }
      : { phase: "failed", reason: "分析结果不完整或缺少置信度，未显示为事实。" };
  } catch (error) {
    if (error?.code === "LOCAL_UNAVAILABLE") return { phase: "unavailable", reason: error.message };
    return { phase: "failed", reason: "分析服务没有返回可验证的结果；你的音频仍可正常播放。" };
  }
}
