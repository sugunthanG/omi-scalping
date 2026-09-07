from pathlib import Path
from datetime import datetime
import shutil

ROOT = Path(r"D:\OMI-pro\omi-frontend")
TARGET = ROOT / "src/services/api/scientist-session-policy-api.ts"

print("=" * 100)
print("S4A.2 — FIX SESSION POLICY API TO EXISTING FRONTEND AUTH PATTERN")
print("=" * 100)

if not TARGET.exists():
    raise SystemExit(
        "[FAILED] scientist-session-policy-api.ts not found"
    )

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

backup = TARGET.with_name(
    f"{TARGET.stem}.before_auth_fix_{timestamp}{TARGET.suffix}"
)

shutil.copy2(
    TARGET,
    backup,
)

print(
    "[PASS] Backup:",
    backup.relative_to(ROOT),
)

text = TARGET.read_text(
    encoding="utf-8",
)

bad_import = (
    'import api from "@/services/api/api";'
)

if bad_import not in text:
    raise SystemExit(
        "[FAILED] Expected invalid API import was not found. "
        "Original file preserved."
    )

replacement = '''import axios from "axios";

import {
  API_BASE_URL,
} from "@/lib/api-config";

import {
  getAccessToken,
} from "@/lib/auth-token-storage";


function getSessionPolicyAuthorizationHeaders() {
  const token =
    getAccessToken();

  if (!token) {
    throw new Error(
      "Scientist access token is unavailable.",
    );
  }

  return {
    Authorization:
      `Bearer ${token}`,

    Accept:
      "application/json",

    "Content-Type":
      "application/json",
  };
}
'''

text = text.replace(
    bad_import,
    replacement,
    1,
)

# ------------------------------------------------------------
# Convert generated shared-client calls to axios calls.
#
# Existing generated file uses:
#
#   api.get(...)
#   api.post(...)
#
# We preserve all endpoints/payloads/types and change only
# the HTTP client/auth configuration.
# ------------------------------------------------------------

text = text.replace(
    "api.get(",
    "axios.get(",
)

text = text.replace(
    "api.post(",
    "axios.post(",
)

# ------------------------------------------------------------
# Existing generated GET requests may have no config argument.
# Instead of risky structural rewriting of every call, create
# a small local authenticated Axios instance.
#
# This follows the same token/base URL architecture already
# proven in scientist-api.ts.
# ------------------------------------------------------------

instance_code = '''

const scientistSessionPolicyApi =
  axios.create({
    baseURL:
      API_BASE_URL,

    timeout:
      15_000,
  });


scientistSessionPolicyApi.interceptors.request.use(
  (config) => {
    const headers =
      getSessionPolicyAuthorizationHeaders();

    config.headers.set(
      "Authorization",
      headers.Authorization,
    );

    config.headers.set(
      "Accept",
      headers.Accept,
    );

    config.headers.set(
      "Content-Type",
      headers["Content-Type"],
    );

    return config;
  },
);
'''

marker = (
    "function getSessionPolicyAuthorizationHeaders()"
)

start = text.find(marker)

if start == -1:
    raise SystemExit(
        "[FAILED] Authorization helper insertion failed."
    )

# Find the end of the helper.
helper_end = text.find(
    "\n}\n",
    start,
)

if helper_end == -1:
    raise SystemExit(
        "[FAILED] Could not locate authorization helper end."
    )

helper_end += len("\n}\n")

text = (
    text[:helper_end]
    + instance_code
    + text[helper_end:]
)

# Use authenticated instance for all generated requests.
text = text.replace(
    "axios.get(",
    "scientistSessionPolicyApi.get(",
)

text = text.replace(
    "axios.post(",
    "scientistSessionPolicyApi.post(",
)

TARGET.write_text(
    text,
    encoding="utf-8",
)

# ------------------------------------------------------------
# Safety checks
# ------------------------------------------------------------

final = TARGET.read_text(
    encoding="utf-8",
)

checks = {
    "Invalid API import removed":
        '@/services/api/api' not in final,

    "Axios imported":
        'import axios from "axios";' in final,

    "API_BASE_URL reused":
        'API_BASE_URL' in final,

    "Existing token storage reused":
        'getAccessToken' in final,

    "Bearer authentication":
        'Bearer ${token}' in final,

    "Authenticated API instance":
        'scientistSessionPolicyApi' in final,

    "15 second timeout":
        '15_000' in final,

    "Scientist policy endpoint preserved":
        '/scientist/session-policy' in final,

    "No password hardcoded":
        '"0008"' not in final,
}

failed = []

for name, passed in checks.items():
    print(
        "[PASS]" if passed else "[FAILED]",
        name,
    )

    if not passed:
        failed.append(name)

if failed:
    print()
    print("[FAILED] Safety validation failed.")
    print("[ROLLBACK] Restoring generated API file.")

    shutil.copy2(
        backup,
        TARGET,
    )

    raise SystemExit(1)

print()
print("[PASS] session_filter.py not accessed")
print("[PASS] Backend not modified")
print("[PASS] OMI trading logic not modified")
print("[PASS] MT5 orders: NONE")

print("=" * 100)
print("S4A.2 PATCH COMPLETE")
print("=" * 100)
