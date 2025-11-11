import { Pool, QueryResult } from 'pg';
import { logger } from '../utils/logger';

let pool: Pool;

export async function initDatabase(): Promise<void> {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    // Test connection
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();

    logger.info('✅ Database connection established successfully');
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    throw error;
  }
}

export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    logger.info('Database connection closed');
  }
}

// Weather Data Interface
export interface WeatherData {
  time: Date;
  location: string;
  temperature: number;
  feels_like: number;
  humidity: number;
  pressure: number;
  weather_condition: string;
  weather_description: string;
  wind_speed: number;
  clouds: number;
  precipitation?: number;
  visibility?: number;
}

// Event Data Interface
export interface EventData {
  event_id: string;
  event_date: string;
  event_time: string | null;
  event_name: string;
  event_type: string;
  venue: string;
  location: string;
  distance_km: number;
  impact_score: number;
  expected_attendance?: number;
}

// Insert Weather Data
export async function insertWeatherData(data: WeatherData): Promise<void> {
  const query = `
    INSERT INTO restaurant.weather (
      time, location, temperature, feels_like, humidity, 
      pressure, weather_condition, weather_description, 
      wind_speed, clouds, precipitation, visibility
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
  `;

  const values = [
    data.time,
    data.location,
    data.temperature,
    data.feels_like,
    data.humidity,
    data.pressure,
    data.weather_condition,
    data.weather_description,
    data.wind_speed,
    data.clouds,
    data.precipitation || null,
    data.visibility || null,
  ];

  try {
    await pool.query(query, values);
    logger.debug('Weather data inserted successfully');
  } catch (error) {
    logger.error('Failed to insert weather data:', error);
    throw error;
  }
}

// Insert Event Data
export async function insertEventData(data: EventData): Promise<void> {
  const query = `
    INSERT INTO restaurant.events (
      event_id, event_date, event_time, event_name, 
      event_type, venue, location, distance_km, 
      impact_score, expected_attendance
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    ON CONFLICT (event_id) DO UPDATE SET
      event_date = EXCLUDED.event_date,
      event_time = EXCLUDED.event_time,
      impact_score = EXCLUDED.impact_score,
      expected_attendance = EXCLUDED.expected_attendance
  `;

  const values = [
    data.event_id,
    data.event_date,
    data.event_time,
    data.event_name,
    data.event_type,
    data.venue,
    data.location,
    data.distance_km,
    data.impact_score,
    data.expected_attendance || null,
  ];

  try {
    await pool.query(query, values);
    logger.debug(`Event inserted: ${data.event_name}`);
  } catch (error) {
    logger.error('Failed to insert event data:', error);
    throw error;
  }
}

// Insert Calendar Data
export async function insertCalendarData(
  date: Date,
  isHoliday: boolean,
  holidayName: string | null
): Promise<void> {
  const query = `
    INSERT INTO restaurant.calendar (
      date, day_of_week, is_weekend, is_holiday, 
      holiday_name, month, quarter, year
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (date) DO UPDATE SET
      is_holiday = EXCLUDED.is_holiday,
      holiday_name = EXCLUDED.holiday_name
  `;

  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const month = date.getMonth() + 1;
  const quarter = Math.ceil(month / 3);
  const year = date.getFullYear();

  const values = [date, dayOfWeek, isWeekend, isHoliday, holidayName, month, quarter, year];

  try {
    await pool.query(query, values);
    logger.debug(`Calendar data inserted for ${date.toISOString().split('T')[0]}`);
  } catch (error) {
    logger.error('Failed to insert calendar data:', error);
    throw error;
  }
}

// Get database connection pool (for custom queries)
export function getPool(): Pool {
  if (!pool) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return pool;
}
