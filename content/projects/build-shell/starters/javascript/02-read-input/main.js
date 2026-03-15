const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
});

process.stdout.write("$ ");

rl.on("line", (line) => {
  // TODO: Handle the input line
  // TODO: For now, print "<input>: command not found" for any input
  // TODO: Then print the prompt again
  //
  // Hints:
  //   - Use process.stdout.write() to print without a trailing newline
  //   - Print the "command not found" message:
  //     process.stdout.write(`${line}: command not found\n`)
  //   - After printing, show the prompt again with process.stdout.write('$ ')

  process.stdout.write("$ ");
});

rl.on("close", () => {
  process.exit(0);
});
