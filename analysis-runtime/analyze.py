#!/usr/bin/env python3
"""Offline, provenance-first audio analysis for ONSEKI.

The command reads one local file and emits a JSON object compatible with the
browser analysis contract. It never uploads input audio or writes it to cache.
Progress is emitted to stderr as `ONSEKI_PROGRESS <json>`; stdout is reserved
for the final analysis result.
"""

from __future__ import annotations

import argparse
import contextlib
import json
import sys
from pathlib import Path

import librosa
import numpy as np
from basic_pitch import ICASSP_2022_MODEL_PATH
from basic_pitch.inference import predict

PITCH_CLASSES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"]
TRIADS = {"major": (0, 4, 7), "minor": (0, 3, 7)}


def progress(value: float, label: str) -> None:
    print(f"ONSEKI_PROGRESS {json.dumps({'progress': value, 'label': label}, ensure_ascii=False)}", file=sys.stderr, flush=True)


def confidence(top: float, total: float) -> float:
    return float(max(0.0, min(1.0, top / total))) if total > 0 else 0.0


def chord_for(chroma: np.ndarray) -> tuple[str, float]:
    weights = chroma.mean(axis=1)
    total = float(weights.sum())
    if total <= 0:
        return "无法可靠判断", 0.0
    best = ("无法可靠判断", 0.0)
    for root, root_name in enumerate(PITCH_CLASSES):
        for quality, offsets in TRIADS.items():
            score = float(sum(weights[(root + offset) % 12] for offset in offsets))
            if score > best[1]:
                suffix = "" if quality == "major" else "m"
                best = (f"{root_name}{suffix}", score)
    return best[0], confidence(best[1], total)


def boundaries(chroma: np.ndarray, duration: float, sr: int, hop_length: int) -> list[float]:
    frames = chroma.shape[1]
    if frames < 2 or duration < 4:
        return [0.0, duration]
    target = min(4, max(1, round(duration / 12)))
    try:
        segment_frames = librosa.segment.agglomerative(chroma, k=target)
        points = [float(librosa.frames_to_time(frame, sr=sr, hop_length=hop_length)) for frame in segment_frames]
    except Exception:
        points = []
    points = sorted({0.0, *(point for point in points if 1.5 < point < duration - 1.5), duration})
    return points if len(points) >= 2 else [0.0, duration]


def clips_from_notes(note_events: list[tuple], duration: float) -> list[list[float | str]]:
    clips: list[list[float | str]] = []
    for event in note_events:
        start = max(0.0, float(event[0]))
        end = min(float(event[1]), duration)
        length = end - start
        if length <= 0:
            continue
        start_r, length_r = round(start, 3), round(length, 3)
        if length_r <= 0 or start_r + length_r > duration + 1e-9:
            length_r = round(max(0.0, min(length, duration - start_r)), 3)
        if length_r > 0:
            clips.append([start_r, length_r, "PITCH ACTIVITY"])
    return clips[:240]


def analyze(audio_path: Path, target_duration: float | None = None) -> dict:
    progress(0.08, "正在读取本地音频…")
    audio, sr = librosa.load(audio_path, sr=22050, mono=True)
    measured = max(float(librosa.get_duration(y=audio, sr=sr)), 0.01)
    duration = measured if not (isinstance(target_duration, (int, float)) and target_duration > 0) else float(target_duration)
    progress(0.28, "正在检测段落结构…")
    hop_length = 512
    chroma = librosa.feature.chroma_cqt(y=audio, sr=sr, hop_length=hop_length)
    rms = librosa.feature.rms(y=audio, hop_length=hop_length)[0]
    progress(0.50, "正在进行本地音高转录…")
    # Basic Pitch writes its own informational line to stdout. Keep stdout
    # reserved for the final JSON contract and send that line to stderr.
    with contextlib.redirect_stdout(sys.stderr):
        _, _, note_events = predict(audio_path=str(audio_path), model_or_model_path=ICASSP_2022_MODEL_PATH)
    progress(0.78, "正在生成带置信度的结果…")

    points = boundaries(chroma, duration, sr, hop_length)
    sections = []
    confidences = []
    for index, (start, end) in enumerate(zip(points, points[1:]), start=1):
        start_frame = librosa.time_to_frames(start, sr=sr, hop_length=hop_length)
        end_frame = max(start_frame + 1, librosa.time_to_frames(end, sr=sr, hop_length=hop_length))
        chord, chord_confidence = chord_for(chroma[:, start_frame:end_frame])
        confidences.append(chord_confidence)
        local_rms = rms[start_frame:end_frame]
        density = int(np.clip((float(local_rms.mean()) if local_rms.size else 0) * 450, 0, 100))
        readable_chord = chord if chord_confidence >= 0.60 else "无法可靠判断"
        sections.append({
            "start": round(start, 3), "end": round(end, 3), "name": f"段落 {index}",
            "chord": readable_chord, "register": "未可靠识别", "density": density,
            "lead": "未可靠识别（乐器模型未接入）",
            "principle": "这是本地音频特征推测；低置信度结论不会被显示为确定事实。",
            "moment": "正在根据音色、能量与音高变化划分这一段。",
            "trace": f"和弦估计置信度 {round(chord_confidence * 100)}%；它不是原始乐谱或分轨。",
            "next": "END" if index == len(points) - 1 else f"{int(end // 60):02d}:{int(end % 60):02d}",
            "cue": "下一段将由本地结构变化重新评估。",
            "note": "乐器身份仍未知；音高转录不等于真实分轨。"
        })

    if sections:
        sections[0]["start"] = 0.0
        sections[-1]["end"] = round(duration, 3)
        for index in range(1, len(sections)):
            sections[index]["start"] = sections[index - 1]["end"]

    source_confidence = round(float(np.mean(confidences)) if confidences else 0.0, 2)
    progress(0.95, "正在校验本地分析结果…")
    return {
        "source": {"kind": "ai", "confidence": source_confidence},
        "sections": sections,
        "tracks": [{
            "id": "pitch-events", "name": "PITCH EVENTS", "cn": "音高事件（非分轨）",
            "icon": "♮", "color": "#55ccd6", "clips": clips_from_notes(note_events, duration)
        }]
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Analyze a local audio file without uploading it.")
    parser.add_argument("audio", type=Path)
    args = parser.parse_args()
    if not args.audio.is_file():
        raise SystemExit(f"audio file not found: {args.audio}")
    print(json.dumps(analyze(args.audio), ensure_ascii=False))


if __name__ == "__main__":
    main()
