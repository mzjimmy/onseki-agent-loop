import assert from "node:assert/strict";
import test from "node:test";
import { deriveViewState } from "../player-state.mjs";

test("chapter boundaries derive from the shared playback clock", () => {
  assert.equal(deriveViewState(0).section.name, "引子");
  assert.equal(deriveViewState(12).section.name, "发展");
  assert.equal(deriveViewState(22).section.name, "展开");
  assert.equal(deriveViewState(36).section.name, "余韵");
});

test("mute and solo are reflected in the same track snapshot", () => {
  const muted = deriveViewState(13, { muted: { strings: true } });
  assert.equal(muted.tracks.keys.active, true);
  assert.equal(muted.tracks.strings.scheduled, true);
  assert.equal(muted.tracks.strings.muted, true);
  assert.equal(muted.tracks.strings.active, false);

  const solo = deriveViewState(23, { solo: "bass" });
  assert.equal(solo.tracks.bass.active, true);
  assert.equal(solo.tracks.keys.muted, true);
  assert.equal(solo.tracks.strings.muted, true);
  assert.equal(solo.tracks.drums.muted, true);
});
