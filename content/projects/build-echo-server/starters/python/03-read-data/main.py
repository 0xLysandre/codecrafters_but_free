import socket


def main():
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_socket.bind(("127.0.0.1", 4221))
    server_socket.listen(1)

    print("Server listening on port 4221...")

    conn, addr = server_socket.accept()
    print(f"Connected by {addr}")

    # TODO: Read data from the client connection
    # TODO: Print the received data to stdout
    # TODO: Close the connection
    #
    # Hints:
    #   - Use conn.recv(buffer_size) to read data. A buffer of 1024 bytes is fine.
    #   - recv() returns bytes. Use .decode() to convert to a string for printing.
    #   - Print the data exactly as received (use end='' and flush=True to avoid
    #     extra newlines and buffering issues)


if __name__ == "__main__":
    main()
