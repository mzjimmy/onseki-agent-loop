import test from "node:test";
import assert from "node:assert/strict";
import { analyzeUploadedAudio, createLocalAnalysisProvider, createLoopbackAnalysisProvider, normalizeAnalysisResult } from "../analysis-engine.js";

const duration = 10;
const payload = {
  source: { kind: "ai", confidence: .78 },
  sections: [{ start: 0, end: 10, name: "段落", chord: "Dm", register: "中音区", density: 52, lead: "钢琴", principle: "原理", moment: "此刻", trace: "解释", next: "END", cue: "结束", note: "注意" }],
  tracks: [{ id: "keys", name: "PIANO", cn: "钢琴", icon: "♮", color: "#fff", clips: [[0, 10, "PIANO"]] }]
};

test("complete AI analysis is normalized with its provenance", () => {
  const result = normalizeAnalysisResult(payload, duration);
  assert.equal(result.source.confidence, .78);
  assert.equal(result.sections[0].name, "段落");
});

test("partial or unlabelled analysis is rejected rather than rendered", () => {
  assert.equal(normalizeAnalysisResult({ ...payload, source: { kind: "ai" } }, duration), null);
  assert.equal(normalizeAnalysisResult({ ...payload, sections: [] }, duration), null);
});

test("an unavailable provider remains explicitly unavailable", async () => {
  const result = await analyzeUploadedAudio(new Blob(), duration);
  assert.equal(result.phase, "unavailable");
});

test("local providers report progress and receive the file without a network client", async () => {
  const progress = [];
  const provider = createLocalAnalysisProvider(async ({ file, duration: receivedDuration, reportProgress }) => {
    assert.ok(file instanceof Blob);
    assert.equal(receivedDuration, duration);
    reportProgress({ progress: .55, label: "正在识别段落…" });
    return payload;
  });
  const result = await analyzeUploadedAudio(new Blob(), duration, provider, (event) => progress.push(event));
  assert.equal(result.phase, "analyzed");
  assert.deepEqual(progress.map((event) => event.progress), [.02, .08, .55, .92]);
});

test("loopback provider rejects non-local endpoints and maps connection errors to unavailable", async () => {
  assert.equal(createLoopbackAnalysisProvider("https://example.com/analyze"), null);
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error("offline"); };
  const result = await analyzeUploadedAudio(new Blob(), duration, createLoopbackAnalysisProvider("http://127.0.0.1:8765/api/analyze"));
  globalThis.fetch = originalFetch;
  assert.equal(result.phase, "unavailable");
});
