@echo off
echo Pushing Firebase Integration to GitHub...
cd /d "%~dp0"

git add .
git commit -m "feat: Add Firebase integration for Auth, Database, and Storage"

git push origin main

echo.
echo Firebase integration successfully pushed to GitHub!
echo Visit: https://github.com/balirwaalvin/treez-intelligence
pause
