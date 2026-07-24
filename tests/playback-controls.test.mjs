import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const app = await readFile(new URL("../app.js", import.meta.url), "utf8");
const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("player exposes chapter, speed and volume controls without inventing imported chapters", () => {
  for (const id of ["previous-section-btn", "next-section-btn", "playback-rate", "volume"]) {
    assert.match(html, new RegExp(`id=\\"${id}\\"`));
  }
  assert.match(app, /function seekSection\(direction\)/);
  assert.match(app, /state\.uploaded \|\| view\.time <= 0/);
  assert.match(app, /function setSpeed\(speed\)/);
  assert.match(app, /upload\.playbackRate = state\.speed/);
  assert.match(app, /function setVolume\(volume\)/);
  assert.match(app, /master\.gain\.value = state\.volume/);
});
