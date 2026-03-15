const net = require("net");

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const request = data.toString();
    const lines = request.split("\r\n");

    // Parse the request line
    const requestLine = lines[0];
    const [method, path, version] = requestLine.split(" ");

    // TODO: Parse the HTTP headers from the request
    // TODO: Headers are on lines[1], lines[2], etc. until you hit an empty line
    // TODO: Each header is "Name: Value" — split on ": " (colon + space)
    // TODO: Store headers in an object (use lowercase keys for easy lookup)
    //
    // TODO: Implement the /echo/<string> endpoint:
    //   - If path starts with "/echo/", respond with everything after "/echo/"
    //   - Set Content-Type: text/plain and Content-Length headers
    //
    // TODO: Implement the /user-agent endpoint:
    //   - Respond with the value of the User-Agent header
    //
    // TODO: For all other paths, respond with "HTTP/1.1 200 OK\r\n\r\n"
    //
    // Hints:
    //   - To parse headers: for (let i = 1; i < lines.length; i++) { if (lines[i] === '') break; }
    //   - Split on ': ': const [key, ...rest] = line.split(': '); value = rest.join(': ')
    //   - Store as headers[key.toLowerCase()] = value
    //   - For /echo/: const body = path.slice(6)
    //   - Don't forget Content-Length must match the body's byte length

    socket.write("HTTP/1.1 200 OK\r\n\r\n");
    socket.end();
  });
});

server.listen(4221, "127.0.0.1", () => {
  console.log("HTTP server listening on port 4221...");
});
