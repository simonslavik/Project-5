import dotenv from 'dotenv';
import cron from 'node-cron';
import { initDatabase, closeDatabase } from './database/db';
import { collectWeatherData } from './collectors/weatherCollector';
import { collectEventsData } from './collectors/eventsCollector';
import { collectCalendarData } from './collectors/calendarCollector';
import { collectSocialMediaData } from './collectors/socialMediaCollector';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

// Graceful shutdown handler
async function shutdown(signal: string) {
  logger.info(`\n${signal} received. Shutting down gracefully...`);
  await closeDatabase();
  process.exit(0);
}

async function main() {
  try {
    logger.info('');
    logger.info('═══════════════════════════════════════════════════════════');
    logger.info('🚀 Restaurant Intelligence - Data Collection Service');
    logger.info('═══════════════════════════════════════════════════════════');
    logger.info('');

    // Initialize database connection
    logger.info('📊 Initializing database connection...');
    await initDatabase();
    logger.info('');

    // Validate configuration
    const hasWeatherKey = process.env.WEATHER_API_KEY && 
                          process.env.WEATHER_API_KEY !== 'your_openweathermap_api_key_here';
    const hasEventsKey = process.env.EVENTS_API_KEY && 
                         process.env.EVENTS_API_KEY !== 'your_ticketmaster_api_key_here';

    if (!hasWeatherKey) {
      logger.warn('⚠️  Weather API key not configured');
      logger.warn('   Get your free key at: https://openweathermap.org/api');
    }

    if (!hasEventsKey) {
      logger.warn('⚠️  Events API key not configured');
      logger.warn('   Get your free key at: https://developer.ticketmaster.com/');
    }

    logger.info('');
    logger.info('═══════════════════════════════════════════════════════════');
    logger.info('🎬 Running initial data collection...');
    logger.info('═══════════════════════════════════════════════════════════');
    logger.info('');

    // Run initial collection immediately
    await collectWeatherData();
    await collectEventsData();
    await collectCalendarData();
    // await collectSocialMediaData(); // Optional - not implemented yet

    logger.info('');
    logger.info('═══════════════════════════════════════════════════════════');
    logger.info('⏰ Setting up scheduled collections...');
    logger.info('═══════════════════════════════════════════════════════════');
    logger.info('');

    // Weather: Every 15 minutes (or custom interval)
    const weatherInterval = process.env.WEATHER_INTERVAL || '15';
    const weatherCron = `*/${weatherInterval} * * * *`;
    cron.schedule(weatherCron, async () => {
      logger.info('');
      logger.info('⏰ [Scheduled] Weather collection triggered');
      await collectWeatherData();
    });
    logger.info(`✅ Weather collector scheduled: Every ${weatherInterval} minutes`);

    // Events: Every 6 hours (or custom interval)
    const eventsInterval = process.env.EVENTS_INTERVAL || '360';
    const eventsHours = Math.floor(parseInt(eventsInterval) / 60);
    const eventsCron = `0 */${eventsHours} * * *`;
    cron.schedule(eventsCron, async () => {
      logger.info('');
      logger.info('⏰ [Scheduled] Events collection triggered');
      await collectEventsData();
    });
    logger.info(`✅ Events collector scheduled: Every ${eventsHours} hours`);

    // Calendar: Once daily at midnight (or custom interval)
    const calendarCron = '0 0 * * *';
    cron.schedule(calendarCron, async () => {
      logger.info('');
      logger.info('⏰ [Scheduled] Calendar collection triggered');
      await collectCalendarData();
    });
    logger.info('✅ Calendar collector scheduled: Daily at midnight');

    logger.info('');
    logger.info('═══════════════════════════════════════════════════════════');
    logger.info('✅ Data Collection Service is running!');
    logger.info('═══════════════════════════════════════════════════════════');
    logger.info('');
    logger.info('📋 Active Collectors:');
    logger.info(`   🌤️  Weather: Every ${weatherInterval} minutes`);
    logger.info(`   🎉 Events: Every ${eventsHours} hours`);
    logger.info('   📅 Calendar: Daily at midnight');
    logger.info('');
    logger.info('💡 Press Ctrl+C to stop');
    logger.info('');

    // Setup graceful shutdown handlers
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error('❌ Fatal error during startup:', error);
    process.exit(1);
  }
}

// Start the service
main();
