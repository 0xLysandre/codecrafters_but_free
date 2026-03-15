import socket


def main():
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_socket.bind(("127.0.0.1", 4221))
    server_socket.listen(5)

    print("HTTP server listening on port 4221...")

    while True:
        conn, addr = server_socket.accept()

        data = conn.recv(4096).decode()
        lines = data.split("\r\n")

        # Parse the request line
        request_line = lines[0]
        method, path, version = request_line.split(" ")

        # TODO: Parse the HTTP headers from the request
        # TODO: Headers are on lines[1], lines[2], etc. until you hit an empty line
        # TODO: Each header is "Name: Value" — split on ": " (colon + space)
        # TODO: Store headers in a dictionary (use lowercase keys for easy lookup)
        #
        # TODO: Implement the /echo/<string> endpoint:
        #   - If path starts with "/echo/", respond with everything after "/echo/"
        #   - Set Content-Type: text/plain and Content-Length headers
        #
        # TODO: Implement the /user-agent endpoint:
        #   - Respond with the value of the User-Agent header
        #
        # TODO: For all other paths, respond with "HTTP/1.1 200 OK\r\n\r\n"
        #
        # Hints:
        #   - To parse headers: for line in lines[1:]: if line == '': break
        #   - Split on ': ' (with space): key, value = line.split(': ', 1)
        #   - Store as headers[key.lower()] = value
        #   - For /echo/: body = path[6:]  (everything after "/echo/")
        #   - Don't forget Content-Length must match the body length

        response = "HTTP/1.1 200 OK\r\n\r\n"
        conn.sendall(response.encode())
        conn.close()


if __name__ == "__main__":
    main()
