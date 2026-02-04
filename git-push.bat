@echo off
REM Git Push Script for Treez Intelligence (Windows)

echo === Treez Intelligence - Git Push Script ===
echo.

REM Configure Git user
echo Configuring Git user...
git config user.name "balirwaalvin"
git config user.email "sanyukalvin@gmail.com"

REM Initialize repository if needed
if not exist ".git" (
    echo Initializing Git repository...
    git init
)

REM Add all files
echo Adding files to Git...
git add .

REM Create commit
echo Creating commit...
git commit -m "Initial commit: Treez Intelligence - Full-stack AI application with revised backend"

REM Add remote repository
echo Adding remote repository...
git remote remove origin 2>nul
git remote add origin https://github.com/balirwaalvin/treez-intelligence.git

REM Push to GitHub
echo Pushing to GitHub...
git branch -M main
git push -u origin main --force

echo.
echo === Push Complete! ===
echo Repository: https://github.com/balirwaalvin/treez-intelligence
pause
