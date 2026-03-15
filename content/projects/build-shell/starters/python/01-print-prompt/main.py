import sys


def main():
    # TODO: Implement a REPL (Read-Eval-Print Loop)
    # TODO: Print the prompt "$ " (dollar sign + space) to stdout
    # TODO: Wait for a line of input
    # TODO: After receiving input, print the prompt again
    # TODO: Exit cleanly when you receive EOF (Ctrl+D)
    #
    # Hints:
    #   - Use print("$ ", end="", flush=True) to print the prompt without a newline
    #   - The flush=True is important! Without it, the prompt may not appear
    #     when stdout is piped (not connected to a terminal)
    #   - Use input() to read a line — it raises EOFError on EOF
    #   - Wrap everything in a while True loop with a try/except for EOFError
    pass


if __name__ == "__main__":
    main()
