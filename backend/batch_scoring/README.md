# Batch Scoring 批次評分工具

繞過前端 chat 流程，直接呼叫後端 Scoring Agent 進行批次評分，並將結果匯出為 Excel。

## 目錄結構

```
batch_scoring/
├── _shared.py                # 共用工具函式
├── batch_scoring_mindmap.py  # Mindmap CER 批次評分
├── batch_scoring_essay.py    # Essay 批次評分
├── mindmap/
│   ├── data/                 # 測試資料
│   │   └── {資料夾名稱}/
│   │       ├── article.txt   # 閱讀文章
│   │       ├── prompt.txt    # 自訂 Prompt（選填）
│   │       ├── 1.json
│   │       └── 2.json
│   └── results/              # 輸出結果
│       └── {資料夾名稱}/
│           └── {時戳}.xlsx
└── essay/
    ├── data/                 # 測試資料
    │   └── {資料夾名稱}/
    │       ├── article.txt   # 閱讀文章
    │       ├── prompt.txt    # 自訂 Prompt（選填）
    │       ├── 1.txt         # Essay 內容
    │       └── 2.txt
    └── results/              # 輸出結果
        └── {資料夾名稱}/
            └── {時戳}.xlsx
```

## 執行方式

> 需在 `backend/` 目錄下執行，並使用 `uv` 環境。

```bash
# Mindmap CER 批次評分
uv run python batch_scoring/batch_scoring_mindmap.py

# Essay 批次評分
uv run python batch_scoring/batch_scoring_essay.py
```

## 互動流程

1. 自動列出 `data/` 下的所有資料夾，輸入編號選擇
2. 若資料夾內有 `prompt.txt`，詢問要使用內建 Prompt 還是自訂 Prompt
3. 依序對所有資料進行評分，並即時顯示每筆結果
4. 評分完成後自動匯出 Excel 至 `results/{資料夾名稱}/{時戳}.xlsx`

## 新增測試資料

在對應的 `data/` 目錄下建立一個新資料夾，資料夾名稱即為該批次測試的識別名稱。

### Mindmap

在 `mindmap/data/{資料夾名稱}/` 下放入：

| 檔案 | 說明 |
|------|------|
| `article.txt` | **必填**，閱讀文章全文 |
| `1.json`、`2.json`、... | **必填**，每個 JSON 為一筆 mindmap 評分資料，檔名即為 Excel 的 ID |
| `prompt.txt` | 選填，自訂 Prompt；若有此檔，執行時會詢問是否使用 |

### Essay

在 `essay/data/{資料夾名稱}/` 下放入：

| 檔案 | 說明 |
|------|------|
| `article.txt` | **必填**，閱讀文章全文 |
| `1.txt`、`2.txt`、... | **必填**，每個 .txt 為一篇 essay 全文，檔名即為 Excel 的 ID |
| `prompt.txt` | 選填，自訂 Prompt；若有此檔，執行時會詢問是否使用 |

## 測試資料格式

### Mindmap（`.json`）

```json
{
  "nodes": [
    {"id": "c1", "content": "c1-content"},
    {"id": "e1", "content": "e1-content"},
    {"id": "r1", "content": "r1-content"}
  ],
  "edges": [
    { "node1": "c1", "node2": "e1" },
    { "node1": "e1", "node2": "r1" }
  ]
}
```

### Essay（`.txt`）

直接寫入 essay 全文。
