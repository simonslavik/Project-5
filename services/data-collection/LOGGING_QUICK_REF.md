# 📝 Quick Reference - Winston Logger

## 🚀 Quick Start

```bash
# 1. Install winston
npm install

# 2. Create logs directory
./scripts/setup-logs.sh

# 3. Use in your code
import { logger } from './utils/logger';
logger.info('Hello!');
```

---

## 📂 Log Files Location

```
logs/
├── combined.log      # Everything (rotates at 10MB, keeps 5 files)
├── error.log         # Errors only (rotates at 10MB, keeps 5 files)
├── exceptions.log    # App crashes
├── rejections.log    # Promise errors
└── daily/
    └── app-2025-11-11.log  # Daily logs (keeps 14 days)
```

---

## 💻 Basic Usage

```typescript
import { logger } from "./utils/logger";

// Four log levels
logger.debug("Detailed debug info"); // Only when LOG_LEVEL=debug
logger.info("✅ Operation successful"); // Normal messages
logger.warn("⚠️  Something might be wrong"); // Warnings
logger.error("❌ Operation failed", error); // Errors with stack trace
```

---

## 🔍 View Logs

```bash
# Watch all logs live
tail -f logs/combined.log

# Watch errors only
tail -f logs/error.log

# Interactive viewer (recommended!)
./scripts/view-logs.sh

# Search logs
grep "Weather" logs/combined.log
grep "ERROR" logs/combined.log | tail -20
```

---

## ⚙️ Configuration

**.env file:**

```env
# Development - see everything
LOG_LEVEL=debug

# Production - only warnings and errors
LOG_LEVEL=warn

# Default (if not set)
LOG_LEVEL=info
```

---

## 📊 Log Rotation Rules

**Size-based (combined.log, error.log):**

- Max file size: **10MB**
- Keeps: **5 files**
- When full: Oldest deleted automatically

**Time-based (daily/):**

- Creates: **One file per day**
- Keeps: **14 days**
- After 14 days: Automatically deleted

---

## 🎯 Real Examples

### Example 1: Simple Message

```typescript
logger.info("Weather data collected");
```

**Output:**

```
2025-11-11 14:30:00 [INFO]: Weather data collected
```

### Example 2: With Context

```typescript
logger.info("API request completed", {
  url: "https://api.weather.com",
  duration: 234,
  status: 200,
});
```

**Output:**

```
2025-11-11 14:30:00 [INFO]: API request completed {"url":"https://api.weather.com","duration":234,"status":200}
```

### Example 3: Error with Stack

```typescript
try {
  throw new Error("Connection timeout");
} catch (error) {
  logger.error("Database error:", error);
}
```

**Output:**

```
2025-11-11 14:30:00 [ERROR]: Database error: Error: Connection timeout
Error: Connection timeout
    at collectWeatherData (weatherCollector.ts:45:11)
    at async main (index.ts:23:5)
```

---

## 🛠️ Useful Commands

```bash
# Count errors today
grep -c "ERROR" logs/combined.log

# Last 50 errors
grep "ERROR" logs/error.log | tail -50

# Check disk usage
du -sh logs/

# Find specific time
grep "14:30" logs/combined.log

# Clear old logs manually
rm logs/daily/app-2025-10-*.log
```

---

## 🐛 Troubleshooting

### Logs directory doesn't exist

```bash
./scripts/setup-logs.sh
```

### No logs appearing

- Check LOG_LEVEL in .env
- Make sure logger is imported correctly
- Run `npm install` to get winston

### Disk full

- Check `du -sh logs/`
- Reduce retention: Edit logger.ts → `maxFiles: '7d'`
- Manual cleanup: `rm logs/daily/app-2025-*-*.log`

---

## 📚 Learn More

- Full guide: `LOGGING_GUIDE.md`
- Winston docs: https://github.com/winstonjs/winston
- Log management: `./scripts/view-logs.sh`

---

**Pro Tip:** Use `./scripts/view-logs.sh` for an interactive log viewer! 🎯
