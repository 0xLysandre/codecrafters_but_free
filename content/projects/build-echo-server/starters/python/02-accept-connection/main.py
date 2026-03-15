import socket


def main():
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_socket.bind(("127.0.0.1", 4221))
    server_socket.listen(1)

    print("Server listening on port 4221...")

    # TODO: Accept an incoming connection using server_socket.accept()
    # TODO: Print a message indicating a client connected (include the client's address)
    # TODO: Close the client connection
    # TODO: Close the server socket
    #
    # Hints:
    #   - .accept() returns (client_socket, client_address)
    #   - client_address is a tuple of (ip, port)
    #   - Don't forget to close both the client socket and the server socket


if __name__ == "__main__":
    main()
