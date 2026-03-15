#!/bin/bash
#
# Test: Echo Server — Stage 3: Read Data from the Client
#
# Verifies that the server reads incoming data and prints it to stdout.
# Uses $RUN_COMMAND to start the user's program.
#

set -euo pipefail

PORT=4221
TIMEOUT=5
SERVER_PID=""
TEST_STRING="Hello, Echo Server!"
STDOUT_FILE=$(mktemp)

cleanup() {
    if [ -n "$SERVER_PID" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
        kill "$SERVER_PID" 2>/dev/null || true
        wait "$SERVER_PID" 2>/dev/null || true
    fi
    rm -f "$STDOUT_FILE"
}
trap cleanup EXIT

# --- Start the user's server, capturing stdout ---
$RUN_COMMAND > "$STDOUT_FILE" 2>&1 &
SERVER_PID=$!

# --- Wait for the server to start listening ---
for i in $(seq 1 $TIMEOUT); do
    if nc -z 127.0.0.1 $PORT 2>/dev/null; then
        break
    fi
    sleep 1
done

if ! nc -z 127.0.0.1 $PORT 2>/dev/null; then
    echo ""
    echo "========================================="
    echo "  TEST FAILED: Server not listening"
    echo "========================================="
    echo ""
    echo "Your server did not start listening on port $PORT."
    echo "This test requires working Stages 1-2."
    exit 1
fi

# --- Send data to the server ---
echo -n "$TEST_STRING" | nc -w 3 127.0.0.1 $PORT 2>/dev/null || true

# Give the server a moment to process and write to stdout
sleep 1

# --- Check if the server printed the data ---
if grep -qF "$TEST_STRING" "$STDOUT_FILE"; then
    echo ""
    echo "========================================="
    echo "  TEST PASSED: Server read and printed data"
    echo "========================================="
    echo ""
    echo "Your server received \"$TEST_STRING\" and printed it to stdout."
    exit 0
else
    echo ""
    echo "========================================="
    echo "  TEST FAILED: Data not found in server output"
    echo "========================================="
    echo ""
    echo "Sent: \"$TEST_STRING\""
    echo "Expected your server to print the received data to stdout."
    echo ""
    echo "Server stdout contained:"
    cat "$STDOUT_FILE"
    echo ""
    echo "After accepting a connection, you need to read data from the client"
    echo "socket using recv() (Python) or the 'data' event (JavaScript)."
    echo ""
    echo "Make sure you're printing the received data to stdout with print()"
    echo "or process.stdout.write()."
    exit 1
fi
