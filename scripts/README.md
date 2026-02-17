# CER Scripts
**所有 scripts 都在專案根目錄運行**，不是 `scripts/` 底下

## `backup_db.ps1`
Windows 備份拉取腳本，從 Linux 找最新的備份檔並下載到本地 `backups/` 目錄
```powershell
# 一般執行：檢查 Linux 是否有備份，沒有就觸發，有就拉取
./scripts/backup_db.ps1

# 強制重新備份
./scripts/backup_db.ps1 -Force
```

## `backup_db.sh`
Linux 整合備份腳本，依序執行 PostgreSQL 和 ClickHouse 備份，由 systemd 定時觸發
```bash
chmod +x scripts/backup_db.sh
./scripts/backup_db.sh
```

## `backup_postgres.sh`
Linux PostgreSQL 備份腳本，備份 `cer-db` 和 `cer-langfuse-postgres-1` 兩個容器的資料庫（Binary Format `.dump`）
```bash
chmod +x scripts/backup_postgres.sh
./scripts/backup_postgres.sh
```

## `backup_clickhouse.sh`
Linux ClickHouse 備份腳本，備份 `cer-langfuse-clickhouse-1` 容器的資料庫（`.zip`）
```bash
chmod +x scripts/backup_clickhouse.sh
./scripts/backup_clickhouse.sh
```

## `start.sh`
用於初次啟動所有服務，包含 Langfuse、CER Agent
```bash
# 權限只要給一次
chmod +x scripts/start.sh
./scripts/start.sh
```

## `update.sh`
用於更新所有服務，僅包含 CER Agent，具體包含 rebuild frontend、restart backend
```bash
# 權限只要給一次
chmod +x scripts/update.sh
./scripts/update.sh
```
