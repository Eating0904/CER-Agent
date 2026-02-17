#!/bin/bash
export TZ="Asia/Taipei"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== Starting all backups ==="
bash "$SCRIPT_DIR/backup_postgres.sh"
bash "$SCRIPT_DIR/backup_clickhouse.sh"
echo "=== All backups completed ==="
