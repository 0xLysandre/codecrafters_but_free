import socket


def main():
    # TODO: Create a TCP socket
    # TODO: Set SO_REUSEADDR so you can restart the server quickly
    # TODO: Bind the socket to 127.0.0.1 on port 4221
    # TODO: Start listening for connections
    # TODO: Keep the server running
    #
    # This is the same as the echo server's first stage.
    # An HTTP server is just a TCP server that speaks the HTTP protocol.
    #
    # Hints:
    #   - socket.socket(socket.AF_INET, socket.SOCK_STREAM) creates a TCP socket
    #   - .setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1) lets you rebind quickly
    #   - .bind(('127.0.0.1', 4221)) binds to localhost port 4221
    #   - .listen(5) starts listening with a backlog of 5
    pass


if __name__ == "__main__":
    main()
