#!/bin/bash
#
# Test: HTTP Server — Stage 1: Bind to a Port
#
# Verifies that the HTTP server binds to port 4221 and starts listening.
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
    echo "Your HTTP server did not start listening on port $PORT within"
    echo "${TIMEOUT} seconds."
    echo ""
    echo "Expected: A TCP server listening on 127.0.0.1:$PORT."
    echo ""
    echo "An HTTP server is fundamentally a TCP server. It needs to bind to a"
    echo "port and listen for connections — exactly like the echo server."
    echo ""
    echo "If you completed the echo server project, you can reuse that code"
    echo "as a starting point. Create a socket, bind to port $PORT, and listen."
    exit 1
fi

echo ""
echo "========================================="
echo "  TEST PASSED: HTTP server listening on port $PORT"
echo "========================================="
echo ""
echo "Your server is bound to port $PORT and ready to accept connections."
exit 0
