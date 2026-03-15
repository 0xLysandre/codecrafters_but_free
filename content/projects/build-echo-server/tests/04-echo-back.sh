#!/bin/bash
#
# Test: Echo Server — Stage 4: Echo the Data Back
#
# Verifies that the server sends back exactly what it receives.
# Uses $RUN_COMMAND to start the user's program.
#

set -euo pipefail

PORT=4221
TIMEOUT=5
SERVER_PID=""

# Generate a random test string to prevent hardcoded responses
TEST_STRING="echo_test_$(date +%s)_$RANDOM"

cleanup() {
    if [ -n "$SERVER_PID" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
        kill "$SERVER_PID" 2>/dev/null || true
        wait "$SERVER_PID" 2>/dev/null || true
    fi
}
trap cleanup EXIT

# --- Start the user's server ---
$RUN_COMMAND > /dev/null 2>&1 &
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
    echo "This test requires working Stages 1-3."
    exit 1
fi

# --- Send data and capture the echo ---
RESPONSE=$(echo -n "$TEST_STRING" | nc -w 3 127.0.0.1 $PORT 2>/dev/null) || true

if [ "$RESPONSE" = "$TEST_STRING" ]; then
    echo ""
    echo "========================================="
    echo "  TEST PASSED: Echo works correctly"
    echo "========================================="
    echo ""
    echo "Sent:     \"$TEST_STRING\""
    echo "Received: \"$RESPONSE\""
    echo ""
    echo "Your echo server correctly sends back exactly what it receives."
    exit 0
else
    echo ""
    echo "========================================="
    echo "  TEST FAILED: Echo response mismatch"
    echo "========================================="
    echo ""
    echo "Sent:     \"$TEST_STRING\""
    echo "Received: \"$RESPONSE\""
    echo ""
    if [ -z "$RESPONSE" ]; then
        echo "Your server did not send any data back to the client."
        echo ""
        echo "After reading data with recv(), you need to send it back using"
        echo "sendall() (Python) or socket.write() (JavaScript)."
    else
        echo "Your server sent data back, but it doesn't match what was sent."
        echo ""
        echo "The echo server should send back the EXACT same bytes it received."
        echo "Make sure you're sending the raw data, not a modified version."
    fi
    echo ""
    echo "Tip: Use conn.sendall(data) in Python — it ensures all bytes are sent."
    exit 1
fi
