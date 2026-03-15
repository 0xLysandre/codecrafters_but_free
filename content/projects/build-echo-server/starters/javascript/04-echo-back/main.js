const net = require("net");

const server = net.createServer((socket) => {
  console.log(`Client connected: ${socket.remoteAddress}:${socket.remotePort}`);

  socket.on("data", (data) => {
    console.log(`Received: ${data.toString()}`);

    // TODO: Send the received data back to the client
    // TODO: Close the connection
    //
    // Hints:
    //   - Use socket.write(data) to send data back to the client
    //   - Call socket.end() after writing to close the connection gracefully
    //   - You can also use socket.end(data) to write and close in one call
  });
});

server.listen(4221, "127.0.0.1", () => {
  console.log("Server listening on port 4221...");
});
