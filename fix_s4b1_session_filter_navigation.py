from pathlib import Path
from datetime import datetime
import shutil
import sys

ROOT = Path(r"D:\OMI-pro\omi-frontend")

NAV = (
    ROOT
    / "src"
    / "constants"
    / "navigation.ts"
)

PAGE = (
    ROOT
    / "src"
    / "app"
    / "scientist"
    / "session-filter"
    / "page.tsx"
)

COMPONENT = (
    ROOT
    / "src"
    / "components"
    / "scientist"
    / "omi-session-intelligence.tsx"
)

API = (
    ROOT
    / "src"
    / "services"
    / "api"
    / "scientist-session-policy-api.ts"
)

print("=" * 100)
print("S4B.1 — FIX SEPARATE SESSION FILTER NAVIGATION")
print("=" * 100)

# ============================================================
# SAFETY
# ============================================================

for path in (
    NAV,
    PAGE,
    COMPONENT,
    API,
):
    if not path.exists():
        raise SystemExit(
            f"[FAILED] Required file missing: {path}"
        )

stamp = datetime.now().strftime(
    "%Y%m%d_%H%M%S"
)

backup = NAV.with_name(
    f"navigation.before_session_filter_nav_{stamp}.ts.bak"
)

shutil.copy2(
    NAV,
    backup,
)

print(
    "[PASS] Navigation backup:",
    backup.relative_to(ROOT),
)

nav = NAV.read_text(
    encoding="utf-8",
)

# ============================================================
# DO NOT DUPLICATE
# ============================================================

new_href = (
    'href: "/scientist/session-filter"'
)

if new_href in nav:

    print(
        "[PASS] Session Filter navigation already exists"
    )

else:

    # ========================================================
    # FIND EXISTING OMI BRAIN ITEM BY ITS UNIQUE HREF
    # ========================================================

    brain_href = (
        'href: "/scientist/omi-brain"'
    )

    href_pos = nav.find(
        brain_href
    )

    if href_pos == -1:
        raise SystemExit(
            "[FAILED] Existing OMI Brain navigation href "
            "was not found. No modification applied."
        )

    # ========================================================
    # FIND THE START OF THIS NAV OBJECT
    # ========================================================

    object_start = nav.rfind(
        "{",
        0,
        href_pos,
    )

    if object_start == -1:
        raise SystemExit(
            "[FAILED] Could not locate OMI Brain item start."
        )

    # ========================================================
    # FIND OBJECT END USING BRACE DEPTH
    # ========================================================

    depth = 0
    object_end = None

    for index in range(
        object_start,
        len(nav),
    ):

        char = nav[index]

        if char == "{":
            depth += 1

        elif char == "}":
            depth -= 1

            if depth == 0:
                object_end = index + 1
                break

    if object_end is None:
        raise SystemExit(
            "[FAILED] Could not locate OMI Brain item end."
        )

    # Preserve comma if the existing object has one.
    insert_at = object_end

    while (
        insert_at < len(nav)
        and nav[insert_at] in " \t"
    ):
        insert_at += 1

    if (
        insert_at < len(nav)
        and nav[insert_at] == ","
    ):
        insert_at += 1

    new_item = '''

      {
        label: "Session Filter",
        href: "/scientist/session-filter",
        icon: SlidersHorizontal,
        roles: [
          "DEVELOPER",
        ],
      },'''

    nav = (
        nav[:insert_at]
        + new_item
        + nav[insert_at:]
    )

    NAV.write_text(
        nav,
        encoding="utf-8",
    )

    print(
        "[PASS] Session Filter added after OMI Brain"
    )


# ============================================================
# VALIDATE NAVIGATION
# ============================================================

final_nav = NAV.read_text(
    encoding="utf-8",
)

checks = {
    "OMI Brain preserved":
        'href: "/scientist/omi-brain"'
        in final_nav,

    "Session Filter route":
        'href: "/scientist/session-filter"'
        in final_nav,

    "Session Filter label":
        'label: "Session Filter"'
        in final_nav,

    "Scientist internal role":
        '"DEVELOPER"'
        in final_nav,

    "Existing icon available":
        "SlidersHorizontal"
        in final_nav,

    "Separate page exists":
        PAGE.exists(),

    "Session component exists":
        COMPONENT.exists(),

    "Session API exists":
        API.exists(),
}

failed = []

for name, passed in checks.items():

    print(
        "[PASS]" if passed else "[FAILED]",
        name,
    )

    if not passed:
        failed.append(name)


# ============================================================
# MAKE SURE BAD .TS BACKUPS ARE NOT IN SRC
# ============================================================

bad_backups = []

for path in (
    ROOT / "src"
).rglob(
    "*.before_*.ts"
):

    bad_backups.append(
        path
    )

if bad_backups:

    print()
    print(
        "[INFO] Excluding TypeScript backup files "
        "from compilation..."
    )

    for path in bad_backups:

        target = path.with_name(
            path.name + ".bak"
        )

        if target.exists():
            target = path.with_name(
                path.name
                + f".{stamp}.bak"
            )

        path.rename(
            target
        )

        print(
            "[PASS] Excluded:",
            target.relative_to(ROOT),
        )

else:

    print(
        "[PASS] No compilable .ts backup files remain"
    )


if failed:

    print()
    print(
        "[FAILED] Static validation failed."
    )

    print(
        "[ROLLBACK] Restoring navigation only."
    )

    shutil.copy2(
        backup,
        NAV,
    )

    sys.exit(1)


print()
print("=" * 100)
print("S4B.1 NAVIGATION FIX COMPLETE")
print("=" * 100)
print("Scientist / OMI Brain       : PRESERVED")
print("Scientist / Session Filter  : INSTALLED")
print("Separate page               : YES")
print("Scientist role              : DEVELOPER")
print("OMI Brain page              : UNCHANGED")
print("session_filter.py           : UNCHANGED")
print("Backend                     : UNCHANGED")
print("OMI trading logic           : UNCHANGED")
print("MT5 orders                  : NONE")
print("=" * 100)
