/**
 * ASTRA Health - AI Tools & Structured Health Data Queries
 * 
 * Implements Section 12 Tool/Function Calling Interface:
 * 1. getLatestHealthMeasurements()
 * 2. getPhysicalHealthIndex()
 * 3. getMentalHealthIndex()
 * 4. getPersonalBaseline(metric)
 * 5. getHealthTrends(metric, days)
 * 6. getActiveAlerts()
 * 7. getTodayCheckIn()
 * 8. getRecentChanges()
 * 9. getMissionEnvironment()
 * 10. getSyncStatus()
 */

import { HealthMeasurement, MetricBaseline, HealthAlert, DailyCheckIn, MultiMetricChange } from '../types/health';
import { MissionContext } from '../types/mission';
import { computePhysicalHealthSystem, computeMentalHealthSystem } from '../health/healthIndexes';
import { syncManager } from '../services/syncManager';

export interface HealthToolContext {
  currentHealth: HealthMeasurement;
  baselines: MetricBaseline[];
  activeAlerts: HealthAlert[];
  todayCheckIn?: DailyCheckIn;
  history: HealthMeasurement[];
  missionContext: MissionContext;
  changes?: MultiMetricChange[];
}

export class ASTRAHealthTools {
  private ctx: HealthToolContext;

  constructor(ctx: HealthToolContext) {
    this.ctx = ctx;
  }

  // 1. getLatestHealthMeasurements()
  getLatestHealthMeasurements(): HealthMeasurement {
    return this.ctx.currentHealth;
  }

  // 2. getPhysicalHealthIndex()
  getPhysicalHealthIndex() {
    return computePhysicalHealthSystem(this.ctx.currentHealth, this.ctx.baselines, this.ctx.history);
  }

  // 3. getMentalHealthIndex()
  getMentalHealthIndex() {
    return computeMentalHealthSystem(this.ctx.currentHealth, this.ctx.baselines, this.ctx.todayCheckIn);
  }

  // 4. getPersonalBaseline(metric)
  getPersonalBaseline(metricKey: string): MetricBaseline | undefined {
    return this.ctx.baselines.find(b => b.metricKey.toLowerCase() === metricKey.toLowerCase());
  }

  // 5. getHealthTrends(metric, days)
  getHealthTrends(metricKey: keyof HealthMeasurement, days = 7) {
    const records = this.ctx.history.slice(-days);
    return records.map(r => ({
      sol: r.sol,
      timestamp: r.timestamp,
      value: r[metricKey],
    }));
  }

  // 6. getActiveAlerts()
  getActiveAlerts(): HealthAlert[] {
    return this.ctx.activeAlerts;
  }

  // 7. getTodayCheckIn()
  getTodayCheckIn(): DailyCheckIn | undefined {
    return this.ctx.todayCheckIn;
  }

  // 8. getRecentChanges()
  getRecentChanges(): MultiMetricChange[] {
    return this.ctx.changes || [];
  }

  // 9. getMissionEnvironment()
  getMissionEnvironment(): MissionContext {
    return this.ctx.missionContext;
  }

  // 10. getSyncStatus()
  getSyncStatus() {
    return syncManager.getSyncState();
  }
}
