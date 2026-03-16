import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create projects
  await prisma.project.upsert({
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
      concepts: JSON.stringify([
        "TCP server programming",
        "Socket I/O",
        "Connection lifecycle",
        "Concurrent connections",
        "Graceful shutdown",
      ]),
    },
  });

  await prisma.project.upsert({
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
      concepts: JSON.stringify([
        "Process creation",
        "File descriptors",
        "Pipes and redirection",
        "Signal handling",
        "PATH resolution",
        "Command parsing",
      ]),
    },
  });

  await prisma.project.upsert({
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
      concepts: JSON.stringify([
        "HTTP/1.1 protocol",
        "Request parsing",
        "Content negotiation",
        "Gzip compression",
        "Keep-alive connections",
        "Static file serving",
      ]),
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
        { level: 1, text: "Look up how to create a TCP/socket server in your language. Key operations: create, bind, listen, accept." },
        { level: 2, text: "In Python: socket.socket(AF_INET, SOCK_STREAM), bind(('localhost', 4221)), listen(), accept()." },
        { level: 3, text: "1. Create TCP socket\n2. Set SO_REUSEADDR\n3. Bind to ('localhost', 4221)\n4. listen()\n5. accept()\n6. Close connection and socket" },
      ],
      conceptsTaught: ["TCP sockets", "Port binding", "Connection lifecycle"],
      testConfig: { timeout_seconds: 10, test_type: "integration", test_script: "01-bind-port.sh" },
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
        { level: 1, text: "Wrap your accept() call in an infinite loop." },
        { level: 2, text: "while True: conn, addr = server.accept(); conn.close()" },
        { level: 3, text: "Don't close the server socket inside the loop — only close client connections." },
      ],
      conceptsTaught: ["Connection loops", "Server lifecycle"],
      testConfig: { timeout_seconds: 10, test_type: "integration", test_script: "02-accept-connection.sh" },
    },
    {
      id: "echo-read-data",
      number: 3,
      title: "Read Data",
      narrative:
        "Now that your server can accept connections, it's time to read data from clients.",
      taskDescription:
        "Modify your server to:\n- Read data from each connected client\n- Read up to 1024 bytes at a time\n- Print the received data to stdout",
      hints: [
        { level: 1, text: "Use the recv() or read() method on the connection object." },
        { level: 2, text: "In Python: data = conn.recv(1024)" },
        { level: 3, text: "After accept(), call conn.recv(1024) and print the decoded data." },
      ],
      conceptsTaught: ["Socket reading", "Buffer sizes", "Data encoding"],
      testConfig: { timeout_seconds: 10, test_type: "integration", test_script: "03-read-data.sh" },
    },
    {
      id: "echo-back",
      number: 4,
      title: "Echo Data Back",
      narrative:
        "The core of an echo server: whatever data you receive, send it right back.",
      taskDescription:
        "Modify your server to:\n- Read data from the client\n- Send the exact same data back to the client\n- Continue reading until the client disconnects",
      hints: [
        { level: 1, text: "After receiving data, use send() or write() to send it back on the same connection." },
        { level: 2, text: "In Python: conn.sendall(data)" },
        { level: 3, text: "Loop: data = conn.recv(1024); if not data: break; conn.sendall(data)" },
      ],
      conceptsTaught: ["Socket writing", "Echo pattern", "Connection handling"],
      testConfig: { timeout_seconds: 10, test_type: "integration", test_script: "04-echo-back.sh" },
    },
    {
      id: "echo-multiple-clients",
      number: 5,
      title: "Handle Multiple Clients",
      narrative:
        "Your echo server works for one client, but what about multiple?",
      taskDescription:
        "Modify your server to:\n- Handle multiple clients sequentially\n- After one client disconnects, accept the next\n- Each client gets full echo functionality",
      hints: [
        { level: 1, text: "Use nested loops — outer loop accepts connections, inner loop handles each client." },
        { level: 2, text: "while True: conn = accept(); while True: data = recv(); if not data: break; sendall(data); close(conn)" },
        { level: 3, text: "Make sure to close the connection when the inner loop breaks." },
      ],
      conceptsTaught: ["Sequential client handling", "Connection management"],
      testConfig: { timeout_seconds: 10, test_type: "integration", test_script: "05-multiple-clients.sh" },
    },
    {
      id: "echo-concurrent",
      number: 6,
      title: "Handle Concurrent Clients",
      narrative:
        "Sequential handling means clients wait in line. Real servers handle many clients at once.",
      taskDescription:
        "Modify your server to:\n- Handle multiple clients simultaneously\n- Use threading, async, or multiprocessing\n- Each client gets independent echo functionality",
      hints: [
        { level: 1, text: "Spawn a new thread (or use async) for each accepted connection." },
        { level: 2, text: "In Python: threading.Thread(target=handle_client, args=(conn,)).start()" },
        { level: 3, text: "Create a handle_client(conn) function that does the recv/send loop, then spawn a thread for each accept()." },
      ],
      conceptsTaught: ["Concurrency", "Threading", "Async I/O"],
      testConfig: { timeout_seconds: 15, test_type: "integration", test_script: "06-concurrent.sh" },
    },
    {
      id: "echo-graceful-shutdown",
      number: 7,
      title: "Graceful Shutdown",
      narrative:
        "A well-behaved server shuts down cleanly when it receives SIGINT (Ctrl+C).",
      taskDescription:
        "Modify your server to:\n- Handle SIGINT signal\n- Stop accepting new connections\n- Wait for active connections to finish\n- Close the server socket and exit cleanly",
      hints: [
        { level: 1, text: "Register a signal handler for SIGINT that sets a shutdown flag." },
        { level: 2, text: "Use signal.signal(signal.SIGINT, handler) and a threading.Event() to coordinate shutdown." },
        { level: 3, text: "Set a global shutdown_event. In the accept loop, check shutdown_event.is_set()." },
      ],
      conceptsTaught: ["Signal handling", "Graceful shutdown", "Resource cleanup"],
      testConfig: { timeout_seconds: 15, test_type: "integration", test_script: "07-graceful-shutdown.sh" },
    },
    {
      id: "echo-stress-test",
      number: 8,
      title: "Stress Test",
      narrative:
        "Your echo server is feature-complete! This final stage stress tests it.",
      taskDescription:
        "Your server must:\n- Handle 100 concurrent connections\n- Echo data correctly for all connections\n- Not crash or leak resources\n- Complete within the time limit",
      hints: [
        { level: 1, text: "Make sure your threading/async approach can scale to 100 connections." },
        { level: 2, text: "Consider using a thread pool or async I/O to avoid creating too many threads." },
        { level: 3, text: "Use concurrent.futures.ThreadPoolExecutor or asyncio for better scalability." },
      ],
      conceptsTaught: ["Load testing", "Scalability", "Resource management"],
      testConfig: { timeout_seconds: 30, test_type: "integration", test_script: "08-stress-test.sh" },
    },
  ];

  for (const stage of echoStages) {
    await prisma.stage.upsert({
      where: { id: stage.id },
      update: {},
      create: {
        id: stage.id,
        projectId: "build-echo-server",
        number: stage.number,
        title: stage.title,
        narrative: stage.narrative,
        taskDescription: stage.taskDescription,
        hints: JSON.stringify(stage.hints),
        testConfig: JSON.stringify(stage.testConfig),
        conceptsTaught: JSON.stringify(stage.conceptsTaught),
      },
    });
  }

  // Create starter code for Echo Server Stage 1
  await prisma.starterCode.upsert({
    where: { stageId_language: { stageId: "echo-bind-port", language: "python" } },
    update: {},
    create: {
      stageId: "echo-bind-port",
      language: "python",
      files: JSON.stringify({
        "main.py": 'import socket\n\n\ndef main():\n    # TODO: Create a TCP server that binds to port 4221\n    # and accepts at least one incoming connection.\n    #\n    # Steps:\n    # 1. Create a TCP socket\n    # 2. Bind it to ("localhost", 4221)\n    # 3. Start listening for connections\n    # 4. Accept a connection\n    # 5. Close the connection\n    print("Server starting...")\n\n\nif __name__ == "__main__":\n    main()\n',
      }),
    },
  });

  await prisma.starterCode.upsert({
    where: { stageId_language: { stageId: "echo-bind-port", language: "javascript" } },
    update: {},
    create: {
      stageId: "echo-bind-port",
      language: "javascript",
      files: JSON.stringify({
        "main.js": 'const net = require("net");\n\nfunction main() {\n  // TODO: Create a TCP server that binds to port 4221\n  // and accepts at least one incoming connection.\n  console.log("Server starting...");\n}\n\nmain();\n',
      }),
    },
  });

  await prisma.starterCode.upsert({
    where: { stageId_language: { stageId: "echo-bind-port", language: "c" } },
    update: {},
    create: {
      stageId: "echo-bind-port",
      language: "c",
      files: JSON.stringify({
        "main.c": '#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n#include <sys/socket.h>\n#include <netinet/in.h>\n#include <unistd.h>\n\nint main() {\n    // TODO: Create a TCP server that binds to port 4221\n    // and accepts at least one incoming connection.\n    //\n    // Steps:\n    // 1. Create a TCP socket with socket(AF_INET, SOCK_STREAM, 0)\n    // 2. Set SO_REUSEADDR with setsockopt()\n    // 3. Bind to port 4221 with bind()\n    // 4. Listen with listen()\n    // 5. Accept a connection with accept()\n    // 6. Close the connection and socket\n    printf("Server starting...\\n");\n    return 0;\n}\n',
      }),
    },
  });

  // ── Shell project stages ─────────────────────────────────────────

  const shellStages = [
    {
      id: "shell-print-prompt",
      number: 1,
      title: "Print a Prompt",
      narrative:
        "Every shell begins with a prompt — that little marker that tells you the shell is ready for input. It might be a simple \"$ \" or something elaborate, but it signals: \"I'm listening.\"",
      taskDescription:
        "Create a program that:\n- Prints a shell prompt (\"$ \")\n- Waits for user input\n- Exits after receiving one line of input",
      hints: [
        { level: 1, text: "Print \"$ \" to stdout (without a newline), then read a line from stdin." },
        { level: 2, text: "In C: printf(\"$ \"); then use fgets() or getline() to read input." },
        { level: 3, text: "printf(\"$ \"); fflush(stdout); char buf[1024]; fgets(buf, sizeof(buf), stdin);" },
      ],
      conceptsTaught: ["Standard I/O", "Prompts", "User input"],
      testConfig: { timeout_seconds: 10, test_type: "integration", test_script: "01-print-prompt.sh" },
    },
    {
      id: "shell-repl",
      number: 2,
      title: "Read-Eval-Print Loop",
      narrative:
        "A shell that quits after one command isn't very useful. Real shells run in a loop: print prompt, read input, process it, repeat. This is the REPL — Read, Eval, Print, Loop.",
      taskDescription:
        "Modify your shell to:\n- Print the prompt repeatedly\n- Read user input in a loop\n- Echo the input back (for now)\n- Exit when the user types \"exit 0\"",
      hints: [
        { level: 1, text: "Wrap your prompt + read in a while loop. Check if the input is \"exit 0\" to break." },
        { level: 2, text: "while (1) { printf(\"$ \"); read input; if input == \"exit 0\": break; print input; }" },
        { level: 3, text: "Remember to strip the trailing newline from fgets() input before comparing." },
      ],
      conceptsTaught: ["REPL pattern", "Loop control", "String comparison"],
      testConfig: { timeout_seconds: 10, test_type: "integration", test_script: "02-repl.sh" },
    },
    {
      id: "shell-run-program",
      number: 3,
      title: "Run a Program",
      narrative:
        "The core job of a shell is to run programs. When you type \"ls\" or \"cat\", the shell creates a new process, executes the program, and waits for it to finish.",
      taskDescription:
        "Modify your shell to:\n- Parse the command name and arguments\n- Search for the program in PATH\n- Execute it using fork() and exec()\n- Wait for the program to finish\n- Print an error if the command is not found",
      hints: [
        { level: 1, text: "Use fork() to create a child process, then execvp() to run the command in the child." },
        { level: 2, text: "Split the input into tokens (command + args). In the child: execvp(args[0], args). In the parent: waitpid()." },
        { level: 3, text: "Use strtok() to split input. fork() returns 0 in child. Call execvp() in child, waitpid() in parent. If execvp fails, print \"command not found\"." },
      ],
      conceptsTaught: ["fork()", "exec()", "waitpid()", "PATH resolution"],
      testConfig: { timeout_seconds: 10, test_type: "integration", test_script: "03-run-program.sh" },
    },
    {
      id: "shell-builtins",
      number: 4,
      title: "Built-in Commands",
      narrative:
        "Some commands can't be external programs — they need to modify the shell's own state. \"cd\" changes the shell's working directory, \"exit\" terminates the shell. These are built-in commands.",
      taskDescription:
        "Add these built-in commands:\n- \"exit <code>\" — exit the shell with the given status code\n- \"echo <text>\" — print the arguments\n- \"type <cmd>\" — print whether a command is a builtin or where it's found in PATH\n- \"cd <dir>\" — change the working directory",
      hints: [
        { level: 1, text: "Before trying fork/exec, check if the command matches a builtin name." },
        { level: 2, text: "For cd: use chdir(). For type: check builtins first, then search PATH directories." },
        { level: 3, text: "Check command against builtin list. For 'type': if builtin print 'is a shell builtin', else search each PATH dir for the executable." },
      ],
      conceptsTaught: ["Built-in commands", "chdir()", "PATH searching"],
      testConfig: { timeout_seconds: 10, test_type: "integration", test_script: "04-builtins.sh" },
    },
    {
      id: "shell-quoting",
      number: 5,
      title: "Quoting & Escaping",
      narrative:
        "What happens when you type: echo \"hello   world\"? Without proper quoting support, the shell would treat each space-separated word as a separate argument. Quoting lets users pass arguments containing spaces and special characters.",
      taskDescription:
        "Add support for:\n- Single quotes: preserve everything literally\n- Double quotes: preserve spaces, allow some escapes\n- Backslash: escape the next character",
      hints: [
        { level: 1, text: "Write a custom tokenizer instead of using simple strtok(). Track whether you're inside quotes." },
        { level: 2, text: "Walk through the input char by char. If you see a quote, toggle quote mode and don't split on spaces until the closing quote." },
        { level: 3, text: "Single quotes: copy everything verbatim until closing quote. Double quotes: handle \\\\, \\\", \\$, \\n. Backslash outside quotes: skip backslash, copy next char." },
      ],
      conceptsTaught: ["Lexical analysis", "Quoting rules", "Escape sequences"],
      testConfig: { timeout_seconds: 10, test_type: "integration", test_script: "05-quoting.sh" },
    },
    {
      id: "shell-redirections",
      number: 6,
      title: "Redirections",
      narrative:
        "Redirections let you control where a program's input and output go. \"ls > file.txt\" sends output to a file instead of the terminal. This is one of the most powerful features of Unix shells.",
      taskDescription:
        "Add support for:\n- Output redirection: cmd > file (truncate)\n- Append redirection: cmd >> file\n- Input redirection: cmd < file\n- Stderr redirection: cmd 2> file",
      hints: [
        { level: 1, text: "After parsing, look for >, >>, <, 2> tokens. Open the target file and use dup2() to redirect." },
        { level: 2, text: "In the child process (after fork, before exec): open() the file, then dup2(fd, STDOUT_FILENO) for >, or dup2(fd, STDIN_FILENO) for <." },
        { level: 3, text: "Parse redirections from the arg list. For >: open(file, O_WRONLY|O_CREAT|O_TRUNC, 0644), dup2(fd, 1). For >>: use O_APPEND. For 2>: dup2(fd, 2). For <: open O_RDONLY, dup2(fd, 0)." },
      ],
      conceptsTaught: ["File descriptors", "dup2()", "I/O redirection"],
      testConfig: { timeout_seconds: 10, test_type: "integration", test_script: "06-redirections.sh" },
    },
    {
      id: "shell-pipes",
      number: 7,
      title: "Pipes",
      narrative:
        "Pipes connect the output of one program to the input of another: \"cat file | grep pattern | wc -l\". This is the Unix philosophy in action — small programs composed together.",
      taskDescription:
        "Add support for:\n- Single pipes: cmd1 | cmd2\n- Multiple pipes: cmd1 | cmd2 | cmd3\n- Pipes combined with redirections",
      hints: [
        { level: 1, text: "Split the command line on | characters. For each pair, use pipe() to create a pipe, fork both processes, and connect them with dup2()." },
        { level: 2, text: "For cmd1 | cmd2: pipe(fds), fork cmd1 with dup2(fds[1], STDOUT), fork cmd2 with dup2(fds[0], STDIN), close unused ends, waitpid both." },
        { level: 3, text: "For N commands: create N-1 pipes. For command i: if i > 0, dup2(pipes[i-1][0], STDIN). If i < N-1, dup2(pipes[i][1], STDOUT). Close all pipe fds in all processes." },
      ],
      conceptsTaught: ["pipe()", "Process pipelines", "Unix philosophy"],
      testConfig: { timeout_seconds: 15, test_type: "integration", test_script: "07-pipes.sh" },
    },
  ];

  for (const stage of shellStages) {
    await prisma.stage.upsert({
      where: { id: stage.id },
      update: {},
      create: {
        id: stage.id,
        projectId: "build-shell",
        number: stage.number,
        title: stage.title,
        narrative: stage.narrative,
        taskDescription: stage.taskDescription,
        hints: JSON.stringify(stage.hints),
        testConfig: JSON.stringify(stage.testConfig),
        conceptsTaught: JSON.stringify(stage.conceptsTaught),
      },
    });
  }

  // Shell starter code — Stage 1 in multiple languages
  await prisma.starterCode.upsert({
    where: { stageId_language: { stageId: "shell-print-prompt", language: "c" } },
    update: {},
    create: {
      stageId: "shell-print-prompt",
      language: "c",
      files: JSON.stringify({
        "main.c": '#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n\nint main() {\n    // TODO: Print a shell prompt and wait for input.\n    //\n    // Steps:\n    // 1. Print "$ " to stdout (no newline)\n    // 2. Flush stdout\n    // 3. Read a line of input from stdin\n    printf("Server starting...\\n");\n    return 0;\n}\n',
      }),
    },
  });

  await prisma.starterCode.upsert({
    where: { stageId_language: { stageId: "shell-print-prompt", language: "python" } },
    update: {},
    create: {
      stageId: "shell-print-prompt",
      language: "python",
      files: JSON.stringify({
        "main.py": 'import sys\n\n\ndef main():\n    # TODO: Print a shell prompt and wait for input.\n    #\n    # Steps:\n    # 1. Print "$ " to stdout (no newline)\n    # 2. Flush stdout\n    # 3. Read a line of input from stdin\n    pass\n\n\nif __name__ == "__main__":\n    main()\n',
      }),
    },
  });

  await prisma.starterCode.upsert({
    where: { stageId_language: { stageId: "shell-print-prompt", language: "javascript" } },
    update: {},
    create: {
      stageId: "shell-print-prompt",
      language: "javascript",
      files: JSON.stringify({
        "main.js": 'const readline = require("readline");\n\nfunction main() {\n  // TODO: Print a shell prompt and wait for input.\n  //\n  // Steps:\n  // 1. Print "$ " to stdout (no newline)\n  // 2. Read a line of input from stdin\n  console.log("Starting...");\n}\n\nmain();\n',
      }),
    },
  });

  // Create badges
  const badges = [
    { id: "echo-chamber", title: "Echo Chamber", description: "Complete Build Your Own Echo Server", icon: "📡", criteriaType: "project_complete", criteriaConfig: JSON.stringify({ projectId: "build-echo-server" }) },
    { id: "shell-shocked", title: "Shell Shocked", description: "Complete Build Your Own Shell", icon: "🐚", criteriaType: "project_complete", criteriaConfig: JSON.stringify({ projectId: "build-shell" }) },
    { id: "web-weaver", title: "Web Weaver", description: "Complete Build Your Own HTTP Server", icon: "🕸️", criteriaType: "project_complete", criteriaConfig: JSON.stringify({ projectId: "build-http-server" }) },
    { id: "polyglot", title: "Polyglot", description: "Complete any project in 3+ languages", icon: "🌍", criteriaType: "meta", criteriaConfig: JSON.stringify({ type: "multi_language", count: 3 }) },
    { id: "speed-demon", title: "Speed Demon", description: "Complete any project in under 2 hours", icon: "⚡", criteriaType: "meta", criteriaConfig: JSON.stringify({ type: "speed", maxHours: 2 }) },
    { id: "streak-master", title: "Streak Master", description: "Maintain a 30-day streak", icon: "🔥", criteriaType: "meta", criteriaConfig: JSON.stringify({ type: "streak", days: 30 }) },
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
