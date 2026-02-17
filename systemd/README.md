# CER systemd

## 安裝

```bash
# 建立 symlink
sudo ln -s /home/ccliu/CER-Agent/systemd/cer-backup.service /etc/systemd/system/
sudo ln -s /home/ccliu/CER-Agent/systemd/cer-backup.timer /etc/systemd/system/

# 載入並啟用
sudo systemctl daemon-reload
sudo systemctl enable --now cer-backup.timer
```

## 移除

```bash
# 停用並移除
sudo systemctl disable --now cer-backup.timer
sudo rm /etc/systemd/system/cer-backup.service
sudo rm /etc/systemd/system/cer-backup.timer
sudo systemctl daemon-reload
```

## Debug

```bash
# 查看 timer 狀態與下次執行時間
systemctl status cer-backup.timer
systemctl list-timers cer-backup.timer

# 查看最近一次執行的日誌
journalctl -u cer-backup.service -n 50 --no-pager

# 即時追蹤日誌
journalctl -u cer-backup.service -f

# 手動觸發一次（測試用）
sudo systemctl start cer-backup.service

# 確認 service 執行結果
systemctl status cer-backup.service
```

## 修改備份頻率

編輯 `cer-backup.timer` 中的 `OnCalendar`，然後重新載入：

```bash
sudo systemctl daemon-reload
sudo systemctl restart cer-backup.timer
```

常用範例：
- 每 4 小時：`OnCalendar=*-*-* 00,04,08,12,16,20:00:00`
- 每 2 小時：`OnCalendar=*-*-* 00/2:00:00`
- 每天凌晨：`OnCalendar=*-*-* 00:00:00`
