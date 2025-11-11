# 📝 Winston Logger Guide

## 🎯 How Logs Are Organized

Your logs will be stored in the `logs/` directory:

```
services/data-collection/
├── logs/
│   ├── combined.log         # All logs (info, warn, error)
│   ├── error.log            # Only errors
│   ├── exceptions.log       # Uncaught exceptions
│   ├── rejections.log       # Unhandled promise rejections
│   └── daily/
│       ├── app-2025-11-11.log
│       ├── app-2025-11-12.log
│       └── app-2025-11-13.log
```

---

## 📊 Log Storage Strategy

### **1. combined.log** - Everything

- All log levels: `debug`, `info`, `warn`, `error`
- Maximum size: 10MB per file
- Keeps last 5 files (rotates automatically)
- **Use for**: General monitoring, debugging

### **2. error.log** - Errors Only

- Only `error` level logs
- Maximum size: 10MB per file
- Keeps last 5 files
- **Use for**: Quick error checking, alerts

### **3. daily/ folder** - Daily Logs

- One file per day
- Automatically rotates at midnight
- Keeps 14 days of history
- **Use for**: Historical analysis, trends

### **4. exceptions.log** - Crashes

- Uncaught exceptions (app crashes)
- **Use for**: Critical failures investigation

### **5. rejections.log** - Promise Errors

- Unhandled promise rejections
- **Use for**: Finding async bugs

---

## 🚀 How to Use

### **Basic Usage**

```typescript
import { logger } from "./utils/logger";

// Different log levels
logger.debug("Detailed debugging info");
logger.info("✅ Weather data collected successfully");
logger.warn("⚠️  API rate limit approaching");
logger.error("❌ Database connection failed", error);
```

### **With Context/Metadata**

```typescript
logger.info("Weather collected", {
  temperature: 22.5,
  location: "New York",
  timestamp: new Date(),
});

logger.error("API request failed", {
  url: "https://api.example.com",
  status: 500,
  error: error.message,
});
```

### **Stack Traces (Automatic)**

```typescript
try {
  // Some code that fails
  throw new Error("Something broke");
} catch (error) {
  logger.error("Operation failed:", error);
  // Automatically includes stack trace in logs!
}
```

---

## 🔍 Reading Logs

### **View All Recent Logs**

```bash
tail -f logs/combined.log
```

### **View Only Errors**

```bash
tail -f logs/error.log
```

### **View Today's Logs**

```bash
tail -f logs/daily/app-$(date +%Y-%m-%d).log
```

### **Search for Specific Term**

```bash
grep "Weather Collector" logs/combined.log
grep "ERROR" logs/combined.log | tail -20
```

### **Count Errors Today**

```bash
grep -c "ERROR" logs/daily/app-$(date +%Y-%m-%d).log
```

---

## 📈 Log Rotation Explained

### **Why Rotate?**

Logs grow infinitely → disk fills up → server crashes ❌

**Solution**: Automatically delete old logs and limit file sizes ✅

### **How It Works**

**Size-based rotation** (combined.log, error.log):

```
combined.log        (current, 8MB)
combined.log.1      (old, 10MB)
combined.log.2      (older, 10MB)
combined.log.3      (oldest, 10MB)
combined.log.4      (very old, 10MB)
combined.log.5      (gets deleted when new one arrives)
```

**Time-based rotation** (daily/):

```
app-2025-11-11.log  (today)
app-2025-11-10.log  (yesterday)
app-2025-11-09.log  (2 days ago)
...
app-2025-10-28.log  (14 days ago)
app-2025-10-27.log  (gets deleted - older than 14 days)
```

---

## 🎚️ Log Levels Configuration

### **Development** (.env):

```env
LOG_LEVEL=debug
```

**See**: Everything (very verbose)

### **Staging** (.env):

```env
LOG_LEVEL=info
```

**See**: Info, warnings, errors (normal)

### **Production** (.env):

```env
LOG_LEVEL=warn
```

**See**: Only warnings and errors (quiet)

---

## 🔔 Monitoring Best Practices

### **1. Regular Checks**

```bash
# Check for errors in last hour
grep "$(date -u +%Y-%m-%d -d '1 hour ago')" logs/error.log

# Count errors per collector
grep "Weather Collector" logs/error.log | wc -l
grep "Events Collector" logs/error.log | wc -l
```

### **2. Set Up Alerts** (Advanced)

Use tools like:

- **LogWatch**: Email daily log summaries
- **Fail2ban**: Alert on repeated errors
- **Grafana + Loki**: Visual log monitoring
- **Sentry**: Error tracking service

### **3. Log Cleanup Script**

Create `scripts/cleanup-logs.sh`:

```bash
#!/bin/bash
# Delete logs older than 30 days
find logs/daily -name "*.log" -mtime +30 -delete
echo "Old logs cleaned up"
```

---

## 🐛 Debugging with Logs

### **Find When Issue Started**

```bash
# Search logs by date
ls -lt logs/daily/
cat logs/daily/app-2025-11-10.log | grep "ERROR"
```

### **Trace a Specific Collection Run**

```bash
# Find all logs from specific time
grep "2025-11-11 14:30" logs/combined.log
```

### **Common Patterns**

```bash
# API failures
grep "API.*failed\|401\|403\|500" logs/combined.log

# Database issues
grep -i "database\|connection" logs/error.log

# Memory issues
grep -i "memory\|heap" logs/combined.log
```

---

## 📦 Disk Space Management

### **Check Log Directory Size**

```bash
du -sh logs/
# Expected: 50-200MB depending on activity
```

### **If Logs Get Too Large**

Adjust in `logger.ts`:

```typescript
maxsize: 5 * 1024 * 1024,  // Reduce to 5MB
maxFiles: 3,                // Keep only 3 files
maxFiles: '7d'              // Keep only 7 days
```

---

## 🎯 Real-World Example

Your data collector runs and produces logs like:

**logs/combined.log:**

```
2025-11-11 10:00:00 [INFO]: 🚀 Data Collection Service Starting...
2025-11-11 10:00:01 [INFO]: ✅ Database connection established
2025-11-11 10:00:02 [INFO]: 🌤️  [Weather Collector] Starting collection...
2025-11-11 10:00:03 [INFO]: [Weather Collector] ✅ Success (234ms): 22.5°C, clear sky
2025-11-11 10:00:04 [INFO]: 🎉 [Events Collector] Starting collection...
2025-11-11 10:00:05 [INFO]: [Events Collector] ✅ Success (1234ms): Found 5 events
2025-11-11 10:15:00 [INFO]: ⏰ [Scheduled] Weather collection triggered
2025-11-11 10:15:01 [WARN]: [Weather Collector] ⚠️  API response slow (5000ms)
```

**logs/error.log** (only errors):

```
2025-11-11 11:30:00 [ERROR]: [Weather Collector] ❌ API Error: 401 Unauthorized
Error: Request failed with status code 401
    at createError (/node_modules/axios/lib/core/createError.js:16:15)
    at settle (/node_modules/axios/lib/core/settle.js:17:12)
```

---

## 💡 Pro Tips

### **1. Structured Logging**

```typescript
// Instead of:
logger.info(`Temperature is ${temp}`);

// Do this:
logger.info("Weather data collected", {
  temperature: temp,
  location: "NYC",
  source: "OpenWeatherMap",
});
// Makes searching logs easier!
```

### **2. Log Correlation IDs**

```typescript
const requestId = generateId();
logger.info("Starting collection", { requestId });
logger.info("API call completed", { requestId });
logger.info("Data saved", { requestId });
// Track entire request flow!
```

### **3. Performance Logging**

```typescript
const startTime = Date.now();
await collectWeatherData();
const duration = Date.now() - startTime;
logger.info("Collection completed", { duration, unit: "ms" });
// Monitor performance over time!
```

---

## 🚨 Common Issues

### **"ENOENT: no such file or directory, open 'logs/combined.log'"**

**Fix**: Create logs directory:

```bash
mkdir -p logs/daily
```

Or add to your code (automatic):

```typescript
import fs from "fs";
if (!fs.existsSync("logs/daily")) {
  fs.mkdirSync("logs/daily", { recursive: true });
}
```

### **Logs growing too fast**

**Fix**: Increase log level:

```env
LOG_LEVEL=warn  # Less verbose
```

### **Can't find old logs**

**Fix**: Check retention settings, they might be auto-deleted

---

## 📚 Summary

**Where logs go**:

- ✅ Console → Terminal (development)
- ✅ combined.log → All logs
- ✅ error.log → Only errors
- ✅ daily/ → One file per day

**How to monitor**:

```bash
tail -f logs/combined.log        # Watch live
grep "ERROR" logs/error.log      # Find errors
du -sh logs/                     # Check size
```

**Best practices**:

- ✅ Use appropriate log levels
- ✅ Include context/metadata
- ✅ Check logs regularly
- ✅ Set up rotation
- ✅ Monitor disk space

Your logs are now **production-ready**! 🚀
