# Prisma ORM Migration Guide

## ✅ What Changed

Successfully migrated from raw SQL queries (`pg` library) to **Prisma ORM**!

### Benefits of Prisma

- ✨ Type-safe database queries
- 🔄 Automatic TypeScript types generation
- 🛡️ Protection against SQL injection
- 📊 Easy database migrations
- 🎨 Intuitive API (no more raw SQL strings)
- 🔍 Built-in query logging and debugging

## 📦 Installed Packages

```bash
✅ @prisma/client   # Prisma Client for queries
✅ prisma           # Prisma CLI (dev dependency)
❌ pg               # Removed - no longer needed
❌ @types/pg        # Removed - no longer needed
```

## 📁 New Files Created

```
services/data-collection/
├── prisma/
│   └── schema.prisma          # Database schema definition
├── prisma.config.ts           # Prisma configuration
└── .env                       # Environment variables (created from .env.example)
```

## 🗄️ Schema Definition

**Location:** `prisma/schema.prisma`

Defines three models:

- **Weather** - Weather data collection
- **Event** - Local events data
- **Calendar** - Holiday and special dates

All models use the `restaurant` PostgreSQL schema.

## 🔄 Code Changes

### db.ts (Database Layer)

**Before (Raw SQL):**

```typescript
import { Pool } from "pg";
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
await pool.query(
  "INSERT INTO restaurant.weather (...) VALUES ($1, $2, ...)",
  values
);
```

**After (Prisma):**

```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
await prisma.weather.create({ data: { ... } });
```

### Key Improvements

1. **Weather Collection** - `prisma.weather.create()`
2. **Event Collection** - `prisma.event.upsert()` (auto handles duplicates)
3. **Calendar Collection** - `prisma.calendar.upsert()` (auto handles updates)

### Query Logging

Prisma automatically logs queries in development mode:

```typescript
prisma.$on("query", (e: any) => {
  logger.debug(`Query: ${e.query}`);
  logger.debug(`Duration: ${e.duration}ms`);
});
```

## 📝 Available NPM Scripts

```bash
# Generate Prisma Client (run after schema changes)
npm run prisma:generate

# Create and apply migrations
npm run prisma:migrate

# Push schema changes without migration (development)
npm run prisma:push

# Open Prisma Studio (visual database editor)
npm run prisma:studio

# Regular development
npm run dev
```

## 🚀 Setup Instructions

### 1. Configure Database

Ensure your `.env` file has the correct `DATABASE_URL`:

```bash
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/restaurant_intelligence
```

### 2. Create Database Schema

First, ensure the `restaurant` schema exists in PostgreSQL:

```sql
CREATE SCHEMA IF NOT EXISTS restaurant;
```

### 3. Push Schema to Database

For development (no migration files):

```bash
npm run prisma:push
```

Or create a migration:

```bash
npm run prisma:migrate
# Enter migration name when prompted
```

### 4. Generate Prisma Client

This happens automatically on `npm install`, but you can run manually:

```bash
npm run prisma:generate
```

### 5. Run the Service

```bash
npm run dev
```

## 🎨 Prisma Studio

Open a visual database editor in your browser:

```bash
npm run prisma:studio
```

This opens `http://localhost:5555` where you can:

- View all data in your tables
- Add/edit/delete records
- Run queries visually
- Export data

## 📊 Example Queries

### Using Prisma Client

```typescript
import { prisma } from "./database/db";

// Find all weather records for a location
const weather = await prisma.weather.findMany({
  where: { location: "New York" },
  orderBy: { time: "desc" },
  take: 10,
});

// Get events happening today
const today = new Date().toISOString().split("T")[0];
const events = await prisma.event.findMany({
  where: { event_date: today },
  orderBy: { impact_score: "desc" },
});

// Check if today is a holiday
const calendar = await prisma.calendar.findUnique({
  where: { date: new Date() },
});

// Count total weather records
const count = await prisma.weather.count();

// Get average temperature
const avg = await prisma.weather.aggregate({
  _avg: { temperature: true },
});
```

## 🔧 Troubleshooting

### Error: "Prisma Client not generated"

```bash
npm run prisma:generate
```

### Error: "Database schema not found"

```bash
# Create the schema in PostgreSQL
psql -U postgres -d restaurant_intelligence -c "CREATE SCHEMA restaurant;"
npm run prisma:push
```

### Error: "Environment variable not loaded"

Make sure `.env` exists (copy from `.env.example`) and contains `DATABASE_URL`.

### Migrations out of sync

```bash
# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```

## 📚 Learn More

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)

## ✨ Next Steps

1. Run `npm run prisma:push` to sync your schema to the database
2. Test the data collectors with `npm run dev`
3. Explore your data with `npm run prisma:studio`
4. Learn Prisma queries from the [documentation](https://www.prisma.io/docs/concepts/components/prisma-client)
