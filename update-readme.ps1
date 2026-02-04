# Update README on GitHub (PowerShell)

Write-Host "=== Updating README on GitHub ===" -ForegroundColor Cyan
Write-Host ""

Set-Location "C:\Users\EduScan\OneDrive\Documents\treez-intelligence"

# Add README.md
Write-Host "Staging README.md..." -ForegroundColor Yellow
git add README.md

# Commit changes
Write-Host "Creating commit..." -ForegroundColor Yellow
$commitMessage = @"
docs: Enhanced README with comprehensive documentation

- Added professional badges and banner
- Included detailed table of contents
- Expanded feature descriptions with examples
- Added complete architecture diagram
- Documented all API endpoints with examples
- Added usage guide with example prompts
- Included security best practices
- Added contribution guidelines
- Enhanced project structure visualization
- Added contact information and acknowledgments
"@

git commit -m $commitMessage

# Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host ""
Write-Host "=== README Successfully Updated! ===" -ForegroundColor Green
Write-Host "View it at: https://github.com/balirwaalvin/treez-intelligence" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit"
