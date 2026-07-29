#!/usr/bin/env python3
"""
CODE ARCADE - tiny zero-dependency web server for Termux.

Usage:
    python server.py            # serve on http://localhost:8080
    python server.py 5000       # custom port
"""

import http.server
import socket
import socketserver
import os
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public")


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        # Dev-friendly: always fetch fresh files so edits show up on refresh.
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Service-Worker-Allowed", "/")
        super().end_headers()

    def log_message(self, fmt, *args):
        # Quiet log: only show errors, keeps Termux readable.
        code = args[1] if len(args) > 1 else ""
        if str(code).startswith(("4", "5")):
            sys.stderr.write("  [!] %s\n" % (fmt % args))


def lan_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return None


class Server(socketserver.TCPServer):
    allow_reuse_address = True


def main():
    if not os.path.isdir(ROOT):
        print("ERROR: 'public' folder not found next to server.py")
        sys.exit(1)

    Handler.extensions_map.update({
        ".js": "text/javascript",
        ".mjs": "text/javascript",
        ".webmanifest": "application/manifest+json",
        ".svg": "image/svg+xml",
    })

    try:
        httpd = Server(("0.0.0.0", PORT), Handler)
    except OSError as e:
        print("Could not bind port %d (%s)." % (PORT, e))
        print("Try:  python server.py %d" % (PORT + 1))
        sys.exit(1)

    ip = lan_ip()
    print("")
    print("  \033[95m*** CODE ARCADE ***\033[0m")
    print("  " + "-" * 34)
    print("  On this phone : \033[96mhttp://localhost:%d\033[0m" % PORT)
    if ip:
        print("  Same Wi-Fi    : \033[96mhttp://%s:%d\033[0m" % (ip, PORT))
    print("  " + "-" * 34)
    print("  Stop with Ctrl+C")
    print("")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n  Bye! Progress is saved in your browser.\n")
        httpd.server_close()


if __name__ == "__main__":
    main()
