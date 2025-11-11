#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Restaurant Intelligence - Logs      ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo ""

# Check if logs directory exists
if [ ! -d "logs" ]; then
    echo -e "${RED}❌ Logs directory not found!${NC}"
    echo -e "Run: ${YELLOW}./scripts/setup-logs.sh${NC} first"
    exit 1
fi

# Menu
echo "What would you like to view?"
echo ""
echo "1) 📋 All logs (live)"
echo "2) ❌ Errors only (live)"
echo "3) 📅 Today's logs"
echo "4) 🔍 Search logs"
echo "5) 📊 Log statistics"
echo "6) 💾 Check disk usage"
echo ""
read -p "Enter choice [1-6]: " choice

case $choice in
    1)
        echo -e "${GREEN}Showing all logs (Ctrl+C to exit)...${NC}"
        tail -f logs/combined.log
        ;;
    2)
        echo -e "${RED}Showing errors only (Ctrl+C to exit)...${NC}"
        tail -f logs/error.log
        ;;
    3)
        TODAY=$(date +%Y-%m-%d)
        if [ -f "logs/daily/app-$TODAY.log" ]; then
            echo -e "${GREEN}Showing today's logs...${NC}"
            cat logs/daily/app-$TODAY.log
        else
            echo -e "${YELLOW}No logs for today yet${NC}"
        fi
        ;;
    4)
        read -p "Search term: " term
        echo -e "${GREEN}Searching for '$term'...${NC}"
        grep -i "$term" logs/combined.log | tail -20
        ;;
    5)
        echo -e "${BLUE}Log Statistics:${NC}"
        echo ""
        echo -e "${GREEN}Total log files:${NC} $(find logs -name "*.log" -type f | wc -l)"
        echo -e "${GREEN}Error count today:${NC} $(grep -c "ERROR" logs/combined.log 2>/dev/null || echo 0)"
        echo -e "${GREEN}Warning count today:${NC} $(grep -c "WARN" logs/combined.log 2>/dev/null || echo 0)"
        echo -e "${GREEN}Info count today:${NC} $(grep -c "INFO" logs/combined.log 2>/dev/null || echo 0)"
        echo ""
        echo -e "${YELLOW}Recent errors:${NC}"
        grep "ERROR" logs/error.log 2>/dev/null | tail -5 || echo "No errors found"
        ;;
    6)
        echo -e "${BLUE}Disk Usage:${NC}"
        du -sh logs/
        echo ""
        echo -e "${YELLOW}Breakdown by file:${NC}"
        du -h logs/*.log 2>/dev/null | sort -h
        echo ""
        echo -e "${YELLOW}Daily logs:${NC}"
        du -h logs/daily/*.log 2>/dev/null | tail -5
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac
