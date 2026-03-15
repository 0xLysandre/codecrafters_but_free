#!/bin/bash
#
# Test: Echo Server — Stage 1: Bind to a Port
#
# Verifies that the user's server binds to port 4221 and starts listening.
# Uses $RUN_COMMAND to start the user's program.
#

set -euo pipefail

PORT=4221
TIMEOUT=5
SERVER_PID=""

cleanup() {
    if [ -n "$SERVER_PID" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
        kill "$SERVER_PID" 2>/dev/null || true
        wait "$SERVER_PID" 2>/dev/null || true
    fi
}
trap cleanup EXIT

# --- Start the user's server ---
$RUN_COMMAND &
SERVER_PID=$!

# --- Wait for the server to start listening ---
CONNECTED=false
for i in $(seq 1 $TIMEOUT); do
    if nc -z 127.0.0.1 $PORT 2>/dev/null; then
        CONNECTED=true
        break
    fi
    sleep 1
done

if [ "$CONNECTED" = false ]; then
    echo ""
    echo "========================================="
    echo "  TEST FAILED: Port $PORT not listening"
    echo "========================================="
    echo ""
    echo "Your server did not start listening on port $PORT within ${TIMEOUT} seconds."
    echo ""
    echo "Expected: A TCP server listening on 127.0.0.1:$PORT."
    echo ""
    echo "This is the foundation of all network programming — your server needs"
    echo "to bind to a port so the OS knows to route traffic to your program."
    echo ""
    echo "Make sure you are calling bind() with ('127.0.0.1', $PORT) and then"
    echo "calling listen() on the socket."
    exit 1
fi

echo ""
echo "========================================="
echo "  TEST PASSED: Server listening on port $PORT"
echo "========================================="
echo ""
echo "Your server successfully bound to port $PORT and is accepting connections."
exit 0
