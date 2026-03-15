const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
});

process.stdout.write("$ ");

rl.on("line", (line) => {
  // TODO: Split the line into command and arguments
  // TODO: The first token is the command name
  // TODO: Print "<command>: command not found" (just the command, not the full line)
  // TODO: Handle empty input (user just pressed Enter) — skip to next prompt
  //
  // Hints:
  //   - Use line.trim().split(/\s+/) to split on whitespace
  //   - parts[0] is the command, parts.slice(1) are the arguments
  //   - Check for empty input: if (parts.length === 0 || parts[0] === '')
  //   - Example: "foo bar baz" → command="foo", args=["bar", "baz"]

  process.stdout.write("$ ");
});

rl.on("close", () => {
  process.exit(0);
});
