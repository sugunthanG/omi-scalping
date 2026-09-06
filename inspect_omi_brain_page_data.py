from pathlib import Path

p = Path(
    r"D:\OMI-pro\omi-frontend"
    r"\src\app\scientist\omi-brain\page.tsx"
)

lines = p.read_text(
    encoding="utf-8-sig",
    errors="replace",
).splitlines()

print("=" * 100)
print("OMI BRAIN PAGE — DATA VARIABLE INSPECTION")
print("=" * 100)

for i, line in enumerate(lines[:160], start=1):
    print(f"{i:4} | {line}")

print()
print("=" * 100)
print("INSPECTION COMPLETE")
print("=" * 100)
print("Files modified : NONE")
print("Backend touched: NO")
print("MT5 orders     : NO")
print("=" * 100)
