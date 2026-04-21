import JSZip from 'jszip';
import { ZeppSleepEntry, ZeppActivityEntry } from '../../types/health';

export class ZeppImporter {
  async importFromZip(file: File): Promise<{
    sleep: ZeppSleepEntry[];
    activity: ZeppActivityEntry[];
  }> {
    const zip = await JSZip.loadAsync(file);
    const sleep: ZeppSleepEntry[] = [];
    const activity: ZeppActivityEntry[] = [];

    for (const [filename, zipFile] of Object.entries(zip.files)) {
      if (filename.includes('SLEEP') && filename.endsWith('.json')) {
        const raw = await zipFile.async('text');
        const parsed = this.parseSleepJSON(raw);
        sleep.push(...parsed);
      }
      if (filename.includes('ACTIVITY') && filename.endsWith('.csv')) {
        const raw = await zipFile.async('text');
        const parsed = this.parseActivityCSV(raw);
        activity.push(...parsed);
      }
    }

    // Unificar por fecha (por si hay duplicados en el export)
    return {
      sleep: this.uniqueByDate(sleep),
      activity: this.uniqueByDate(activity)
    };
  }

  private parseSleepJSON(raw: string): ZeppSleepEntry[] {
    try {
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) return [];

      return data.map((entry: any) => ({
        date: entry.date,
        bedtime: new Date(entry.start * 1000).toISOString(),
        wakeup: new Date(entry.stop * 1000).toISOString(),
        deepSleepMin: entry.deepSleepTime ?? 0,
        lightSleepMin: entry.shallowSleepTime ?? 0,
        remSleepMin: entry.remTime ?? 0,
        awakeSleepMin: entry.wakeTime ?? 0,
        totalSleepMin: (entry.deepSleepTime ?? 0) + (entry.shallowSleepTime ?? 0) + (entry.remTime ?? 0)
      }));
    } catch (e) {
      console.error('Error parsing Zepp Sleep JSON', e);
      return [];
    }
  }

  private parseActivityCSV(raw: string): ZeppActivityEntry[] {
    const lines = raw.trim().split('\n');
    if (lines.length < 2) return [];

    const header = lines[0].split(',');
    const dateIdx = header.indexOf('date');
    const stepsIdx = header.indexOf('steps');
    const distIdx = header.indexOf('distance');
    const calIdx = header.indexOf('calories');

    return lines.slice(1).map(line => {
      const cols = line.split(',');
      return {
        date: cols[dateIdx]?.trim(),
        steps: parseInt(cols[stepsIdx]) || 0,
        distance: parseFloat(cols[distIdx]) || 0,
        calories: parseInt(cols[calIdx]) || 0
      };
    }).filter(e => e.date);
  }

  private uniqueByDate<T extends { date: string }>(items: T[]): T[] {
    const seen = new Set();
    return items.filter(item => {
      if (seen.has(item.date)) return false;
      seen.add(item.date);
      return true;
    }).sort((a, b) => a.date.localeCompare(b.date));
  }
}
