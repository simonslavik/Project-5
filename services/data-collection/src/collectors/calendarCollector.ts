import { insertCalendarData } from '../database/db';
import { logger } from '../utils/logger';

// US Federal Holidays and common observances
const US_HOLIDAYS_2025_2026: { [key: string]: string } = {
  '2025-01-01': "New Year's Day",
  '2025-01-20': 'Martin Luther King Jr. Day',
  '2025-02-14': "Valentine's Day",
  '2025-02-17': "Presidents' Day",
  '2025-03-17': "St. Patrick's Day",
  '2025-04-20': 'Easter Sunday',
  '2025-05-11': "Mother's Day",
  '2025-05-26': 'Memorial Day',
  '2025-06-15': "Father's Day",
  '2025-06-19': 'Juneteenth',
  '2025-07-04': 'Independence Day',
  '2025-09-01': 'Labor Day',
  '2025-10-13': 'Columbus Day',
  '2025-10-31': 'Halloween',
  '2025-11-11': 'Veterans Day',
  '2025-11-27': 'Thanksgiving',
  '2025-12-24': 'Christmas Eve',
  '2025-12-25': 'Christmas Day',
  '2025-12-31': "New Year's Eve",
  
  '2026-01-01': "New Year's Day",
  '2026-01-19': 'Martin Luther King Jr. Day',
  '2026-02-14': "Valentine's Day",
  '2026-02-16': "Presidents' Day",
  '2026-03-17': "St. Patrick's Day",
  '2026-04-05': 'Easter Sunday',
  '2026-05-10': "Mother's Day",
  '2026-05-25': 'Memorial Day',
  '2026-06-19': 'Juneteenth',
  '2026-06-21': "Father's Day",
  '2026-07-04': 'Independence Day',
  '2026-09-07': 'Labor Day',
  '2026-10-12': 'Columbus Day',
  '2026-10-31': 'Halloween',
  '2026-11-11': 'Veterans Day',
  '2026-11-26': 'Thanksgiving',
  '2026-12-24': 'Christmas Eve',
  '2026-12-25': 'Christmas Day',
  '2026-12-31': "New Year's Eve",
};

export async function collectCalendarData(): Promise<void> {
  const startTime = Date.now();

  try {
    logger.info('📅 [Calendar Collector] Starting collection...');

    // Generate calendar data for the next 90 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 90);

    let insertedCount = 0;
    let holidayCount = 0;

    for (let d = new Date(today); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      
      // Check if it's a holiday
      const holidayName = US_HOLIDAYS_2025_2026[dateStr] || null;
      const isHoliday = holidayName !== null;
      
      if (isHoliday) {
        holidayCount++;
        logger.debug(`  - ${dateStr}: ${holidayName}`);
      }

      await insertCalendarData(new Date(d), isHoliday, holidayName);
      insertedCount++;
    }

    const duration = Date.now() - startTime;
    logger.info(
      `[Calendar Collector] ✅ Success (${duration}ms): ` +
      `Processed ${insertedCount} days (${holidayCount} holidays)`
    );

  } catch (error: any) {
    const duration = Date.now() - startTime;
    logger.error(`[Calendar Collector] ❌ Error (${duration}ms):`, error);
  }
}
