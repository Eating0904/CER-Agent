import os
from pathlib import Path

import uvicorn
from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles

# 建立 FastAPI 實例
app = FastAPI(title="CER-Agent Excel Viewer")

# 設定基礎目錄
BASE_DIR = Path(__file__).resolve().parent
USER_ACTION_DIR = BASE_DIR / "user_action"
STATIC_DIR = BASE_DIR / "static"

# 確保目錄存在以免啟動報錯
os.makedirs(USER_ACTION_DIR, exist_ok=True)
os.makedirs(STATIC_DIR, exist_ok=True)


@app.get("/api/files")
def list_excel_files():
    """
    掃描 user_action 目錄下的所有 Excel 檔案，並回傳成列表供前端渲染側邊欄
    """
    files = []
    for path in USER_ACTION_DIR.rglob("*.xlsx"):
        rel_path = path.relative_to(USER_ACTION_DIR)
        parts = rel_path.parts
        # 路徑格式: Class_I/01/xxx.xlsx (3 層) 或 Class_I/xxx.xlsx (2 層)
        if len(parts) >= 3:
            user_class, user_id = parts[0], parts[1]
        elif len(parts) == 2:
            user_class, user_id = parts[0], parts[0]
        else:
            user_class, user_id = "未分類", "—"

        files.append(
            {
                "name": path.name,
                "path": str(rel_path).replace("\\", "/"),
                "user_class": user_class,
                "user_id": user_id,
                "size_bytes": path.stat().st_size,
            }
        )

    files.sort(key=lambda x: (x["user_class"], x["user_id"], x["name"]))
    return {"files": files}


# 掛載供前端下載 Excel 的靜態檔案目錄 (前端用 fetch 讀取)
app.mount("/api/data", StaticFiles(directory=str(USER_ACTION_DIR)), name="data")


# 將根目錄重定向到 index.html，或是直接讓 StaticFiles 處理預設 HTML
@app.get("/")
def read_root():
    return RedirectResponse(url="/static/index.html")


# 掛載前端網頁檔案的靜態檔案目錄
app.mount("/static", StaticFiles(directory=str(STATIC_DIR), html=True), name="static")

if __name__ == "__main__":
    # 使用 uvicorn 啟動
    # reload=True 在開發時很有用，但只限於 Python 程式碼變更。
    # 如果只要載入新的產出資料 (Excel)，使用者其實不需重啟伺服器，直接在網頁上重整 (F5) 即可。
    print("啟動 Excel 查看伺服器... 網址: http://localhost:8800")
    uvicorn.run("server:app", host="0.0.0.0", port=8800, reload=True)
