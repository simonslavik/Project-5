import axios from 'axios';
import { insertEventData, EventData } from '../database/db';
import { logger } from '../utils/logger';

interface TicketmasterResponse {
  _embedded?: {
    events: Array<{
      id: string;
      name: string;
      dates: {
        start: {
          localDate: string;
          localTime?: string;
        };
      };
      _embedded: {
        venues: Array<{
          name: string;
          location: {
            latitude: string;
            longitude: string;
          };
        }>;
      };
      classifications?: Array<{
        segment: { name: string };
        genre?: { name: string };
      }>;
      info?: string;
      pleaseNote?: string;
    }>;
  };
  page?: {
    totalElements: number;
    size: number;
  };
}

export async function collectEventsData(): Promise<void> {
  const startTime = Date.now();

  try {
    logger.info('🎉 [Events Collector] Starting collection...');

    // Validate environment variables
    const API_KEY = process.env.EVENTS_API_KEY;
    if (!API_KEY || API_KEY === 'your_ticketmaster_api_key_here') {
      logger.warn('[Events Collector] ⚠️  API key not configured. Skipping collection.');
      logger.info('[Events Collector] Get your free API key at: https://developer.ticketmaster.com/');
      return;
    }

    const CITY = process.env.EVENTS_CITY || 'New York';
    const RADIUS = process.env.EVENTS_RADIUS || '10';
    const RESTAURANT_LAT = parseFloat(process.env.WEATHER_LAT || '40.7128');
    const RESTAURANT_LON = parseFloat(process.env.WEATHER_LON || '-74.0060');

    // Get events for the next 7 days
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);

    const startDateTime = startDate.toISOString().split('.')[0] + 'Z';
    const endDateTime = endDate.toISOString().split('.')[0] + 'Z';

    const url = `https://app.ticketmaster.com/discovery/v2/events.json?city=${encodeURIComponent(CITY)}&radius=${RADIUS}&unit=miles&startDateTime=${startDateTime}&endDateTime=${endDateTime}&size=50&apikey=${API_KEY}`;

    // Fetch events data
    const response = await axios.get<TicketmasterResponse>(url, {
      timeout: 15000, // 15 second timeout
    });

    // Process events
    if (response.data._embedded?.events) {
      const events = response.data._embedded.events;
      let insertedCount = 0;

      for (const event of events) {
        try {
          const venue = event._embedded.venues[0];
          const venueLat = parseFloat(venue.location.latitude);
          const venueLon = parseFloat(venue.location.longitude);

          // Calculate distance from restaurant
          const distance = calculateDistance(
            RESTAURANT_LAT,
            RESTAURANT_LON,
            venueLat,
            venueLon
          );

          // Estimate impact score based on event type and distance
          const eventType = event.classifications?.[0]?.segment.name || 'Unknown';
          const impactScore = estimateImpact(eventType, distance);

          const eventData: EventData = {
            event_id: event.id,
            event_date: event.dates.start.localDate,
            event_time: event.dates.start.localTime || null,
            event_name: event.name,
            event_type: eventType,
            venue: venue.name,
            location: CITY,
            distance_km: distance,
            impact_score: impactScore,
          };

          await insertEventData(eventData);
          insertedCount++;

          logger.debug(
            `  - ${eventData.event_name} (${eventData.event_type}) ` +
            `on ${eventData.event_date} - Impact: ${impactScore.toFixed(2)}`
          );

        } catch (err) {
          logger.warn(`Failed to process event ${event.name}:`, err);
        }
      }

      const duration = Date.now() - startTime;
      logger.info(
        `[Events Collector] ✅ Success (${duration}ms): ` +
        `Processed ${insertedCount}/${events.length} events for next 7 days`
      );

    } else {
      const duration = Date.now() - startTime;
      logger.info(`[Events Collector] ℹ️  No events found (${duration}ms)`);
    }

  } catch (error: any) {
    const duration = Date.now() - startTime;

    if (axios.isAxiosError(error)) {
      if (error.response) {
        logger.error(
          `[Events Collector] ❌ API Error (${duration}ms):`,
          error.response.status,
          error.response.data
        );
      } else if (error.request) {
        logger.error(`[Events Collector] ❌ Network Error (${duration}ms): No response received`);
      } else {
        logger.error(`[Events Collector] ❌ Request Error (${duration}ms):`, error.message);
      }
    } else {
      logger.error(`[Events Collector] ❌ Unexpected Error (${duration}ms):`, error);
    }
  }
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Estimate impact on restaurant based on event type and distance
function estimateImpact(eventType: string, distanceKm: number): number {
  // Base impact scores by event type
  const baseScores: { [key: string]: number } = {
    Sports: 0.85,
    Music: 0.75,
    'Arts & Theatre': 0.65,
    Family: 0.70,
    Film: 0.55,
    Miscellaneous: 0.50,
    Unknown: 0.40,
  };

  const baseScore = baseScores[eventType] || baseScores.Unknown;

  // Distance decay factor (closer = higher impact)
  let distanceFactor: number;
  if (distanceKm <= 1) {
    distanceFactor = 1.0;
  } else if (distanceKm <= 3) {
    distanceFactor = 0.85;
  } else if (distanceKm <= 5) {
    distanceFactor = 0.65;
  } else if (distanceKm <= 8) {
    distanceFactor = 0.45;
  } else {
    distanceFactor = 0.25;
  }

  const finalScore = baseScore * distanceFactor;
  return Math.round(finalScore * 100) / 100; // Round to 2 decimal places
}
