from pathlib import Path

ROOT = Path(r"D:\OMI-pro\omi-frontend")

TARGETS = [
    ROOT / "src" / "app" / "scientist" / "omi-brain" / "page.tsx",
    ROOT / "src" / "components" / "scientist" / "omi-brain-visualizer.tsx",
    ROOT / "src" / "components" / "scientist" / "omi-emergency-control.tsx",
    ROOT / "src" / "services" / "api" / "scientist-api.ts",
    ROOT / "src" / "constants" / "navigation.ts",
]

print("=" * 100)
print("S4 — SCIENTIST FRONTEND CONTRACT INSPECTION")
print("=" * 100)

for path in TARGETS:

    print()
    print("=" * 100)
    print("FILE:", path.relative_to(ROOT))
    print("=" * 100)

    if not path.exists():
        print("[NOT FOUND]")
        continue

    text = path.read_text(
        encoding="utf-8",
        errors="replace",
    )

    lines = text.splitlines()

    print("Lines:", len(lines))
    print()

    # --------------------------------------------------------------
    # For the API file and Brain page we need the full contract.
    # Other components only need structural excerpts.
    # --------------------------------------------------------------

    if (
        path.name == "scientist-api.ts"
        or path.name == "page.tsx"
    ):
        for number, line in enumerate(
            lines,
            start=1,
        ):
            print(
                f"{number:4} | {line}"
            )

        continue

    keywords = (
        "export",
        "interface",
        "type ",
        "function",
        "const ",
        "return",
        "useQuery",
        "useMutation",
        "motion",
        "Card",
        "Button",
        "Dialog",
        "Modal",
        "password",
        "emergency",
        "scientist",
        "omi-brain",
        "navigation",
        "href",
        "role",
    )

    hits = []

    for index, line in enumerate(
        lines,
        start=1,
    ):

        if any(
            keyword.lower()
            in line.lower()
            for keyword in keywords
        ):
            hits.append(
                index
            )

    shown = set()

    for hit in hits:

        start = max(
            1,
            hit - 5,
        )

        end = min(
            len(lines),
            hit + 10,
        )

        key = (
            start,
            end,
        )

        if key in shown:
            continue

        shown.add(
            key
        )

        print()
        print(
            f"--- LINES {start}-{end} ---"
        )

        for number in range(
            start,
            end + 1,
        ):
            print(
                f"{number:4} | "
                f"{lines[number - 1]}"
            )


print()
print("=" * 100)
print("READ ONLY")
print("=" * 100)
print("Frontend files modified : NONE")
print("Backend files modified  : NONE")
print("session_filter.py        : UNCHANGED")
print("OMI restarted            : NO")
print("MT5 orders               : NONE")
print("=" * 100)
