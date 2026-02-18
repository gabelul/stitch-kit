#!/usr/bin/env bash
# fetch-stitch.sh
# Reliably downloads Stitch HTML from Google Cloud Storage URLs.
# GCS URLs require redirect handling and specific security handshakes that
# AI fetch tools often fail on. This script handles both.
#
# Usage:
#   bash scripts/fetch-stitch.sh "<url>" "<output-path>"
#
# Example:
#   bash scripts/fetch-stitch.sh "$htmlCode_downloadUrl" "temp/source.html"

set -euo pipefail

URL="${1:?Usage: fetch-stitch.sh <url> <output-path>}"
OUTPUT="${2:?Usage: fetch-stitch.sh <url> <output-path>}"

mkdir -p "$(dirname "$OUTPUT")"

curl -L \
  -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" \
  --compressed \
  --retry 3 \
  --retry-delay 1 \
  --max-time 30 \
  --silent \
  --show-error \
  --output "$OUTPUT" \
  "$URL"

if [ ! -s "$OUTPUT" ]; then
  echo "Error: Downloaded file is empty. URL may be expired or invalid." >&2
  exit 1
fi

echo "Downloaded to: $OUTPUT ($(wc -c < "$OUTPUT") bytes)"
