import sys
from datetime import datetime

from src.config import CLASS_I_IDS, CLASS_P_IDS
from src.export_excel import export_all, fetch_user_ids, get_connection
from src.time_utils import TZ_TAIWAN, parse_date


def prompt_date(prompt: str, end_of_day: bool = False) -> datetime:
    while True:
        val = input(prompt).strip()
        if not val:
            print("  ⚠️  日期為必填，請輸入 8 位數字（例如 20260101）。")
            continue
        try:
            return parse_date(val, end_of_day=end_of_day)
        except ValueError as e:
            print(f"  ⚠️  {e}")


def prompt_user_ids(all_ids: list[int]) -> list[int]:
    print("\n請選擇要匯出的 user id：")
    print("  [A] All")
    print("  [I] Class_I")
    print("  [P] Class_P")
    print("  [M] Manual")
    while True:
        choice = input("請輸入選項：").strip().upper()
        if choice == "A":
            return all_ids
        elif choice == "I":
            print(f"  已選擇 Class_I，共 {len(CLASS_I_IDS)} 個 id")
            return CLASS_I_IDS
        elif choice == "P":
            print(f"  已選擇 Class_P，共 {len(CLASS_P_IDS)} 個 id")
            return CLASS_P_IDS
        elif choice == "M":
            raw = input("請輸入 user id（例如: 1 2 3）：").strip()
            ids = []
            for token in raw.split():
                if token.isdigit():
                    ids.append(int(token))
                else:
                    print(f"  ⚠️  「{token}」不是有效的 id，已略過。")
            if ids:
                return ids
            print("  ⚠️  未輸入任何有效 id，請重試。")
        else:
            print("  ⚠️  無效選項，請輸入 A、I、P 或 M。")


def main() -> None:
    print("=" * 50)
    print("  user_action 資料匯出工具")
    print("=" * 50)

    conn = get_connection()
    try:
        all_ids = fetch_user_ids(conn)
    finally:
        conn.close()

    if not all_ids:
        print("❌ 資料庫中找不到任何 user_action 資料。")
        sys.exit(1)

    print("\n  Class_I: 9~26、28~48、91")
    print("  Class_P: 49~63、65~90、94")

    user_ids = prompt_user_ids(all_ids)

    print("\n請輸入匯出的日期範圍（台灣時間，格式: YYYYMMDD）：")
    start_dt = prompt_date("  開始日期：", end_of_day=False)
    end_dt = prompt_date("  結束日期：", end_of_day=True)

    print(f"\n開始匯出 {len(user_ids)} 個 user 的資料...")
    print(
        f"  時段：{start_dt.astimezone(TZ_TAIWAN).strftime('%Y-%m-%d')} ~ {end_dt.astimezone(TZ_TAIWAN).strftime('%Y-%m-%d')} (台灣時間)"
    )
    print()

    export_all(user_ids, start_dt, end_dt)

    print("\n✅ 匯出完成！Excel 檔案儲存於 user_action/ 目錄下。")


if __name__ == "__main__":
    main()
