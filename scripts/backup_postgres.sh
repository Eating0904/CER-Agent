#!/bin/bash
export TZ="Asia/Taipei"

# ==========================================
#  PostgreSQL Backup Script (Binary Format)
# ==========================================

# 1. Basic Settings
BACKUP_DIR="/home/ccliu/backup-cer"
DATE_TAG=$(date +%Y%m%d-%H%M)

# 2. Database Task List (ContainerName DbUser DbName)
TASKS=(
    "cer-db|postgres|db"
    "cer-langfuse-postgres-1|postgres|postgres"
)

# ==========================================
# 3. Execution
# ==========================================

mkdir -p "$BACKUP_DIR"

for TASK in "${TASKS[@]}"; do
    IFS='|' read -r CONTAINER DB_USER DB_NAME <<< "$TASK"

    if [ -z "$CONTAINER" ]; then
        echo "[WARN] Skipped: ContainerName is empty"
        continue
    fi

    echo ""
    echo ">>> Processing: $CONTAINER"

    FILENAME="${DATE_TAG}_${CONTAINER}.dump"
    FILEPATH="${BACKUP_DIR}/${FILENAME}"

    # --- Backup ---
    echo " -> Running pg_dump (Binary) to: $FILEPATH"
    docker exec -i "$CONTAINER" pg_dump -F c -U "$DB_USER" "$DB_NAME" > "$FILEPATH"

    if [ $? -eq 0 ] && [ -f "$FILEPATH" ]; then
        SIZE=$(du -h "$FILEPATH" | cut -f1)
        echo " -> [Done] Backup succeeded. Size: $SIZE"
    else
        echo " -> [Failed] Backup failed (check container name or DB name)"
    fi
done

echo ""
echo "All PostgreSQL backup tasks completed."
