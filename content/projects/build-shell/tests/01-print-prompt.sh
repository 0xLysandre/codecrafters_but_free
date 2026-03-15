#!/bin/bash
#
# Test: Shell — Stage 1: Print a Prompt
#
# Verifies that the shell prints "$ " and handles EOF correctly.
# Uses $RUN_COMMAND to start the user's program.
#

set -euo pipefail

TIMEOUT=5
OUTPUT_FILE=$(mktemp)

cleanup() {
    rm -f "$OUTPUT_FILE"
}
trap cleanup EXIT

# --- Test 1: Shell prints prompt on startup ---
# Send EOF immediately (empty input) and capture output
echo "" | timeout $TIMEOUT $RUN_COMMAND > "$OUTPUT_FILE" 2>/dev/null || true

# Check that the output starts with "$ "
if head -c 2 "$OUTPUT_FILE" | grep -q '^\$ $'; then
    echo "  [PASS] Shell prints '$ ' prompt on startup"
else
    ACTUAL=$(head -c 20 "$OUTPUT_FILE" | cat -v)
    echo ""
    echo "========================================="
    echo "  TEST FAILED: Prompt not found"
    echo "========================================="
    echo ""
    echo "Your shell did not print the expected prompt."
    echo ""
    echo "Expected: \"\$ \" (dollar sign followed by a space)"
    echo "Got:      \"$ACTUAL\""
    echo ""
    echo "The prompt tells the user your shell is ready for input. Every shell"
    echo "starts by printing a prompt to stdout."
    echo ""
    echo "Make sure you print exactly \"\$ \" (with the trailing space) to stdout."
    echo "Use flush=True (Python) or process.stdout.write (JavaScript) to ensure"
    echo "the prompt appears immediately."
    exit 1
fi

# --- Test 2: Shell prints prompt again after input ---
OUTPUT_FILE2=$(mktemp)
printf "hello\n" | timeout $TIMEOUT $RUN_COMMAND > "$OUTPUT_FILE2" 2>/dev/null || true

# Count occurrences of "$ " in output
PROMPT_COUNT=$(grep -o '\$ ' "$OUTPUT_FILE2" | wc -l)

if [ "$PROMPT_COUNT" -ge 2 ]; then
    echo "  [PASS] Shell prints prompt again after receiving input"
else
    echo ""
    echo "========================================="
    echo "  TEST FAILED: Prompt not repeated"
    echo "========================================="
    echo ""
    echo "Your shell printed the initial prompt, but did not print a second"
    echo "prompt after receiving a line of input."
    echo ""
    echo "Expected: At least 2 prompts (one initial, one after input)."
    echo "Found:    $PROMPT_COUNT prompt(s)."
    echo ""
    echo "Your shell should be a loop: print prompt, read input, repeat."
    echo "After processing each line, print the prompt again."
    rm -f "$OUTPUT_FILE2"
    exit 1
fi
rm -f "$OUTPUT_FILE2"

# --- Test 3: Shell exits cleanly on EOF ---
OUTPUT_FILE3=$(mktemp)
timeout $TIMEOUT $RUN_COMMAND < /dev/null > "$OUTPUT_FILE3" 2>/dev/null
EXIT_CODE=$?

if [ "$EXIT_CODE" -eq 0 ]; then
    echo "  [PASS] Shell exits cleanly on EOF (exit code 0)"
else
    echo ""
    echo "========================================="
    echo "  TEST FAILED: Non-zero exit on EOF"
    echo "========================================="
    echo ""
    echo "Your shell exited with code $EXIT_CODE when it received EOF."
    echo ""
    echo "Expected: Exit code 0."
    echo ""
    echo "When stdin reaches EOF (end of file), your shell should exit cleanly"
    echo "with code 0. In Python, input() raises EOFError on EOF. In JavaScript,"
    echo "the readline 'close' event fires."
    rm -f "$OUTPUT_FILE3"
    exit 1
fi
rm -f "$OUTPUT_FILE3"

echo ""
echo "========================================="
echo "  ALL TESTS PASSED"
echo "========================================="
echo ""
echo "Your shell prints the prompt correctly, repeats it after input, and"
echo "exits cleanly on EOF."
exit 0
