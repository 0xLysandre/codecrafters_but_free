#!/bin/bash
#
# Test: Echo Server — Stage 2: Accept a Connection
#
# Verifies that the server accepts an incoming TCP connection and closes it
# gracefully. Uses $RUN_COMMAND to start the user's program.
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
    echo "This test requires a working Stage 1 (Bind to a Port)."
    exit 1
fi

# --- Try to connect ---
# nc with a short timeout; we expect the connection to be accepted and then closed
RESPONSE=$(echo "" | nc -w 3 127.0.0.1 $PORT 2>&1) || true
NC_EXIT=$?

# If nc was able to connect (exit code 0 or connection was closed by remote),
# the connection was accepted successfully.
# nc returns 0 on successful connection even if the remote closes it.

# Verify connection was accepted by trying to connect and checking it doesn't hang
CONNECT_RESULT=$(timeout 3 bash -c "echo '' | nc 127.0.0.1 $PORT" 2>&1 && echo "CONNECTED" || echo "FAILED")

if echo "$CONNECT_RESULT" | grep -q "CONNECTED\|^$"; then
    echo ""
    echo "========================================="
    echo "  TEST PASSED: Connection accepted"
    echo "========================================="
    echo ""
    echo "Your server successfully accepted a TCP connection and closed it."
    exit 0
else
    echo ""
    echo "========================================="
    echo "  TEST FAILED: Connection not accepted"
    echo "========================================="
    echo ""
    echo "Your server is listening on port $PORT, but it did not accept the"
    echo "incoming connection."
    echo ""
    echo "Expected: The server should call accept() to receive the connection,"
    echo "then close it."
    echo ""
    echo "The accept() call pulls a pending connection from the OS queue and"
    echo "gives you a new socket for that client. Without it, the client is"
    echo "left hanging."
    echo ""
    echo "Make sure you are calling accept() on your listening socket."
    exit 1
fi
