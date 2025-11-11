# CER Agent Backend


## Getting Started
1. 確保已安裝 Python 3.11 和 uv
2. 確保已經啟動 PostgreSQL Server，如果想用 Docker 快速啟動，請切換到上個目錄 (即整個專案的根目錄)，修改好 `.env` 之後執行
    ```bash
    docker compose up -d postgres
    ```
3. 複製 `.env.example` 為 `.env`，並根據需要修改環境變數，注意 `.env` 的 `DB_HOST`，如果是本地開發請設為 `127.0.0.1`，如果是 Docker 環境請設為 `postgres`
4. 建立虛擬環境
    ```
    uv venv .venv
    ```
5. 安裝依賴
   ```bash
   uv sync
   ```
6. 啟動開發伺服器
   ```bash
    uv run python manage.py runserver
    ```


## Notes
- 此專案移除 `/admin/` 路徑，禁用 Django Admin
- 建立 app 時，可以使用 `python manage.py createapp <app_name>`，會自動在 apps 底下建立，並註冊到 settings，亦可使用原始 `python manage.py startapp` 指令，但記得手動移動 app 到 `apps` 底下
