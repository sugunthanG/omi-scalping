from pathlib import Path

p = Path(
    r"D:\OMI-pro\omi-frontend"
    r"\src\components\scientist\omi-brain-visualizer.tsx"
)

lines = p.read_text(
    encoding="utf-8-sig",
    errors="replace",
).splitlines()

print("=" * 100)
print("OMI BRAIN VISUALIZER — QUERY + RETURN INSPECTION")
print("=" * 100)

# Show beginning where imports/query/data variables live.
print()
print("QUERY / DATA SECTION")
print("-" * 100)

for i, line in enumerate(lines[:220], start=1):
    print(f"{i:4} | {line}")

# Show end where we can safely insert the new dashboard.
print()
print("=" * 100)
print("RETURN / END SECTION")
print("-" * 100)

start = max(0, len(lines) - 180)

for i in range(start, len(lines)):
    print(f"{i + 1:4} | {lines[i]}")

print()
print("=" * 100)
print("INSPECTION COMPLETE")
print("=" * 100)
print("Total lines    :", len(lines))
print("Files modified : NONE")
print("Backend touched: NO")
print("MT5 orders     : NO")
print("=" * 100)
