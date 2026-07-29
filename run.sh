#!/data/data/com.termux/files/usr/bin/bash
# CODE ARCADE launcher for Termux
cd "$(dirname "$0")" || exit 1

if command -v python >/dev/null 2>&1; then
  PY=python
elif command -v python3 >/dev/null 2>&1; then
  PY=python3
else
  echo "Python not found. Run:  pkg install python"
  exit 1
fi

PORT="${1:-8080}"

# Try to open the browser automatically (Termux only, harmless elsewhere)
if command -v termux-open-url >/dev/null 2>&1; then
  ( sleep 1; termux-open-url "http://localhost:$PORT" ) &
fi

exec "$PY" server.py "$PORT"
