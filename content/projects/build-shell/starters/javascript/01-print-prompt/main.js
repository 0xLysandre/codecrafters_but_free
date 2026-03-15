const readline = require("readline");

// TODO: Create a readline interface for reading from stdin
// TODO: Print the prompt "$ " to stdout
// TODO: When a line is received, print the prompt again
// TODO: When the input stream closes (EOF / Ctrl+D), exit with code 0
//
// Hints:
//   - Use readline.createInterface({ input: process.stdin, output: process.stdout })
//     OR create it with just input and handle prompting yourself
//   - Use process.stdout.write('$ ') to print without a trailing newline
//   - Listen for the 'line' event to handle each line of input
//   - Listen for the 'close' event to handle EOF
