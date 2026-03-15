import sys


def main():
    while True:
        try:
            print("$ ", end="", flush=True)
            line = input()

            # TODO: Handle the input line
            # TODO: For now, print "<input>: command not found" for any input
            #
            # Hints:
            #   - The variable `line` contains what the user typed (without newline)
            #   - Print the "command not found" message using an f-string:
            #     print(f"{line}: command not found")
            #   - Don't forget to handle empty input (just pressing Enter)

        except EOFError:
            break


if __name__ == "__main__":
    main()
