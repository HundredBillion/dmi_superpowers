#!/usr/bin/env bash
# Run matching tests individually to find one that creates unwanted files/state.
# Usage: bash find-polluter.sh <file_or_dir_to_check> <test_pattern>
# Example: bash find-polluter.sh '.git' 'src/**/*.test.ts'
set -euo pipefail

if [ $# -ne 2 ]; then
  echo "Usage: $0 <file_to_check> <test_pattern>" >&2
  exit 2
fi
pollution=$1
pattern=${2#./}
echo "Searching for test that creates: $pollution"
echo "Test pattern: $pattern"

if [ -e "$pollution" ] || [ -L "$pollution" ]; then
  echo "Pollution already exists; cannot attribute it to a test: $pollution" >&2
  exit 2
fi

# Bash 3 (macOS) has no globstar. Expand each **/ into both its recursive
# find -path form and its zero-directory form, including mixed combinations.
patterns=("./$pattern")
for ((i=0; i<${#patterns[@]}; i++)); do
  p=${patterns[i]}
  if [[ "$p" == *'**/'* ]]; then
    prefix=${p%%\*\*/*}
    suffix=${p#*\*\*/}
    patterns[i]="${prefix}*/${suffix}"
    patterns+=("${prefix}${suffix}")
    i=$((i - 1))
  fi
done
find_args=()
for p in "${patterns[@]}"; do
  if [ ${#find_args[@]} -gt 0 ]; then find_args+=(-o); fi
  find_args+=(-path "$p")
done
# Use a NUL-delimited temporary list so spaces and newlines stay in filenames,
# and discovery errors cannot be hidden by process substitution.
list=$(mktemp "${TMPDIR:-/tmp}/dmi-polluter.XXXXXX")
trap 'rm -f -- "$list"' EXIT
find . -type f \( "${find_args[@]}" \) -print0 > "$list"
tests=()
while IFS= read -r -d '' file; do tests+=("$file"); done < "$list"
total=${#tests[@]}
echo "Found $total test files"
if [ "$total" -eq 0 ]; then
  echo "No matching tests; pollution check is inconclusive." >&2
  exit 2
fi

count=0
failed=0
for file in "${tests[@]}"; do
  count=$((count + 1))
  echo "[$count/$total] Testing: $file"
  status=0
  npm test "$file" > /dev/null 2>&1 || status=$?
  if [ -e "$pollution" ] || [ -L "$pollution" ]; then
    echo "FOUND POLLUTER!"
    printf 'Test: %s\nCreated: %s\n' "$file" "$pollution"
    if [ "$status" -ne 0 ]; then echo "Test also failed (exit $status)." >&2; fi
    ls -ld -- "$pollution"
    exit 1
  fi
  if [ "$status" -ne 0 ]; then
    echo "Test failed (exit $status): $file" >&2
    failed=$((failed + 1))
  fi
done
if [ "$failed" -gt 0 ]; then
  echo "No pollution observed, but $failed test(s) failed; result is inconclusive." >&2
  exit 2
fi
echo "No polluter found - all tests clean!"
