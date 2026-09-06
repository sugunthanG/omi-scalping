from pathlib import Path

ROOT = Path(r"D:\OMI-pro\omi-frontend")

FILES = [
    ROOT / "src/services/api/scientist-api.ts",
    ROOT / "src/components/scientist/omi-brain-visualizer.tsx",
]

print("=" * 100)
print("STEP 3 — FRONTEND CONNECTION INSPECTION")
print("=" * 100)

for file in FILES:

    print()
    print("-" * 100)
    print(file.relative_to(ROOT))
    print("-" * 100)

    if not file.exists():
        print("MISSING")
        continue

    text = file.read_text(
        encoding="utf-8-sig",
        errors="strict",
    )

    lines = text.splitlines()

    for i, line in enumerate(
        lines,
        start=1,
    ):
        print(
            f"{i:4}: {line}"
        )

print()
print("=" * 100)
print("Changes made : NONE")
print("Frontend run : NO")
print("Backend run  : NO")
print("=" * 100)
