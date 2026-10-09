/**
 * ASTRA Health - NASA Data Normalizer
 * Transforms raw API responses and formats them into sanitized, consistent domain objects.
 */

import { NasaRadiationContext, NasaSpaceWeatherEvent, NasaResearchItem } from './nasaTypes.ts';

export function normalizeRadiationData(raw: any, source: 'live' | 'cached'): NasaRadiationContext {
  const now = new Date().toISOString();
  return {
    id: raw.id || `rad-${Date.now()}`,
    spacecraft: raw.spacecraft || 'NASA Interplanetary Cruise Vehicle',
    instrument: raw.instrument || 'NASA MSL-RAD / Liulin Suite',
    timestamp: raw.timestamp || now,
    absorbedDoseRate: typeof raw.absorbedDoseRate === 'number' ? raw.absorbedDoseRate : 482.4,
    doseEquivalentRate: typeof raw.doseEquivalentRate === 'number' ? raw.doseEquivalentRate : 1840.0,
    flux: typeof raw.flux === 'number' ? raw.flux : 2.84,
    latitude: raw.latitude,
    longitude: raw.longitude,
    altitude: raw.altitude,
    missionPhase: raw.missionPhase || 'Interplanetary Cruise',
    source: 'NASA_RADLAB',
    fetchedAt: raw.fetchedAt || now,
    dataStatus: source,
  };
}

export function sanitizeSpaceWeatherSummary(events: NasaSpaceWeatherEvent[]): string {
  if (!events || events.length === 0) {
    return 'Solar environment is quiet. No recent Coronal Mass Ejections or high-energy proton events detected by NASA DONKI.';
  }

  const latest = events[0];
  const timeStr = new Date(latest.startTime).toUTCString();
  return `Latest Event: ${latest.type} (${latest.eventID}) recorded at ${timeStr}. ${latest.note || ''}`;
}

export function formatResearchForAIContext(items: NasaResearchItem[]): string {
  if (!items || items.length === 0) {
    return 'No specific NASA space-life-science citations retrieved.';
  }

  return items.map(item => {
    return `[NASA OSDR ${item.accession}] ${item.title} (Topic: ${item.topic})
Summary: ${item.summary}
Key Evidence:
${item.keyFindings.map(f => `  • ${f}`).join('\n')}`;
  }).join('\n\n');
}
