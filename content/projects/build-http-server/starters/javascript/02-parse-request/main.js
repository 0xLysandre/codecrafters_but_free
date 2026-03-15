const net = require("net");

const server = net.createServer((socket) => {
  console.log(
    `Client connected: ${socket.remoteAddress}:${socket.remotePort}`
  );

  socket.on("data", (data) => {
    const request = data.toString();

    // TODO: Parse the HTTP request line from the received data
    // TODO: Extract the method (GET), path (/), and HTTP version (HTTP/1.1)
    // TODO: Send back a minimal valid HTTP response: "HTTP/1.1 200 OK\r\n\r\n"
    // TODO: Close the connection
    //
    // Hints:
    //   - The request line is the first line: request.split('\r\n')[0]
    //   - Split it on spaces: const [method, path, version] = requestLine.split(' ')
    //   - Use socket.write('HTTP/1.1 200 OK\r\n\r\n') to send the response
    //   - Use socket.end() to close the connection
    //   - HTTP uses \r\n (CRLF), not just \n
  });
});

server.listen(4221, "127.0.0.1", () => {
  console.log("HTTP server listening on port 4221...");
});
