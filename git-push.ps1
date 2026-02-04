# Git Push Script for Treez Intelligence (PowerShell)

Write-Host "=== Treez Intelligence - Git Push Script ===" -ForegroundColor Cyan
Write-Host ""

# Change to project directory
Set-Location "C:\Users\EduScan\OneDrive\Documents\treez-intelligence"

# Configure Git user
Write-Host "Configuring Git user..." -ForegroundColor Yellow
git config user.name "balirwaalvin"
git config user.email "sanyukalvin@gmail.com"

# Initialize repository if needed
if (!(Test-Path ".git")) {
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
}

# Add all files
Write-Host "Adding files to Git..." -ForegroundColor Yellow
git add .

# Create commit
Write-Host "Creating commit..." -ForegroundColor Yellow
$commitMessage = @"
Initial commit: Treez Intelligence - Full-stack AI application

Features:
- React + TypeScript frontend with Vite
- Node.js + Express backend with secure API
- Google Gemini AI integration (Chat, Live, Video)
- Tailwind CSS styling
- WebSocket support for real-time features
- Proper environment variable management
- Complete documentation and setup guides
"@

git commit -m $commitMessage

# Add remote repository
Write-Host "Adding remote repository..." -ForegroundColor Yellow
git remote remove origin 2>$null
git remote add origin https://github.com/balirwaalvin/treez-intelligence.git

# Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
git branch -M main
git push -u origin main --force

Write-Host ""
Write-Host "=== Push Complete! ===" -ForegroundColor Green
Write-Host "Repository: https://github.com/balirwaalvin/treez-intelligence" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit"
