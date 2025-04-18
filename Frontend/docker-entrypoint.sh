#!/bin/sh
set -e

echo "Starting frontend development server with hot reload..."

# Kør i udviklings-mode med ekstra polling-flag for bedre hot reload
exec npm run dev -- --host 0.0.0.0 --force 