/**
 * DateTimeService - Centralized Timezone-Aware Date/Time Handling
 *
 * This service provides a single source of truth for all date/time operations
 * in the scheduling system. It eliminates timezone drift by:
 *
 * 1. Always using a robust library (date-fns + date-fns-tz) instead of native Date
 * 2. Enforcing UTC for all database operations
 * 3. Converting between shop timezone (America/Sao_Paulo) and UTC explicitly
 *
 * @module services/datetime.service
 */

import {
    parse,
    format,
    addMinutes,
    startOfDay,
    endOfDay,
    areIntervalsOverlapping,
    Interval,
    parseISO,
} from 'date-fns';
import { toZonedTime, fromZonedTime, formatInTimeZone } from 'date-fns-tz';

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * The shop's timezone. This is the single source of truth for the business timezone.
 * All "local" times (e.g., barber schedule, user-facing slot times) are in this timezone.
 */
const SHOP_TIMEZONE = 'America/Sao_Paulo';

/**
 * Slot generation interval in minutes.
 */
const SLOT_INTERVAL_MINUTES = 30;

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Get the shop's configured timezone.
 * @returns The IANA timezone string for the shop
 */
export function getShopTimezone(): string {
    return SHOP_TIMEZONE;
}

/**
 * Get the slot interval in minutes.
 * @returns The interval in minutes between each slot
 */
export function getSlotIntervalMinutes(): number {
    return SLOT_INTERVAL_MINUTES;
}

/**
 * Parse a date string (YYYY-MM-DD) as a Date representing midnight in the shop timezone,
 * then convert to UTC.
 *
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Date object representing the start of that day in UTC
 *
 * @example
 * // 2026-01-21 00:00 BRT = 2026-01-21 03:00 UTC
 * parseBusinessDate('2026-01-21') // → Date representing 2026-01-21T03:00:00.000Z
 */
export function parseBusinessDate(dateStr: string): Date {
    // Parse as a date in the shop timezone
    const localMidnight = parse(dateStr, 'yyyy-MM-dd', new Date());
    // Convert from shop timezone to UTC
    return fromZonedTime(localMidnight, SHOP_TIMEZONE);
}

/**
 * Get the UTC bounds (start and end) for a business day in the shop timezone.
 *
 * This is crucial for database queries: when searching for "appointments on 2026-01-21",
 * we need to search between the UTC timestamps that correspond to midnight and 23:59:59 BRT.
 *
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Object with start and end Date objects in UTC
 *
 * @example
 * // For 2026-01-21 in BRT (UTC-3):
 * // Start: 2026-01-21 00:00 BRT = 2026-01-21 03:00 UTC
 * // End:   2026-01-21 23:59:59.999 BRT = 2026-01-22 02:59:59.999 UTC
 * getBusinessDayUTCBounds('2026-01-21')
 */
export function getBusinessDayUTCBounds(dateStr: string): { start: Date; end: Date } {
    // Parse the date string and treat it as a date in the shop timezone
    const localDate = parse(dateStr, 'yyyy-MM-dd', new Date());

    // Get start and end of day in local time
    const localStart = startOfDay(localDate);
    const localEnd = endOfDay(localDate);

    // Convert to UTC
    return {
        start: fromZonedTime(localStart, SHOP_TIMEZONE),
        end: fromZonedTime(localEnd, SHOP_TIMEZONE),
    };
}

/**
 * Convert a local date and time to a UTC Date object.
 *
 * @param dateStr - Date string in YYYY-MM-DD format
 * @param timeStr - Time string in HH:mm format
 * @returns Date object in UTC
 *
 * @example
 * // 2026-01-21 10:30 BRT = 2026-01-21 13:30 UTC
 * localTimeToUTC('2026-01-21', '10:30') // → Date representing 2026-01-21T13:30:00.000Z
 */
export function localTimeToUTC(dateStr: string, timeStr: string): Date {
    // Combine date and time
    const localDateTimeStr = `${dateStr} ${timeStr}`;
    // Parse as a datetime in the shop timezone
    const localDateTime = parse(localDateTimeStr, 'yyyy-MM-dd HH:mm', new Date());
    // Convert from shop timezone to UTC
    return fromZonedTime(localDateTime, SHOP_TIMEZONE);
}

/**
 * Convert a UTC Date to a local time string in HH:mm format.
 *
 * @param utcDate - Date object in UTC
 * @returns Time string in HH:mm format in shop timezone
 *
 * @example
 * // 2026-01-21 13:30 UTC = 10:30 BRT
 * utcToLocalTime(new Date('2026-01-21T13:30:00.000Z')) // → '10:30'
 */
export function utcToLocalTime(utcDate: Date): string {
    return formatInTimeZone(utcDate, SHOP_TIMEZONE, 'HH:mm');
}

/**
 * Parse a UTC timestamp string (from database) to a Date object.
 *
 * This function handles the common issue where Supabase/Postgres may return
 * timestamps without timezone indicators. It ensures consistent UTC parsing.
 *
 * @param timestamp - ISO 8601 timestamp string (with or without Z suffix)
 * @returns Date object in UTC
 *
 * @example
 * parseUTCTimestamp('2026-01-21T13:30:00') // → Date (treats as UTC)
 * parseUTCTimestamp('2026-01-21T13:30:00Z') // → Date (same result)
 * parseUTCTimestamp('2026-01-21T13:30:00.000Z') // → Date (same result)
 */
export function parseUTCTimestamp(timestamp: string): Date {
    // If the timestamp doesn't have a timezone indicator, append 'Z' for UTC
    // This is the ONLY place we do this manipulation, centralized and explicit
    let normalizedTimestamp = timestamp;
    if (!timestamp.endsWith('Z') && !timestamp.includes('+') && !/.*-\d{2}:\d{2}$/.test(timestamp)) {
        normalizedTimestamp = timestamp + 'Z';
    }
    return parseISO(normalizedTimestamp);
}

/**
 * Add minutes to a Date object.
 *
 * @param date - The base Date object
 * @param minutes - Number of minutes to add
 * @returns New Date object with minutes added
 */
export function addMinutesToDate(date: Date, minutes: number): Date {
    return addMinutes(date, minutes);
}

/**
 * Check if two intervals overlap.
 *
 * @param intervalA - First interval { start: Date, end: Date }
 * @param intervalB - Second interval { start: Date, end: Date }
 * @returns true if intervals overlap, false otherwise
 *
 * @example
 * const slot = { start: new Date('2026-01-21T13:00:00Z'), end: new Date('2026-01-21T14:00:00Z') };
 * const appt = { start: new Date('2026-01-21T13:30:00Z'), end: new Date('2026-01-21T14:30:00Z') };
 * checkIntervalOverlap(slot, appt) // → true
 */
export function checkIntervalOverlap(intervalA: Interval, intervalB: Interval): boolean {
    return areIntervalsOverlapping(intervalA, intervalB);
}

/**
 * Format a Date as an ISO 8601 UTC string suitable for database storage.
 *
 * @param date - Date object to format
 * @returns ISO 8601 string with Z suffix
 */
export function toUTCString(date: Date): string {
    return date.toISOString();
}

/**
 * Generate an array of time slot start times for a given schedule.
 *
 * @param dateStr - Date string in YYYY-MM-DD format
 * @param startTime - Schedule start time in HH:mm format (shop timezone)
 * @param endTime - Schedule end time in HH:mm format (shop timezone)
 * @param durationMinutes - Duration of each slot in minutes
 * @returns Array of { startUTC: Date, endUTC: Date, localTime: string }
 */
export function generateSlotIntervals(
    dateStr: string,
    startTime: string,
    endTime: string,
    durationMinutes: number
): Array<{ startUTC: Date; endUTC: Date; localTime: string }> {
    const slots: Array<{ startUTC: Date; endUTC: Date; localTime: string }> = [];

    // Parse schedule times
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    // Convert to minutes from midnight
    const startTotalMinutes = startH * 60 + startM;
    const endTotalMinutes = endH * 60 + endM;

    // Generate slots
    for (let minutes = startTotalMinutes; minutes + durationMinutes <= endTotalMinutes; minutes += SLOT_INTERVAL_MINUTES) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;

        const slotStartUTC = localTimeToUTC(dateStr, timeStr);
        const slotEndUTC = addMinutesToDate(slotStartUTC, durationMinutes);

        slots.push({
            startUTC: slotStartUTC,
            endUTC: slotEndUTC,
            localTime: timeStr,
        });
    }

    return slots;
}

/**
 * Create an Interval object for use with areIntervalsOverlapping.
 *
 * @param startTime - Start Date
 * @param endTime - End Date
 * @returns Interval object compatible with date-fns
 */
export function createInterval(startTime: Date, endTime: Date): Interval {
    return { start: startTime, end: endTime };
}

// ============================================================================
// EXPORTED SERVICE OBJECT (for DI/testing patterns)
// ============================================================================

export const DateTimeService = {
    getShopTimezone,
    getSlotIntervalMinutes,
    parseBusinessDate,
    getBusinessDayUTCBounds,
    localTimeToUTC,
    utcToLocalTime,
    parseUTCTimestamp,
    addMinutesToDate,
    checkIntervalOverlap,
    toUTCString,
    generateSlotIntervals,
    createInterval,
};

export default DateTimeService;
