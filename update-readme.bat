@echo off
echo Updating README on GitHub...
cd /d "%~dp0"

git add README.md
git commit -m "docs: Enhanced README with comprehensive documentation and professional formatting"

git push origin main

echo.
echo README successfully updated on GitHub!
echo Visit: https://github.com/balirwaalvin/treez-intelligence
pause
