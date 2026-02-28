$repo = "https://github.com/OwenDinsmore/daudio.git"
$installDir = Join-Path $env:USERPROFILE "Documents\daudio"
Write-Host "`n=== daudio setup ===`n" -ForegroundColor Cyan
if (Get-Command node -ErrorAction SilentlyContinue) {
    Write-Host "[ok] Node.js $(node -v)" -ForegroundColor Green
} else {
    Write-Host "[installing] Node.js..." -ForegroundColor Yellow
    winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
}
if (Get-Command ffmpeg -ErrorAction SilentlyContinue) {
    Write-Host "[ok] ffmpeg found" -ForegroundColor Green
} else {
    Write-Host "[installing] ffmpeg..." -ForegroundColor Yellow
    winget install Gyan.FFmpeg --accept-source-agreements --accept-package-agreements
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
}
if (Get-Command python -ErrorAction SilentlyContinue) {
    Write-Host "[ok] Python $(python --version 2>&1)" -ForegroundColor Green
} else {
    Write-Host "[installing] Python..." -ForegroundColor Yellow
    winget install Python.Python.3.12 --accept-source-agreements --accept-package-agreements
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
}
if (Get-Command git -ErrorAction SilentlyContinue) {
    Write-Host "[ok] git found" -ForegroundColor Green
} else {
    Write-Host "[installing] git..." -ForegroundColor Yellow
    winget install Git.Git --accept-source-agreements --accept-package-agreements
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
}
if (Test-Path $installDir) {
    Write-Host "[ok] $installDir already exists, pulling latest..." -ForegroundColor Green
    git -C $installDir pull
} else {
    Write-Host "[cloning] daudio to $installDir..." -ForegroundColor Yellow
    git clone $repo $installDir
}
Set-Location $installDir

Write-Host "[installing] yt-dlp..." -ForegroundColor Yellow
pip install -r requirements.txt

Write-Host "[installing] node modules..." -ForegroundColor Yellow
npm install

Write-Host "`n=== setup complete ===`n" -ForegroundColor Cyan
Write-Host "To start daudio:" -ForegroundColor White
Write-Host "  cd $installDir" -ForegroundColor White
Write-Host "  npm start" -ForegroundColor White
Write-Host "`nThen open http://localhost:3000 in your browser.`n" -ForegroundColor White
