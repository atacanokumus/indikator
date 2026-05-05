#!/bin/bash
PROJECT_DIR="$(pwd)"
export PATH="$PROJECT_DIR/bin:/Users/atacan/node/bin:$PATH"
export NODE="$PROJECT_DIR/bin/node"
export NPM="$PROJECT_DIR/bin/npm"
export NEXT_TELEMETRY_DISABLED=1
node node_modules/.bin/next dev -p 8000
