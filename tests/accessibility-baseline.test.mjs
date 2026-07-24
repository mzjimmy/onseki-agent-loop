import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [html, css, app] = await Promise.all([
  readFile(new URL("../index.html", import.meta.url), "utf8"),
  readFile(new URL("../styles.css", import.meta.url), "utf8"),
  readFile(new URL("../app.js", import.meta.url), "utf8")
]);

test("accessibility baseline has focus, live status and textual track state", () => {
  assert.match(css, /button:focus-visible,input:focus-visible/);
  assert.match(html, /id="player-status" role="status" aria-live="polite"/);
  assert.match(app, /#player-status/);
  assert.match(app, /setAttribute\("aria-label", `\$\{tr\.cn\}/);
  assert.match(app, /"Space"/);
  assert.match(app, /"ArrowLeft"/);
  assert.match(app, /"ArrowRight"/);
  assert.match(css, /prefers-reduced-motion:reduce/);
});
