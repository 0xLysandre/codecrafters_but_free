#!/bin/bash
#
# Test: Shell — Stage 2: Read Input
#
# Verifies that the shell reads input and prints "command not found" messages.
# Uses $RUN_COMMAND to start the user's program.
#

set -euo pipefail

TIMEOUT=5
OUTPUT_FILE=$(mktemp)

cleanup() {
    rm -f "$OUTPUT_FILE"
}
trap cleanup EXIT

# --- Test 1: Unknown command produces "command not found" ---
printf "foobar\n" | timeout $TIMEOUT $RUN_COMMAND > "$OUTPUT_FILE" 2>/dev/null || true

if grep -qF "foobar: command not found" "$OUTPUT_FILE"; then
    echo "  [PASS] 'foobar' produces 'foobar: command not found'"
else
    ACTUAL=$(cat "$OUTPUT_FILE" | grep -v '^\$ $' | head -5)
    echo ""
    echo "========================================="
    echo "  TEST FAILED: Missing 'command not found' message"
    echo "========================================="
    echo ""
    echo "Input:    foobar"
    echo "Expected: \"foobar: command not found\""
    echo "Got:"
    echo "$ACTUAL"
    echo ""
    echo "When your shell receives an unrecognized command, it should print"
    echo "\"<input>: command not found\" to stdout."
    echo ""
    echo "This is how real shells communicate that a command was not recognized."
    echo "Read the input line and use it in the error message."
    exit 1
fi

# --- Test 2: Multiple commands in sequence ---
OUTPUT_FILE2=$(mktemp)
printf "apple\nbanana\ncherry\n" | timeout $TIMEOUT $RUN_COMMAND > "$OUTPUT_FILE2" 2>/dev/null || true

PASS=true
for cmd in apple banana cherry; do
    if ! grep -qF "$cmd: command not found" "$OUTPUT_FILE2"; then
        echo ""
        echo "========================================="
        echo "  TEST FAILED: Missing message for '$cmd'"
        echo "========================================="
        echo ""
        echo "Sent three commands: apple, banana, cherry"
        echo "Expected \"$cmd: command not found\" in output but didn't find it."
        echo ""
        echo "Your shell should handle multiple commands in sequence. After"
        echo "printing 'command not found' for one input, it should show a new"
        echo "prompt and read the next line."
        echo ""
        echo "Output was:"
        cat "$OUTPUT_FILE2"
        rm -f "$OUTPUT_FILE2"
        exit 1
    fi
done
rm -f "$OUTPUT_FILE2"

echo "  [PASS] Multiple commands each produce 'command not found'"

# --- Test 3: Command with spaces ---
OUTPUT_FILE3=$(mktemp)
printf "hello world\n" | timeout $TIMEOUT $RUN_COMMAND > "$OUTPUT_FILE3" 2>/dev/null || true

if grep -qF "hello world: command not found" "$OUTPUT_FILE3"; then
    echo "  [PASS] 'hello world' produces 'hello world: command not found'"
else
    echo ""
    echo "========================================="
    echo "  TEST FAILED: Input with spaces not handled"
    echo "========================================="
    echo ""
    echo "Input:    hello world"
    echo "Expected: \"hello world: command not found\""
    echo ""
    echo "At this stage, use the entire input line (not just the first word)"
    echo "in the error message. Command parsing comes in the next stage."
    echo ""
    echo "Output was:"
    cat "$OUTPUT_FILE3"
    rm -f "$OUTPUT_FILE3"
    exit 1
fi
rm -f "$OUTPUT_FILE3"

echo ""
echo "========================================="
echo "  ALL TESTS PASSED"
echo "========================================="
echo ""
echo "Your shell correctly reads input and prints 'command not found' messages."
exit 0
