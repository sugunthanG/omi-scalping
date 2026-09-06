from pathlib import Path

ROOT = Path(r"D:\OMI-pro\omi-frontend")

FILES = [
    ROOT / "src/app/scientist/omi-brain/page.tsx",
    ROOT / "src/components/scientist/omi-brain-visualizer.tsx",
    ROOT / "src/components/scientist/omi-emergency-control.tsx",
    ROOT / "src/services/api/scientist-api.ts",
]

print("=" * 100)
print("OMI BRAIN — FINAL UI INSPECTION")
print("=" * 100)

for path in FILES:

    print()
    print("=" * 100)
    print(path.relative_to(ROOT))
    print("=" * 100)

    if not path.exists():
        print("[MISSING]")
        continue

    text = path.read_text(
        encoding="utf-8-sig",
        errors="replace",
    )

    print(text)

print()
print("=" * 100)
print("UI INSPECTION COMPLETE")
print("=" * 100)
print("Files modified : NONE")
print("Backend touched: NO")
print("MT5 orders     : NO")
print("=" * 100)
