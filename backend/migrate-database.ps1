# MongoDB Migration Script for Windows PowerShell
# This script helps migrate data from 'careerconnect' to 'saarthix' database

Write-Host "MongoDB Database Migration Script" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will help you migrate data from 'careerconnect' to 'saarthix' database"
Write-Host ""

# Check if mongosh is available
$mongoshPath = Get-Command mongosh -ErrorAction SilentlyContinue
if (-not $mongoshPath) {
    Write-Host "Error: mongosh is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install MongoDB Shell (mongosh) first" -ForegroundColor Red
    exit 1
}

Write-Host "Connecting to MongoDB..." -ForegroundColor Yellow
Write-Host "If you're using Docker, connect to: mongodb://localhost:27017"
Write-Host ""

# Execute the migration
$scriptPath = Join-Path $PSScriptRoot "migrate-database.js"
mongosh mongodb://localhost:27017 --quiet --file $scriptPath

Write-Host ""
Write-Host "Migration script completed!" -ForegroundColor Green
Write-Host "Please verify the data in the 'saarthix' database" -ForegroundColor Yellow

