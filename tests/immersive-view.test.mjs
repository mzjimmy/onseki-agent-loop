import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [app, styles] = await Promise.all([
  readFile(new URL("../app.js", import.meta.url), "utf8"),
  readFile(new URL("../styles.css", import.meta.url), "utf8")
]);

test("immersive mode isolates the stage while preserving a keyboard exit", () => {
  assert.match(styles, /body\[data-listening-mode="immerse"\] \.studio-header.*\.stage-title.*\.analysis-panel.*\.transport.*\.daw.*footer\{display:none\}/);
  assert.match(styles, /body\[data-listening-mode="immerse"\] \.band-stage\{height:100vh/);
  assert.match(app, /e\.key === "Escape" && document\.body\.dataset\.listeningMode === "immerse"/);
  assert.match(app, /setListeningMode\("observe"\)/);
});

test("section state controls a dedicated immersive stage wash", () => {
  for (const section of ["引子", "发展", "展开", "余韵"]) assert.match(styles, new RegExp(`html\\[data-section="${section}"\\]`));
  assert.match(styles, /\.band-stage:before/);
  assert.match(styles, /transition:background 1\.1s ease/);
});
