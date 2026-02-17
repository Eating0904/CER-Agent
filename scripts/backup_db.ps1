# ==========================================
#  Backup Pull Script (Windows)
#  Find latest / Trigger if needed / Download
# ==========================================

param(
    [switch]$Force   # Force trigger all backups regardless of existing files
)

# 1. Basic Settings
$ProjectRoot = Split-Path $PSScriptRoot -Parent
$LocalBaseDir = Join-Path $ProjectRoot "backups"
$IntervalHours = 6   # Expected backup interval (used for age warning)

# Linux Server Connection
$RemoteUser = "ccliu"
$RemoteHost = "140.115.53.220"
$RemoteDir  = "/home/ccliu/backup-cer"

# Remote backup script (runs both PG + ClickHouse)
$RemoteScriptDir = "/home/ccliu/CER-Agent/scripts"
$BackupScript    = "$RemoteScriptDir/backup_db.sh"

# ==========================================
# 2. Define expected backups
# ==========================================
$Backups = @(
    @{ Name = "cer-db";                    Pattern = "*_cer-db.dump" },
    @{ Name = "cer-langfuse-postgres-1";   Pattern = "*_cer-langfuse-postgres-1.dump" },
    @{ Name = "cer-langfuse-clickhouse-1"; Pattern = "*_cer-langfuse-clickhouse-1.zip" }
)

# ==========================================
# 3. Ensure local backup directory exists
# ==========================================
if (!(Test-Path -Path $LocalBaseDir)) {
    New-Item -ItemType Directory -Force -Path $LocalBaseDir | Out-Null
}

# ==========================================
# 4. Force mode: trigger all backups first
# ==========================================
if ($Force) {
    Write-Host "[Force] Triggering backup_db.sh ..."
    ssh $RemoteUser@$RemoteHost "bash $BackupScript"
    Write-Host ""
}

# ==========================================
# 5. Find latest, trigger if missing, pull
# ==========================================
$MaxAgeMinutes = $IntervalHours * 60 + 30
$HasTriggered = $false

foreach ($b in $Backups) {
    Write-Host "--- $($b.Name) ---"

    # Find latest file on Linux
    $latestPath = ssh $RemoteUser@$RemoteHost "ls -t $RemoteDir/$($b.Pattern) 2>/dev/null | head -1"

    # If no file found, trigger backup (once)
    if ([string]::IsNullOrWhiteSpace($latestPath) -and !$HasTriggered) {
        Write-Host " -> No backup found. Triggering backup_db.sh ..."
        ssh $RemoteUser@$RemoteHost "bash $BackupScript"
        $HasTriggered = $true
        $latestPath = ssh $RemoteUser@$RemoteHost "ls -t $RemoteDir/$($b.Pattern) 2>/dev/null | head -1"
    }

    if ([string]::IsNullOrWhiteSpace($latestPath)) {
        Write-Error " -> [Failed] No file found"
        continue
    }

    $fileName = ssh $RemoteUser@$RemoteHost "basename $latestPath"
    $localFile = Join-Path $LocalBaseDir $fileName

    # Check file age
    $ageMinutes = [int](ssh $RemoteUser@$RemoteHost "echo `$(( (`$(date +%s) - `$(stat -c %Y $latestPath)) / 60 ))")
    if ($ageMinutes -gt $MaxAgeMinutes) {
        Write-Warning " -> Latest file is ${ageMinutes}m old (expected within ${MaxAgeMinutes}m): $fileName"
    }

    # Pull if not already local
    if (Test-Path $localFile) {
        $SizeMB = (Get-Item $localFile).Length / 1MB
        Write-Host " -> [Skip] Already exists: $fileName ($([math]::Round($SizeMB, 2)) MB)"
    } else {
        Write-Host " -> [Pull] $fileName"
        scp "$RemoteUser@$RemoteHost`:$latestPath" "$LocalBaseDir/"

        if (Test-Path $localFile) {
            $SizeMB = (Get-Item $localFile).Length / 1MB
            Write-Host " -> [Done] $fileName ($([math]::Round($SizeMB, 2)) MB)"
        } else {
            Write-Error " -> [Failed] Download failed: $fileName"
        }
    }
    Write-Host ""
}

Write-Host "All backup pull tasks completed."
