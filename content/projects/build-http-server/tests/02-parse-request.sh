#!/bin/bash
#
# Test: HTTP Server — Stage 2: Parse the Request Line
#
# Verifies that the server accepts an HTTP request and responds with 200 OK.
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
    echo "This test requires a working Stage 1 (Bind to a Port)."
    exit 1
fi

# --- Test 1: Send GET / and check for 200 OK ---
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 http://127.0.0.1:$PORT/ 2>/dev/null) || true

if [ "$RESPONSE" = "200" ]; then
    echo "  [PASS] GET / returns HTTP 200"
else
    echo ""
    echo "========================================="
    echo "  TEST FAILED: Expected HTTP 200 response"
    echo "========================================="
    echo ""
    echo "Sent:     GET / HTTP/1.1"
    echo "Expected: HTTP/1.1 200 OK"
    echo "Got:      HTTP status $RESPONSE"
    echo ""
    if [ -z "$RESPONSE" ] || [ "$RESPONSE" = "000" ]; then
        echo "Your server accepted the connection but did not send a valid HTTP"
        echo "response. The client received nothing or the response was malformed."
        echo ""
        echo "A minimal valid HTTP response is exactly:"
        echo "  HTTP/1.1 200 OK\\r\\n\\r\\n"
        echo ""
        echo "Note the \\r\\n (CRLF) line endings — HTTP requires carriage return"
        echo "followed by newline, not just newline."
    else
        echo "Your server sent an HTTP response, but with the wrong status code."
        echo ""
        echo "For this stage, respond to every request with 200 OK."
    fi
    echo ""
    echo "Tip: Use curl -v http://127.0.0.1:$PORT/ to see the full request"
    echo "and response for debugging."
    exit 1
fi

# --- Test 2: Send GET /any-path and check for 200 ---
RESPONSE2=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 http://127.0.0.1:$PORT/some/path 2>/dev/null) || true

if [ "$RESPONSE2" = "200" ]; then
    echo "  [PASS] GET /some/path returns HTTP 200"
else
    echo ""
    echo "========================================="
    echo "  TEST FAILED: Non-root path did not return 200"
    echo "========================================="
    echo ""
    echo "Sent:     GET /some/path HTTP/1.1"
    echo "Expected: HTTP/1.1 200 OK"
    echo "Got:      HTTP status $RESPONSE2"
    echo ""
    echo "For this stage, your server should return 200 OK for ALL paths."
    echo "We'll add proper routing and 404 handling in later stages."
    exit 1
fi

# --- Test 3: Verify the response is valid HTTP (has proper status line) ---
RAW_RESPONSE=$(printf "GET / HTTP/1.1\r\nHost: localhost\r\n\r\n" | nc -w 3 127.0.0.1 $PORT 2>/dev/null) || true

if echo "$RAW_RESPONSE" | head -1 | grep -q "HTTP/1.1 200"; then
    echo "  [PASS] Response has valid HTTP/1.1 status line"
else
    echo ""
    echo "========================================="
    echo "  TEST WARNING: Response may have issues"
    echo "========================================="
    echo ""
    echo "Raw response first line: $(echo "$RAW_RESPONSE" | head -1 | cat -v)"
    echo "Expected: HTTP/1.1 200 OK"
    echo ""
    echo "Make sure your response starts with exactly \"HTTP/1.1 200 OK\\r\\n\"."
fi

echo ""
echo "========================================="
echo "  ALL TESTS PASSED"
echo "========================================="
echo ""
echo "Your HTTP server correctly parses requests and responds with 200 OK."
exit 0
