/**
 * Unit Tests for DateTimeService
 * 
 * Run with: npx tsx src/services/datetime.service.test.ts
 */

import {
    getShopTimezone,
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
} from './datetime.service';

// Simple test assertion helper
function assert(condition: boolean, message: string): void {
    if (!condition) {
        console.error(`❌ FAIL: ${message}`);
        process.exitCode = 1;
    } else {
        console.log(`✅ PASS: ${message}`);
    }
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
    if (actual !== expected) {
        console.error(`❌ FAIL: ${message}`);
        console.error(`   Expected: ${expected}`);
        console.error(`   Actual: ${actual}`);
        process.exitCode = 1;
    } else {
        console.log(`✅ PASS: ${message}`);
    }
}

console.log('\n===== DateTimeService Unit Tests =====\n');

// ============================================================================
// Test: getShopTimezone
// ============================================================================
console.log('--- getShopTimezone ---');
assertEqual(getShopTimezone(), 'America/Sao_Paulo', 'Should return America/Sao_Paulo');

// ============================================================================
// Test: parseBusinessDate
// ============================================================================
console.log('\n--- parseBusinessDate ---');

// 2026-01-21 00:00 BRT = 2026-01-21 03:00 UTC (BRT is UTC-3)
const businessDate = parseBusinessDate('2026-01-21');
assertEqual(businessDate.toISOString(), '2026-01-21T03:00:00.000Z', 'Should parse 2026-01-21 as UTC 03:00 (midnight BRT)');

// ============================================================================
// Test: getBusinessDayUTCBounds
// ============================================================================
console.log('\n--- getBusinessDayUTCBounds ---');

const bounds = getBusinessDayUTCBounds('2026-01-21');
assertEqual(bounds.start.toISOString(), '2026-01-21T03:00:00.000Z', 'Start should be 03:00 UTC (00:00 BRT)');
assertEqual(bounds.end.toISOString(), '2026-01-22T02:59:59.999Z', 'End should be 02:59:59.999 UTC (23:59:59.999 BRT)');

// ============================================================================
// Test: localTimeToUTC
// ============================================================================
console.log('\n--- localTimeToUTC ---');

// 2026-01-21 10:30 BRT = 2026-01-21 13:30 UTC
const utcDate = localTimeToUTC('2026-01-21', '10:30');
assertEqual(utcDate.toISOString(), '2026-01-21T13:30:00.000Z', 'Should convert 10:30 BRT to 13:30 UTC');

// 2026-01-21 22:00 BRT = 2026-01-22 01:00 UTC (crosses midnight UTC)
const lateUtc = localTimeToUTC('2026-01-21', '22:00');
assertEqual(lateUtc.toISOString(), '2026-01-22T01:00:00.000Z', 'Should handle times that cross UTC midnight');

// ============================================================================
// Test: utcToLocalTime
// ============================================================================
console.log('\n--- utcToLocalTime ---');

const localTime = utcToLocalTime(new Date('2026-01-21T13:30:00.000Z'));
assertEqual(localTime, '10:30', 'Should convert 13:30 UTC to 10:30 BRT');

// ============================================================================
// Test: parseUTCTimestamp
// ============================================================================
console.log('\n--- parseUTCTimestamp ---');

// With Z suffix
const withZ = parseUTCTimestamp('2026-01-21T13:30:00.000Z');
assertEqual(withZ.toISOString(), '2026-01-21T13:30:00.000Z', 'Should parse timestamp with Z suffix');

// Without Z suffix (common from Supabase)
const withoutZ = parseUTCTimestamp('2026-01-21T13:30:00.000');
assertEqual(withoutZ.toISOString(), '2026-01-21T13:30:00.000Z', 'Should parse timestamp without Z suffix as UTC');

// Without milliseconds
const noMs = parseUTCTimestamp('2026-01-21T13:30:00');
assertEqual(noMs.toISOString(), '2026-01-21T13:30:00.000Z', 'Should parse timestamp without milliseconds');

// ============================================================================
// Test: addMinutesToDate
// ============================================================================
console.log('\n--- addMinutesToDate ---');

const baseDate = new Date('2026-01-21T10:00:00.000Z');
const plusThirty = addMinutesToDate(baseDate, 30);
assertEqual(plusThirty.toISOString(), '2026-01-21T10:30:00.000Z', 'Should add 30 minutes');

const plusSixty = addMinutesToDate(baseDate, 60);
assertEqual(plusSixty.toISOString(), '2026-01-21T11:00:00.000Z', 'Should add 60 minutes');

// ============================================================================
// Test: checkIntervalOverlap
// ============================================================================
console.log('\n--- checkIntervalOverlap ---');

// Overlapping intervals
const intervalA = createInterval(
    new Date('2026-01-21T10:00:00Z'),
    new Date('2026-01-21T11:00:00Z')
);
const intervalB = createInterval(
    new Date('2026-01-21T10:30:00Z'),
    new Date('2026-01-21T11:30:00Z')
);
assert(checkIntervalOverlap(intervalA, intervalB), 'Should detect overlapping intervals');

// Non-overlapping intervals
const intervalC = createInterval(
    new Date('2026-01-21T09:00:00Z'),
    new Date('2026-01-21T10:00:00Z')
);
assert(!checkIntervalOverlap(intervalA, intervalC), 'Should not detect overlap for adjacent intervals');

// Contained interval
const intervalD = createInterval(
    new Date('2026-01-21T10:15:00Z'),
    new Date('2026-01-21T10:45:00Z')
);
assert(checkIntervalOverlap(intervalA, intervalD), 'Should detect contained intervals');

// ============================================================================
// Test: generateSlotIntervals
// ============================================================================
console.log('\n--- generateSlotIntervals ---');

const slots = generateSlotIntervals('2026-01-21', '09:00', '12:00', 30);

// Should generate slots: 09:00, 09:30, 10:00, 10:30, 11:00, 11:30
// (12:00 excluded because 12:00 + 30min > 12:00)
assertEqual(slots.length, 6, 'Should generate 6 slots from 09:00 to 12:00 with 30min duration');
assertEqual(slots[0].localTime, '09:00', 'First slot should be 09:00');
assertEqual(slots[5].localTime, '11:30', 'Last slot should be 11:30');
assertEqual(slots[0].startUTC.toISOString(), '2026-01-21T12:00:00.000Z', 'First slot UTC should be 12:00 (09:00 BRT)');

// ============================================================================
// Test: toUTCString
// ============================================================================
console.log('\n--- toUTCString ---');

const isoString = toUTCString(new Date('2026-01-21T13:30:00.000Z'));
assertEqual(isoString, '2026-01-21T13:30:00.000Z', 'Should format as ISO 8601 with Z suffix');

// ============================================================================
// Summary
// ============================================================================
console.log('\n===== Tests Complete =====\n');

if (process.exitCode === 1) {
    console.error('Some tests failed!');
} else {
    console.log('All tests passed!');
}
