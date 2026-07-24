#!/usr/bin/env python3
"""Loopback-only ONSEKI analysis server.

Run: .analysis-venv/bin/python analysis-runtime/server.py --static-root .
Then open http://127.0.0.1:8765. Uploaded audio is written to a temporary file
only for Basic Pitch inference and removed before the response is returned.
"""

from __future__ import annotations

import argparse
import json
import traceback
import tempfile
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

from analyze import analyze

MAX_BYTES = 64 * 1024 * 1024


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, directory: str | None = None, **kwargs):
        super().__init__(*args, directory=directory, **kwargs)

    def send_json(self, status: HTTPStatus, body: dict) -> None:
        payload = json.dumps(body, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def do_GET(self) -> None:
        if urlparse(self.path).path == "/api/health":
            self.send_json(HTTPStatus.OK, {"status": "local-only", "audio_retention": "temporary"})
            return
        super().do_GET()

    def do_POST(self) -> None:
        if urlparse(self.path).path != "/api/analyze":
            self.send_error(HTTPStatus.NOT_FOUND)
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            length = 0
        if not 0 < length <= MAX_BYTES:
            self.send_json(HTTPStatus.REQUEST_ENTITY_TOO_LARGE, {"error": "audio must be between 1 byte and 64 MB"})
            return
        suffix = Path(self.headers.get("X-Onseki-Filename", "audio.wav")).suffix or ".wav"
        try:
            target_duration = float(self.headers.get("X-Onseki-Duration", ""))
        except ValueError:
            target_duration = None
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=True) as audio:
            audio.write(self.rfile.read(length))
            audio.flush()
            try:
                self.send_json(HTTPStatus.OK, analyze(Path(audio.name), target_duration=target_duration))
            except Exception as error:
                traceback.print_exc()
                self.send_json(HTTPStatus.SERVICE_UNAVAILABLE, {"error": f"local analysis failed: {type(error).__name__}: {error}"})


def main() -> None:
    parser = argparse.ArgumentParser(description="Run ONSEKI analysis on loopback only.")
    parser.add_argument("--host", default="127.0.0.1", choices=["127.0.0.1"], help="loopback binding is intentional")
    parser.add_argument("--port", default=8765, type=int)
    parser.add_argument("--static-root", default=".")
    args = parser.parse_args()
    root = str(Path(args.static_root).resolve())
    server = ThreadingHTTPServer((args.host, args.port), lambda *a, **kw: Handler(*a, directory=root, **kw))
    print(f"ONSEKI local analysis: http://{args.host}:{args.port}")
    server.serve_forever()


if __name__ == "__main__":
    main()
