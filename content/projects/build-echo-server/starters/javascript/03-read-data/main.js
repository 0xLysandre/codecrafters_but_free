const net = require("net");

const server = net.createServer((socket) => {
  console.log(`Client connected: ${socket.remoteAddress}:${socket.remotePort}`);

  // TODO: Listen for incoming data from the client
  // TODO: Print the received data to stdout
  // TODO: Close the connection after reading
  //
  // Hints:
  //   - Use socket.on('data', callback) to listen for incoming data
  //   - The callback receives a Buffer object — use .toString() to convert it
  //   - Use process.stdout.write() instead of console.log() to avoid extra newlines
  //   - Call socket.end() when you're done
});

server.listen(4221, "127.0.0.1", () => {
  console.log("Server listening on port 4221...");
});
