#!/bin/bash
# Git Push Script for Treez Intelligence

echo "=== Treez Intelligence - Git Push Script ==="
echo ""

# Configure Git user
echo "Configuring Git user..."
git config user.name "balirwaalvin"
git config user.email "sanyukalvin@gmail.com"

# Initialize repository if needed
if [ ! -d ".git" ]; then
    echo "Initializing Git repository..."
    git init
fi

# Add all files
echo "Adding files to Git..."
git add .

# Create commit
echo "Creating commit..."
git commit -m "Initial commit: Treez Intelligence - Full-stack AI application with revised backend

- React + TypeScript frontend with Vite
- Node.js + Express backend with secure API
- Google Gemini AI integration (Chat, Live, Video)
- Tailwind CSS styling
- WebSocket support for real-time features
- Proper environment variable management
- Complete documentation and setup guides"

# Add remote repository
echo "Adding remote repository..."
git remote remove origin 2>/dev/null
git remote add origin https://github.com/balirwaalvin/treez-intelligence.git

# Push to GitHub
echo "Pushing to GitHub..."
git branch -M main
git push -u origin main --force

echo ""
echo "=== Push Complete! ==="
echo "Repository: https://github.com/balirwaalvin/treez-intelligence"
