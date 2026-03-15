import socket


def main():
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_socket.bind(("127.0.0.1", 4221))
    server_socket.listen(1)

    print("Server listening on port 4221...")

    conn, addr = server_socket.accept()
    print(f"Connected by {addr}")

    data = conn.recv(1024)
    print(f"Received: {data.decode()}", end="", flush=True)

    # TODO: Send the received data back to the client
    # TODO: Close the connection
    #
    # Hints:
    #   - Use conn.sendall(data) to send ALL the data back reliably
    #   - sendall() is preferred over send() because send() might not write
    #     all the bytes in one call
    #   - Close the connection with conn.close() after sending


if __name__ == "__main__":
    main()
