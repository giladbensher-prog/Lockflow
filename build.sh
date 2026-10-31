#!/usr/bin/env bash
# Compile src/app.jsx → app.js (plain JS for Safari; React is a UMD global).
set -euo pipefail
cd "$(dirname "$0")"
npx --yes esbuild@0.24.0 src/app.jsx \
  --outfile=app.js \
  --target=safari15 \
  --jsx=transform \
  --jsx-factory=React.createElement \
  --jsx-fragment=React.Fragment \
  --minify \
  --legal-comments=none \
  --tsconfig-raw='{}'
