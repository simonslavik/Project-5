# ✅ Winston Logger - Complete Setup

## 🎉 What You Have Now

### **Updated Logger with Winston**

- ✅ File logging (combined.log, error.log, daily/)
- ✅ Automatic log rotation
- ✅ Colored console output
- ✅ Stack traces for errors
- ✅ Exception and rejection handlers
- ✅ 14-day retention for daily logs

### **Log Storage Structure**

```
logs/
├── combined.log         # All logs (10MB × 5 files)
├── error.log           # Only errors (10MB × 5 files)
├── exceptions.log      # App crashes
├── rejections.log      # Unhandled promises
└── daily/
    ├── app-2025-11-11.log  # Daily logs
    ├── app-2025-11-12.log  # (keeps 14 days)
    └── ...
```

### **Helper Scripts**

- ✅ `scripts/setup-logs.sh` - Create log directories
- ✅ `scripts/view-logs.sh` - Interactive log viewer

### **Documentation**

- ✅ `LOGGING_GUIDE.md` - Complete guide
- ✅ `LOGGING_QUICK_REF.md` - Quick reference

---

## 🚀 Next Steps

### 1. Install Dependencies

```bash
cd /Users/simonslavik/Desktop/Project-5/services/data-collection
npm install
```

This will install winston (it's already in package.json).

### 2. Your Code Already Uses It!

The logger is already imported in all your collectors:

```typescript
import { logger } from "../utils/logger";
```

When you run the service, logs will automatically go to:

- **Console** (what you see in terminal)
- **Files** (stored in logs/ directory)

### 3. Run Your Service

```bash
npm run dev
```

Logs will appear in both console AND files!

---

## 📊 Where Logs Go & Why

### **Console** (Terminal)

- **What**: Colored, real-time logs
- **Why**: See what's happening RIGHT NOW
- **When**: Development, debugging
- **Usage**: Watch while service runs

### **combined.log**

- **What**: ALL logs (debug, info, warn, error)
- **Why**: Complete history of everything
- **When**: Reviewing what happened
- **Usage**: `tail -f logs/combined.log`

### **error.log**

- **What**: ONLY error messages
- **Why**: Quick error checking
- **When**: Troubleshooting issues
- **Usage**: `grep "Weather" logs/error.log`

### **daily/app-YYYY-MM-DD.log**

- **What**: One file per day
- **Why**: Historical analysis, trends
- **When**: "What happened last Tuesday?"
- **Usage**: `cat logs/daily/app-2025-11-10.log`

### **exceptions.log**

- **What**: Uncaught exceptions (crashes)
- **Why**: Find critical bugs
- **When**: App crashes unexpectedly
- **Usage**: `cat logs/exceptions.log`

---

## 🎯 Real-World Usage Examples

### **Development Workflow**

**Terminal 1** - Run service:

```bash
npm run dev
```

See colorful logs in real-time ✨

**Terminal 2** - Watch all logs:

```bash
tail -f logs/combined.log
```

See everything being written to file 📝

**Terminal 3** - Watch errors only:

```bash
tail -f logs/error.log
```

Monitor for issues 🔍

### **Debugging Workflow**

**Issue**: Weather collector fails sometimes

**Step 1** - Find when it started:

```bash
grep "Weather.*ERROR" logs/combined.log
```

**Step 2** - Check that day's logs:

```bash
cat logs/daily/app-2025-11-10.log | grep "Weather"
```

**Step 3** - See full error with stack trace:

```bash
cat logs/error.log | grep -A 10 "Weather Collector"
```

### **Production Monitoring**

**Check errors from last hour**:

```bash
tail -100 logs/error.log
```

**Count error frequency**:

```bash
grep -c "ERROR" logs/combined.log
# If > 100, investigate!
```

**Check disk space**:

```bash
du -sh logs/
# Should be < 200MB
```

---

## 🎚️ Adjust Log Levels

### **See Everything** (Development)

`.env`:

```env
LOG_LEVEL=debug
```

**Result**: Very verbose, all details

### **Normal Operation** (Default)

`.env`:

```env
LOG_LEVEL=info
```

**Result**: Standard messages, warnings, errors

### **Quiet Mode** (Production)

`.env`:

```env
LOG_LEVEL=warn
```

**Result**: Only warnings and errors

### **Errors Only** (Critical)

`.env`:

```env
LOG_LEVEL=error
```

**Result**: Only error messages

---

## 🔔 Set Up Monitoring (Advanced)

### **Option 1: Simple Email Alert**

Create `scripts/check-errors.sh`:

```bash
#!/bin/bash
ERROR_COUNT=$(grep -c "ERROR" logs/combined.log)
if [ $ERROR_COUNT -gt 10 ]; then
    echo "⚠️ $ERROR_COUNT errors found!" | mail -s "Alert" you@email.com
fi
```

Run daily via cron:

```bash
0 9 * * * /path/to/scripts/check-errors.sh
```

### **Option 2: Log Aggregation Tools**

- **Grafana + Loki**: Visual dashboards
- **ELK Stack**: Elasticsearch, Logstash, Kibana
- **Papertrail**: Cloud log management
- **Sentry**: Error tracking (free tier)

### **Option 3: Simple Dashboard**

```bash
./scripts/view-logs.sh
# Choose option 5 for statistics
```

---

## 💾 Disk Space Management

### **Current Settings**

- combined.log: Max 50MB (10MB × 5 files)
- error.log: Max 50MB (10MB × 5 files)
- Daily logs: Max ~280MB (20MB × 14 days)
- **Total**: ~380MB maximum

### **If You Need Less Space**

Edit `src/utils/logger.ts`:

```typescript
maxsize: 5 * 1024 * 1024,  // Change to 5MB
maxFiles: 3,                // Keep only 3 files
maxFiles: '7d'              // Keep only 7 days
```

### **Auto-Cleanup Script**

Create `scripts/cleanup-old-logs.sh`:

```bash
#!/bin/bash
find logs/daily -name "*.log" -mtime +30 -delete
echo "Logs older than 30 days deleted"
```

---

## 🎓 Understanding the Code

### **How Winston Works**

1. **You call**:

```typescript
logger.info("Hello");
```

2. **Winston processes**:

- Adds timestamp
- Formats message
- Checks if should log (based on level)

3. **Winston writes to**:

- Console (with colors)
- combined.log
- daily/app-2025-11-11.log
- If error: also writes to error.log

4. **Winston manages files**:

- Checks file sizes
- Rotates if needed
- Deletes old logs

### **Transports Explained**

Think of transports as "destinations":

```typescript
transports: [
  new winston.transports.Console(),  // → Your terminal
  new winston.transports.File({...}) // → A file
]
```

Each transport can have:

- Different log levels
- Different formats
- Different rotation rules

---

## 🐛 Common Issues & Solutions

### **Issue**: TypeScript errors about winston

**Solution**:

```bash
npm install
# Installs winston and @types
```

### **Issue**: "ENOENT: no such file or directory"

**Solution**:

```bash
./scripts/setup-logs.sh
```

### **Issue**: No logs in files

**Solution**:

1. Check LOG_LEVEL in .env
2. Verify logger import: `import { logger } from './utils/logger'`
3. Run: `npm install`

### **Issue**: Logs growing too fast

**Solution**:

1. Increase LOG_LEVEL to 'warn' or 'error'
2. Reduce retention in logger.ts

---

## 📚 Quick Commands Cheat Sheet

```bash
# View logs live
tail -f logs/combined.log

# View errors only
tail -f logs/error.log

# Interactive viewer (RECOMMENDED!)
./scripts/view-logs.sh

# Search logs
grep "Weather" logs/combined.log

# Count errors
grep -c "ERROR" logs/error.log

# Check disk usage
du -sh logs/

# Last 20 errors
tail -20 logs/error.log

# Clear old daily logs
rm logs/daily/app-2025-10-*.log
```

---

## ✅ You're Ready!

Your logging system is **production-ready** with:

- ✅ Multiple log destinations
- ✅ Automatic rotation
- ✅ Error tracking
- ✅ Historical data
- ✅ Easy monitoring

**Start your service and watch the logs flow!** 🚀

```bash
npm run dev
```

Then in another terminal:

```bash
./scripts/view-logs.sh
```

---

## 📖 Documentation Reference

- **Complete Guide**: `LOGGING_GUIDE.md` (detailed explanations)
- **Quick Reference**: `LOGGING_QUICK_REF.md` (common commands)
- **This File**: Complete setup summary

---

**Questions?** Check the guides or the comments in `src/utils/logger.ts`! 📘
