<#
.SYNOPSIS
    Launches the Budg4 app (backend + frontend).

.DESCRIPTION
    Starts the Django backend and Vite frontend in separate windows with one click.
    Each process runs in its own window so you can see output and stop them individually.

.EXAMPLE
    .\launch-budg4.ps1
#>

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ProjectRoot

# Start backend (Django) in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ProjectRoot'; python manage.py runserver"

# Brief pause so backend starts first
Start-Sleep -Seconds 2

# Start frontend (Vite) in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ProjectRoot\frontend'; npm run dev"

Write-Host "Budg4 launched!" -ForegroundColor Green
Write-Host "  Backend:  http://localhost:8000"
Write-Host "  Frontend: http://localhost:5173"
