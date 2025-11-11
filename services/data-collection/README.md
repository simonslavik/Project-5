# 📊 Data Collection Service

Automated data collection service for the Restaurant Intelligence Platform. Collects data from multiple external APIs and stores it in TimescaleDB for ML model training and predictions.

## 🎯 What It Does

- **Weather Data**: Collects current weather conditions every 15 minutes
- **Events Data**: Fetches local events that might affect restaurant traffic
- **Calendar Data**: Maintains holiday and special date information
- **Social Media**: (Coming soon) Sentiment analysis from social platforms

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/restaurant_intelligence

# Weather API (Get free key at https://openweathermap.org/api)
WEATHER_API_KEY=your_actual_api_key_here
WEATHER_LOCATION=New York

# Events API (Get free key at https://developer.ticketmaster.com/)
EVENTS_API_KEY=your_actual_api_key_here
EVENTS_CITY=New York
```

### 3. Get API Keys

#### OpenWeatherMap (Weather Data) - FREE

1. Go to https://openweathermap.org/api
2. Click "Sign Up" and create a free account
3. Go to "API keys" in your account
4. Copy your API key

#### Ticketmaster (Events Data) - FREE

1. Go to https://developer.ticketmaster.com/
2. Click "Get Your Free API Key"
3. Fill out the form and create account
4. Copy your Consumer Key (this is your API key)

### 4. Run the Service

**Development mode** (with auto-restart):

```bash
npm run dev
```

**Production mode**:

```bash
npm run build
npm start
```

## 📁 Project Structure

```
src/
├── collectors/
│   ├── weatherCollector.ts      # Collects weather data
│   ├── eventsCollector.ts        # Collects local events
│   ├── calendarCollector.ts      # Manages calendar data
│   └── socialMediaCollector.ts   # (Future) Social sentiment
├── database/
│   └── db.ts                     # Database connection & queries
├── utils/
│   └── logger.ts                 # Logging utility
└── index.ts                      # Main scheduler
```

## ⏰ Collection Schedules

| Collector | Default Frequency | Why?                             |
| --------- | ----------------- | -------------------------------- |
| Weather   | Every 15 minutes  | Weather changes frequently       |
| Events    | Every 6 hours     | Events don't change often        |
| Calendar  | Daily at midnight | Static data, update once per day |

You can customize these in `.env`:

```env
WEATHER_INTERVAL=15    # minutes
EVENTS_INTERVAL=360    # minutes (6 hours)
CALENDAR_INTERVAL=1440 # minutes (24 hours)
```

## 🔍 What Each Collector Does

### Weather Collector

- Fetches current weather from OpenWeatherMap
- Stores: temperature, humidity, wind speed, conditions, etc.
- **Why**: Rain → more delivery orders, hot weather → more cold drinks

### Events Collector

- Searches for events within 10 miles of restaurant
- Calculates distance and impact score
- Stores: concerts, sports games, festivals, etc.
- **Why**: Big game nearby → spike in orders

### Calendar Collector

- Maintains dates with holiday information
- Includes: US federal holidays, observances
- **Why**: Holidays affect restaurant traffic patterns

## 📊 Data Flow

```
External APIs → Collectors → Database (TimescaleDB)
                    ↓
            Validation & Processing
                    ↓
            ML Models (for predictions)
```

## 🐛 Troubleshooting

### "Database connection failed"

- Make sure PostgreSQL is running: `docker-compose up timescaledb`
- Check DATABASE_URL in `.env`
- Verify database exists: `restaurant_intelligence`

### "API key not configured"

- Check your `.env` file has actual API keys
- Don't use the placeholder values
- API keys are case-sensitive

### "401 Unauthorized" or "403 Forbidden"

- Your API key might be invalid
- For OpenWeatherMap: Keys take 10 minutes to activate
- Check you're not exceeding free tier limits

### No events found

- Normal if there are no events in your area
- Try a different city in `.env`
- Check your Ticketmaster API key is valid

## 📈 Monitoring

The service logs all activities:

```
[2025-11-11T10:00:00.000Z] INFO  🌤️  [Weather Collector] Starting...
[2025-11-11T10:00:01.234Z] INFO  [Weather Collector] ✅ Success (234ms): 22.5°C, clear sky
```

**Log Levels** (set in `.env`):

- `debug`: Everything (verbose)
- `info`: Normal operations (default)
- `warn`: Warnings only
- `error`: Errors only

## 🎓 Learning Notes

### Key Concepts Used

- **TypeScript**: Type-safe JavaScript
- **Async/Await**: Handle API calls without blocking
- **Cron Jobs**: Schedule tasks at specific intervals
- **Error Handling**: Graceful failures (one collector failing doesn't stop others)
- **Environment Variables**: Secure configuration management

### How Scheduling Works

```typescript
cron.schedule("*/15 * * * *", async () => {
  await collectWeatherData();
});

// Cron syntax: minute hour day month weekday
// */15 * * * * = every 15 minutes
// 0 */6 * * * = every 6 hours (at minute 0)
// 0 0 * * * = daily at midnight
```

### How Database Inserts Work

```typescript
// 1. Fetch data from API
const response = await axios.get(url);

// 2. Extract relevant fields
const weatherData = {
  temperature: response.data.main.temp,
  humidity: response.data.main.humidity,
  // ...
};

// 3. Insert into database
await pool.query(insertQuery, values);
```

## 🔜 Next Steps

Once this is running:

1. ✅ You have data being collected automatically
2. ✅ Your database has time-series weather and events
3. ➡️ Next: Build the ML prediction engine to use this data!

## 💡 Tips

- **Start with just weather**: Get one collector working before adding others
- **Test with manual runs**: Call `collectWeatherData()` directly before scheduling
- **Check the database**: Use `psql` to verify data is being inserted
- **Free tier limits**: OpenWeatherMap free tier = 60 calls/minute (plenty!)

## 🤝 Need Help?

- Check logs for error messages
- Verify all environment variables are set
- Make sure database is running and accessible
- Test API keys with curl or Postman first

---

**Built as part of the Restaurant Intelligence Platform** 🍽️
