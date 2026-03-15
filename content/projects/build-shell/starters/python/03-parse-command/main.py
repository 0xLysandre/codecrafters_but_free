import sys


def main():
    while True:
        try:
            print("$ ", end="", flush=True)
            line = input()

            # TODO: Split the line into command and arguments
            # TODO: The first token is the command name
            # TODO: Print "<command>: command not found" (just the command, not the full line)
            # TODO: Handle empty input (user just pressed Enter) — skip to next prompt
            #
            # Hints:
            #   - Use line.split() to split on whitespace (handles multiple spaces)
            #   - parts[0] is the command, parts[1:] are the arguments
            #   - Check if parts is empty before accessing parts[0]
            #   - Example: "foo bar baz" → command="foo", args=["bar", "baz"]

        except EOFError:
            break


if __name__ == "__main__":
    main()
