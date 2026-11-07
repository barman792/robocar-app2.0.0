#!/usr/bin/env python3
"""Copies the control page into the app. The page is built in the ESP32 project (ui_source/build.py).
   usage:  python3 tools/sync_ui.py path/to/RoboCar_ESP32/index.html"""
import sys, pathlib, shutil
src = pathlib.Path(sys.argv[1])
dst = pathlib.Path(__file__).resolve().parent.parent / "app/src/main/assets/index.html"
shutil.copyfile(src, dst)
print("copied", src, "->", dst, dst.stat().st_size, "bytes")
