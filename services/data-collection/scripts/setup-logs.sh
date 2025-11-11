#!/bin/bash

# Create logs directory structure
mkdir -p logs/daily

# Create .gitkeep files to track empty directories
touch logs/.gitkeep
touch logs/daily/.gitkeep

echo "✅ Logs directory created successfully!"
echo ""
echo "Directory structure:"
tree logs/ 2>/dev/null || find logs/ -print | sed -e 's;[^/]*/;|____;g;s;____|; |;g'
