#!/bin/bash
export TZ="Asia/Taipei"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Load .env if exists (can override: DF_REPORT_API_URL, DF_REPORT_API_KEY)
ENV_FILE="$PROJECT_DIR/.env"
if [ -f "$ENV_FILE" ]; then
    set -a
    source "$ENV_FILE"
    set +a
fi

API_URL="${DF_REPORT_API_URL:-}"
API_KEY="${DF_REPORT_API_KEY:-}"

if [ -z "$API_URL" ]; then
    echo "[check_disk] ERROR: DF_REPORT_API_URL is not set" >&2
    exit 1
fi

TIMESTAMP="$(date -Iseconds)"
HOSTNAME="$(hostname)"

# Parse df -h into JSON array (fields: Size Used Avail Use%)
DISKS_JSON="$(df -h / --output=size,used,avail,pcent | tail -n +2 | \
awk '{
    printf "{\"size\":\"%s\",\"used\":\"%s\",\"avail\":\"%s\",\"use_pct\":\"%s\"},\n",
        $1, $2, $3, $4
}' | sed '$ s/,$//')"

PAYLOAD=$(cat <<EOF
{
  "timestamp": "$TIMESTAMP",
  "hostname": "$HOSTNAME",
  "disks": [
$DISKS_JSON
  ]
}
EOF
)

echo "=== check_disk @ $TIMESTAMP ==="

HTTP_ARGS=(-s -o /dev/null -w "%{http_code}" -X POST "$API_URL" \
    -H "Content-Type: application/json")

if [ -n "$API_KEY" ]; then
    HTTP_ARGS+=(-H "Authorization: Bearer $API_KEY")
fi

HTTP_CODE=$(curl "${HTTP_ARGS[@]}" -d "$PAYLOAD")

if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
    echo "[check_disk] OK (HTTP $HTTP_CODE)"
else
    echo "[check_disk] ERROR: API returned HTTP $HTTP_CODE" >&2
    exit 1
fi
