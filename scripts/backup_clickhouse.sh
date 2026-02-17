#!/bin/bash
export TZ="Asia/Taipei"

# ================= Configuration =================
CONTAINER_NAME="cer-langfuse-clickhouse-1"
DB_NAME="default"
HOST_BACKUP_DIR="/home/ccliu/backup-cer"
DATE_TAG=$(date +%Y%m%d-%H%M)
BACKUP_FILENAME="${DATE_TAG}_${CONTAINER_NAME}.zip"

# Backup directory inside the container (Must match the XML config below)
CONTAINER_BACKUP_DIR="/var/lib/clickhouse/backups"
CONTAINER_BACKUP_PATH="${CONTAINER_BACKUP_DIR}/${BACKUP_FILENAME}"
# ===============================================

echo "Starting ClickHouse hot backup..."
mkdir -p "$HOST_BACKUP_DIR"

# 1. Resolve Code 36 error: Inject backup path configuration (Hot reload, no restart required)
echo "Configuring backup permissions..."
docker exec "$CONTAINER_NAME" bash -c "mkdir -p /etc/clickhouse-server/config.d/ && \
printf '<clickhouse>\n    <backups>\n        <allowed_path>${CONTAINER_BACKUP_DIR}/</allowed_path>\n    </backups>\n</clickhouse>' \
> /etc/clickhouse-server/config.d/allow_backups.xml"

# Wait for ClickHouse to reload the configuration
sleep 3

# 2. Ensure the backup directory exists inside the container
docker exec "$CONTAINER_NAME" mkdir -p "$CONTAINER_BACKUP_DIR"

# 3. Execute the SQL BACKUP command (Hot backup, does not lock tables)
echo "Creating database backup (Database: $DB_NAME)..."
docker exec "$CONTAINER_NAME" clickhouse-client --query \
"BACKUP DATABASE $DB_NAME TO File('${CONTAINER_BACKUP_PATH}')"

if [ $? -eq 0 ]; then
    echo "Database backup created successfully."
else
    echo "Backup failed. Please check the error messages."
    exit 1
fi

# 4. Copy the backup file from the container to the host machine
echo "Copying backup file to the host machine..."
docker cp "${CONTAINER_NAME}:${CONTAINER_BACKUP_PATH}" "${HOST_BACKUP_DIR}/${BACKUP_FILENAME}"

# 5. Clean up the temporary backup file inside the container
echo "Cleaning up temporary files inside the container..."
docker exec "$CONTAINER_NAME" rm -f "${CONTAINER_BACKUP_PATH}"

# 6. Delete old backups on the host older than 7 days
find "$HOST_BACKUP_DIR" -name "backup_*.zip" -mtime +7 -delete

echo "Backup completed. File located at: ${HOST_BACKUP_DIR}/${BACKUP_FILENAME}"
