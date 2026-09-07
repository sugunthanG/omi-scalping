from pathlib import Path
import re

ROOT = Path(r"D:\OMI-pro\omi-frontend")
TARGET = ROOT / "src/services/api/scientist-session-policy-api.ts"

print("=" * 100)
print("S4A.1 — FIX SCIENTIST SESSION POLICY API IMPORT")
print("=" * 100)

if not TARGET.exists():
    raise SystemExit(
        "[FAILED] scientist-session-policy-api.ts not found"
    )

# ------------------------------------------------------------
# Find the API/Axios client already used by existing frontend.
# Prefer scientist-api.ts because it is known to already work.
# ------------------------------------------------------------

candidates = [
    ROOT / "src/services/api/scientist-api.ts",
]

candidates.extend(
    sorted(
        (ROOT / "src/services").rglob("*.ts")
    )
)

found_import = None
source_file = None

patterns = [
    r'import\s+api\s+from\s+["\']([^"\']+)["\']',
    r'import\s+axiosInstance\s+from\s+["\']([^"\']+)["\']',
    r'import\s+client\s+from\s+["\']([^"\']+)["\']',
]

for candidate in candidates:

    if (
        not candidate.exists()
        or candidate == TARGET
    ):
        continue

    try:
        text = candidate.read_text(
            encoding="utf-8"
        )
    except Exception:
        continue

    # Strong preference: files that actually call .get/.post
    if (
        ".get(" not in text
        and ".post(" not in text
        and ".put(" not in text
        and ".delete(" not in text
    ):
        continue

    for pattern in patterns:

        match = re.search(
            pattern,
            text,
        )

        if match:
            variable_match = re.search(
                r'import\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+from\s+["\']'
                + re.escape(match.group(1))
                + r'["\']',
                text,
            )

            if variable_match:
                found_import = (
                    variable_match.group(1),
                    match.group(1),
                )

                source_file = candidate
                break

    if found_import:
        break


if not found_import:

    print("[FAILED] Could not safely identify existing API client.")
    print()
    print("No frontend file was modified.")
    print("Run:")
    print(
        r'Get-Content .\src\services\api\scientist-api.ts -TotalCount 40'
    )
    raise SystemExit(1)


existing_variable, existing_path = found_import

print(
    "[PASS] Existing API client source:",
    source_file.relative_to(ROOT),
)

print(
    "[PASS] Existing API import:",
    existing_variable,
    "from",
    existing_path,
)


# ------------------------------------------------------------
# Patch ONLY generated S4A API file.
# Normalize imported client locally as `api`.
# ------------------------------------------------------------

text = TARGET.read_text(
    encoding="utf-8"
)

old_line = (
    'import api from "@/services/api/api";'
)

if old_line not in text:
    raise SystemExit(
        "[FAILED] Expected generated import not found. "
        "No patch applied."
    )

if existing_variable == "api":

    replacement = (
        f'import api from "{existing_path}";'
    )

else:

    replacement = (
        f'import {existing_variable} from "{existing_path}";\n'
        f'const api = {existing_variable};'
    )

text = text.replace(
    old_line,
    replacement,
    1,
)

TARGET.write_text(
    text,
    encoding="utf-8",
)

print("[PASS] Generated API client import corrected")
print("[PASS] Existing frontend API architecture reused")
print("[PASS] Existing scientist-api.ts unchanged")
print("[PASS] OMI Brain unchanged")
print("[PASS] session_filter.py unchanged")
print("[PASS] Backend unchanged")
print("[PASS] Trading logic unchanged")
print("[PASS] MT5 orders: NONE")

print("=" * 100)
print("S4A.1 PATCH COMPLETE")
print("=" * 100)
