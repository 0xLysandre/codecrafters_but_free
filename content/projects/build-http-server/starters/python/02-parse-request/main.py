import socket


def main():
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_socket.bind(("127.0.0.1", 4221))
    server_socket.listen(5)

    print("HTTP server listening on port 4221...")

    while True:
        conn, addr = server_socket.accept()
        print(f"Connected by {addr}")

        data = conn.recv(4096).decode()

        # TODO: Parse the HTTP request line from the received data
        # TODO: Extract the method (GET), path (/), and HTTP version (HTTP/1.1)
        # TODO: Send back a minimal valid HTTP response: "HTTP/1.1 200 OK\r\n\r\n"
        # TODO: Close the connection
        #
        # Hints:
        #   - The request line is the first line: data.split('\r\n')[0]
        #   - Split the request line on spaces: method, path, version = line.split(' ')
        #   - The response must end with \r\n\r\n (double CRLF)
        #   - Use conn.sendall(response.encode()) to send the response
        #   - HTTP uses \r\n (CRLF), not just \n

        conn.close()


if __name__ == "__main__":
    main()
