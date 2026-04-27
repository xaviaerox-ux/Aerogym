import { DailyHealthMetric } from '../../types/health';

export interface HealthImporter {
  getName(): string;
  canHandle(filename: string, firstLine: string): boolean;
  parse(content: string, filename?: string): Promise<DailyHealthMetric[]>;
}

/**
 * Utilidad para fusionar dos arrays de métricas de salud evitando duplicados por fecha
 */
export function mergeHealthMetrics(base: DailyHealthMetric[], incoming: DailyHealthMetric[]): DailyHealthMetric[] {
  const merged = [...base];
  
  incoming.forEach(newItem => {
    const existing = merged.find(m => m.date === newItem.date);
    if (existing) {
      if (newItem.steps !== undefined) existing.steps = newItem.steps;
      if (newItem.weight !== undefined) existing.weight = newItem.weight;
      if (newItem.calories !== undefined) existing.calories = newItem.calories;
      if (newItem.sleep) existing.sleep = newItem.sleep;
    } else {
      merged.push(newItem);
    }
  });
  
  return merged.sort((a, b) => a.date.localeCompare(b.date));
}
