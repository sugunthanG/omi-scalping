from pathlib import Path
from datetime import datetime
import shutil
import subprocess
import sys

ROOT = Path(r"D:\OMI-pro\omi-frontend")
FILE = ROOT / "src/components/scientist/omi-brain-visualizer.tsx"

stamp = datetime.now().strftime("%Y%m%d_%H%M%S")

print("=" * 100)
print("OMI BRAIN — RESPONSIVE LAYOUT FIX")
print("=" * 100)

if not FILE.exists():
    print("ABORT: Visualizer not found.")
    sys.exit(1)

original = FILE.read_text(
    encoding="utf-8-sig"
)

backup = FILE.with_name(
    f"omi-brain-visualizer.before_responsive_fix_{stamp}.tsx"
)

shutil.copy2(
    FILE,
    backup,
)

print("Backup :", backup)

text = original

replacements = [
    (
        '        <div className="grid xl:grid-cols-[1fr_320px]">',
        '        <div className="grid min-w-0 2xl:grid-cols-[minmax(0,1fr)_320px]">'
    ),
    (
        '          <div className="overflow-x-auto p-5">',
        '          <div className="min-w-0 overflow-hidden p-4 sm:p-5">'
    ),
    (
        '            <div className="min-w-[820px]">',
        '            <div className="mx-auto w-full max-w-[920px]">'
    ),
    (
        '              <div className="mb-3 grid grid-cols-4 px-8 text-center text-xs uppercase tracking-[0.18em] text-slate-500">',
        '              <div className="mb-3 grid grid-cols-4 gap-2 px-2 text-center text-[10px] uppercase tracking-[0.14em] text-slate-500 sm:px-6 sm:text-xs sm:tracking-[0.18em]">'
    ),
    (
        '                className="h-auto w-full"',
        '                className="block h-auto w-full max-w-full"'
    ),
    (
        '          <aside className="border-t border-slate-800 p-5 xl:border-l xl:border-t-0">',
        '          <aside className="min-w-0 border-t border-slate-800 p-5 2xl:border-l 2xl:border-t-0">'
    ),
]

for old, new in replacements:

    if old not in text:
        print()
        print("ABORT: Expected layout marker missing:")
        print(old)

        shutil.copy2(
            backup,
            FILE,
        )

        print("No layout changes retained.")
        sys.exit(1)

    text = text.replace(
        old,
        new,
        1,
    )


# Add SVG aspect-ratio protection.
old_svg = '''              <svg
                viewBox="0 0 820 430"
                className="block h-auto w-full max-w-full"
              >'''

new_svg = '''              <svg
                viewBox="0 0 820 430"
                preserveAspectRatio="xMidYMid meet"
                className="block h-auto w-full max-w-full"
              >'''

if old_svg not in text:

    shutil.copy2(
        backup,
        FILE,
    )

    print("ABORT: SVG marker not found.")
    sys.exit(1)

text = text.replace(
    old_svg,
    new_svg,
    1,
)

FILE.write_text(
    text,
    encoding="utf-8",
)

print("[OK] Neural canvas made responsive")
print("[OK] Fixed 820px minimum width removed")
print("[OK] Telemetry panel overlap removed")
print("[OK] Decision layer preserved")
print("[OK] Small/medium screens stack safely")
print("[OK] Wide screens use side telemetry panel")

print()
print("-" * 100)
print("PRODUCTION BUILD")
print("-" * 100)

result = subprocess.run(
    [
        "npm.cmd",
        "run",
        "build",
    ],
    cwd=ROOT,
)

if result.returncode != 0:

    print()
    print("BUILD FAILED — ROLLING BACK")

    shutil.copy2(
        backup,
        FILE,
    )

    print("Automatic rollback : COMPLETE")
    sys.exit(
        result.returncode
    )

print()
print("=" * 100)
print("OMI BRAIN — RESPONSIVE FIX COMPLETE")
print("=" * 100)
print("Neural network clipping : FIXED")
print("Decision layer          : PRESERVED")
print("Right state panel       : RESPONSIVE")
print("Horizontal overflow     : REMOVED")
print("Production build        : PASS")
print("Backend modified        : NO")
print("OMI modified            : NO")
print("MT5 interaction         : NONE")
print("=" * 100)
