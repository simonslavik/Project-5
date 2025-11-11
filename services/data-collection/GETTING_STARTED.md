# 🎯 Quick Start Guide - Data Collection Service

## Step 1: Install Dependencies

Open terminal in the data-collection folder:

```bash
cd /Users/simonslavik/Desktop/Project-5/services/data-collection
npm install
```

This installs:

- TypeScript
- axios (for API calls)
- pg (PostgreSQL client)
- node-cron (scheduling)
- dotenv (environment variables)

---

## Step 2: Get Your FREE API Keys

### OpenWeatherMap (Weather Data)

1. Go to: https://openweathermap.org/api
2. Click "Sign Up" → Create free account
3. Check your email to verify
4. Go to "API keys" tab
5. Copy the "Key" (starts with a long string of letters/numbers)

### Ticketmaster (Events Data)

1. Go to: https://developer.ticketmaster.com/
2. Click "Get Your Free API Key"
3. Fill form: Name, Email, App Name (any name), Website (can use http://localhost)
4. Check email for confirmation
5. Login → Your Apps → Copy "Consumer Key"

---

## Step 3: Configure Environment

```bash
# Copy the example file
cp .env.example .env

# Edit with your actual API keys
nano .env  # or use any text editor
```

Your `.env` should look like:

```env
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/restaurant_intelligence

WEATHER_API_KEY=abc123your_actual_key_here
WEATHER_LOCATION=New York

EVENTS_API_KEY=xyz789your_actual_key_here
EVENTS_CITY=New York
```

**Replace the placeholder keys with your real keys!**

---

## Step 4: Make Sure Database is Running

If you're using Docker (recommended):

```bash
# From project root
cd /Users/simonslavik/Desktop/Project-5
docker-compose up -d timescaledb
```

Check it's running:

```bash
docker ps
# Should see "restaurant-timescaledb"
```

---

## Step 5: Run the Service!

```bash
cd services/data-collection
npm run dev
```

You should see:

```
🚀 Restaurant Intelligence - Data Collection Service
✅ Database connection established
🌤️  [Weather Collector] Success: 22.5°C, clear sky
🎉 [Events Collector] Success: Found 5 events
📅 [Calendar Collector] Success: 90 days processed
✅ Data Collection Service is running!
```

---

## 🎉 Success!

If you see those messages, **it's working!**

Your service is now:

- ✅ Collecting weather every 15 minutes
- ✅ Collecting events every 6 hours
- ✅ Updating calendar daily
- ✅ Storing everything in your database

---

## 🔍 Check Your Data

Connect to database:

```bash
docker exec -it restaurant-timescaledb psql -U postgres -d restaurant_intelligence
```

Query weather data:

```sql
SELECT time, temperature, weather_condition
FROM restaurant.weather
ORDER BY time DESC
LIMIT 5;
```

Query events:

```sql
SELECT event_name, event_date, event_type, impact_score
FROM restaurant.events
ORDER BY event_date
LIMIT 5;
```

Exit psql:

```
\q
```

---

## ⚠️ Troubleshooting

### "Cannot find module 'axios'"

Run: `npm install`

### "Database connection failed"

- Check PostgreSQL is running: `docker ps`
- Check DATABASE_URL in `.env`

### "401 Unauthorized"

- OpenWeatherMap keys take ~10 minutes to activate after signup
- Check you copied the full API key (no spaces)

### "No events found"

- Normal if no events in your area
- Try bigger city like "New York" or "Los Angeles"

---

## 📚 What's Next?

Now that data is being collected:

1. Let it run for a few hours to gather data
2. Check database to see growing time-series data
3. Next step: Build ML models to analyze this data!

---

## 💡 Pro Tips

- **Let it run overnight** - More data = better ML predictions
- **Check logs** - Watch the terminal to see it working
- **Stop with Ctrl+C** - Graceful shutdown
- **Start small** - Just weather first, then add events

---

**Questions? Check the main README.md or the code comments!** 📖
