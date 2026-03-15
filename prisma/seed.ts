import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create projects
  const echoServer = await prisma.project.upsert({
    where: { id: "build-echo-server" },
    update: {},
    create: {
      id: "build-echo-server",
      title: "Build Your Own Echo Server",
      slug: "echo-server",
      description:
        "Build a TCP echo server that accepts connections, reads incoming data, and echoes it back to clients. Learn the fundamentals of network programming.",
      difficulty: "beginner",
      estimatedHours: 6,
      icon: "radio",
      displayOrder: 1,
      concepts: [
        "TCP server programming",
        "Socket I/O",
        "Connection lifecycle",
        "Concurrent connections",
        "Graceful shutdown",
      ],
    },
  });

  const shell = await prisma.project.upsert({
    where: { id: "build-shell" },
    update: {},
    create: {
      id: "build-shell",
      title: "Build Your Own Shell",
      slug: "shell",
      description:
        "Build a Unix shell that reads commands, parses arguments, executes programs, and handles pipes and redirections. Demystify the terminal.",
      difficulty: "beginner",
      estimatedHours: 10,
      icon: "terminal",
      displayOrder: 2,
      concepts: [
        "Process creation",
        "File descriptors",
        "Pipes and redirection",
        "Signal handling",
        "PATH resolution",
        "Command parsing",
      ],
    },
  });

  const httpServer = await prisma.project.upsert({
    where: { id: "build-http-server" },
    update: {},
    create: {
      id: "build-http-server",
      title: "Build Your Own HTTP Server",
      slug: "http-server",
      description:
        "Build a full HTTP/1.1 server from scratch with request parsing, URL routing, static file serving, compression, and persistent connections.",
      difficulty: "intermediate",
      estimatedHours: 12,
      icon: "globe",
      displayOrder: 4,
      concepts: [
        "HTTP/1.1 protocol",
        "Request parsing",
        "Content negotiation",
        "Gzip compression",
        "Keep-alive connections",
        "Static file serving",
      ],
    },
  });

  // HTTP Server requires Echo Server
  await prisma.projectPrerequisite.upsert({
    where: {
      projectId_prerequisiteId: {
        projectId: "build-http-server",
        prerequisiteId: "build-echo-server",
      },
    },
    update: {},
    create: {
      projectId: "build-http-server",
      prerequisiteId: "build-echo-server",
    },
  });

  // Create Echo Server stages
  const echoStages = [
    {
      id: "echo-bind-port",
      number: 1,
      title: "Bind to a Port",
      narrative:
        "Every network server starts by claiming a port number and listening for connections. Your echo server will bind to port 4221.",
      taskDescription:
        "Create a TCP server that:\n- Binds to port 4221 on localhost\n- Listens for incoming connections\n- Accepts at least one TCP connection\n- Closes the connection gracefully",
      hints: [
        {
          level: 1,
          text: "Look up how to create a TCP/socket server in your language. Key operations: create, bind, listen, accept.",
        },
        {
          level: 2,
          text: "In Python: socket.socket(AF_INET, SOCK_STREAM), bind(('localhost', 4221)), listen(), accept().",
        },
        {
          level: 3,
          text: "1. Create TCP socket\n2. Set SO_REUSEADDR\n3. Bind to ('localhost', 4221)\n4. listen()\n5. accept()\n6. Close connection and socket",
        },
      ],
      conceptsTaught: ["TCP sockets", "Port binding", "Connection lifecycle"],
      testConfig: {
        timeout_seconds: 10,
        test_type: "integration",
        test_script: "01-bind-port.sh",
      },
    },
    {
      id: "echo-accept-connection",
      number: 2,
      title: "Accept a Connection",
      narrative:
        "A real server stays alive and handles multiple connections over time. Modify your server to accept connections in a loop.",
      taskDescription:
        "Modify your server to:\n- Accept connections in a loop\n- Print a message when a client connects\n- Close each connection\n- Keep the server running",
      hints: [
        {
          level: 1,
          text: "Wrap your accept() call in an infinite loop.",
        },
        {
          level: 2,
          text: "while True: conn, addr = server.accept(); conn.close()",
        },
        {
          level: 3,
          text: "Don't close the server socket inside the loop — only close client connections.",
        },
      ],
      conceptsTaught: ["Connection loops", "Server lifecycle"],
      testConfig: {
        timeout_seconds: 10,
        test_type: "integration",
        test_script: "02-accept-connection.sh",
      },
    },
    {
      id: "echo-read-data",
      number: 3,
      title: "Read Data",
      narrative:
        "Now that your server can accept connections, it's time to read data from clients. When a client sends data over TCP, your server needs to read it from the connection.",
      taskDescription:
        "Modify your server to:\n- Read data from each connected client\n- Read up to 1024 bytes at a time\n- Print the received data to stdout",
      hints: [
        {
          level: 1,
          text: "Use the recv() or read() method on the connection object.",
        },
        {
          level: 2,
          text: "In Python: data = conn.recv(1024)",
        },
        {
          level: 3,
          text: "After accept(), call conn.recv(1024) and print the decoded data.",
        },
      ],
      conceptsTaught: ["Socket reading", "Buffer sizes", "Data encoding"],
      testConfig: {
        timeout_seconds: 10,
        test_type: "integration",
        test_script: "03-read-data.sh",
      },
    },
    {
      id: "echo-back",
      number: 4,
      title: "Echo Data Back",
      narrative:
        "The core of an echo server: whatever data you receive, send it right back. This completes the basic echo functionality.",
      taskDescription:
        "Modify your server to:\n- Read data from the client\n- Send the exact same data back to the client\n- Continue reading until the client disconnects",
      hints: [
        {
          level: 1,
          text: "After receiving data, use send() or write() to send it back on the same connection.",
        },
        {
          level: 2,
          text: "In Python: conn.sendall(data)",
        },
        {
          level: 3,
          text: "Loop: data = conn.recv(1024); if not data: break; conn.sendall(data)",
        },
      ],
      conceptsTaught: ["Socket writing", "Echo pattern", "Connection handling"],
      testConfig: {
        timeout_seconds: 10,
        test_type: "integration",
        test_script: "04-echo-back.sh",
      },
    },
    {
      id: "echo-multiple-clients",
      number: 5,
      title: "Handle Multiple Clients",
      narrative:
        "Your echo server works for one client, but what about multiple? Currently, the second client has to wait for the first to disconnect.",
      taskDescription:
        "Modify your server to:\n- Handle multiple clients sequentially\n- After one client disconnects, accept the next\n- Each client gets full echo functionality",
      hints: [
        {
          level: 1,
          text: "Use nested loops — outer loop accepts connections, inner loop handles each client.",
        },
        {
          level: 2,
          text: "while True: conn = accept(); while True: data = recv(); if not data: break; sendall(data); close(conn)",
        },
        { level: 3, text: "Make sure to close the connection when the inner loop breaks (client disconnected)." },
      ],
      conceptsTaught: ["Sequential client handling", "Connection management"],
      testConfig: {
        timeout_seconds: 10,
        test_type: "integration",
        test_script: "05-multiple-clients.sh",
      },
    },
    {
      id: "echo-concurrent",
      number: 6,
      title: "Handle Concurrent Clients",
      narrative:
        "Sequential handling means clients wait in line. Real servers handle many clients at once using threads, async I/O, or multiple processes.",
      taskDescription:
        "Modify your server to:\n- Handle multiple clients simultaneously\n- Use threading, async, or multiprocessing\n- Each client gets independent echo functionality",
      hints: [
        {
          level: 1,
          text: "Spawn a new thread (or use async) for each accepted connection.",
        },
        {
          level: 2,
          text: "In Python: threading.Thread(target=handle_client, args=(conn,)).start()",
        },
        {
          level: 3,
          text: "Create a handle_client(conn) function that does the recv/send loop, then spawn a thread for each accept().",
        },
      ],
      conceptsTaught: ["Concurrency", "Threading", "Async I/O"],
      testConfig: {
        timeout_seconds: 15,
        test_type: "integration",
        test_script: "06-concurrent.sh",
      },
    },
    {
      id: "echo-graceful-shutdown",
      number: 7,
      title: "Graceful Shutdown",
      narrative:
        "A well-behaved server shuts down cleanly when it receives SIGINT (Ctrl+C). It should stop accepting new connections and finish serving existing ones.",
      taskDescription:
        "Modify your server to:\n- Handle SIGINT signal\n- Stop accepting new connections\n- Wait for active connections to finish\n- Close the server socket and exit cleanly",
      hints: [
        {
          level: 1,
          text: "Register a signal handler for SIGINT that sets a shutdown flag.",
        },
        {
          level: 2,
          text: "Use signal.signal(signal.SIGINT, handler) and a threading.Event() to coordinate shutdown.",
        },
        {
          level: 3,
          text: "Set a global shutdown_event. In the accept loop, check shutdown_event.is_set(). In the handler, set the event and close the server socket.",
        },
      ],
      conceptsTaught: ["Signal handling", "Graceful shutdown", "Resource cleanup"],
      testConfig: {
        timeout_seconds: 15,
        test_type: "integration",
        test_script: "07-graceful-shutdown.sh",
      },
    },
    {
      id: "echo-stress-test",
      number: 8,
      title: "Stress Test",
      narrative:
        "Your echo server is feature-complete! This final stage stress tests it with many concurrent connections to ensure stability.",
      taskDescription:
        "Your server must:\n- Handle 100 concurrent connections\n- Echo data correctly for all connections\n- Not crash or leak resources\n- Complete within the time limit",
      hints: [
        {
          level: 1,
          text: "Make sure your threading/async approach can scale to 100 connections.",
        },
        {
          level: 2,
          text: "Consider using a thread pool or async I/O to avoid creating too many threads.",
        },
        {
          level: 3,
          text: "Use concurrent.futures.ThreadPoolExecutor or asyncio for better scalability.",
        },
      ],
      conceptsTaught: ["Load testing", "Scalability", "Resource management"],
      testConfig: {
        timeout_seconds: 30,
        test_type: "integration",
        test_script: "08-stress-test.sh",
      },
    },
  ];

  for (const stage of echoStages) {
    await prisma.stage.upsert({
      where: { id: stage.id },
      update: {},
      create: {
        ...stage,
        projectId: "build-echo-server",
        referenceMaterial: undefined,
      },
    });
  }

  // Create starter code for Echo Server Stage 1
  await prisma.starterCode.upsert({
    where: {
      stageId_language: { stageId: "echo-bind-port", language: "python" },
    },
    update: {},
    create: {
      stageId: "echo-bind-port",
      language: "python",
      files: {
        "main.py": `import socket\n\n\ndef main():\n    # TODO: Create a TCP server that binds to port 4221\n    # and accepts at least one incoming connection.\n    #\n    # Steps:\n    # 1. Create a TCP socket\n    # 2. Bind it to ("localhost", 4221)\n    # 3. Start listening for connections\n    # 4. Accept a connection\n    # 5. Close the connection\n    print("Server starting...")\n\n\nif __name__ == "__main__":\n    main()\n`,
      },
      buildCommand: null,
    },
  });

  await prisma.starterCode.upsert({
    where: {
      stageId_language: { stageId: "echo-bind-port", language: "javascript" },
    },
    update: {},
    create: {
      stageId: "echo-bind-port",
      language: "javascript",
      files: {
        "main.js": `const net = require("net");\n\nfunction main() {\n  // TODO: Create a TCP server that binds to port 4221\n  // and accepts at least one incoming connection.\n  //\n  // Steps:\n  // 1. Create a TCP server using net.createServer()\n  // 2. Listen on port 4221\n  // 3. Handle the "connection" event\n  // 4. Close the connection when done\n  console.log("Server starting...");\n}\n\nmain();\n`,
      },
      buildCommand: null,
    },
  });

  // Create badges
  const badges = [
    {
      id: "echo-chamber",
      title: "Echo Chamber",
      description: "Complete Build Your Own Echo Server",
      icon: "📡",
      criteriaType: "project_complete" as const,
      criteriaConfig: { projectId: "build-echo-server" },
    },
    {
      id: "shell-shocked",
      title: "Shell Shocked",
      description: "Complete Build Your Own Shell",
      icon: "🐚",
      criteriaType: "project_complete" as const,
      criteriaConfig: { projectId: "build-shell" },
    },
    {
      id: "web-weaver",
      title: "Web Weaver",
      description: "Complete Build Your Own HTTP Server",
      icon: "🕸️",
      criteriaType: "project_complete" as const,
      criteriaConfig: { projectId: "build-http-server" },
    },
    {
      id: "polyglot",
      title: "Polyglot",
      description: "Complete any project in 3+ languages",
      icon: "🌍",
      criteriaType: "meta" as const,
      criteriaConfig: { type: "multi_language", count: 3 },
    },
    {
      id: "speed-demon",
      title: "Speed Demon",
      description: "Complete any project in under 2 hours",
      icon: "⚡",
      criteriaType: "meta" as const,
      criteriaConfig: { type: "speed", maxHours: 2 },
    },
    {
      id: "streak-master",
      title: "Streak Master",
      description: "Maintain a 30-day streak",
      icon: "🔥",
      criteriaType: "meta" as const,
      criteriaConfig: { type: "streak", days: 30 },
    },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { id: badge.id },
      update: {},
      create: badge,
    });
  }

  console.log("Seed complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
