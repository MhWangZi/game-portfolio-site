"""Backward-compatible entry point for the complete editorial assembler."""
import subprocess
import sys
from pathlib import Path

script = Path(__file__).with_name('assemble-companion-editorial.py')
raise SystemExit(subprocess.call([sys.executable, str(script), *sys.argv[1:]]))
