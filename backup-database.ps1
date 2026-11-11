<#
.SYNOPSIS
    Copies the Budg4 database to OneDrive with a unique name based on date and time.

.DESCRIPTION
    Takes a copy of the database and saves it to the Budg4 Backups folder with a filename
    that includes today's date and current time for uniqueness.

.EXAMPLE
    .\backup-database.ps1
#>

$SourcePath = "D:\Travis\Projects\BudgetWebApp\Budg4\db.sqlite3"
$DestFolder = "C:\Users\mtrav\OneDrive\Finance\Budg4 Backups"

# Build unique filename: DatabaseName_YYYY-MM-DD_HH-mm-ss.ext
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$sourceFile = Get-Item -LiteralPath $SourcePath -ErrorAction Stop
$baseName = $sourceFile.BaseName
$extension = $sourceFile.Extension
$uniqueFileName = "${baseName}_${timestamp}${extension}"
$fullDestPath = Join-Path $DestFolder $uniqueFileName

# Create destination folder if it doesn't exist
if (-not (Test-Path $DestFolder)) {
    New-Item -ItemType Directory -Path $DestFolder -Force | Out-Null
    Write-Host "Created folder: $DestFolder"
}

# Copy the database
try {
    Copy-Item -Path $SourcePath -Destination $fullDestPath -Force
    Write-Host "Backup completed successfully!" -ForegroundColor Green
    Write-Host "  Source:      $SourcePath"
    Write-Host "  Destination: $fullDestPath"
} catch {
    Write-Error "Failed to copy database: $_"
    exit 1
}
