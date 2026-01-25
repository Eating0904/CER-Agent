# CER Scripts
**所有 scripts 都在專案根目錄運行**，不是 `scripts/` 底下

## `start.sh`
用於初次啟動所有服務，包含 Langfuse、CER Agent
```
# 權限只要給一次
chmod +x scripts/start.sh
./scripts/start.sh
```

## `update.sh`
用於更新所有服務，僅包含 CER Agent，具體包含 rebuild frontend、restart backend
```
# 權限只要給一次
chmod +x scripts/update.sh
./scripts/update.sh
```
