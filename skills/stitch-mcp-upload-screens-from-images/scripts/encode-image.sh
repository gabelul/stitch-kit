#!/usr/bin/env bash
# encode-image.sh — Encodes an image file to base64 for the Stitch upload API.
#
# Usage: bash encode-image.sh "path/to/image.png"
# Output: Raw base64 string to stdout (no wrapping, no data: prefix)
#
# Supports: PNG, JPG, JPEG, WebP, GIF

set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: bash encode-image.sh <image-path>" >&2
  exit 1
fi

IMAGE_PATH="$1"

# Validate the file exists
if [[ ! -f "$IMAGE_PATH" ]]; then
  echo "Error: File not found: $IMAGE_PATH" >&2
  exit 1
fi

# Validate the file is an image by extension
EXT="${IMAGE_PATH##*.}"
EXT_LOWER=$(echo "$EXT" | tr '[:upper:]' '[:lower:]')

case "$EXT_LOWER" in
  png|jpg|jpeg|webp|gif)
    ;;
  *)
    echo "Error: Unsupported image format: .$EXT_LOWER (expected png, jpg, jpeg, webp, or gif)" >&2
    exit 1
    ;;
esac

# Encode to base64 — macOS and Linux compatible
# macOS base64 doesn't support --wrap, uses -b 0 instead
if base64 --wrap=0 "$IMAGE_PATH" 2>/dev/null; then
  : # Linux: --wrap=0 disables line wrapping
else
  base64 -i "$IMAGE_PATH" # macOS: no wrapping by default with -i
fi
