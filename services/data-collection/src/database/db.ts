import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

// Initialize Prisma Client
const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' },
  ],
});

// Log Prisma queries in development
if (process.env.NODE_ENV !== 'production') {
  prisma.$on('query' as never, (e: any) => {
    logger.debug(`Query: ${e.query}`);
    logger.debug(`Duration: ${e.duration}ms`);
  });
}

export async function initDatabase(): Promise<void> {
  try {
    // Test connection
    await prisma.$connect();
    logger.info('✅ Database connection established successfully (Prisma)');
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    throw error;
  }
}

export async function closeDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info('Database connection closed (Prisma)');
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
  try {
    await prisma.weather.create({
      data: {
        time: data.time,
        location: data.location,
        temperature: data.temperature,
        feels_like: data.feels_like,
        humidity: data.humidity,
        pressure: data.pressure,
        weather_condition: data.weather_condition,
        weather_description: data.weather_description,
        wind_speed: data.wind_speed,
        clouds: data.clouds,
        precipitation: data.precipitation || null,
        visibility: data.visibility || null,
      },
    });
    logger.debug('Weather data inserted successfully');
  } catch (error) {
    logger.error('Failed to insert weather data:', error);
    throw error;
  }
}

// Insert Event Data
export async function insertEventData(data: EventData): Promise<void> {
  try {
    await prisma.event.upsert({
      where: { event_id: data.event_id },
      update: {
        event_date: data.event_date,
        event_time: data.event_time,
        impact_score: data.impact_score,
        expected_attendance: data.expected_attendance || null,
      },
      create: {
        event_id: data.event_id,
        event_date: data.event_date,
        event_time: data.event_time,
        event_name: data.event_name,
        event_type: data.event_type,
        venue: data.venue,
        location: data.location,
        distance_km: data.distance_km,
        impact_score: data.impact_score,
        expected_attendance: data.expected_attendance || null,
      },
    });
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
  try {
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const month = date.getMonth() + 1;
    const quarter = Math.ceil(month / 3);
    const year = date.getFullYear();

    await prisma.calendar.upsert({
      where: { date },
      update: {
        is_holiday: isHoliday,
        holiday_name: holidayName,
      },
      create: {
        date,
        day_of_week: dayOfWeek,
        is_weekend: isWeekend,
        is_holiday: isHoliday,
        holiday_name: holidayName,
        month,
        quarter,
        year,
      },
    });
    logger.debug(`Calendar data inserted for ${date.toISOString().split('T')[0]}`);
  } catch (error) {
    logger.error('Failed to insert calendar data:', error);
    throw error;
  }
}

// Export Prisma client for custom queries
export { prisma };
export default prisma;
