#!/bin/bash

# Ensure you are on main branch
git checkout main

# Stage everything
git add .

# Ask for commit message in a popup
commit_message=$(osascript -e 'Tell application "System Events" to display dialog "Enter commit message:" default answer ""' -e 'text returned of result' 2>/dev/null)

# If popup was cancelled, exit
if [ -z "$commit_message" ]; then
  echo "Commit cancelled."
  exit 1
fi

# Commit with the message
git commit -m "$commit_message"

# Pull latest main to avoid conflicts
git pull origin main --rebase

# Push changes
git push origin main