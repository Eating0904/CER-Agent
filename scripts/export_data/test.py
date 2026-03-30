from dotenv import load_dotenv

from langfuse import get_client

load_dotenv()
langfuse = get_client()  # 自動讀取環境變數認證

# trace_id = "398abda2eada24466b2c52e06d67e3bd"  # mindmap (support)
# trace_id = "737ad75c5933bcc46cf520e4d7f0d8ea"  # mindmap (score)
# trace_id = "9e0f27fe529655614ad6ef5bc6e45ef6"  # essay (support)
# trace_id = "1eca71137acb10726eec069a8827b84f"  # essay (score)
# trace_id = "ab76bf69171a04a2e7827d20780b5c8f"  # feedback

trace_id = "b6ff446e5e128e80f2d042517f45d92a"

# 取得單一 trace（完整資料，包含 evals、input/output、timing、cost）
trace = langfuse.api.trace.get(trace_id)

output_path = "../../tmp/test.json"
with open(output_path, "w", encoding="utf-8") as f:
    f.write(trace.json())

# print(trace.json())
