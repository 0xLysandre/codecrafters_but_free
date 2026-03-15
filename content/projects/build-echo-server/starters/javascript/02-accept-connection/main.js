const net = require("net");

// The server is created for you. Your job: handle the incoming connection.
const server = net.createServer((socket) => {
  // TODO: This callback fires when a client connects.
  // TODO: Print a message indicating a client connected (use socket.remoteAddress and socket.remotePort)
  // TODO: Close the connection by calling socket.end()
  //
  // Hints:
  //   - socket.remoteAddress gives the client's IP
  //   - socket.remotePort gives the client's port
  //   - socket.end() gracefully closes the connection
});

server.listen(4221, "127.0.0.1", () => {
  console.log("Server listening on port 4221...");
});
