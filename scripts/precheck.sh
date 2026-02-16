#!/usr/bin/env bash
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

# --- The "Anti-Efficiency Trap" skip logic ---
LAST_COMMIT_MSG="$(git log -1 --pretty=%B || true)"
if echo "$LAST_COMMIT_MSG" | grep -qi '\[skip-precheck\]'; then
  echo "🏃‍♂️ [SYSTEM BYPASS]: Skipping checks because you told me to. I hope you know what you're doing!"
  exit 0
fi

echo "🛡️  [SYSTEM AUDIT]: Initializing Pre-Push Quality Gate..."
echo "----------------------------------------------------------------"

# 1. EMPTY FILE CHECK (The Anti-Bloat Protocol)
echo "📂 [STEP 1]: Scanning for ghost files (empty ones)..."
UPSTREAM="$(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || true)"
if [ -n "$UPSTREAM" ]; then
  BASE="$(git merge-base HEAD "$UPSTREAM")"
  FILES_TO_CHECK="$(git diff --name-only --diff-filter=AM "$BASE"..HEAD)"
else
  echo "⚠️  [ALERT]: No upstream found. Auditing the entire Physical Layer..."
  FILES_TO_CHECK="$(git ls-files)"
fi

ALLOW_EMPTY_REGEX='(^|/)\.gitkeep$|(^|/)\.keep$'
EMPTY_FILES=""
while IFS= read -r file; do
  [ -z "${file:-}" ] && continue
  if echo "$file" | grep -Eq "$ALLOW_EMPTY_REGEX"; then continue; fi
  if [ -f "$file" ] && [ ! -s "$file" ]; then
    EMPTY_FILES+="$file"$'\n'
  fi
done <<< "$FILES_TO_CHECK"

if [ -n "$EMPTY_FILES" ]; then
  echo "🛑 [CRITICAL FAULT]: I found some empty files that aren't .keep files:"
  echo -e "$EMPTY_FILES"
  echo "Please feed them some data or delete them. Integrity first!"
  exit 1
fi
echo "✅ [SUCCESS]: No empty files detected."

# 2. PRETTIER (format check)
echo "🎨 [STEP 2]: Checking code style (Prettier)..."
if ! pnpm exec prettier --check . 2>/dev/null; then
  echo "🛑 [SYSTEM FAULT]: Prettier check failed. Run 'pnpm run format' to fix."
  exit 1
fi
echo "✅ [SUCCESS]: Code style OK."

# 3. LINT (ESLint)
echo "🧪 [STEP 3]: Linting..."
if pnpm run lint 2>/dev/null; then
  echo "✅ [SUCCESS]: Lint passed."
else
  echo "🛑 [SYSTEM FAULT]: Lint failed. Run 'pnpm run lint:fix' to auto-fix what you can."
  exit 1
fi
echo "✅ [SUCCESS]: Lint passed."

# 4. TYPESCRIPT (Static Verification)
echo "🛠️  [STEP 4]: Verifying Type Integrity (tsc)..."
if ! pnpm exec tsc --noEmit -p apps/web -p apps/api -p packages/shared 2>/dev/null; then
  echo "🛑 [SYSTEM FAULT]: TypeScript found type errors. Go fix those red squiggles!"
  exit 1
fi
echo "✅ [SUCCESS]: Types are verified."

# 4. UNIT TESTS (Vitest)
echo "🧪 [STEP 5]: Running unit tests (Vitest)..."
if ! pnpm run test; then
  echo "🛑 [SYSTEM FAULT]: Unit tests failed. Fix the red dots!"
  exit 1
fi
echo "✅ [SUCCESS]: All unit tests passed."

echo "----------------------------------------------------------------"
echo "🚀 [SYSTEM AUDIT COMPLETE]: All systems nominal."