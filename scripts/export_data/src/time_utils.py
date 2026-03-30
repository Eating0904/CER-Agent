from datetime import datetime, timezone, timedelta

TZ_TAIWAN = timezone(timedelta(hours=8))


def parse_date(s: str, end_of_day: bool = False) -> datetime:
    try:
        d = datetime.strptime(s.strip(), "%Y%m%d")
        if end_of_day:
            d = d.replace(hour=23, minute=59, second=59)
        return d.replace(tzinfo=TZ_TAIWAN).astimezone(timezone.utc)
    except ValueError:
        raise ValueError(f"無法解析日期：{s!r}，請輸入 8 位數字（例如 20260101）")


def to_taiwan_str(dt: datetime | None) -> str:
    if dt is None:
        return ""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(TZ_TAIWAN).strftime("%Y-%m-%d %H:%M:%S")


def ts_to_filename_str(dt: datetime) -> str:
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(TZ_TAIWAN).strftime("%Y%m%d")


def iter_slots(start_dt: datetime, end_dt: datetime):
    start_tw = start_dt.astimezone(TZ_TAIWAN)
    end_tw = end_dt.astimezone(TZ_TAIWAN)

    current_date = start_tw.date()
    end_date = end_tw.date()

    while current_date <= end_date:
        s_start = datetime.combine(current_date, datetime.min.time()).replace(
            tzinfo=TZ_TAIWAN
        )
        s_end = s_start + timedelta(hours=23, minutes=59, seconds=59)
        day_label = current_date.strftime("%Y%m%d")

        if s_start <= end_tw and s_end >= start_tw:
            yield (
                day_label,
                s_start.astimezone(timezone.utc),
                s_end.astimezone(timezone.utc),
            )

        current_date += timedelta(days=1)


def get_now_tw_str(fmt: str = "%Y%m%d_%H%M%S") -> str:
    return datetime.now(timezone.utc).astimezone(TZ_TAIWAN).strftime(fmt)
