/**
 * ASTRA Health - Crew Members on Mission MARS-01
 */

import { CrewMember } from '../types/health';

export const INITIAL_CREW: CrewMember[] = [
  {
    id: 'sarah-chen',
    name: 'Sarah Chen',
    callsign: 'Astra-1',
    role: 'Commander',
    avatarInitials: 'SC',
    status: 'ORANGE',
    statusText: 'Attention',
    keyMetricSummary: 'Multi-metric shift: Sleep -18%, HRV -29%, Resting HR +9%',
    lastCheckInSol: 184,
    restingHr: 81,
    sleepHours: 5.9,
    radiationCumulative_mSv: 88.7,
  },
  {
    id: 'marcus-vance',
    name: 'Marcus Vance',
    callsign: 'Astra-2',
    role: 'Pilot',
    avatarInitials: 'MV',
    status: 'GREEN',
    statusText: 'Stable',
    keyMetricSummary: 'All vitals within ±4% of 14-day baseline',
    lastCheckInSol: 184,
    restingHr: 65,
    sleepHours: 7.4,
    radiationCumulative_mSv: 86.2,
  },
  {
    id: 'maya-patel',
    name: 'Dr. Maya Patel',
    callsign: 'Astra-3',
    role: 'Flight Engineer',
    avatarInitials: 'MP',
    status: 'YELLOW',
    statusText: 'Monitor',
    keyMetricSummary: 'Mild sleep latency elevation; SpO2 stable at 98.6%',
    lastCheckInSol: 183,
    restingHr: 72,
    sleepHours: 6.5,
    radiationCumulative_mSv: 87.9,
  },
  {
    id: 'elena-rostova',
    name: 'Elena Rostova',
    callsign: 'Astra-4',
    role: 'Payload Specialist',
    avatarInitials: 'ER',
    status: 'GREEN',
    statusText: 'Stable',
    keyMetricSummary: 'Recovery score 86/100, cognitive scores optimal',
    lastCheckInSol: 184,
    restingHr: 63,
    sleepHours: 7.6,
    radiationCumulative_mSv: 85.8,
  }
];
